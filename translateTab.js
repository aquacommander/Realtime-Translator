// Translate API manager
const TranslateTabManager = {
  translateTabId: null,
  translateWindowId: null,

  // Translate text using custom translator URL
  async translateText(text, targetLang, sourceLang = 'auto') {
    const settings = await StorageManager.getSettings();
    const translatorLinks = settings.translatorLinks || [];
    
    // Try custom translator links first
    for (const link of translatorLinks) {
      if (!link.enabled) continue;
      
      try {
        const result = await this.translateWithCustomLink(text, targetLang, sourceLang, link);
        if (result) return result;
      } catch (error) {
        console.error('Translation error with', link.name, error);
      }
    }
    
    // Fallback to Google Translate URL method
    return null;
  },

  // Translate using custom link
  async translateWithCustomLink(text, targetLang, sourceLang, link) {
    try {
      let response;
      
      if (link.method === 'POST') {
        // POST request (e.g., LibreTranslate)
        response = await fetch(link.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang === 'auto' ? 'en' : sourceLang,
            target: targetLang,
            format: 'text'
          })
        });
      } else {
        // GET request (default)
        const url = link.url
          .replace('{text}', encodeURIComponent(text))
          .replace('{target}', targetLang)
          .replace('{source}', sourceLang);
        
        response = await fetch(url);
      }
      
      const data = await response.json();
      
      // Parse response based on translator type
      return this.parseTranslationResponse(data, link.type);
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  },

  // Parse different translator API responses
  parseTranslationResponse(data, type) {
    try {
      switch (type) {
        case 'google':
          // Google Translate Free API response
          if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
            return data[0].map(item => item[0]).join('');
          }
          return data.translated_text || data.translatedText || null;
          
        case 'deepl':
          return data.translations?.[0]?.text || null;
          
        case 'libretranslate':
          return data.translatedText || null;
          
        case 'mymemory':
          return data.responseData?.translatedText || null;
          
        case 'custom':
          return data.translation || data.text || data.result || null;
          
        default:
          // Try to find any translation field
          return data.translation || data.translatedText || data.text || null;
      }
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  },

  // Build Google Translate URL (fallback)
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
