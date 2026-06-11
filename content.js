// Content script for Google Meet caption detection
(function() {
  'use strict';

  // State management
  let isEnabled = false;
  let targetLanguage = 'ja';
  let sourceLanguage = 'auto';
  let translateBehavior = 'inline';
  let captionHistory = [];
  let lastCaptionText = '';
  let lastTranslation = '';
  let debounceTimer = null;
  let observer = null;
  let overlayElement = null;
  let inlineTranslationElement = null;

  const DEBOUNCE_DELAY = 700;
  const HISTORY_SIZE = 10;

  // Caption selectors for Google Meet
  const CAPTION_SELECTORS = [
    '[jsname="tgaKEf"]', // Main caption container
    '.iOzk7', // Caption text
    '.a4cQT', // Alternative caption class
    '[data-content-id]', // Another possible container
    '.CNusmb' // Speaker label container
  ];

  // Initialize
  async function init() {
    console.log('Meet Caption Translator: Initializing...');
    
    // Load settings
    await loadSettings();
    
    // Create overlay
    createOverlay();
    
    // Create inline translation display
    createInlineTranslation();
    
    // Start observing if auto-run is enabled
    const currentUrl = window.location.href;
    const shouldAuto = await StorageManager.shouldAutoRun(currentUrl);
    
    if (shouldAuto) {
      startObserving();
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(handleMessage);
    
    updateOverlayStatus('Waiting for activation');
  }

  // Load settings from storage
  async function loadSettings() {
    const settings = await StorageManager.getSettings();
    isEnabled = settings.enabled;
    targetLanguage = settings.targetLanguage;
    sourceLanguage = settings.sourceLanguage;
    translateBehavior = settings.translateBehavior;
  }

  // Handle messages from popup/background
  function handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'start':
        startObserving();
        sendResponse({ success: true });
        break;
      case 'stop':
        stopObserving();
        sendResponse({ success: true });
        break;
      case 'updateSettings':
        targetLanguage = message.settings.targetLanguage;
        sourceLanguage = message.settings.sourceLanguage;
        translateBehavior = message.settings.translateBehavior;
        sendResponse({ success: true });
        break;
      case 'clearHistory':
        clearHistory();
        sendResponse({ success: true });
        break;
      case 'getStatus':
        sendResponse({
          isEnabled: isEnabled,
          lastCaption: lastCaptionText,
          historySize: captionHistory.length
        });
        break;
    }
    return true;
  }

  // Start observing captions
  function startObserving() {
    if (isEnabled) return;
    
    isEnabled = true;
    updateOverlayStatus('Active - Waiting for captions');
    
    // Find caption container
    const captionContainer = findCaptionContainer();
    
    if (!captionContainer) {
      console.warn('Caption container not found. Make sure captions are enabled.');
      updateOverlayStatus('Caption container not found');
      scheduleRetryObserver();
      return;
    }
    
    // Create mutation observer
    observer = new MutationObserver(handleMutations);
    observer.observe(captionContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('Started observing captions');
    showOverlay();
  }

  // Stop observing captions
  function stopObserving() {
    isEnabled = false;
    
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    
    updateOverlayStatus('Paused');
    console.log('Stopped observing captions');
  }

  // Retry finding caption container
  function scheduleRetryObserver() {
    setTimeout(() => {
      if (isEnabled && !observer) {
        startObserving();
      }
    }, 3000);
  }

  // Find caption container element
  function findCaptionContainer() {
    for (const selector of CAPTION_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        // Find the parent container
        let container = elements[0].parentElement;
        while (container && !container.classList.contains('a4cQT') && container.tagName !== 'BODY') {
          container = container.parentElement;
        }
        return container || document.body;
      }
    }
    return null;
  }

  // Handle DOM mutations
  function handleMutations(mutations) {
    if (!isEnabled) return;
    
    // Extract caption text
    const captionText = extractCaptionText();
    
    if (!captionText || captionText === lastCaptionText) {
      return;
    }
    
    lastCaptionText = captionText;
    updateOverlayCaption(captionText);
    
    // Debounce: wait for caption to stabilize
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      sendStableCaption(captionText);
    }, DEBOUNCE_DELAY);
  }

  // Extract caption text from DOM
  function extractCaptionText() {
    const captionElements = [];
    
    for (const selector of CAPTION_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      captionElements.push(...elements);
    }
    
    if (captionElements.length === 0) return '';
    
    // Get visible text
    const texts = [];
    for (const element of captionElements) {
      const text = element.textContent?.trim();
      if (text && isElementVisible(element)) {
        texts.push(text);
      }
    }
    
    return texts.join(' ').trim();
  }

  // Check if element is visible
  function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  // Send stable caption to translator
  async function sendStableCaption(text) {
    if (!text || text.length === 0) return;
    
    // Check if already in history (duplicate)
    if (captionHistory.includes(text)) {
      console.log('Duplicate caption, skipping:', text);
      return;
    }
    
    // Add to history
    captionHistory.push(text);
    if (captionHistory.length > HISTORY_SIZE) {
      captionHistory.shift();
    }
    
    console.log('Translating caption:', text);
    updateOverlayStatus('Translating...');
    
    // Translate caption
    try {
      // Get translation from custom links
      const translation = await TranslateTabManager.translateText(
        text,
        targetLanguage,
        sourceLanguage
      );
      
      if (translation) {
        lastTranslation = translation;
        
        // Show inline translation
        if (translateBehavior === 'inline') {
          showInlineTranslation(translation);
          updateOverlayStatus('Translated ✓');
        } else {
          // Open in tab/popup
          await TranslateTabManager.openOrUpdateTranslate(
            text,
            targetLanguage,
            sourceLanguage,
            translateBehavior
          );
          updateOverlayStatus('Sent ✓');
        }
      } else {
        // Fallback to opening Google Translate
        await TranslateTabManager.openOrUpdateTranslate(
          text,
          targetLanguage,
          sourceLanguage,
          translateBehavior === 'inline' ? 'update' : translateBehavior
        );
        updateOverlayStatus('Opened in browser ✓');
      }
      
      setTimeout(() => {
        if (isEnabled) {
          updateOverlayStatus('Active - Waiting for captions');
        }
      }, 2000);
    } catch (error) {
      console.error('Error translating:', error);
      updateOverlayStatus('Error translating');
    }
  }

  // Create inline translation display
  function createInlineTranslation() {
    inlineTranslationElement = document.createElement('div');
    inlineTranslationElement.id = 'meet-caption-translator-inline';
    inlineTranslationElement.innerHTML = `
      <div class="inline-translation-header">Translation</div>
      <div class="inline-translation-text"></div>
    `;
    inlineTranslationElement.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(66, 133, 244, 0.95), rgba(52, 168, 83, 0.95));
      color: white;
      padding: 0;
      border-radius: 12px;
      font-size: 16px;
      max-width: 70%;
      min-width: 300px;
      text-align: center;
      z-index: 999998;
      display: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      overflow: hidden;
    `;
    
    const header = inlineTranslationElement.querySelector('.inline-translation-header');
    header.style.cssText = `
      background: rgba(0, 0, 0, 0.2);
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    
    const textDiv = inlineTranslationElement.querySelector('.inline-translation-text');
    textDiv.style.cssText = `
      padding: 16px 24px;
      font-size: 18px;
      font-weight: 500;
      line-height: 1.5;
    `;
    
    document.body.appendChild(inlineTranslationElement);
  }

  // Show inline translation
  function showInlineTranslation(translation) {
    if (!inlineTranslationElement) return;
    
    const textDiv = inlineTranslationElement.querySelector('.inline-translation-text');
    textDiv.textContent = translation;
    inlineTranslationElement.style.display = 'block';
    
    // Auto-hide after 7 seconds
    setTimeout(() => {
      if (textDiv.textContent === translation) {
        inlineTranslationElement.style.display = 'none';
      }
    }, 7000);
  }

  // Clear caption history
  function clearHistory() {
    captionHistory = [];
    lastCaptionText = '';
    console.log('Caption history cleared');
  }

  // Create overlay UI
  function createOverlay() {
    overlayElement = document.createElement('div');
    overlayElement.id = 'meet-caption-translator-overlay';
    overlayElement.innerHTML = `
      <div class="mct-header">
        <span class="mct-title">Caption Translator</span>
        <button class="mct-btn mct-close" id="mct-close">✕</button>
      </div>
      <div class="mct-body">
        <div class="mct-caption-wrapper">
          <div class="mct-label">Original Caption:</div>
          <div class="mct-caption" id="mct-caption">No caption yet</div>
        </div>
        <div class="mct-info">
          <span class="mct-lang">→ <span id="mct-target-lang">JA</span></span>
          <span class="mct-status" id="mct-status">Inactive</span>
        </div>
        <div class="mct-controls">
          <button class="mct-btn" id="mct-pause">Pause</button>
          <button class="mct-btn" id="mct-open-translate">Open Translate</button>
          <button class="mct-btn" id="mct-clear">Clear History</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlayElement);
    
    // Add event listeners
    document.getElementById('mct-close').addEventListener('click', hideOverlay);
    document.getElementById('mct-pause').addEventListener('click', togglePause);
    document.getElementById('mct-open-translate').addEventListener('click', openTranslateManually);
    document.getElementById('mct-clear').addEventListener('click', () => {
      clearHistory();
      updateOverlayCaption('History cleared');
    });
    
    // Update target language display
    updateOverlayTargetLang();
    
    // Make draggable
    makeDraggable(overlayElement);
  }

  // Show overlay
  function showOverlay() {
    if (overlayElement) {
      overlayElement.style.display = 'block';
    }
  }

  // Hide overlay
  function hideOverlay() {
    if (overlayElement) {
      overlayElement.style.display = 'none';
    }
  }

  // Toggle pause/resume
  function togglePause() {
    if (isEnabled) {
      stopObserving();
      document.getElementById('mct-pause').textContent = 'Resume';
    } else {
      startObserving();
      document.getElementById('mct-pause').textContent = 'Pause';
    }
  }

  // Open Google Translate manually
  async function openTranslateManually() {
    const text = lastCaptionText || 'Hello';
    await TranslateTabManager.openOrUpdateTranslate(
      text,
      targetLanguage,
      sourceLanguage,
      'newtab'
    );
  }

  // Update overlay caption
  function updateOverlayCaption(text) {
    const captionEl = document.getElementById('mct-caption');
    if (captionEl) {
      captionEl.textContent = text;
    }
  }

  // Update overlay status
  function updateOverlayStatus(status) {
    const statusEl = document.getElementById('mct-status');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }

  // Update overlay target language
  function updateOverlayTargetLang() {
    const langEl = document.getElementById('mct-target-lang');
    if (langEl) {
      langEl.textContent = targetLanguage.toUpperCase();
    }
  }

  // Make element draggable
  function makeDraggable(element) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    
    const header = element.querySelector('.mct-header');
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('mct-close')) return;
      isDragging = true;
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.cursor = 'grab';
    });
  }

  // Start initialization
  init();
})();
