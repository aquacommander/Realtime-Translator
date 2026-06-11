# Troubleshooting Guide

Quick solutions to common issues with Meet Caption Translator.

---

## 🚨 Extension Won't Load

### Problem: "Manifest file is missing or unreadable"

**Solution:**
1. Check that `manifest.json` exists in the root folder
2. Open `manifest.json` and verify it's valid JSON (no syntax errors)
3. Make sure you selected the **folder**, not a file, when loading unpacked

### Problem: "Could not load icon"

**Solution:**
1. Open `generate-icons.html` in browser
2. Click "Generate & Download Icons"
3. Move downloaded files to `icons/` folder
4. Reload extension in `chrome://extensions/`

### Problem: Extension loads but icon doesn't appear

**Solution:**
1. Click the puzzle piece icon (Extensions) in Chrome toolbar
2. Find "Meet Caption Translator"
3. Click the pin icon to pin it

---

## 🎯 Extension Not Working in Meet

### Problem: Nothing happens when I click Start

**Checklist:**
- [ ] Are you on `https://meet.google.com/*` URL?
- [ ] Are captions enabled in Meet (CC button)?
- [ ] Did you click "Start" in the extension popup?
- [ ] Is the extension enabled in `chrome://extensions/`?

**Debug Steps:**
1. Press `F12` to open DevTools
2. Look for errors in Console tab
3. Check if content script loaded: Type `TranslateTabManager` in console
4. If undefined, refresh the Meet page

### Problem: Overlay doesn't appear

**Solution:**
1. Click extension icon
2. Verify status shows "Active"
3. Check console for "Started observing captions"
4. Overlay might be off-screen - try refreshing page

### Problem: "Caption container not found"

**Solution:**
1. **Enable captions first!** Click CC button in Meet
2. Make sure captions are visible on screen
3. Extension will auto-retry every 3 seconds
4. If still failing, Google Meet UI may have changed (see below)

---

## 🌐 Google Translate Issues

### Problem: Google Translate tab doesn't open

**Solution:**
1. Check if pop-ups are blocked
   - Look for blocked pop-up icon in address bar
   - Allow pop-ups for `meet.google.com`
2. Try different translate behavior:
   - Open popup → Translate Window → "Always New Tab"
3. Manually click "Open Google Translate" in popup

### Problem: Google Translate shows wrong language

**Solution:**
1. Open extension popup
2. Change "Target Language" to desired language
3. Click "Clear History"
4. Try again with new caption

### Problem: Translation is incomplete/cut off

**Cause:** Caption too long (URL limit ~2000 chars)

**Solution:**
- This is normal for very long captions
- Extension auto-truncates to ~1500 chars
- Speak shorter sentences for better results

---

## 🔄 Caption Detection Issues

### Problem: Some captions aren't detected

**Possible Causes:**
1. Caption changes too fast (debounce not triggering)
2. Caption is duplicate of recent caption
3. Caption is empty/whitespace only

**Solution:**
1. Check console for "Duplicate caption, skipping"
2. Click "Clear History" to reset
3. Adjust speaking pace (slower/clearer)

### Problem: Same caption sent multiple times

**Solution:**
1. Click "Clear History" button
2. Refresh the Meet page
3. Restart the extension

### Problem: Captions detected but not translated

**Debug Steps:**
1. Open console (`F12`)
2. Look for "Sending caption to translate: [text]"
3. If missing, check if `TranslateTabManager` is defined
4. If present but no tab opens, check pop-up blocker

---

## ⚙️ Settings & Storage Issues

### Problem: Settings don't save

**Solution:**
1. Check extension has `storage` permission
2. Open console in popup (right-click icon → Inspect popup)
3. Test storage:
   ```javascript
   chrome.storage.local.set({test: 'value'}, () => {
     chrome.storage.local.get('test', console.log);
   });
   ```
4. If fails, reinstall extension

### Problem: Auto-run not working

**Checklist:**
- [ ] Is "Enable auto-run for saved meetings" checked?
- [ ] Did you add the meeting URL to saved list?
- [ ] Is the URL format correct? (Must include `meet.google.com`)
- [ ] Did you refresh the Meet page after enabling?

**Solution:**
1. Copy full Meet URL from address bar
2. Paste in popup → Add URL
3. Verify it appears in saved list
4. Check "Enable auto-run for saved meetings"
5. **Refresh the Meet page**

---

## 🐛 Console Errors

### Error: "Cannot read property 'textContent' of null"

**Cause:** Caption element not found

**Solution:**
1. Enable captions in Meet
2. Refresh page
3. If persists, Google Meet UI changed (see Updating Selectors)

### Error: "Extension context invalidated"

**Cause:** Extension was reloaded/updated

**Solution:**
1. Close all Google Meet tabs
2. Reopen Google Meet
3. Start extension again

### Error: "Cannot access chrome.tabs"

**Cause:** Missing permission

**Solution:**
1. Check `manifest.json` includes `"tabs"` in permissions
2. Reload extension
3. Restart Chrome if needed

---

## 🔧 Advanced Troubleshooting

### Updating Caption Selectors (If Google Meet Changes)

If captions aren't detected after a Google Meet update:

