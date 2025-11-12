// Settings Page JavaScript

// Default settings
const DEFAULT_SETTINGS = {
  headingStyle: 'atx',
  commentFormat: 'blockquote',
  includeResolvedComments: false,
  imageQuality: 'high',
  showProgress: true
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

/**
 * Load settings from chrome.storage
 */
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    // Populate form fields
    document.getElementById('headingStyle').value = settings.headingStyle;
    document.getElementById('commentFormat').value = settings.commentFormat;
    document.getElementById('includeResolvedComments').checked = settings.includeResolvedComments;
    document.getElementById('imageQuality').value = settings.imageQuality;
    document.getElementById('showProgress').checked = settings.showProgress;
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.addEventListener('click', saveSettings);

  // Auto-save on change (optional)
  const inputs = document.querySelectorAll('select, input[type="checkbox"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      // Show that there are unsaved changes
      saveBtn.textContent = 'Save Settings *';
      saveBtn.style.background = '#ea8600';
    });
  });
}

/**
 * Save settings to chrome.storage
 */
function saveSettings() {
  const settings = {
    headingStyle: document.getElementById('headingStyle').value,
    commentFormat: document.getElementById('commentFormat').value,
    includeResolvedComments: document.getElementById('includeResolvedComments').checked,
    imageQuality: document.getElementById('imageQuality').value,
    showProgress: document.getElementById('showProgress').checked
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');

    // Reset save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = 'Save Settings';
    saveBtn.style.background = '#1a73e8';
  });
}

/**
 * Show status message
 */
function showStatus(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  statusDiv.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}
