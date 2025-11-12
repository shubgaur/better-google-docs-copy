// Content Script - Injects UI into Google Docs

// ============================================================================
// CONSTANTS
// ============================================================================

// UI Initialization
const MAX_RETRIES = 20; // Maximum attempts to find Google Docs toolbar
const RETRY_DELAY_MS = 500; // Delay between toolbar search attempts

// Selection Detection
const MIN_SELECTION_LENGTH = 20; // Minimum character count to consider as valid selection

// Dropdown Menu
const DROPDOWN_HEIGHT_ESTIMATE = 500; // Estimated dropdown height for positioning

// Notification
const NOTIFICATION_DURATION_MS = 4000; // How long to show success/error notifications
const NOTIFICATION_FADE_DURATION_MS = 300; // Animation duration for notification fade

// Filename
const MAX_FILENAME_LENGTH = 100; // Maximum length for downloaded filenames

// Debouncing
const BUTTON_CLICK_DEBOUNCE_MS = 300; // Prevent rapid button clicks

// Wait for Google Docs toolbar to load
let retryCount = 0;

// Selection state (captured when button is clicked)
let currentSelection = null;

// Debouncing state
let isProcessing = false;
let lastClickTime = 0;

function init() {
  const toolbar = findToolbar();

  if (toolbar) {
    injectCopyButton(toolbar);
  } else if (retryCount < MAX_RETRIES) {
    retryCount++;
    setTimeout(init, RETRY_DELAY_MS);
  } else {
    console.error('Google Docs Copy Extension: Failed to find toolbar');
  }
}

/**
 * Find the Google Docs toolbar
 */
function findToolbar() {
  // Google Docs toolbar usually has this class
  const toolbar = document.querySelector('.docs-titlebar-buttons') ||
                   document.querySelector('#docs-toolbar') ||
                   document.querySelector('[role="toolbar"]');
  return toolbar;
}

/**
 * Get current selection information
 * Supports multiple disconnected ranges (Ctrl+click)
 * Enhanced with validation and error handling
 */
function getSelectionInfo() {
  try {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    // Collect all selected text from all ranges
    let combinedText = '';
    const ranges = [];

    for (let i = 0; i < selection.rangeCount; i++) {
      try {
        const range = selection.getRangeAt(i);

        // Validate range before processing
        if (!range || !range.startContainer || !range.endContainer) {
          continue;
        }

        const rangeText = range.toString();

        if (rangeText && rangeText.trim().length > 0) {
          combinedText += (i > 0 ? '\n\n' : '') + rangeText;
          ranges.push({
            text: rangeText,
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset
          });
        }
      } catch (rangeError) {
        console.warn('Failed to process range:', rangeError);
        // Continue processing other ranges
        continue;
      }
    }

    if (combinedText.trim().length === 0) {
      return null;
    }

    return {
      text: combinedText,
      ranges: ranges,
      rangeCount: ranges.length
    };
  } catch (error) {
    console.error('Failed to get selection info:', error);
    return null;
  }
}


/**
 * Inject the copy button into the toolbar
 */
