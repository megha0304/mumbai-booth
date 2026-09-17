
// Kiosk State Controller
let currentSession = null;
let currentStickerUrl = null;
let themesList = [];
const socket = io();

// DOM elements
const screens = {
  themes: document.getElementById('screenThemes'),
  qr: document.getElementById('screenQr'),
  generating: document.getElementById('screenGenerating'),
  reveal: document.getElementById('screenReveal')
};

const themesContainer = document.getElementById('themesContainer');
const qrCodeImg = document.getElementById('qrCodeImg');
const sessionCodeDisplay = document.getElementById('sessionCodeDisplay');
const selectedThemeName = document.getElementById('selectedThemeName');
const phoneConnectionStatus = document.getElementById('phoneConnectionStatus');
const statusDot = document.getElementById('statusDot');
const generatingSubtitle = document.getElementById('generatingSubtitle');
const stickerPreviewImg = document.getElementById('stickerPreviewImg');
const hostDisplay = document.getElementById('hostDisplay');
const galleryModal = document.getElementById('galleryModal');
const galleryGrid = document.getElementById('galleryGrid');

function showScreen(name) {
  Object.keys(screens).forEach(k => {
    screens[k].classList.remove('active');
  });
  if (screens[name]) {
    screens[name].classList.add('active');
  }
}

// Fetch network & host details
async function loadNetworkInfo() {
  try {
    const res = await fetch('/api/network');
    const data = await res.json();
    
    hostDisplay.textContent = data.hostUrl;
    hostDisplay.title = 'Click to change QR Code Public/Tunnel URL';
    hostDisplay.style.cursor = 'pointer';

  } catch (e) {
    hostDisplay.textContent = window.location.origin;
  }
}

// Load and render theme cards
async function loadThemes() {
  try {
    const res = await fetch('/api/themes');
    const data = await res.json();
    themesList = data.themes;
    renderThemes();
  } catch (err) {
    console.error('Failed to load themes:', err);
  }
}

const themeIcons = {
  'marine-drive': '🌉',
  'gateway-hacker': '🏛️',
  'local-train': '🚆',
  'vada-pav': '🍔',
  'bandra-hipster': '☕',
  'retro-synthwave': '🌴'
};

function renderThemes() {
  themesContainer.innerHTML = '';
  themesList.forEach(theme => {
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.style.setProperty('--card-accent', theme.primaryColor);

    card.innerHTML = `
      <div class="theme-card-icon">${themeIcons[theme.id] || '⚡'}</div>
      <h3>${theme.name}</h3>
      <p>${theme.tagline}</p>
      <div class="theme-tags">
        <span class="theme-tag">${theme.landmark}</span>
        <span class="theme-tag">JS Mumbai</span>
      </div>
    `;

    card.addEventListener('click', () => selectTheme(theme.id));
    themesContainer.appendChild(card);
  });
}

// User selects a theme -> Create Session & Show QR
async function selectTheme(themeId) {
  try {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeId })
    });
    const data = await res.json();

    if (data.success) {
      currentSession = data.session;
      // Join socket room
      socket.emit('join:session', {
        sessionId: currentSession.id,
        clientType: 'kiosk'
      });

      // Update QR Screen
      qrCodeImg.src = currentSession.qrDataUrl;
      sessionCodeDisplay.textContent = `Session: ${currentSession.id}`;
      selectedThemeName.textContent = currentSession.theme.name;
      selectedThemeName.style.color = currentSession.theme.primaryColor;

      // Reset connection indicator
      phoneConnectionStatus.textContent = 'Waiting for phone scan...';
      statusDot.className = 'status-dot';

      showScreen('qr');
    }
  } catch (err) {
    alert('Failed to start session: ' + err.message);
  }
}

// Reset / Back to Themes
function resetToThemes() {
  if (currentSession) {
    socket.emit('kiosk:reset', { sessionId: currentSession.id });
  }
  currentSession = null;
  currentStickerUrl = null;
  showScreen('themes');
}

// Socket Listeners
socket.on('phone:connected', (data) => {
  if (currentSession && data.sessionId === currentSession.id) {
    phoneConnectionStatus.textContent = '📱 Phone Connected! Ready for selfie.';
    statusDot.className = 'status-dot connected';
    // Visual bump
    qrCodeImg.style.transform = 'scale(1.03)';
    setTimeout(() => qrCodeImg.style.transform = '', 300);
  }
});

