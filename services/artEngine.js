const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Theme definitions
const THEMES = {
  'marine-drive': {
    id: 'marine-drive',
    name: 'Marine Drive Cyber-Dev',
    tagline: "Queen's Necklace & Async Loops",
    primaryColor: '#00F0FF',
    accentColor: '#F7DF1E',
    bgGradient: ['#0A1128', '#1C2541', '#001F3F'],
    landmark: 'Sea Link & Marine Drive',
    badgeText: 'JS COMMUNITY MUMBAI'
  },
  'gateway-hacker': {
    id: 'gateway-hacker',
    name: 'Gateway to Code',
    tagline: 'Gateway of India Tech Matrix',
    primaryColor: '#FFD700',
    accentColor: '#38BDF8',
    bgGradient: ['#1E1B4B', '#312E81', '#0F172A'],
    landmark: 'Gateway of India',
    badgeText: 'JS COMMUNITY MUMBAI'
  },
  'local-train': {
    id: 'local-train',
    name: 'Local Train Speed-Coder',
    tagline: 'Superfast Western Line Express',
    primaryColor: '#F59E0B',
    accentColor: '#EF4444',
    bgGradient: ['#18181B', '#3F3F46', '#27272A'],
    landmark: 'Mumbai Local Express',
    badgeText: 'JS COMMUNITY MUMBAI'
  },
  'vada-pav': {
    id: 'vada-pav',
    name: 'Vada Pav & JavaScript',
    tagline: 'Fueling Devs: { spicy: true }',
    primaryColor: '#F97316',
    accentColor: '#FACC15',
    bgGradient: ['#2A1810', '#431407', '#1C1917'],
    landmark: 'Chutney & Code',
    badgeText: 'JS COMMUNITY MUMBAI'
  },
  'bandra-hipster': {
    id: 'bandra-hipster',
    name: 'Bandra Tech District',
    tagline: 'Sea Breeze, Coffee & Git Push',
    primaryColor: '#10B981',
    accentColor: '#A855F7',
    bgGradient: ['#064E3B', '#042F2E', '#0F172A'],
    landmark: 'Bandra Bandstand Skyline',
    badgeText: 'JS COMMUNITY MUMBAI'
  },
  'retro-synthwave': {
    id: 'retro-synthwave',
    name: 'Synthwave Mumbai 80s',
    tagline: 'Neon Palms & Retro Beats',
    primaryColor: '#EC4899',
    accentColor: '#8B5CF6',
    bgGradient: ['#2E0854', '#581C87', '#1E1B4B'],
    landmark: 'Retro Skyline & Palms',
    badgeText: 'JS COMMUNITY MUMBAI'
  }
};

/**
 * Generate SVG background illustration for the given theme
 */
