# Meet Caption Translator

A Chrome extension that automatically translates Google Meet live captions using Google Translate.

## Features

- 🎯 **Real-time Translation**: Detects Google Meet captions and sends them to Google Translate
- 🌍 **Multi-language Support**: Supports all languages available in Google Translate
- 🎨 **Floating Overlay**: Shows current caption and status directly in Google Meet
- ⚙️ **Flexible Settings**: Choose translation behavior, target language, and more
- 🔒 **Privacy-Focused**: No audio/video recording, no external servers
- 📝 **Auto-Run**: Optionally auto-start for specific meeting URLs





### Basic Usage

1. Install the extension
2. Join a Google Meet meeting
3. **Enable captions** in Google Meet (CC button)
4. Click the extension icon and click **Start**
5. Captions will automatically be translated in a Google Translate tab

### Settings

Open the extension popup to configure:

- **Source Language**: Auto-detect or specify source language
- **Target Language**: Choose your preferred translation language
- **Translate Window**: 
  - Update Existing Tab (default)
  - Always New Tab
  - Popup Window
- **Auto-Run**: Automatically start for saved meeting URLs

### Floating Overlay

The overlay appears in Google Meet showing:
- Current detected caption
- Target language
- Status (Active, Paused, Sending, etc.)
- Quick controls (Pause, Open Translate, Clear History)

### Auto-Run for Specific Meetings

1. Copy the Google Meet URL
2. Open extension popup
3. Paste URL in "Meeting URL" field
4. Click **Add URL**
5. Enable "Enable auto-run for saved meetings"

The extension will automatically start when you join saved meetings.

## How It Works

### Caption Detection

- Injects content script into Google Meet pages
- Uses `MutationObserver` to detect caption DOM changes
- Extracts visible caption text only
- No audio or video access required

### Caption Stabilization

- Waits 700ms for caption to stabilize
- Ignores empty or duplicate captions
- Maintains history to prevent re-sending
- Only sends stable, complete captions

### Translation Method

Uses Google Translate website URL:
```
https://translate.google.com/?sl=auto&tl={lang}&text={caption}&op=translate
```

- Opens or updates a single Google Translate tab
- No API keys required
- No backend server needed
- Translation shown directly in Google Translate

## Permissions

- `storage`: Save user preferences and meeting URLs
- `tabs`: Create and update Google Translate tabs
- `activeTab`: Access current tab information
- Host: `https://meet.google.com/*` for content script

## Privacy

This extension:
- ✅ Only processes captions that you enable in Google Meet
- ✅ Only sends caption text to Google Translate via URL
- ✅ Stores settings locally in Chrome storage
- ❌ Does NOT access microphone
- ❌ Does NOT access camera
- ❌ Does NOT record audio or video
- ❌ Does NOT send data to any external server

## Limitations

- Relies on Google Meet's caption DOM structure (may break with UI updates)
- Google Translate URL has length limits (~2000 characters)
- No offline translation
- Requires active internet connection
- Depends on Google Translate website availability

## Troubleshooting

### Extension not working

1. Make sure you are on a Google Meet page (`https://meet.google.com/*`)
2. Enable captions in Google Meet (CC button)
3. Click extension icon and click **Start**
4. Check browser console for errors (F12)

### Captions not detected

1. Verify captions are visible in Google Meet
2. Try refreshing the page
3. Check if caption language is supported
4. Look at floating overlay status

### Google Translate not opening

1. Check popup settings for "Translate Window" option
2. Try manually clicking "Open Google Translate" in popup
3. Allow pop-ups for meet.google.com if needed

## Development

### Testing

1. Load extension in Chrome
2. Join a test Google Meet with captions
3. Open DevTools Console (F12)
4. Check console logs for debugging

### Modifying

All files are plain JavaScript/HTML/CSS:
- Edit files directly
- Reload extension in `chrome://extensions/`
- No build step required


## Contributing

Contributions welcome! Please test thoroughly before submitting PRs.

## Support

For issues or questions, please check:
1. This README
2. Browser console for errors
3. Extension permissions in Chrome

---

**Note**: This extension is not affiliated with or endorsed by Google. Google Meet and Google Translate are trademarks of Google LLC.
