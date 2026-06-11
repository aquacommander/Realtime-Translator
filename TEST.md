# Testing Guide

## Pre-Testing Checklist

- [ ] All files are present in the extension folder
- [ ] Icons generated and placed in `icons/` folder
- [ ] Extension loaded in Chrome (`chrome://extensions/`)
- [ ] Extension is enabled (toggle is blue)
- [ ] Extension icon is visible in toolbar

## Test Scenarios

### Test 1: Basic Installation

**Expected Result**: Extension loads without errors

1. Go to `chrome://extensions/`
2. Verify "Meet Caption Translator" is listed
3. Check for error messages (should be none)
4. Extension icon should appear in toolbar

**Status**: ☐ Pass ☐ Fail

---

### Test 2: Popup UI

**Expected Result**: Popup opens and displays correctly

1. Click extension icon in toolbar
2. Popup should open (360px wide)
3. All sections visible:
   - Status
   - Control buttons (Start/Stop)
   - Translation Settings
   - Auto-Run Settings
   - Actions
4. Dropdowns and inputs functional

**Status**: ☐ Pass ☐ Fail

---

### Test 3: Settings Persistence

**Expected Result**: Settings are saved and persist

1. Open popup
2. Change target language to "Spanish"
3. Change translate behavior to "Always New Tab"
4. Close popup
5. Reopen popup
6. Verify settings are still "Spanish" and "Always New Tab"

**Status**: ☐ Pass ☐ Fail

---

### Test 4: Caption Detection (Manual Test)

**Expected Result**: Extension detects captions and shows overlay

1. Join Google Meet: https://meet.google.com/
2. Enable captions (CC button)
3. Say something or play audio
4. Open extension popup
5. Click "Start"
6. Verify floating overlay appears in top-right
7. Speak or play audio with captions on
8. Verify overlay updates with caption text

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________

---

### Test 5: Google Translate Integration

**Expected Result**: Captions are sent to Google Translate

1. Complete Test 4 first
2. With captions active and extension started
3. Speak a sentence and wait for caption to stabilize
4. After 700ms, Google Translate tab should open/update
5. Verify caption text appears in Google Translate
6. Verify translation is shown

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________

---

### Test 6: Duplicate Prevention

**Expected Result**: Same caption not sent multiple times

1. Extension started with captions on
2. Speak the same sentence twice
3. Only first instance should be sent to Google Translate
4. Check console (F12) for "Duplicate caption, skipping" message

**Status**: ☐ Pass ☐ Fail

---

### Test 7: Pause/Resume

**Expected Result**: Extension can be paused and resumed

1. Extension started
2. Click "Pause" in overlay or popup
3. Status should show "Paused"
4. Speak with captions on
5. Verify NO translation is sent
6. Click "Resume"
7. Speak again
8. Verify translation IS sent

**Status**: ☐ Pass ☐ Fail

---

### Test 8: Different Translate Behaviors

**Expected Result**: Each behavior works correctly

**Test 8a: Update Existing Tab**
1. Set behavior to "Update Existing Tab"
2. Start extension
3. Trigger multiple captions
4. Verify only ONE Google Translate tab exists
5. Verify tab updates with each caption

**Status**: ☐ Pass ☐ Fail

**Test 8b: Always New Tab**
1. Set behavior to "Always New Tab"
2. Start extension
3. Trigger 3 captions
4. Verify 3 separate Google Translate tabs are created

**Status**: ☐ Pass ☐ Fail

**Test 8c: Popup Window**
1. Set behavior to "Popup Window"
2. Start extension
3. Trigger caption
4. Verify Google Translate opens in small popup window
5. Trigger another caption
6. Verify same popup window is updated

**Status**: ☐ Pass ☐ Fail

---

### Test 9: Auto-Run URLs

**Expected Result**: Extension auto-starts for saved URLs

1. In a Google Meet, copy the URL
2. Open extension popup
3. Paste URL in "Meeting URL" field
4. Click "Add URL"
5. Verify URL appears in saved list
6. Enable "Enable auto-run for saved meetings"
7. Refresh Google Meet page
8. Extension should auto-start
9. Verify overlay appears automatically

**Status**: ☐ Pass ☐ Fail

---

### Test 10: Clear History

**Expected Result**: Caption history is cleared

1. Extension running with several captions processed
2. Click "Clear History" in overlay or popup
3. Previously sent captions should now be sendable again
4. Console should show "Caption history cleared"

**Status**: ☐ Pass ☐ Fail

