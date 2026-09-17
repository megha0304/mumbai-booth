const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const os = require('os');
const fs = require('fs');
const multer = require('multer');
const qrcode = require('qrcode');
const cors = require('cors');
require('dotenv').config();

const artEngine = require('./services/artEngine');
const geminiArt = require('./services/geminiArt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const STICKERS_DIR = path.join(__dirname, 'stickers');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(STICKERS_DIR)) fs.mkdirSync(STICKERS_DIR, { recursive: true });

// Configure Multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `photo-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/stickers', express.static(STICKERS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Detect LAN IPv4 Address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}


let configuredHostUrl = process.env.HOST_URL || null;

function getHostBaseUrl(req) {
  if (configuredHostUrl) {
    return configuredHostUrl.replace(/\/+$/, '');
  }
  if (req) {
    const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
    const forwardedProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
      return `${forwardedProto}://${forwardedHost}`;
    }
  }
  const ip = getLocalIp();
  return `http://${ip}:${PORT}`;
}


// In-Memory Sessions
const sessions = new Map();

// Generate short readable session ID
function generateSessionId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'BOM-';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/print', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'print.html'));
});

// API: Get Network info & Host URL

// API: Update Host URL on the fly
app.post('/api/config/host', (req, res) => {
  const { hostUrl } = req.body;
  if (hostUrl) {
    configuredHostUrl = hostUrl.trim().replace(/\/+$/, '');
    console.log('Public Host URL updated to:', configuredHostUrl);
  } else {
    configuredHostUrl = null;
  }
  res.json({ success: true, hostUrl: getHostBaseUrl(req) });
});

app.get('/api/network', (req, res) => {
  res.json({
    localIp: getLocalIp(),
    port: PORT,
    hostUrl: getHostBaseUrl(req),
    isCustomHost: !!process.env.HOST_URL
  });
});

// API: Get Available Themes
app.get('/api/themes', (req, res) => {
  res.json({
    themes: Object.values(artEngine.THEMES)
  });
});

// API: Create new Session from Kiosk
app.post('/api/session', async (req, res) => {
  try {
    const { themeId } = req.body;
    const selectedTheme = artEngine.THEMES[themeId] || artEngine.THEMES['marine-drive'];
    const sessionId = generateSessionId();

    const hostBase = (req.body.customHost && req.body.customHost.trim()) ? req.body.customHost.trim().replace(/\/+$/, '') : getHostBaseUrl(req);
    const uploadUrl = `${hostBase}/upload?session=${sessionId}&theme=${selectedTheme.id}`;

    // Generate dynamic QR code as Data URL
    const qrDataUrl = await qrcode.toDataURL(uploadUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 480,
      color: {
        dark: '#000000',
        light: '#F7DF1E' // JavaScript yellow background for high brand style!
      }
    });

    const sessionData = {
      id: sessionId,
      themeId: selectedTheme.id,
      theme: selectedTheme,
      uploadUrl,
      qrDataUrl,
      status: 'waiting_scan',
      createdAt: Date.now()
    };

    sessions.set(sessionId, sessionData);

    res.json({
      success: true,
      session: sessionData
    });
  } catch (err) {
    console.error('Session create error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// API: Get Session Info
app.get('/api/session/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  res.json({ session });
});

// API: Upload Photo from Mobile & Generate Sticker
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const { sessionId, themeId, handle } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    const session = sessions.get(sessionId) || {
      id: sessionId || 'DIRECT',
      themeId: themeId || 'marine-drive'
    };

    const finalThemeId = themeId || session.themeId || 'marine-drive';
    const finalHandle = handle || 'MUMBAI DEV';

    // Broadcast status: generating
    session.status = 'generating';
    sessions.set(sessionId, session);
    io.to(`session-${sessionId}`).emit('status:update', {
      status: 'generating',
      message: 'Processing portrait & compositing JS Community Mumbai sticker...'
    });

    const stickerFileName = `sticker-${sessionId}-${Date.now()}.png`;
    const stickerPath = path.join(STICKERS_DIR, stickerFileName);

    // Generate sticker art
    await artEngine.generateSticker({
      photoInput: req.file.path,
      themeId: finalThemeId,
      handle: finalHandle,
      outputPath: stickerPath
    });

    const hostBase = getHostBaseUrl();
    const stickerUrl = `${hostBase}/stickers/${stickerFileName}`;

    session.status = 'completed';
    session.stickerUrl = stickerUrl;
    session.stickerFileName = stickerFileName;
    session.handle = finalHandle;
    session.themeId = finalThemeId;
    sessions.set(sessionId, session);

    // Broadcast to Kiosk & Phone in room
    io.to(`session-${sessionId}`).emit('sticker:ready', {
      sessionId,
      stickerUrl,
      stickerFileName,
      themeId: finalThemeId,
      handle: finalHandle
    });

    res.json({
      success: true,
      sessionId,
      stickerUrl,
      downloadUrl: stickerUrl
    });
  } catch (err) {
    console.error('Sticker generation error:', err);
    res.status(500).json({ error: 'Failed to generate sticker: ' + err.message });
  }
});

// API: Get Recent Stickers (for quick reprint)
app.get('/api/stickers', (req, res) => {
  try {
    if (!fs.existsSync(STICKERS_DIR)) {
      return res.json({ stickers: [] });
    }
    const files = fs.readdirSync(STICKERS_DIR)
      .filter(f => f.endsWith('.png'))
      .map(f => {
        const stats = fs.statSync(path.join(STICKERS_DIR, f));
        return {
          filename: f,
          url: `/stickers/${f}`,
          createdAt: stats.mtimeMs
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 30);

    res.json({ stickers: files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list stickers' });
  }
});

// WebSockets: Real-time synchronization
io.on('connection', (socket) => {
  socket.on('join:session', ({ sessionId, clientType }) => {
    socket.join(`session-${sessionId}`);
    console.log(`Client [${clientType}] joined session room: session-${sessionId}`);

    if (clientType === 'mobile') {
      const session = sessions.get(sessionId);
      if (session) {
        session.status = 'phone_connected';
        sessions.set(sessionId, session);
      }
      // Inform Kiosk that attendee has scanned and phone is active
      io.to(`session-${sessionId}`).emit('phone:connected', { sessionId });
    }
  });

  socket.on('phone:uploading', ({ sessionId }) => {
    io.to(`session-${sessionId}`).emit('status:update', {
      status: 'photo_uploading',
      message: 'Photo snapped! Uploading to booth...'
    });
  });

  socket.on('kiosk:reset', ({ sessionId }) => {
    io.to(`session-${sessionId}`).emit('session:reset');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('====================================================');
  console.log('   JS COMMUNITY MUMBAI - EVENT STICKER BOOTH        ');
  console.log('====================================================');
  console.log(`  🚀 Kiosk Screen:    http://localhost:${PORT}`);
  console.log(`  📱 Mobile LAN URL:  http://${localIp}:${PORT}`);
  console.log(`  🖨️  Print Station:   http://localhost:${PORT}/print`);
  if (process.env.HOST_URL) {
    console.log(`  🌐 Custom Tunnel:   ${process.env.HOST_URL}`);
  }
  console.log('====================================================');
});
