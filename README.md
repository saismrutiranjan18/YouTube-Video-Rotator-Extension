# 🔄 YouTube Rotate Pro

> Rotate any YouTube video to any angle — 90°, 180°, 270°, or any custom degree — for a comfortable viewing experience.

[![Version](https://img.shields.io/badge/version-1.2.0-red.svg)](https://github.com/saismrutiranjan18/YouTube-Video-Rotator)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)]()

---

## ✨ Features

| Feature | Description |
|---|---|
| **Quick Presets** | One-click 90°, 180°, 270° rotation |
| **Precision Slider** | Fine-tune any angle from 0° to 360° |
| **Flip** | Flip video horizontally or vertically |
| **Keyboard Shortcuts** | Rotate without touching your mouse |
| **Draggable Overlay** | Move the overlay bar anywhere on screen |
| **Auto Save** | Remembers your last rotation per session |
| **Dark UI** | Seamless YouTube-native dark theme |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt + R` | Rotate 90° Clockwise |
| `Alt + H` | Flip Horizontal |
| `Alt + Shift + R` | Reset All |
| `Alt + ↑` | Fine rotate +1° |
| `Alt + ↓` | Fine rotate −1° |

---

## 🚀 Installation

### From Chrome Web Store *(Recommended)*
1. Visit the [Chrome Web Store page]()
2. Click **Add to Chrome**
3. Open any YouTube video
4. Use the **ROTATE PRO** bar in the top-right corner

### Manual (Developer Mode)
1. Download or clone this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select this folder

---

## 🎯 Usage

1. Open any YouTube video
2. The **ROTATE PRO** overlay bar appears in the top-right corner
3. Click **⟳** to rotate 90° clockwise, **⟲** for counter-clockwise
4. Use **⇔** / **⇕** to flip the video
5. Click **↺** to reset everything
6. Click **−** to hide the overlay bar
7. Open the extension popup for quick presets and slider control

---

## 📁 File Structure

```
youtube-rotate-pro/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── content.js       ← YouTube page overlay + rotation logic
├── styles.css       ← Overlay bar styles (injected into YouTube)
├── popup.html       ← Extension popup UI
├── popup.js         ← Popup logic
├── options.html     ← Settings page UI
├── options.js       ← Settings page logic
├── manifest.json    ← Chrome extension manifest v3
├── README.md
└── LICENSE
```

---

## 🔒 Privacy

- **No data collection** — zero analytics, zero tracking
- **No external servers** — everything runs locally in your browser
- **Minimal permissions** — only requests what is strictly needed:
  - `storage` — save your rotation preferences
  - `activeTab` — access the current YouTube tab
  - `scripting` — inject the rotation transform
  - `tabs` — detect if you're on YouTube

---

## 📝 License

MIT License — Copyright (c) 2026 Sai Smruti Ranjan Das

See [LICENSE](LICENSE) for full text.