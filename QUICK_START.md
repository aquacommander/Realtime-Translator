# Quick Start Guide (TL;DR)

## 1️⃣ Generate Icons (1 minute)

Open `generate-icons.html` in browser → Click "Generate & Download Icons" → Move files to `icons/` folder

## 2️⃣ Load Extension (1 minute)

`chrome://extensions/` → Enable Developer Mode → Load unpacked → Select this folder

## 3️⃣ Use Extension (30 seconds)

1. Join Google Meet
2. Enable captions (CC button)
3. Click extension icon
4. Click **Start**

Done! 🎉

---

## Settings Explained

| Setting | Options | Recommended |
|---------|---------|-------------|
| **Source Language** | Auto / Specific | Auto |
| **Target Language** | Any language | Your preference |
| **Translate Window** | Update Tab / New Tab / Popup | Update Tab |
| **Auto-Run** | On / Off | Off (unless you want it) |

---

## Common Commands

| Action | How |
|--------|-----|
| Start translation | Click extension icon → Start |
| Stop translation | Click Stop in popup or Pause in overlay |
| Change language | Open popup → Select target language |
| Clear history | Click "Clear History" button |
| Add meeting URL | Paste URL in popup → Add URL |
| Move overlay | Drag the overlay header |

---

## Troubleshooting (One-Liners)

- **Not working?** → Enable captions in Meet first (CC button)
- **No overlay?** → Make sure you clicked "Start" in popup
- **No translation?** → Check if pop-ups are blocked
- **Duplicate translations?** → Click "Clear History"
- **Extension gone?** → Pin it from extensions menu (puzzle piece icon)

---

## URLs You Need

- Extension management: `chrome://extensions/`
- Google Meet: `https://meet.google.com/`
- Google Translate: `https://translate.google.com/`

---

## Keyboard Shortcuts (in Meet)

- `c` - Toggle captions
- Then click extension icon → Start

---

## Pro Tips

1. **Pin the extension** for quick access (puzzle icon → pin)
2. **Use "Update Tab"** behavior to avoid tab clutter
3. **Add frequent meeting URLs** to auto-start
4. **Drag overlay** to preferred position (it stays there)
5. **Test with YouTube captions** (use auto-generated captions on videos)

---

## File Checklist

Before loading:
- ✅ `manifest.json`
- ✅ `icons/icon16.png`
- ✅ `icons/icon48.png`
- ✅ `icons/icon128.png`
- ✅ All `.js` and `.css` files

---

## Default Settings

Out of the box:
- Source: Auto-detect
- Target: Japanese
- Behavior: Update existing tab
- Auto-run: Disabled

---

## Important Notes

⚠️ **Must enable captions in Google Meet first!**

🔒 **Privacy**: No audio/video recording, only text captions

🌐 **Requires internet**: Uses Google Translate website

⏱️ **Debounce**: Waits 700ms for caption to stabilize

📝 **History**: Remembers last 10 captions to prevent duplicates

---

## One-Line Summary

**Detects Google Meet captions → Sends to Google Translate → Shows translation**

---

That's it! For detailed info, see:
- `README.md` - Full documentation
- `INSTALLATION.md` - Detailed setup
- `TEST.md` - Testing guide
