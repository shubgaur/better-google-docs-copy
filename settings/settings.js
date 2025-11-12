// Settings Page JavaScript

// Default settings
const DEFAULT_SETTINGS = {
  headingStyle: 'atx',
  commentFormat: 'xml',
  includeResolvedComments: true,
  showProgress: true
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  checkAuthStatus();
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
    document.getElementById('showProgress').checked = settings.showProgress;
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.addEventListener('click', saveSettings);

  // Authentication buttons
  const authenticateBtn = document.getElementById('authenticateBtn');
  const signOutBtn = document.getElementById('signOutBtn');

  authenticateBtn.addEventListener('click', handleAuthenticate);
  signOutBtn.addEventListener('click', handleSignOut);

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

/**
 * Check authentication status
 */
async function checkAuthStatus() {
  const statusDiv = document.getElementById('authStatus');

  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });

    if (response.authenticated) {
      statusDiv.textContent = 'Authenticated and ready to use';
      statusDiv.className = 'auth-status authenticated';
    } else {
      statusDiv.textContent = 'Not authenticated - Click "Authenticate" to sign in';
      statusDiv.className = 'auth-status not-authenticated';
    }
  } catch (error) {
    statusDiv.textContent = 'Unable to check authentication status';
    statusDiv.className = 'auth-status not-authenticated';
  }
}

/**
 * Handle authenticate button click
 */
async function handleAuthenticate() {
  const statusDiv = document.getElementById('authStatus');
  const authenticateBtn = document.getElementById('authenticateBtn');

  // Disable button and show loading state
  authenticateBtn.disabled = true;
  authenticateBtn.textContent = 'Authenticating...';
  statusDiv.textContent = 'Opening authentication window...';
  statusDiv.className = 'auth-status not-authenticated';

  try {
    const response = await chrome.runtime.sendMessage({ action: 'authenticate' });

    if (response.success) {
      statusDiv.textContent = 'Successfully authenticated!';
      statusDiv.className = 'auth-status authenticated';
      showStatus('Authentication successful! You can now use the extension.', 'success');
    } else {
      statusDiv.textContent = 'Authentication failed - ' + (response.error || 'Unknown error');
      statusDiv.className = 'auth-status not-authenticated';
      showStatus('Authentication failed: ' + (response.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    statusDiv.textContent = 'Authentication error: ' + error.message;
    statusDiv.className = 'auth-status not-authenticated';
    showStatus('Authentication error: ' + error.message, 'error');
  } finally {
    // Re-enable button
    authenticateBtn.disabled = false;
    authenticateBtn.textContent = 'Authenticate';
  }
}

/**
 * Handle sign out button click
 */
async function handleSignOut() {
  const statusDiv = document.getElementById('authStatus');
  const signOutBtn = document.getElementById('signOutBtn');

  // Confirm sign out
  if (!confirm('Are you sure you want to sign out? You\'ll need to authenticate again to use the extension.')) {
    return;
  }

  // Disable button and show loading state
  signOutBtn.disabled = true;
  signOutBtn.textContent = 'Signing out...';

  try {
    const response = await chrome.runtime.sendMessage({ action: 'signOut' });

    if (response.success) {
      statusDiv.textContent = 'Signed out - Click "Authenticate" to sign in again';
      statusDiv.className = 'auth-status not-authenticated';
      showStatus('Successfully signed out', 'success');
    } else {
      showStatus('Sign out failed: ' + (response.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    showStatus('Sign out error: ' + error.message, 'error');
  } finally {
    // Re-enable button
    signOutBtn.disabled = false;
    signOutBtn.textContent = 'Sign Out';
  }
}
