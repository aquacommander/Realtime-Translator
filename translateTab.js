// Google Translate tab manager
const TranslateTabManager = {
  translateTabId: null,
  translateWindowId: null,

  // Build Google Translate URL
  buildTranslateUrl(text, targetLang, sourceLang = 'auto') {
    const baseUrl = 'https://translate.google.com/';
    const params = new URLSearchParams({
      sl: sourceLang,
      tl: targetLang,
      text: text,
      op: 'translate'
    });
    return baseUrl + '?' + params.toString();
  },

  // Open or update Google Translate
  async openOrUpdateTranslate(text, targetLang, sourceLang = 'auto', behavior = 'update') {
    const url = this.buildTranslateUrl(text, targetLang, sourceLang);

    // Truncate URL if too long (browser limit ~2000 chars)
    if (url.length > 2000) {
      console.warn('Caption too long, truncating...');
      const truncatedText = text.substring(0, 1500);
      return this.openOrUpdateTranslate(truncatedText, targetLang, sourceLang, behavior);
    }

    try {
      if (behavior === 'popup') {
        return this.openInPopup(url);
      } else if (behavior === 'newtab') {
        return this.openInNewTab(url);
      } else {
        return this.updateExistingTab(url);
      }
    } catch (error) {
      console.error('Error opening/updating translate:', error);
      // Fallback to new tab
      return this.openInNewTab(url);
    }
  },

  // Update existing tab or create new one
  async updateExistingTab(url) {
    // Check if saved tab still exists
    if (this.translateTabId) {
      try {
        const tab = await chrome.tabs.get(this.translateTabId);
        if (tab) {
          // Update existing tab
          await chrome.tabs.update(this.translateTabId, { url: url, active: false });
          return { success: true, tabId: this.translateTabId };
        }
      } catch (error) {
        // Tab doesn't exist, create new one
        this.translateTabId = null;
      }
    }

    // Create new tab
    return this.openInNewTab(url);
  },

  // Open in new tab
  async openInNewTab(url) {
    const tab = await chrome.tabs.create({ url: url, active: false });
    this.translateTabId = tab.id;
    return { success: true, tabId: tab.id };
  },

  // Open in popup window
  async openInPopup(url) {
    if (this.translateWindowId) {
      try {
        const window = await chrome.windows.get(this.translateWindowId);
        if (window) {
          // Update existing window
          const tabs = await chrome.tabs.query({ windowId: this.translateWindowId });
          if (tabs.length > 0) {
            await chrome.tabs.update(tabs[0].id, { url: url });
            await chrome.windows.update(this.translateWindowId, { focused: false });
            return { success: true, windowId: this.translateWindowId };
          }
        }
      } catch (error) {
        this.translateWindowId = null;
      }
    }

    // Create new popup window
    const window = await chrome.windows.create({
      url: url,
      type: 'popup',
      width: 600,
      height: 800,
      focused: false
    });
    this.translateWindowId = window.id;
    return { success: true, windowId: window.id };
  },

  // Close translate tab/window
  async closeTranslate() {
    if (this.translateTabId) {
      try {
        await chrome.tabs.remove(this.translateTabId);
      } catch (error) {
        // Already closed
      }
      this.translateTabId = null;
    }
    if (this.translateWindowId) {
      try {
        await chrome.windows.remove(this.translateWindowId);
      } catch (error) {
        // Already closed
      }
      this.translateWindowId = null;
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.TranslateTabManager = TranslateTabManager;
}