1. Open DevTools (`F12`) in Meet
2. Right-click a caption and select "Inspect"
3. Note the element's class names
4. Open `content.js`
5. Find `CAPTION_SELECTORS` array:
   ```javascript
   const CAPTION_SELECTORS = [
     '[jsname="tgaKEf"]',
     '.iOzk7',
     // Add new selectors here
   ];
   ```
6. Add the new class names
7. Reload extension

### Testing in Console

**Check if content script loaded:**
```javascript
typeof TranslateTabManager !== 'undefined'
// Should return: true
```

**Test translate URL builder:**
```javascript
TranslateTabManager.buildTranslateUrl('Hello', 'ja', 'auto')
// Should return: https://translate.google.com/?sl=auto&tl=ja&text=Hello&op=translate
```

**Check storage:**
```javascript
chrome.storage.local.get(null, console.log)
// Should show all settings
```

**Test caption detection manually:**
```javascript
document.querySelectorAll('[jsname="tgaKEf"]')
// Should return caption elements
```

### Complete Reset

If nothing works:

1. Remove extension: `chrome://extensions/` → Remove
2. Clear Chrome cache: Settings → Privacy → Clear browsing data
3. Close all Chrome windows
4. Reopen Chrome
5. Regenerate icons
6. Reload extension fresh
7. Test in new Meet session

---

## 📊 Performance Issues

### Problem: Browser becomes slow/laggy

**Causes:**
- Too many translation tabs open
- Extension running for long session
- Memory leak (rare)

**Solution:**
1. Close extra Google Translate tabs
2. Use "Update Existing Tab" behavior
3. Pause extension when not needed
4. Refresh Meet page periodically

### Problem: High CPU usage

**Causes:**
- Rapid caption changes triggering frequent updates
- Multiple MutationObservers running

**Solution:**
1. Check only one Meet tab has extension active
2. Disable other extensions temporarily
3. Try increasing debounce delay (edit `content.js`)

---

## 🔐 Permission Errors

### Problem: "Extension requires additional permissions"

**Solution:**
1. Click "Accept" or "Allow"
2. If declined, reinstall extension
3. Permissions needed:
   - Storage (save settings)
   - Tabs (open translate)
   - Host permission for meet.google.com

### Problem: "Cannot access meet.google.com"

**Solution:**
1. Check `manifest.json` has:
   ```json
   "host_permissions": [
     "https://meet.google.com/*"
   ]
   ```
2. Reload extension
3. Accept permissions prompt

---

## 🌍 Multi-Language Issues

### Problem: Wrong language detected

**Solution:**
1. Change "Source Language" from "Auto" to specific language
2. Make sure you're speaking the language you set
3. Google Translate's auto-detect may not be perfect

### Problem: Translation quality is poor

**Note:** This extension uses Google Translate's service. Translation quality is determined by Google Translate, not this extension.

**Workarounds:**
1. Speak clearly and use common phrases
2. Try different source language setting
3. Use simpler vocabulary
4. Consider using Google Translate directly for important text

---

## 🆘 Getting More Help

### Check These First
1. ✅ Read `README.md` for detailed documentation
2. ✅ Read `INSTALLATION.md` for setup help  
3. ✅ Read `TEST.md` to run tests
4. ✅ Check browser console for errors

### Gather Debug Info

Before reporting issues:
1. **Chrome Version**: `chrome://version/`
2. **Extension Version**: Check `manifest.json`
3. **Console Errors**: Copy from DevTools
4. **Settings**: Screenshot of popup
5. **Meet URL**: (Sanitized, don't share actual meeting codes)

### Check Extension Components

| Component | How to Check | Expected Result |
|-----------|--------------|-----------------|
| Manifest | Open manifest.json | Valid JSON, version 3 |
| Icons | Check icons/ folder | 3 PNG files present |
| Content Script | Console: `typeof TranslateTabManager` | Returns "object" |
| Storage | Console: `chrome.storage.local.get(null, console.log)` | Shows settings |
| Popup | Right-click icon → Inspect | Opens without errors |

---

## 📝 Common Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| Won't load | Check manifest.json, regenerate icons |
| No icon | Pin from extensions menu |
| Not working | Enable captions first, click Start |
| No overlay | Refresh Meet page |
| No translate tab | Allow pop-ups, change behavior |
| Duplicate translations | Clear history |
| Wrong language | Change target language in popup |
| Settings don't save | Reload extension |
| Auto-run fails | Check checkbox, refresh page |
| Console errors | Close and reopen Meet tab |

---

## 🎓 Prevention Tips

To avoid issues:
1. ✅ **Always enable captions first** before starting extension
2. ✅ **Pin the extension** so it's easy to access
3. ✅ **Use "Update Tab"** behavior to avoid tab clutter
4. ✅ **Clear history occasionally** to prevent duplicates
5. ✅ **Refresh Meet page** if extension stops working
6. ✅ **Check console** when debugging issues
7. ✅ **Keep Chrome updated** for best compatibility

---

Still having issues? Check:
- `README.md` - Full documentation
- `TEST.md` - Run test procedures
- Browser console - Look for error messages
- `chrome://extensions/` - Check extension status

**Remember**: This extension only processes captions that are already visible in Google Meet. It cannot create captions - you must enable them manually!
