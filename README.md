# JS Community Mumbai - Event Photo & Sticker Booth 🚀

An interactive, event-ready photo booth application built for **JS Community Mumbai**.

Attendees select a Mumbai JavaScript theme on a kiosk screen, scan a dynamic QR code with their mobile phone, upload their selfie with their handle, and generate custom branded artwork with a realistic die-cut vinyl sticker border ready for instant printing and digital sharing.

---

## 🌟 Key Features

1. **Conference Kiosk Display (Big Screen / Laptop)**:
   - High-contrast, conference-ready dark UI with JavaScript yellow (`#F7DF1E`) accents.
   - **6 Mumbai JavaScript Themes**:
     - 🌉 **Marine Drive Cyber-Dev**: Sea Link, Queen's Necklace, neon cyan & JS yellow.
     - 🏛️ **Gateway to Code**: Gateway of India arch with futuristic circuit lines.
     - 🚆 **Local Train Speed-Coder**: Mumbai local train express with high-speed coding vibe.
     - 🍔 **Vada Pav & JavaScript**: The developer fuel `{ spicy: true }` and code brackets.
     - ☕ **Bandra Tech District**: Hipster developer studio, sea breeze & Git commits.
     - 🌴 **Synthwave Mumbai 80s**: Retro neon sunset and 80s arcade grid.
   - Real-time QR Code with dynamic Session ID.
   - Live WebSocket status tracking (*Waiting for scan* -> *Phone connected* -> *Photo uploaded* -> *Generating* -> *Reveal*).
   - Celebratory confetti explosion and instant sticker preview.
   - Booth operator shortcuts:
     - `F`: Toggle Fullscreen
     - `P`: Print Sticker
     - `Space` / `Esc`: Next Attendee
     - `📂 Gallery`: Reprint recent stickers

2. **Mobile Web Upload UI (Attendee Phone)**:
   - Zero installation required — opens directly from the camera QR scan.
   - Direct camera selfie snapping or photo roll upload.
   - Attendee handle / name input (e.g. `@aaditya` or `Fullstack Dev`).
   - "Save Sticker to Phone" button + Web Share API to post directly on X/LinkedIn with `#JSMumbai`.

3. **High-Resolution Art & Sticker Engine**:
   - 300 DPI high-resolution output (1080x1080).
   - Die-cut white vinyl border with realistic drop shadow.
   - Official **JS Community Mumbai** header badge, logo, date, and attendee handle ribbon.
   - 100% offline-ready fail-safe mode (built with Sharp) + optional Gemini API integration.

4. **Print Station**:
   - Dedicated print layout supporting 1-up, 2-up (4"x6" photo paper), and 4-up mini stickers.
   - Zero-margin browser print configuration.

---

## 🚀 Quick Start

### 1. Start the Server
```bash
npm start
# or: node server.js
```

### 2. Open the Kiosk
Open Chrome or Edge and go to:
```
http://localhost:3000
```
Press **F** to enter full screen.

### 3. Connect from Mobile Phones
- **On Same Wi-Fi**: The app automatically detects your laptop's local IP (e.g., `http://192.168.1.50:3000`) and embeds it in the QR code. Ensure your laptop and attendee phones are on the same Wi-Fi network.
- **On Cellular / 5G / Public Internet**: If attendees are on mobile data, use a tunnel:
  ```bash
  # Using cloudflared:
  cloudflared tunnel --url http://localhost:3000
  # or using ngrok:
  ngrok http 3000
  ```
  Then set `HOST_URL` in your `.env` file or restart with:
  `HOST_URL=https://your-tunnel-url.trycloudflare.com node server.js`

---

## 🖨️ Printer Setup Tips
1. Connect your photo printer or label/sticker printer (e.g. Canon SELPHY, Epson, HP Sprocket, or thermal sticker printer).
2. Set default paper size to your sticker media (e.g. 4x6" sticker paper or 3x3" square label).
3. In Chrome's print dialog, select **Margins: None** and check **Background graphics**.