function createThemeBackgroundSvg(themeId, width = 1000, height = 1000) {
  const theme = THEMES[themeId] || THEMES['marine-drive'];
  const [c1, c2, c3] = theme.bgGradient;

  let landmarkVisual = '';

  if (themeId === 'marine-drive') {
    landmarkVisual = `
      <!-- Sea Link Bridge cables and pylons -->
      <path d="M 0 750 Q 500 680 1000 750 L 1000 1000 L 0 1000 Z" fill="#030712" />
      <path d="M 200 750 L 320 520 L 330 520 L 450 750 Z" fill="#111827" stroke="${theme.primaryColor}" stroke-width="3" opacity="0.8" />
      <path d="M 550 750 L 670 520 L 680 520 L 800 750 Z" fill="#111827" stroke="${theme.primaryColor}" stroke-width="3" opacity="0.8" />
      <line x1="325" y1="520" x2="220" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="325" y1="520" x2="260" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="325" y1="520" x2="380" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="325" y1="520" x2="430" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="675" y1="520" x2="570" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="675" y1="520" x2="620" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="675" y1="520" x2="730" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <line x1="675" y1="520" x2="780" y2="750" stroke="${theme.primaryColor}" stroke-width="1.5" opacity="0.6"/>
      <!-- Queens necklace lights curve -->
      <path d="M 50 780 Q 400 850 950 760" fill="none" stroke="#F7DF1E" stroke-width="8" stroke-linecap="round" filter="url(#glow)" opacity="0.9"/>
      <path d="M 50 780 Q 400 850 950 760" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (themeId === 'gateway-hacker') {
    landmarkVisual = `
      <!-- Gateway of India Arch -->
      <g opacity="0.75" transform="translate(150, 480) scale(0.7)">
        <path d="M 200 450 L 200 200 L 250 150 L 350 150 L 400 120 L 600 120 L 650 150 L 750 150 L 800 200 L 800 450 L 680 450 L 680 260 Q 680 200 620 200 L 380 200 Q 320 200 320 260 L 320 450 Z" 
              fill="#0F172A" stroke="${theme.primaryColor}" stroke-width="4"/>
        <path d="M 400 200 Q 500 100 600 200 Z" fill="#1E293B" stroke="${theme.accentColor}" stroke-width="3"/>
        <circle cx="250" cy="140" r="25" fill="#1E293B" stroke="${theme.primaryColor}" stroke-width="2"/>
        <circle cx="750" cy="140" r="25" fill="#1E293B" stroke="${theme.primaryColor}" stroke-width="2"/>
        <circle cx="500" cy="280" r="8" fill="#F7DF1E" filter="url(#glow)"/>
        <line x1="500" y1="280" x2="500" y2="450" stroke="#F7DF1E" stroke-width="3" stroke-dasharray="6,6"/>
      </g>
    `;
  } else if (themeId === 'local-train') {
    landmarkVisual = `
      <!-- Rail tracks -->
      <line x1="0" y1="850" x2="1000" y2="850" stroke="#71717A" stroke-width="12"/>
      <line x1="0" y1="920" x2="1000" y2="920" stroke="#71717A" stroke-width="16"/>
      <g stroke="#3F3F46" stroke-width="8">
        <line x1="100" y1="820" x2="150" y2="960"/>
        <line x1="300" y1="820" x2="350" y2="960"/>
        <line x1="500" y1="820" x2="550" y2="960"/>
        <line x1="700" y1="820" x2="750" y2="960"/>
        <line x1="900" y1="820" x2="950" y2="960"/>
      </g>
      <!-- Train Front Shape -->
      <path d="M 320 840 L 320 540 Q 320 480 380 480 L 620 480 Q 680 480 680 540 L 680 840 Z" fill="#18181B" stroke="${theme.primaryColor}" stroke-width="6"/>
      <path d="M 330 630 L 670 630 L 670 690 L 330 690 Z" fill="#FACC15" />
      <path d="M 330 710 L 670 710 L 670 740 L 330 740 Z" fill="#991B1B" />
      <rect x="360" y="520" width="130" height="90" rx="10" fill="#0284C7" opacity="0.7"/>
      <rect x="510" y="520" width="130" height="90" rx="10" fill="#0284C7" opacity="0.7"/>
      <circle cx="500" cy="775" r="22" fill="#FEF08A" filter="url(#glow)"/>
    `;
  } else if (themeId === 'vada-pav') {
    landmarkVisual = `
      <text x="120" y="380" font-family="monospace" font-size="160" font-weight="900" fill="${theme.primaryColor}" opacity="0.25">{</text>
      <text x="760" y="380" font-family="monospace" font-size="160" font-weight="900" fill="${theme.primaryColor}" opacity="0.25">}</text>
      <g transform="translate(375, 540) scale(0.9)" opacity="0.85">
        <path d="M 50 140 Q 150 40 250 140 Z" fill="#D97706" stroke="#FEF08A" stroke-width="4"/>
        <path d="M 40 145 Q 150 160 260 145" stroke="#16A34A" stroke-width="12" stroke-linecap="round"/>
        <circle cx="150" cy="180" r="50" fill="#EAB308" stroke="#78350F" stroke-width="4"/>
        <path d="M 230 190 Q 270 180 290 140" fill="none" stroke="#22C55E" stroke-width="10" stroke-linecap="round"/>
        <rect x="40" y="210" width="220" height="40" rx="15" fill="#B45309" stroke="#FEF08A" stroke-width="4"/>
      </g>
    `;
  } else if (themeId === 'bandra-hipster') {
    landmarkVisual = `
      <path d="M 80 820 Q 130 650 160 480" stroke="#047857" stroke-width="10" fill="none"/>
      <path d="M 160 480 Q 250 450 290 490" stroke="#10B981" stroke-width="6" fill="none"/>
      <path d="M 160 480 Q 230 520 280 570" stroke="#10B981" stroke-width="6" fill="none"/>
      <path d="M 160 480 Q 100 420 50 440" stroke="#10B981" stroke-width="6" fill="none"/>
      <path d="M 160 480 Q 110 500 70 540" stroke="#10B981" stroke-width="6" fill="none"/>
      <path d="M 830 750 Q 820 700 840 660 Q 860 620 840 580" stroke="#A78BFA" stroke-width="5" fill="none" opacity="0.6"/>
      <path d="M 860 740 Q 850 700 870 660 Q 890 620 870 580" stroke="#F472B6" stroke-width="5" fill="none" opacity="0.6"/>
      <path d="M 0 850 Q 250 820 500 850 T 1000 850 L 1000 1000 L 0 1000 Z" fill="#042F2E" opacity="0.8"/>
    `;
  } else {
    // Retro Synthwave
    landmarkVisual = `
      <circle cx="500" cy="520" r="160" fill="url(#sunGrad)" filter="url(#glow)"/>
      <line x1="340" y1="520" x2="660" y2="520" stroke="#1E1B4B" stroke-width="6"/>
      <line x1="350" y1="545" x2="650" y2="545" stroke="#1E1B4B" stroke-width="8"/>
      <line x1="370" y1="575" x2="630" y2="575" stroke="#1E1B4B" stroke-width="12"/>
      <line x1="400" y1="615" x2="600" y2="615" stroke="#1E1B4B" stroke-width="16"/>
      <line x1="440" y1="655" x2="560" y2="655" stroke="#1E1B4B" stroke-width="18"/>
      <line x1="0" y1="720" x2="1000" y2="720" stroke="#EC4899" stroke-width="3"/>
      <line x1="0" y1="760" x2="1000" y2="760" stroke="#EC4899" stroke-width="3"/>
      <line x1="0" y1="820" x2="1000" y2="820" stroke="#EC4899" stroke-width="4"/>
      <line x1="0" y1="900" x2="1000" y2="900" stroke="#EC4899" stroke-width="5"/>
      <line x1="500" y1="720" x2="0" y2="1000" stroke="#8B5CF6" stroke-width="3"/>
      <line x1="500" y1="720" x2="250" y2="1000" stroke="#8B5CF6" stroke-width="3"/>
      <line x1="500" y1="720" x2="500" y2="1000" stroke="#8B5CF6" stroke-width="3"/>
      <line x1="500" y1="720" x2="750" y2="1000" stroke="#8B5CF6" stroke-width="3"/>
      <line x1="500" y1="720" x2="1000" y2="1000" stroke="#8B5CF6" stroke-width="3"/>
    `;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="50%" stop-color="${c2}"/>
          <stop offset="100%" stop-color="${c3}"/>
        </linearGradient>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FACC15"/>
          <stop offset="60%" stop-color="#F43F5E"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <pattern id="matrixGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${theme.primaryColor}" stroke-width="1" opacity="0.12"/>
        </pattern>
      </defs>

      <rect width="1000" height="1000" fill="url(#bgGrad)"/>
      <rect width="1000" height="1000" fill="url(#matrixGrid)"/>
      <circle cx="200" cy="200" r="180" fill="${theme.primaryColor}" opacity="0.15" filter="url(#glow)"/>
      <circle cx="800" cy="300" r="220" fill="${theme.accentColor}" opacity="0.12" filter="url(#glow)"/>

      <text x="50" y="100" font-family="'Courier New', monospace" font-size="28" fill="#F7DF1E" opacity="0.35">&lt;script&gt; const city = &apos;Mumbai&apos;; &lt;/script&gt;</text>
      <text x="550" y="140" font-family="'Courier New', monospace" font-size="24" fill="${theme.primaryColor}" opacity="0.3">import { community } from &apos;mumbai.js&apos;</text>
      <text x="80" y="240" font-family="'Courier New', monospace" font-size="20" fill="#FFFFFF" opacity="0.2">while(awake) { code(); eatVadaPav(); }</text>
      <text x="620" y="270" font-family="'Courier New', monospace" font-size="22" fill="#F7DF1E" opacity="0.25">await localTrain.catch();</text>

      ${landmarkVisual}
    </svg>
  `;
}

/**
 * Generate official JS Community Mumbai Overlay Badge & Frame SVG
 */
function createStickerOverlaySvg({
  width = 1000,
  height = 1000,
  themeId = 'marine-drive',
  handle = '',
  dateStr = new Date().getFullYear().toString()
}) {
  const theme = THEMES[themeId] || THEMES['marine-drive'];
  const sanitizedHandle = escapeXml((handle || 'MUMBAI DEVELOPER').trim().toUpperCase());
  const escapedThemeName = escapeXml(theme.name.toUpperCase());
  const escapedTagline = escapeXml(theme.tagline);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Top Header Badge: JS COMMUNITY MUMBAI -->
      <g filter="url(#badgeShadow)" transform="translate(50, 40)">
        <rect x="0" y="0" width="900" height="95" rx="20" fill="#111827" stroke="#F7DF1E" stroke-width="4"/>
        
        <g transform="translate(18, 14)">
          <rect width="66" height="66" rx="10" fill="#F7DF1E"/>
          <text x="33" y="49" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="44" fill="#000000" text-anchor="middle">JS</text>
        </g>

        <text x="105" y="44" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" letter-spacing="1.5">
          JS COMMUNITY MUMBAI
        </text>
        <text x="105" y="74" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="18" fill="${theme.primaryColor}" letter-spacing="2">
          ${escapedThemeName} • ${dateStr}
        </text>

        <g transform="translate(805, 18)">
          <rect width="70" height="58" rx="8" fill="#F7DF1E"/>
          <text x="35" y="30" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#000000" text-anchor="middle">BOM</text>
          <text x="35" y="46" font-family="Arial, sans-serif" font-weight="800" font-size="10" fill="#000000" text-anchor="middle">#JSMumbai</text>
        </g>
      </g>

      <!-- Bottom Attendee Name Ribbon & Hashtag Badge -->
      <g filter="url(#badgeShadow)" transform="translate(60, 840)">
        <rect x="0" y="0" width="880" height="110" rx="24" fill="#0F172A" stroke="${theme.primaryColor}" stroke-width="4"/>
        <path d="M 0 24 Q 0 0 24 0 L 36 0 L 36 110 L 24 110 Q 0 110 0 86 Z" fill="#F7DF1E"/>

        <text x="60" y="50" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="36" fill="#FFFFFF" letter-spacing="1">
          ${sanitizedHandle}
        </text>
        <text x="60" y="85" font-family="'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="20" fill="${theme.accentColor}">
          ${escapedTagline}
        </text>

        <g transform="translate(710, 18)">
          <rect width="145" height="74" rx="14" fill="#F7DF1E"/>
          <text x="72" y="34" font-family="Arial Black, sans-serif" font-size="17" font-weight="900" fill="#000000" text-anchor="middle">CERTIFIED</text>
          <text x="72" y="56" font-family="Arial Black, sans-serif" font-size="14" font-weight="900" fill="#991B1B" text-anchor="middle">JS DEVELOPER</text>
        </g>
      </g>
    </svg>
  `;
}

function createDieCutFrameSvg(width = 1000, height = 1000, borderWidth = 24) {
  const r = 48;
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="stickerShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <rect x="${borderWidth/2}" y="${borderWidth/2}" 
            width="${width - borderWidth}" height="${height - borderWidth}" 
            rx="${r}" ry="${r}" 
            fill="none" 
            stroke="#FFFFFF" 
            stroke-width="${borderWidth}"
            filter="url(#stickerShadow)"/>
    </svg>
  `;
}

async function generateSticker({ photoInput, themeId = 'marine-drive', handle = '', outputPath }) {
  const STICKER_SIZE = 1080;
  const theme = THEMES[themeId] || THEMES['marine-drive'];

  const bgSvg = Buffer.from(createThemeBackgroundSvg(theme.id, STICKER_SIZE, STICKER_SIZE));
  const bgImageBuffer = await sharp(bgSvg).png().toBuffer();

  const photoSize = 700;
  let processedPhotoBuffer;

  try {
    const circleMaskSvg = Buffer.from(`
      <svg width="${photoSize}" height="${photoSize}" viewBox="0 0 ${photoSize} ${photoSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${photoSize/2}" cy="${photoSize/2}" r="${photoSize/2 - 12}" fill="#FFFFFF"/>
      </svg>
    `);

    // .rotate() auto-orients images based on EXIF (crucial for mobile phone photos!)
    const photoBase = sharp(photoInput)
      .rotate()
      .resize(photoSize, photoSize, {
        fit: 'cover',
        position: 'center'
      })
      .modulate({
        brightness: 1.05,
        saturation: 1.25
      });

    const borderRingSvg = Buffer.from(`
      <svg width="${photoSize}" height="${photoSize}" viewBox="0 0 ${photoSize} ${photoSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${photoSize/2}" cy="${photoSize/2}" r="${photoSize/2 - 12}" fill="none" stroke="${theme.primaryColor}" stroke-width="12"/>
        <circle cx="${photoSize/2}" cy="${photoSize/2}" r="${photoSize/2 - 4}" fill="none" stroke="#F7DF1E" stroke-width="4"/>
      </svg>
    `);
    const borderRing = await sharp(borderRingSvg).png().toBuffer();

    const maskedPhoto = await photoBase
      .composite([{ input: circleMaskSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();

    processedPhotoBuffer = await sharp(maskedPhoto)
      .composite([{ input: borderRing, top: 0, left: 0 }])
      .png()
      .toBuffer();

  } catch (err) {
    console.error('Error processing attendee photo, using fallback:', err);
    processedPhotoBuffer = await sharp({
      create: {
        width: photoSize,
        height: photoSize,
        channels: 4,
        background: { r: 40, g: 40, b: 50, alpha: 1 }
      }
    }).png().toBuffer();
  }

  const overlaySvg = Buffer.from(createStickerOverlaySvg({
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    themeId: theme.id,
    handle
  }));
  const overlayBuffer = await sharp(overlaySvg).png().toBuffer();

  const dieCutSvg = Buffer.from(createDieCutFrameSvg(STICKER_SIZE, STICKER_SIZE, 26));
  const dieCutBuffer = await sharp(dieCutSvg).png().toBuffer();

  await sharp(bgImageBuffer)
    .composite([
      {
        input: processedPhotoBuffer,
        top: 145,
        left: 190
      },
      {
        input: overlayBuffer,
        top: 0,
        left: 0
      },
      {
        input: dieCutBuffer,
        top: 0,
        left: 0
      }
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outputPath);

  return {
    success: true,
    theme,
    outputPath,
    dimensions: { width: STICKER_SIZE, height: STICKER_SIZE }
  };
}

module.exports = {
  THEMES,
  generateSticker,
  createThemeBackgroundSvg,
  createStickerOverlaySvg
};
