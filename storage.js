// Storage management module
const StorageManager = {
  // Default settings
  defaults: {
    enabled: false,
    targetLanguage: 'ja',
    sourceLanguage: 'auto',
    translateBehavior: 'inline', // 'inline', 'update', 'newtab', 'popup'
    autoRunUrls: [],
    autoRunEnabled: false,
    translatorLinks: [
      {
        name: 'Google Translate (Free)',
        type: 'google',
        url: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl={source}&tl={target}&dt=t&q={text}',
        enabled: true
      },
      {
        name: 'LibreTranslate (Free)',
        type: 'libretranslate',
        url: 'https://libretranslate.com/translate',
        method: 'POST',
        enabled: false
      },
      {
        name: 'MyMemory (Free)',
        type: 'mymemory',
        url: 'https://api.mymemory.translated.net/get?q={text}&langpair={source}|{target}',
        enabled: false
      }
    ],
    showInlineTranslation: true
  },

  // Get all settings
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(this.defaults, (result) => {
        resolve(result);
      });
    });
  },

  // Get specific setting
  async getSetting(key) {
    const settings = await this.getSettings();
    return settings[key];
  },

  // Save settings
  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set(settings, () => {
        resolve();
      });
    });
  },

  // Save specific setting
  async saveSetting(key, value) {
    return this.saveSettings({ [key]: value });
  },

  // Add URL to auto-run list
  async addAutoRunUrl(url) {
    const urls = await this.getSetting('autoRunUrls');
    if (!urls.includes(url)) {
      urls.push(url);
      await this.saveSetting('autoRunUrls', urls);
    }
  },

  // Remove URL from auto-run list
  async removeAutoRunUrl(url) {
    const urls = await this.getSetting('autoRunUrls');
    const filtered = urls.filter(u => u !== url);
    await this.saveSetting('autoRunUrls', filtered);
  },

  // Check if current URL matches auto-run list
  async shouldAutoRun(currentUrl) {
    const autoRunEnabled = await this.getSetting('autoRunEnabled');
    if (!autoRunEnabled) return false;

    const urls = await this.getSetting('autoRunUrls');
    return urls.some(url => currentUrl.includes(url));
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
