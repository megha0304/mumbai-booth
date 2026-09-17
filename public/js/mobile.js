
const socket = io();

// Parse query params
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session') || 'DIRECT';
const initialThemeId = urlParams.get('theme') || 'marine-drive';

// DOM elements
const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const btnOpenCam = document.getElementById('btnOpenCam');
const btnOpenGallery = document.getElementById('btnOpenGallery');

const uploadBox = document.getElementById('uploadBox');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewImg = document.getElementById('previewImg');
const retakeBtn = document.getElementById('retakeBtn');
const handleInput = document.getElementById('handleInput');
const btnSubmit = document.getElementById('btnSubmit');
const sessionPill = document.getElementById('sessionPill');
const themeNameEl = document.getElementById('themeName');
const themeTaglineEl = document.getElementById('themeTagline');
const themeIconEl = document.getElementById('themeIcon');

const formView = document.getElementById('formView');
const mobileLoading = document.getElementById('mobileLoading');
const mobileSuccess = document.getElementById('mobileSuccess');
const finalStickerImg = document.getElementById('finalStickerImg');
const btnDownloadSticker = document.getElementById('btnDownloadSticker');
const btnShareSticker = document.getElementById('btnShareSticker');
const btnMakeAnother = document.getElementById('btnMakeAnother');

let selectedBlob = null;
let currentThemeId = initialThemeId;

// Display session ID
sessionPill.textContent = sessionId;

// Join Socket session
socket.emit('join:session', {
  sessionId,
  clientType: 'mobile'
});

// Theme Info mapping
const themesMeta = {
  'marine-drive': { name: 'Marine Drive Cyber-Dev', icon: '🌉', tagline: "Queen's Necklace & Async Loops" },
  'gateway-hacker': { name: 'Gateway to Code', icon: '🏛️', tagline: 'Gateway of India Tech Matrix' },
  'local-train': { name: 'Local Train Speed-Coder', icon: '🚆', tagline: 'Fast Track Western Express' },
  'vada-pav': { name: 'Vada Pav & JavaScript', icon: '🍔', tagline: 'Fueling Devs: { spicy: true }' },
  'bandra-hipster': { name: 'Bandra Tech District', icon: '☕', tagline: 'Sea Breeze, Coffee & Git Push' },
  'retro-synthwave': { name: 'Synthwave Mumbai 80s', icon: '🌴', tagline: 'Neon Palms & Retro Beats' }
};

function updateThemeDisplay(tId) {
  currentThemeId = tId;
  const meta = themesMeta[tId] || themesMeta['marine-drive'];
  themeNameEl.textContent = meta.name;
  themeTaglineEl.textContent = meta.tagline;
  themeIconEl.textContent = meta.icon;
}

updateThemeDisplay(initialThemeId);

// Fast Client-Side Image Resizer (Compresses 15MB phone photos to ~150KB in 50ms)
function optimizeImage(file, maxDimension = 1000, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', quality) });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Handle Camera button
btnOpenCam.addEventListener('click', (e) => {
  e.stopPropagation();
  cameraInput.click();
});

// Handle Gallery button
btnOpenGallery.addEventListener('click', (e) => {
  e.stopPropagation();
  galleryInput.click();
});

async function handleFileSelection(file) {
  if (!file) return;
  
  // Show quick processing indicator
  uploadPlaceholder.innerHTML = '<div class="mobile-spinner" style="width:36px;height:36px;margin:0 auto 8px;"></div><p style="font-size:0.85rem;color:#F7DF1E;">Optimizing selfie...</p>';

  try {
    const { blob, dataUrl } = await optimizeImage(file);
    selectedBlob = blob;

    previewImg.src = dataUrl;
    previewImg.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
    uploadBox.classList.add('has-photo');
    retakeBtn.style.display = 'block';
    btnSubmit.disabled = false;
  } catch (err) {
    console.error('Error optimizing photo:', err);
    selectedBlob = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      previewImg.src = event.target.result;
      previewImg.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
      uploadBox.classList.add('has-photo');
      retakeBtn.style.display = 'block';
      btnSubmit.disabled = false;
    };
    reader.readAsDataURL(file);
  }
}