function injectCopyButton(toolbar) {
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'gdoc-copy-extension-btn';
  buttonContainer.className = 'goog-inline-block';
  buttonContainer.style.cssText = 'margin-left: 8px; position: relative;';

  // Create main button
  const mainButton = document.createElement('button');
  mainButton.className = 'gdoc-copy-btn';

  // Create icon image element
  const iconImg = document.createElement('img');
  iconImg.className = 'gdoc-copy-btn-icon';
  iconImg.src = chrome.runtime.getURL('icons/menu/copy_icon.png');
  iconImg.alt = 'Copy';

  // Create text span
  const textSpan = document.createElement('span');
  textSpan.className = 'gdoc-copy-btn-text'; // Add class for reliable selection
  textSpan.textContent = 'Copy for LLM';
  textSpan.style.marginLeft = '4px';

  // Create dropdown arrow
  const arrowSpan = document.createElement('span');
  arrowSpan.textContent = '▼';
  arrowSpan.style.marginLeft = '4px';
  arrowSpan.style.fontSize = '10px';

  // Append elements to button
  mainButton.appendChild(iconImg);
  mainButton.appendChild(textSpan);
  mainButton.appendChild(arrowSpan);
  mainButton.title = 'Copy document as markdown (Ctrl+Shift+M)';

  // Create dropdown menu
  const dropdown = document.createElement('div');
  dropdown.className = 'gdoc-copy-dropdown';
  dropdown.style.display = 'none';

  // Define menu items with their icons
  const menuItems = [
    {
      mode: 'doc-only',
      icon: chrome.runtime.getURL('icons/menu/text_icon.png'),
      title: 'Copy Doc as Markdown',
      description: 'Formatted markdown with structure',
      action: 'copy'
    },
    {
      mode: 'plain-text',
      icon: chrome.runtime.getURL('icons/menu/text_icon.png'),
      title: 'Copy as Plain Text',
      description: 'Raw text without formatting',
      action: 'copy'
    },
    {
      mode: 'doc-and-comments',
      icon: chrome.runtime.getURL('icons/menu/comment_icon.png'),
      title: 'Copy Doc + Comments',
      description: 'Document with comment threads',
      action: 'copy'
    },
    {
      mode: 'doc-comments-images',
      icon: chrome.runtime.getURL('icons/menu/image_icon.png'),
      title: 'Copy Doc + Comments + Images (URLs)',
      description: 'Images as Google URLs',
      action: 'copy'
    },
    {
      mode: 'doc-comments-images-download',
      icon: chrome.runtime.getURL('icons/menu/image_icon.png'),
      title: 'Copy Doc + Comments + Images (Download)',
      description: 'Downloads images to your computer',
      action: 'copy'
    },
    {
      mode: 'doc-comments-images',
      icon: chrome.runtime.getURL('icons/menu/text_icon.png'),
      title: 'Download as .md File',
      description: 'Save markdown file to Downloads',
      action: 'download'
    }
  ];

  // Create menu item elements
  menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'gdoc-copy-menu-item';
    menuItem.setAttribute('data-mode', item.mode);

    const icon = document.createElement('img');
    icon.className = 'gdoc-copy-menu-item-icon';
    icon.src = item.icon;
    icon.alt = item.title;

    const content = document.createElement('div');
    content.className = 'gdoc-copy-menu-item-content';

    const title = document.createElement('strong');
    title.textContent = item.title;

    const description = document.createElement('span');
    description.textContent = item.description;

    content.appendChild(title);
    content.appendChild(description);

    menuItem.appendChild(icon);
    menuItem.appendChild(content);

    dropdown.appendChild(menuItem);
  });

  // Add note about selection
  const selectionNote = document.createElement('div');
  selectionNote.style.cssText = 'padding: 8px 12px; font-size: 11px; color: #666; border-top: 1px solid #e0e0e0; font-style: italic;';
  selectionNote.textContent = 'Tip: Select text in the document, then click here to copy only your selection.';
  dropdown.appendChild(selectionNote);

  // Toggle dropdown on button click
  mainButton.addEventListener('click', async (e) => {
    e.stopPropagation();

    // Capture current selection using window.getSelection()
    const selectionInfo = getSelectionInfo();

    if (selectionInfo && selectionInfo.text.trim().length >= MIN_SELECTION_LENGTH) {
      currentSelection = selectionInfo;
    } else {
      currentSelection = null;
    }

    const isVisible = dropdown.style.display === 'block';

    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      dropdown.style.display = 'block';

      // Update selection note based on whether text is selected
      if (currentSelection) {
        const charCount = currentSelection.text.length;
        selectionNote.textContent = `✓ Selection detected (${charCount} characters) - will copy selected text only`;
        selectionNote.style.color = '#1a73e8';
        selectionNote.style.fontWeight = '500';
      } else {
        selectionNote.textContent = 'Tip: Select text in the document, then click here to copy only your selection.';
        selectionNote.style.color = '#666';
        selectionNote.style.fontWeight = 'normal';
      }

      // Auto-position dropdown based on available space
      const buttonRect = mainButton.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if dropdown would go off bottom of screen
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const dropdownHeight = dropdownRect.height || DROPDOWN_HEIGHT_ESTIMATE;

      if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
        // Flip upward
        dropdown.style.top = 'auto';
        dropdown.style.bottom = '100%';
        dropdown.style.marginTop = '0';
        dropdown.style.marginBottom = '8px';
      } else {
        // Default downward position
        dropdown.style.top = '100%';
        dropdown.style.bottom = 'auto';
        dropdown.style.marginTop = '8px';
        dropdown.style.marginBottom = '0';
      }
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  // Handle menu item clicks with debouncing
  dropdown.querySelectorAll('.gdoc-copy-menu-item').forEach((item, index) => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();

      // Debounce - prevent rapid clicks
      const now = Date.now();
      if (isProcessing || (now - lastClickTime) < BUTTON_CLICK_DEBOUNCE_MS) {
        return;
      }

      lastClickTime = now;
      isProcessing = true;

      const mode = item.getAttribute('data-mode');
      const action = menuItems[index].action;
      dropdown.style.display = 'none';

      try {
        if (action === 'download') {
          await downloadDocument(mode);
        } else {
          await copyDocument(mode);
        }
      } finally {
        isProcessing = false;
      }
    });
  });

  buttonContainer.appendChild(mainButton);
  buttonContainer.appendChild(dropdown);

  // Insert button into toolbar (at the beginning)
  toolbar.insertBefore(buttonContainer, toolbar.firstChild);
}

