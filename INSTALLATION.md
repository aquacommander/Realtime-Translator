# Installation Guide

## Quick Start (5 minutes)

### Step 1: Generate Icons

1. Open `generate-icons.html` in your browser
2. Click "Generate & Download Icons"
3. Move the downloaded `icon16.png`, `icon48.png`, and `icon128.png` files to the `icons/` folder

### Step 2: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select this extension folder
6. Done! The extension icon should appear in your toolbar

### Step 3: Test the Extension

1. Join or create a Google Meet: https://meet.google.com/
2. Enable captions (click the CC button in the bottom toolbar)
3. Click the extension icon in Chrome toolbar
4. In the popup, click **Start**
5. A floating overlay will appear showing the status
6. A Google Translate tab will open showing translations

## Detailed Setup

### Prerequisites

- Google Chrome browser (version 88+)
- Active internet connection
- Google account (for Google Meet)

### File Structure Verification

Make sure your folder has these files:

```
meet-caption-translator/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── overlay.css
├── storage.js
├── translateTab.js
├── README.md
├── INSTALLATION.md
├── generate-icons.html
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Generating Icons

#### Option 1: Use the HTML Generator (Easiest)

1. Double-click `generate-icons.html` to open in browser
2. Click "Generate & Download Icons"
3. Move downloaded files to `icons/` folder

#### Option 2: Use Online Tools

- Visit https://favicon.io/favicon-generator/
- Create a 128x128 icon with globe/translation symbol
- Generate and download
- Resize to 16x16 and 48x48 using an image editor
- Save as `icon16.png`, `icon48.png`, `icon128.png` in `icons/` folder

#### Option 3: Use Any PNG Images (For Testing)

For quick testing, you can use any PNG images:
1. Find 3 PNG images
2. Rename them to `icon16.png`, `icon48.png`, `icon128.png`
3. Place in `icons/` folder

### Loading the Extension

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in address bar, OR
   - Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Look for toggle in top-right corner
   - Turn it ON

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to this extension folder
   - Select the folder (not individual files)
   - Click "Select Folder"

4. **Verify Installation**
   - Extension should appear in the list
   - Icon should appear in toolbar
   - Check for any errors (should be none)

### Pinning the Extension

For easy access:
1. Click the puzzle piece icon (Extensions) in Chrome toolbar
2. Find "Meet Caption Translator"
3. Click the pin icon to pin it to toolbar

## Configuration

### First-Time Setup

1. Click the extension icon
2. Configure settings:
   - **Target Language**: Choose your preferred language (default: Japanese)
   - **Source Language**: Leave as "Auto Detect"
   - **Translate Window**: Choose "Update Existing Tab" (recommended)

### Optional: Auto-Run Setup

To automatically start for specific meetings:

1. Copy a Google Meet URL (e.g., `https://meet.google.com/abc-defg-hij`)
2. Click extension icon
3. Paste URL in "Meeting URL" field
4. Click "Add URL"
5. Check "Enable auto-run for saved meetings"

Now the extension will auto-start when you join that meeting!

## Troubleshooting

### Extension Won't Load

- **Error: "Manifest file is missing or unreadable"**
  - Make sure `manifest.json` exists in the root folder
  - Check file is not corrupted

- **Error: "Could not load icon"**
  - Generate icons using `generate-icons.html`
  - Or temporarily use any PNG files

### Extension Not Working in Meet

1. **Check you're on Google Meet**
   - URL must be `https://meet.google.com/*`

2. **Enable Captions**
   - Click CC button in Meet toolbar
   - Captions must be visible

3. **Click Start**
   - Open extension popup
   - Click "Start" button

4. **Check Console**
   - Press F12 to open DevTools
   - Look for errors in Console tab

### Google Translate Not Opening

- Check pop-up blocker settings
- Try different "Translate Window" option
- Manually click "Open Google Translate" in popup

### Captions Not Detected

- Verify captions are visible in Meet
- Try refreshing the page
- Check browser console for errors (F12)
- Google Meet UI may have changed (caption selectors may need updating)

### Extension Disappeared

- Go to `chrome://extensions/`
- Find "Meet Caption Translator"
- Make sure it's enabled (toggle should be blue)

## Updating the Extension

After making changes to code:

1. Go to `chrome://extensions/`
2. Find "Meet Caption Translator"
3. Click the refresh icon (circular arrow)
4. Refresh any open Google Meet pages

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Meet Caption Translator"
3. Click "Remove"
4. Confirm removal

## Privacy & Permissions

This extension requires:

- **Storage**: Save your settings locally
- **Tabs**: Create/update Google Translate tabs
- **Active Tab**: Access current tab info
- **Host Permission** (`meet.google.com`): Detect captions

The extension:
- ✅ Only processes visible captions
- ✅ Only sends text to Google Translate via URL
- ✅ Stores settings locally
- ❌ Does NOT access microphone
- ❌ Does NOT access camera
- ❌ Does NOT record audio/video
- ❌ Does NOT send data to external servers

## Support

For issues:
1. Check this guide
2. Check README.md
3. Check browser console for errors (F12)
4. Verify all files are present
5. Try reloading the extension

## Next Steps

Once installed:
1. Join a Google Meet
2. Enable captions
3. Click extension icon → Start
4. Watch translations appear in Google Translate tab!

Enjoy real-time caption translation! 🌐