cameraInput.addEventListener('change', (e) => {
  handleFileSelection(e.target.files[0]);
});

galleryInput.addEventListener('change', (e) => {
  handleFileSelection(e.target.files[0]);
});

function resetPhoto() {
  cameraInput.value = '';
  galleryInput.value = '';
  selectedBlob = null;
  previewImg.src = '';
  previewImg.style.display = 'none';
  uploadPlaceholder.style.display = 'flex';
  uploadPlaceholder.innerHTML = `
    <p style="font-size: 0.9rem; color: #94A3B8; margin-bottom: 0.25rem;">Select how you want to add your photo:</p>
    <div class="source-buttons-row">
      <button type="button" class="btn-source btn-source-camera" id="btnOpenCam">
        <span class="source-icon">📸</span>
        <span class="source-label">Take Selfie</span>
        <span class="source-sub">Open Camera</span>
      </button>
      <button type="button" class="btn-source btn-source-gallery" id="btnOpenGallery">
        <span class="source-icon">🖼️</span>
        <span class="source-label">Photo Gallery</span>
        <span class="source-sub">Pick from Photos</span>
      </button>
    </div>
  `;
  document.getElementById('btnOpenCam').addEventListener('click', () => cameraInput.click());
  document.getElementById('btnOpenGallery').addEventListener('click', () => galleryInput.click());
  uploadBox.classList.remove('has-photo');
  retakeBtn.style.display = 'none';
  btnSubmit.disabled = true;
}

retakeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  resetPhoto();
});

// Submit Photo & Generate
btnSubmit.addEventListener('click', async () => {
  if (!selectedBlob) return;

  btnSubmit.disabled = true;
  formView.style.display = 'none';
  mobileLoading.style.display = 'block';

  // Inform kiosk
  socket.emit('phone:uploading', { sessionId });

  const formData = new FormData();
  formData.append('photo', selectedBlob, 'selfie.jpg');
  formData.append('sessionId', sessionId);
  formData.append('themeId', currentThemeId);
  formData.append('handle', handleInput.value.trim() || 'MUMBAI DEV');

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showSuccess(data.stickerUrl);
    } else {
      alert('Generation error: ' + (data.error || 'Unknown'));
      formView.style.display = 'flex';
      mobileLoading.style.display = 'none';
      btnSubmit.disabled = false;
    }
  } catch (err) {
    alert('Upload failed: ' + err.message);
    formView.style.display = 'flex';
    mobileLoading.style.display = 'none';
    btnSubmit.disabled = false;
  }
});

function showSuccess(stickerUrl) {
  mobileLoading.style.display = 'none';
  mobileSuccess.style.display = 'flex';

  // Ensure relative or proper URL
  const resolvedUrl = stickerUrl.startsWith('http') ? stickerUrl : (window.location.origin + stickerUrl);
  finalStickerImg.src = resolvedUrl;
  btnDownloadSticker.href = resolvedUrl;

  // Setup Web Share API if supported
  if (navigator.share) {
    btnShareSticker.style.display = 'flex';
    btnShareSticker.onclick = async () => {
      try {
        await navigator.share({
          title: 'My JS Community Mumbai Sticker',
          text: 'Just got my custom JS Community Mumbai vinyl sticker at the booth! 🚀 #JSMumbai #JSCommunityMumbai',
          url: resolvedUrl
        });
      } catch (e) {
        console.log('Share canceled or not supported');
      }
    };
  } else {
    btnShareSticker.style.display = 'none';
  }
}

if (btnMakeAnother) {
  btnMakeAnother.addEventListener('click', () => {
    mobileSuccess.style.display = 'none';
    formView.style.display = 'flex';
    resetPhoto();
  });
}