/**
 * Get the current document ID from URL
 */
function getDocumentId() {
  const url = window.location.href;
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Process document (copy or download)
 * Enhanced with validation and error handling
 */
async function processDocument(mode, isDownload = false) {
  // Validate inputs
  if (!mode || typeof mode !== 'string') {
    showNotification('Error: Invalid mode specified', 'error');
    return;
  }

  const documentId = getDocumentId();

  if (!documentId) {
    showNotification('Error: Could not find document ID', 'error');
    return;
  }

  // Show loading notification with progress
  const selectionType = currentSelection ? 'selected text' : 'document';
  const action = isDownload ? 'for download' : '';
  showNotification(`Preparing ${selectionType} ${action}...`, 'loading', 'Initializing...');

  try {
    // Validate selection if present
    if (currentSelection) {
      if (!currentSelection.text || typeof currentSelection.text !== 'string') {
        currentSelection = null; // Invalid selection, clear it
      }
    }

    // Send message to background script to process the document
    const response = await chrome.runtime.sendMessage({
      action: 'copyDocument',
      documentId: documentId,
      mode: mode,
      selection: currentSelection,
      forceRefresh: true // Always get fresh data when user clicks button
    });

    if (!response) {
      throw new Error('No response from background script');
    }

    if (response.success) {
      const stats = response.stats || { characters: 0, images: 0, comments: 0 };

      // Validate response data
      if (!response.markdown || typeof response.markdown !== 'string') {
        throw new Error('Invalid markdown data received');
      }

      let message = '';

      if (isDownload) {
        // Download flow - validate title
        const docTitle = (document.title || '').replace(' - Google Docs', '').trim();
        const sanitizedTitle = docTitle
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\.+$/g, '')
          .trim()
          .substring(0, MAX_FILENAME_LENGTH);

        const filename = `${sanitizedTitle || 'document'}.md`;

        const blob = new Blob([response.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        message = `✓ Downloaded ${filename}! ${stats.characters} chars, ${stats.images} images, ${stats.comments} comments`;
      } else {
        // Copy flow - validate clipboard API availability
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          throw new Error('Clipboard API not available');
        }

        await navigator.clipboard.writeText(response.markdown);
        message = `✓ Copied! ${stats.characters} chars, ${stats.images} images, ${stats.comments} comments`;
      }

      // Add warnings if present
      if (response.warnings && Array.isArray(response.warnings) && response.warnings.length > 0) {
        message += ` (⚠ ${response.warnings.join(', ')})`;
      }

      showNotification(message, 'success');
    } else {
      const errorMsg = response.error || 'Unknown error occurred';
      showNotification(`Error: ${errorMsg}`, 'error');
    }

  } catch (error) {
    console.error(`${isDownload ? 'Download' : 'Copy'} failed:`, error);
    const errorMsg = error.message || 'An unexpected error occurred';
    showNotification(`Error: ${errorMsg}`, 'error');
  }
}

/**
 * Main copy function
 */
async function copyDocument(mode) {
  return processDocument(mode, false);
}

/**
 * Download document as .md file
 */
async function downloadDocument(mode) {
  return processDocument(mode, true);
}

/**
 * Show toast notification with circular progress loader
 */
function showNotification(message, type = 'info', subtext = '') {
  // Remove any existing notifications
  const existing = document.getElementById('gdoc-copy-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'gdoc-copy-notification';
  notification.className = `gdoc-copy-notification gdoc-copy-notification-${type}`;

  // Create progress circle for loading state
  if (type === 'loading') {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'gdoc-copy-progress-circle';

    // Create SVG circle
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'gdoc-copy-progress-svg');
    svg.setAttribute('viewBox', '0 0 32 32');

    const radius = 14;
    const circumference = 2 * Math.PI * radius;

    // Background circle
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('class', 'gdoc-copy-progress-bg');
    bgCircle.setAttribute('cx', '16');
    bgCircle.setAttribute('cy', '16');
    bgCircle.setAttribute('r', radius);

    // Progress circle
    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.setAttribute('class', 'gdoc-copy-progress-bar');
    progressCircle.setAttribute('cx', '16');
    progressCircle.setAttribute('cy', '16');
    progressCircle.setAttribute('r', radius);
    progressCircle.setAttribute('stroke-dasharray', circumference);
    progressCircle.setAttribute('stroke-dashoffset', circumference); // Start at 0%
    progressCircle.id = 'gdoc-progress-bar';

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);
    progressContainer.appendChild(svg);

    notification.appendChild(progressContainer);
  }

  // Create message container
  const messageContainer = document.createElement('div');
  messageContainer.className = 'gdoc-copy-notification-message';

  const mainText = document.createElement('div');
  mainText.className = 'gdoc-copy-notification-text';
  mainText.textContent = message;
  messageContainer.appendChild(mainText);

  if (subtext) {
    const subtextEl = document.createElement('div');
    subtextEl.className = 'gdoc-copy-notification-subtext';
    subtextEl.id = 'gdoc-notification-subtext';
    subtextEl.textContent = subtext;
    messageContainer.appendChild(subtextEl);
  }

  notification.appendChild(messageContainer);

  document.body.appendChild(notification);

  // Auto-remove after specified duration (except for loading)
  if (type !== 'loading') {
    setTimeout(() => {
      notification.classList.add('gdoc-copy-notification-fade');
      setTimeout(() => notification.remove(), NOTIFICATION_FADE_DURATION_MS);
    }, NOTIFICATION_DURATION_MS);
  }
}

/**
 * Update progress circle percentage (0-100)
 */
function updateProgress(percentage, subtext = '') {
  const progressBar = document.getElementById('gdoc-progress-bar');
  const subtextEl = document.getElementById('gdoc-notification-subtext');

  if (progressBar) {
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    progressBar.setAttribute('stroke-dashoffset', offset);
  }

  if (subtextEl && subtext) {
    subtextEl.textContent = subtext;
  }
}

/**
 * Hide loading notification
 */
function hideLoadingNotification() {
  const notification = document.getElementById('gdoc-copy-notification');
  if (notification) {
    notification.remove();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerCopyMenu') {
    // Find and click the main button to open the dropdown
    const button = document.querySelector('.gdoc-copy-btn');
    if (button) {
      button.click();
    }
  } else if (request.action === 'updateProgress') {
    // Update progress circle
    updateProgress(request.percentage, request.message);
  }
});