const progressMessages = [
  'Detecting Mumbai developer vibes...',
  'Transpiling Sea Link cables into JavaScript...',
  'Brewing Bandra filter coffee & async functions...',
  'Catching the 8:45 Western Line express...',
  'Applying JS Community Mumbai vinyl badge & cut lines...'
];
let msgInterval = null;

socket.on('status:update', (data) => {
  if (data.status === 'photo_uploading' || data.status === 'generating') {
    showScreen('generating');
    generatingSubtitle.textContent = data.message || 'Processing photo...';

    if (!msgInterval) {
      let idx = 0;
      msgInterval = setInterval(() => {
        idx = (idx + 1) % progressMessages.length;
        generatingSubtitle.textContent = progressMessages[idx];
      }, 1800);
    }
  }
});

socket.on('sticker:ready', (data) => {
  clearInterval(msgInterval);
  msgInterval = null;

  currentStickerUrl = data.stickerUrl;
  stickerPreviewImg.src = data.stickerUrl;
  showScreen('reveal');
  launchConfetti();
});

// Print Sticker
function printSticker(urlToPrint) {
  const targetUrl = urlToPrint || currentStickerUrl;
  if (!targetUrl) return;

  const printWindow = window.open(`/print?url=${encodeURIComponent(targetUrl)}&autoprint=true`, '_blank', 'width=800,height=900');
  if (printWindow) {
    printWindow.focus();
  }
}

// Confetti Effect
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#F7DF1E', '#00F0FF', '#EC4899', '#10B981', '#FFFFFF', '#F59E0B'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 100,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 1.2) * 20,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.rotation += p.vRot;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

// Reprint Gallery
async function openGallery() {
  galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94A3B8;">Loading recent stickers...</p>';
  galleryModal.classList.add('active');

  try {
    const res = await fetch('/api/stickers');
    const data = await res.json();
    galleryGrid.innerHTML = '';

    if (data.stickers.length === 0) {
      galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94A3B8;">No stickers generated yet!</p>';
      return;
    }

    data.stickers.forEach(stk => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `<img src="${stk.url}" alt="Sticker" loading="lazy"/>`;
      item.addEventListener('click', () => {
        galleryModal.classList.remove('active');
        currentStickerUrl = stk.url;
        stickerPreviewImg.src = stk.url;
        showScreen('reveal');
      });
      galleryGrid.appendChild(item);
    });
  } catch (err) {
    galleryGrid.innerHTML = '<p style="color: #EF4444;">Failed to load stickers.</p>';
  }
}

function closeGallery() {
  galleryModal.classList.remove('active');
}

// Fullscreen Toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen().catch(err => console.log(err));
  }
}

// Keyboard shortcuts for booth operators
window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  } else if (e.key === 'p' || e.key === 'P') {
    if (screens.reveal.classList.contains('active')) {
      printSticker();
    }
  } else if (e.key === 'Escape' || e.code === 'Space') {
    if (galleryModal.classList.contains('active')) {
      closeGallery();
    } else if (screens.reveal.classList.contains('active') || screens.qr.classList.contains('active')) {
      resetToThemes();
    }
  }
});

// Event Listeners
document.getElementById('btnBackToThemes').addEventListener('click', resetToThemes);
document.getElementById('btnNewAttendee').addEventListener('click', resetToThemes);
document.getElementById('btnPrintSticker').addEventListener('click', () => printSticker());
document.getElementById('btnReprintRecent').addEventListener('click', () => printSticker());
document.getElementById('btnOpenGallery').addEventListener('click', openGallery);
document.getElementById('btnCloseGallery').addEventListener('click', closeGallery);
document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);

// Init

hostDisplay.addEventListener('click', async () => {
  const current = hostDisplay.textContent;
  const newUrl = prompt('Enter Public / Tunnel URL for Mobile QR Code:\n(e.g., https://your-tunnel.loca.lt or https://xyz.trycloudflare.com)', current);
  if (newUrl && newUrl.trim() !== '') {
    try {
      const res = await fetch('/api/config/host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostUrl: newUrl.trim() })
      });
      const data = await res.json();
      hostDisplay.textContent = data.hostUrl;
      alert('QR Code host updated to: ' + data.hostUrl);
    } catch (e) {
      alert('Failed to update host: ' + e.message);
    }
  }
});

loadNetworkInfo();
loadThemes();
showScreen('themes');
