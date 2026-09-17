const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const qrcode = require('qrcode');
const { generateSticker, THEMES } = require('./services/artEngine');

async function runTests() {
  console.log('--- RUNNING STICKER ENGINE TESTS ---');

  // 1. Create a synthetic test portrait
  const samplePhotoPath = path.join(__dirname, 'test_portrait.png');
  const samplePhotoSvg = `
    <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FCD34D"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="#1E293B"/>
      <!-- Developer avatar head -->
      <circle cx="300" cy="240" r="140" fill="url(#skin)"/>
      <!-- Glasses -->
      <rect x="200" y="210" width="80" height="40" rx="8" fill="none" stroke="#000" stroke-width="8"/>
      <rect x="320" y="210" width="80" height="40" rx="8" fill="none" stroke="#000" stroke-width="8"/>
      <line x1="280" y1="230" x2="320" y2="230" stroke="#000" stroke-width="8"/>
      <!-- Big Smile -->
      <path d="M 240 290 Q 300 350 360 290" stroke="#000" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- Developer Hoodie -->
      <path d="M 120 600 C 140 430 460 430 480 600 Z" fill="#0284C7"/>
      <!-- JavaScript logo badge on hoodie -->
      <rect x="270" y="470" width="60" height="60" rx="8" fill="#F7DF1E"/>
      <text x="300" y="515" font-family="sans-serif" font-weight="900" font-size="34" fill="#000" text-anchor="middle">JS</text>
    </svg>
  `;
  await sharp(Buffer.from(samplePhotoSvg)).png().toFile(samplePhotoPath);
  console.log('✓ Created test portrait at:', samplePhotoPath);

  // 2. Generate stickers for each theme
  const themes = Object.keys(THEMES);
  console.log(`✓ Testing generation for ${themes.length} themes:`, themes.join(', '));

  for (const themeId of themes) {
    const outputPath = path.join(__dirname, 'stickers', `test-${themeId}.png`);
    const result = await generateSticker({
      photoInput: samplePhotoPath,
      themeId,
      handle: '@mumbai_dev',
      outputPath
    });

    const meta = await sharp(outputPath).metadata();
    if (meta.width === 1080 && meta.height === 1080) {
      console.log(`  ✓ Theme [${themeId}] successfully generated: 1080x1080 px (${(meta.size/1024).toFixed(1)} KB)`);
    } else {
      throw new Error(`Invalid dimensions for ${themeId}: ${meta.width}x${meta.height}`);
    }
  }

  // 3. Test QR code generation
  const testUrl = 'http://192.168.1.100:3000/upload?session=BOM-TEST&theme=marine-drive';
  const qrDataUrl = await qrcode.toDataURL(testUrl);
  if (qrDataUrl.startsWith('data:image/png;base64,')) {
    console.log('✓ Dynamic QR code successfully generated');
  } else {
    throw new Error('QR code generation failed');
  }

  console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