---

### Test 11: Overlay Dragging

**Expected Result**: Overlay can be dragged around screen

1. Extension started with overlay visible
2. Click and hold overlay header
3. Drag to different position
4. Release
5. Verify overlay stays in new position

**Status**: ☐ Pass ☐ Fail

---

### Test 12: Multiple Languages

**Expected Result**: Different target languages work

1. Set target language to "Japanese"
2. Process English caption
3. Verify Japanese translation in Google Translate
4. Change target to "Spanish"
5. Process English caption
6. Verify Spanish translation

**Status**: ☐ Pass ☐ Fail

---

### Test 13: Error Handling

**Expected Result**: Extension handles edge cases gracefully

**Test 13a: No Captions**
1. Join Meet without enabling captions
2. Start extension
3. Should show "Caption container not found"
4. Should retry automatically

**Status**: ☐ Pass ☐ Fail

**Test 13b: Very Long Caption**
1. Enable captions
2. Speak a very long sentence (100+ words)
3. Extension should truncate to ~1500 chars
4. Should show warning in console

**Status**: ☐ Pass ☐ Fail

**Test 13c: Empty Captions**
1. Extension running
2. Silence (no speech)
3. Should not send empty text
4. No errors in console

**Status**: ☐ Pass ☐ Fail

---

## Manual Console Testing

Open DevTools (F12) and run these in Console:

### Test Storage
```javascript
// Check default settings
chrome.storage.local.get(null, console.log);

// Save test setting
chrome.storage.local.set({targetLanguage: 'test'}, () => {
  chrome.storage.local.get('targetLanguage', console.log);
});
```

### Test URL Builder
```javascript
// In content script context
TranslateTabManager.buildTranslateUrl('Hello world', 'ja', 'auto');
// Should return: https://translate.google.com/?sl=auto&tl=ja&text=Hello%20world&op=translate
```

## Browser Console Checks

During testing, watch for:

### Expected Console Messages
- ✅ "Meet Caption Translator: Initializing..."
- ✅ "Started observing captions"
- ✅ "Sending caption to translate: [text]"
- ✅ "Caption history cleared"

### Unexpected Messages (Issues)
- ❌ Any error messages in red
- ❌ "Caption container not found" (if captions are enabled)
- ❌ Failed to fetch errors
- ❌ Undefined variable errors

## Performance Testing

### Test 14: Rapid Captions

**Expected Result**: Extension handles rapid caption changes

1. Extension started
2. Speak quickly or play fast audio
3. Captions update rapidly
4. Verify debounce works (only sends after 700ms stabilization)
5. Check console for performance issues
6. UI should remain responsive

**Status**: ☐ Pass ☐ Fail

---

### Test 15: Long Session

**Expected Result**: Extension works for extended period

1. Start extension
2. Leave running for 30+ minutes with periodic captions
3. Verify no memory leaks
4. Verify overlay still responsive
5. Verify translations still working
6. Check console for accumulated errors

**Status**: ☐ Pass ☐ Fail

---

## Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Popup doesn't open | Extension not loaded | Reload extension |
| Overlay doesn't appear | Not on Meet page | Verify URL is meet.google.com |
| No captions detected | Captions not enabled | Click CC button in Meet |
| Translate doesn't open | Pop-up blocker | Allow pop-ups for meet.google.com |
| Duplicate translations | History not working | Clear history and restart |
| Extension stops working | Content script error | Refresh Meet page |

## Debugging Tips

1. **Open Console**: Press F12 in Google Meet tab
2. **Check Extension Console**: Right-click extension icon → "Inspect popup"
3. **Check Background Console**: Go to `chrome://extensions/` → Click "Inspect views: background page"
4. **Monitor Network**: DevTools → Network tab → Watch for translate.google.com requests
5. **Check Storage**: DevTools → Application → Storage → Local Storage

## Test Report Template

```
Extension Version: 1.0.0
Chrome Version: _______________
Test Date: _______________
Tester: _______________

Tests Passed: _____ / 15
Tests Failed: _____ / 15

Critical Issues:
1. _______________________
2. _______________________

Minor Issues:
1. _______________________
2. _______________________

Notes:
_______________________
_______________________
```

## Next Steps After Testing

- [ ] All tests passing
- [ ] No console errors
- [ ] Ready for production use
- [ ] Consider publishing to Chrome Web Store
- [ ] Create user documentation
- [ ] Set up issue tracking

---

Happy Testing! 🧪
