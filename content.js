// Content Script - Injects UI into Google Docs

// Constants
const MAX_RETRIES = 20;
const MIN_CLIPBOARD_LENGTH = 20; // Minimum clipboard text length to consider as selection

// Wait for Google Docs toolbar to load
let retryCount = 0;

// Selection state (captured when button is clicked)
let currentSelection = null;

function init() {
  const toolbar = findToolbar();

  if (toolbar) {
    injectCopyButton(toolbar);
    setupMessageListener();
  } else if (retryCount < MAX_RETRIES) {
    retryCount++;
    setTimeout(init, 500);
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
 */
function getSelectionInfo() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  // Collect all selected text from all ranges
  let combinedText = '';
  const ranges = [];

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    const rangeText = range.toString();

    if (rangeText.trim().length > 0) {
      combinedText += (i > 0 ? '\n\n' : '') + rangeText;
      ranges.push({
        text: rangeText,
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      });
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
      description: 'Just the document text',
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
  selectionNote.textContent = 'Tip: Copy text first (CMD+C), then click here to copy only your selection.';
  dropdown.appendChild(selectionNote);

  // Toggle dropdown on button click
  mainButton.addEventListener('click', async (e) => {
    e.stopPropagation();

    // Read whatever the user last copied (Ctrl+C) from clipboard
    try {
      const clipboardText = await navigator.clipboard.readText();

      // Check if clipboard has substantial text (likely a selection)
      // Short clipboard = likely not a document selection
      if (clipboardText && clipboardText.trim().length > MIN_CLIPBOARD_LENGTH) {
        currentSelection = {
          text: clipboardText,
          ranges: [],
          rangeCount: 1
        };
      } else {
        currentSelection = null;
      }
    } catch (error) {
      currentSelection = null;
    }

    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  // Handle menu item clicks
  dropdown.querySelectorAll('.gdoc-copy-menu-item').forEach((item, index) => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      const mode = item.getAttribute('data-mode');
      const action = menuItems[index].action;
      dropdown.style.display = 'none';

      if (action === 'download') {
        await downloadDocument(mode);
      } else {
        await copyDocument(mode);
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
 * Main copy function
 */
async function copyDocument(mode) {
  const documentId = getDocumentId();

  if (!documentId) {
    showNotification('Error: Could not find document ID', 'error');
    return;
  }

  // Show loading notification
  const selectionType = currentSelection ? 'selected text' : 'document';
  showNotification(`Preparing ${selectionType}...`, 'loading');

  try {
    // Send message to background script to process the document
    const response = await chrome.runtime.sendMessage({
      action: 'copyDocument',
      documentId: documentId,
      mode: mode,
      selection: currentSelection, // Pass selection info if available
      forceRefresh: true // Always get fresh data when user clicks button
    });

    if (response.success) {
      // Copy markdown to clipboard
      await navigator.clipboard.writeText(response.markdown);

      // Show success notification with stats
      const stats = response.stats;
      let message = `✓ Copied! ${stats.characters} chars, ${stats.images} images, ${stats.comments} comments`;

      // Add warnings if present
      if (response.warnings && response.warnings.length > 0) {
        message += ` (⚠ ${response.warnings.join(', ')})`;
      }

      showNotification(message, 'success');
    } else {
      showNotification(`Error: ${response.error}`, 'error');
    }

  } catch (error) {
    console.error('Copy failed:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}

/**
 * Download document as .md file
 */
async function downloadDocument(mode) {
  const documentId = getDocumentId();

  if (!documentId) {
    showNotification('Error: Could not find document ID', 'error');
    return;
  }

  // Show loading notification
  const selectionType = currentSelection ? 'selected text' : 'document';
  showNotification(`Preparing ${selectionType} for download...`, 'loading');

  try {
    // Send message to background script to process the document
    const response = await chrome.runtime.sendMessage({
      action: 'copyDocument',
      documentId: documentId,
      mode: mode,
      selection: currentSelection,
      forceRefresh: true // Always get fresh data when user clicks button
    });

    if (response.success) {
      // Get document title from URL or use default
      const docTitle = document.title.replace(' - Google Docs', '') || 'document';
      const filename = `${docTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;

      // Create blob and download
      const blob = new Blob([response.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      // Clean up
      URL.revokeObjectURL(url);

      // Show success notification
      const stats = response.stats;
      let message = `✓ Downloaded ${filename}! ${stats.characters} chars, ${stats.images} images, ${stats.comments} comments`;

      if (response.warnings && response.warnings.length > 0) {
        message += ` (⚠ ${response.warnings.join(', ')})`;
      }

      showNotification(message, 'success');
    } else {
      showNotification(`Error: ${response.error}`, 'error');
    }

  } catch (error) {
    console.error('Download failed:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}

/**
 * Show toast notification
 */
function showNotification(message, type = 'info') {
  // Remove any existing notifications
  const existing = document.getElementById('gdoc-copy-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'gdoc-copy-notification';
  notification.className = `gdoc-copy-notification gdoc-copy-notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds (except for loading)
  if (type !== 'loading') {
    setTimeout(() => {
      notification.classList.add('gdoc-copy-notification-fade');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
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

/**
 * Setup message listener for keyboard shortcuts
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerQuickCopy') {
      // Use default mode from settings, or 'doc-only' as fallback
      chrome.storage.sync.get(['quickCopyMode'], (result) => {
        const mode = result.quickCopyMode || 'doc-only';
        copyDocument(mode);
      });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
