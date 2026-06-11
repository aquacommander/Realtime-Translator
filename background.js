// Background service worker
console.log('Meet Caption Translator: Background script loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Set default settings
    chrome.storage.local.set({
      enabled: false,
      targetLanguage: 'ja',
      sourceLanguage: 'auto',
      translateBehavior: 'update',
      autoRunUrls: [],
      autoRunEnabled: false
    });
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openTranslateTab') {
    chrome.tabs.create({ url: message.url, active: false });
    sendResponse({ success: true });
  }
  return true;
});
