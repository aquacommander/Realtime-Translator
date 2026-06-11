// Popup script
(async function() {
  'use strict';

  // DOM elements
  const statusText = document.getElementById('status-text');
  const statusIndicator = document.getElementById('status-indicator');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const sourceLangSelect = document.getElementById('source-lang');
  const targetLangSelect = document.getElementById('target-lang');
  const translateBehaviorSelect = document.getElementById('translate-behavior');
  const autoRunEnabledCheckbox = document.getElementById('auto-run-enabled');
  const meetingUrlInput = document.getElementById('meeting-url');
  const addUrlBtn = document.getElementById('add-url-btn');
  const savedUrlsContainer = document.getElementById('saved-urls');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const openTranslateBtn = document.getElementById('open-translate-btn');
  const translatorLinksContainer = document.getElementById('translator-links');
  const addTranslatorBtn = document.getElementById('add-translator-btn');

  // Load settings on popup open
  async function loadSettings() {
    const settings = await StorageManager.getSettings();
    
    sourceLangSelect.value = settings.sourceLanguage;
    targetLangSelect.value = settings.targetLanguage;
    translateBehaviorSelect.value = settings.translateBehavior;
    autoRunEnabledCheckbox.checked = settings.autoRunEnabled;
    
    renderSavedUrls(settings.autoRunUrls);
    renderTranslatorLinks(settings.translatorLinks || []);
    
    // Get current tab to check status
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url.includes('meet.google.com')) {
      updateStatus('On Google Meet page');
    } else {
      updateStatus('Not on Google Meet');
    }
  }

  // Update status display
  function updateStatus(text, isActive = false) {
    statusText.textContent = text;
    statusIndicator.className = 'indicator ' + (isActive ? 'active' : 'inactive');
  }

  // Start caption translation
  async function startTranslation() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (!tab.url.includes('meet.google.com')) {
      alert('Please open a Google Meet page first');
      return;
    }
    
    // Save settings
    await saveSettings();
    
    // Send message to content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'start' });
      if (response.success) {
        updateStatus('Active', true);
      }
    } catch (error) {
      console.error('Error starting:', error);
      alert('Error: Make sure you are on a Google Meet page with captions enabled');
    }
  }

  // Stop caption translation
  async function stopTranslation() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (!tab.url.includes('meet.google.com')) {
      return;
    }
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
      if (response.success) {
        updateStatus('Stopped', false);
      }
    } catch (error) {
      console.error('Error stopping:', error);
    }
  }

  // Save settings
  async function saveSettings() {
    const settings = {
      sourceLanguage: sourceLangSelect.value,
      targetLanguage: targetLangSelect.value,
      translateBehavior: translateBehaviorSelect.value,
      autoRunEnabled: autoRunEnabledCheckbox.checked
    };
    
    await StorageManager.saveSettings(settings);
    
    // Update content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url.includes('meet.google.com')) {
      try {
        await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: settings
        });
      } catch (error) {
        // Content script not loaded yet
      }
    }
  }

  // Add meeting URL
  async function addMeetingUrl() {
    const url = meetingUrlInput.value.trim();
    
    if (!url) {
      alert('Please enter a meeting URL');
      return;
    }
    
    if (!url.includes('meet.google.com')) {
      alert('Please enter a valid Google Meet URL');
      return;
    }
    
    await StorageManager.addAutoRunUrl(url);
    meetingUrlInput.value = '';
    
    const settings = await StorageManager.getSettings();
    renderSavedUrls(settings.autoRunUrls);
  }

  // Remove meeting URL
  async function removeMeetingUrl(url) {
    await StorageManager.removeAutoRunUrl(url);
    const settings = await StorageManager.getSettings();
    renderSavedUrls(settings.autoRunUrls);
  }

  // Render saved URLs
  function renderSavedUrls(urls) {
    savedUrlsContainer.innerHTML = '';
    
    if (urls.length === 0) {
      savedUrlsContainer.innerHTML = '<p class="empty-text">No saved URLs</p>';
      return;
    }
    
    urls.forEach(url => {
      const urlItem = document.createElement('div');
      urlItem.className = 'url-item';
      urlItem.innerHTML = `
        <span class="url-text">${url}</span>
        <button class="btn-remove" data-url="${url}">✕</button>
      `;
      savedUrlsContainer.appendChild(urlItem);
    });
    
    // Add event listeners
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeMeetingUrl(btn.dataset.url);
      });
    });
  }

  // Clear caption history
  async function clearHistory() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url.includes('meet.google.com')) {
      try {
        await chrome.tabs.sendMessage(tabs[0].id, { action: 'clearHistory' });
        alert('Caption history cleared');
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  }

  // Open Google Translate
  function openTranslate() {
    chrome.tabs.create({ url: 'https://translate.google.com/' });
  }

  // Render translator links
  function renderTranslatorLinks(links) {
    translatorLinksContainer.innerHTML = '';
    
    if (!links || links.length === 0) {
      translatorLinksContainer.innerHTML = '<p class="empty-text">No translator services configured</p>';
      return;
    }
    
    links.forEach((link, index) => {
      const linkItem = document.createElement('div');
      linkItem.className = 'translator-item';
      linkItem.innerHTML = `
        <div class="translator-info">
          <input type="checkbox" ${link.enabled ? 'checked' : ''} data-index="${index}" class="translator-checkbox">
          <div class="translator-details">
            <span class="translator-name">${link.name}</span>
            <span class="translator-type">${link.type}</span>
          </div>
        </div>
        ${link.type !== 'google' ? '<button class="btn-remove" data-index="' + index + '">✕</button>' : ''}
      `;
      translatorLinksContainer.appendChild(linkItem);
    });
    
    // Add event listeners
    document.querySelectorAll('.translator-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        toggleTranslator(parseInt(e.target.dataset.index), e.target.checked);
      });
    });
    
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Remove this translator service?')) {
          removeTranslator(parseInt(btn.dataset.index));
        }
      });
    });
  }

  // Toggle translator
  async function toggleTranslator(index, enabled) {
    const settings = await StorageManager.getSettings();
    settings.translatorLinks[index].enabled = enabled;
    await StorageManager.saveSettings(settings);
  }

  // Remove translator
  async function removeTranslator(index) {
    const settings = await StorageManager.getSettings();
    settings.translatorLinks.splice(index, 1);
    await StorageManager.saveSettings(settings);
    renderTranslatorLinks(settings.translatorLinks);
  }

  // Add custom translator
  async function addCustomTranslator() {
    const name = prompt('Translator name (e.g., "DeepL API"):');
    if (!name) return;
    
    const type = prompt('Translator type:\n- google (free)\n- deepl (API key needed)\n- libretranslate (free)\n- mymemory (free)\n- custom\n\nEnter type:') || 'custom';
    
    const url = prompt('API URL with placeholders:\n{text} = text to translate\n{source} = source language\n{target} = target language\n\nExample for GET:\nhttps://api.example.com/translate?from={source}&to={target}&text={text}\n\nFor POST, just enter base URL:\nhttps://api.example.com/translate');
    if (!url) return;
    
    const method = prompt('Request method (GET or POST):')?.toUpperCase() || 'GET';
    
    const settings = await StorageManager.getSettings();
    settings.translatorLinks = settings.translatorLinks || [];
    settings.translatorLinks.push({
      name: name,
      type: type,
      url: url,
      method: method,
      enabled: true
    });
    
    await StorageManager.saveSettings(settings);
    renderTranslatorLinks(settings.translatorLinks);
    alert('Translator added! Enable it by checking the checkbox.');
  }

  // Event listeners
  startBtn.addEventListener('click', startTranslation);
  stopBtn.addEventListener('click', stopTranslation);
  addUrlBtn.addEventListener('click', addMeetingUrl);
  clearHistoryBtn.addEventListener('click', clearHistory);
  openTranslateBtn.addEventListener('click', openTranslate);
  addTranslatorBtn.addEventListener('click', addCustomTranslator);

  // Save settings on change
  sourceLangSelect.addEventListener('change', saveSettings);
  targetLangSelect.addEventListener('change', saveSettings);
  translateBehaviorSelect.addEventListener('change', saveSettings);
  autoRunEnabledCheckbox.addEventListener('change', saveSettings);

  // Initialize
  loadSettings();
})();
