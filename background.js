// Background Service Worker - Handles API calls and OAuth

// Import markdown converter
importScripts('markdown-converter.js');

// ============================================================================
// CONSTANTS
// ============================================================================

// Selection Detection
const MIN_CLIPBOARD_LENGTH = 20; // Minimum clipboard text length to consider as selection
const FUZZY_MATCH_CHUNK_SIZE = 100; // Characters to use for fuzzy matching fallback

// Authentication
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before token expiry
const OAUTH_TIMEOUT_MS = 120000; // 2 minutes timeout for OAuth flow

// Rate Limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute time window
const MAX_REQUESTS_PER_WINDOW = 10; // Max requests per time window

// Caching
const CACHE_TTL_MS = 30 * 1000; // 30 seconds (matches service worker lifetime)

// Retry Logic
const MAX_RETRY_ATTEMPTS = 3; // Maximum retry attempts for failed requests
const BASE_RETRY_DELAY_MS = 1000; // Base delay for exponential backoff (1 second)

// Image Processing
const MAX_IMAGE_WARNING_THRESHOLD = 10; // Warn if more than this many images
const IMAGE_CONTEXT_MAX_LENGTH = 30; // Max characters for image context text
const IMAGE_FILENAME_MAX_LENGTH = 50; // Max length for sanitized title in filenames

// Data structures
const requestTimestamps = [];
const pendingRequests = new Map();

// Message handler for content script requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyDocument') {
    // Handle async operation without blocking message channel
    handleCopyDocument(request.documentId, request.mode, request.selection, request.forceRefresh)
      .then(result => {
        // Ensure we respond even if something goes wrong
        try {
          sendResponse(result);
        } catch (e) {
          console.error('Failed to send response:', e);
        }
      })
      .catch(error => {
        try {
          sendResponse({ success: false, error: error.message });
        } catch (e) {
          console.error('Failed to send error response:', e);
        }
      });
    return true; // Keep message channel open for async response
  }
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger-copy') {
    // Send message to active tab to trigger the copy menu
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('docs.google.com/document')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerCopyMenu' });
      }
    });
  }
});

/**
 * Get user settings from chrome.storage
 */
async function getUserSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      headingStyle: 'atx',
      commentFormat: 'xml',
      includeResolvedComments: true,
      showProgress: true
    }, (settings) => {
      resolve(settings);
    });
  });
}

/**
 * Check if rate limit is exceeded
 */
function checkRateLimit() {
  const now = Date.now();

  // Remove timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }

  // Check if limit exceeded
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  // Add current request
  requestTimestamps.push(now);
  return true;
}

/**
 * Main copy handler - orchestrates the entire copy process
 */
async function handleCopyDocument(documentId, mode, selectionInfo = null, forceRefresh = false) {
  // Check if there's already a pending request for this document
  const requestKey = `${documentId}-${mode}-${JSON.stringify(selectionInfo)}`;

  if (pendingRequests.has(requestKey)) {
    console.log(`Reusing pending request for ${documentId}`);
    return pendingRequests.get(requestKey);
  }

  // Create the promise and store it for deduplication
  const requestPromise = (async () => {
    try {
      // Step 0: Check if online
      if (!navigator.onLine) {
        throw new Error('You are offline. Please check your internet connection and try again.');
      }

      // Step 1: Check rate limit
      if (!checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }

      // If forceRefresh is true, clear caches for this document to get fresh data
      if (forceRefresh) {
        console.log(`Force refresh requested for document ${documentId} - clearing caches`);
        commentCache.delete(documentId);
        documentCache.delete(documentId);
      }

    // Step 2: Get OAuth token
    const token = await getAuthToken();

    // Step 2: Get user settings
    const settings = await getUserSettings();

    // Step 3: Fetch document content from Docs API
    let doc = await getDocumentContent(documentId, token);

    // Step 4: Determine what to fetch based on mode
    const options = {
      includeComments: mode === 'doc-and-comments' || mode === 'doc-comments-images' || mode === 'doc-comments-images-download',
      includeImages: mode === 'doc-comments-images' || mode === 'doc-comments-images-download',
      downloadImages: mode === 'doc-comments-images-download',
      plainTextOnly: mode === 'plain-text',
      // Add settings
      headingStyle: settings.headingStyle || 'atx',
      commentFormat: settings.commentFormat || 'xml',
      includeResolvedComments: settings.includeResolvedComments !== false,
      showProgress: settings.showProgress !== false
    };

    // Step 4: Filter document by selection if provided
    if (selectionInfo && selectionInfo.text) {
      doc = filterDocumentBySelection(doc, selectionInfo);
    }

    // Step 5 & 6: Fetch images and comments in parallel with graceful degradation
    const [imagesResult, commentsResult] = await Promise.allSettled([
      // Fetch images if requested
      options.includeImages
        ? extractImages(doc, token, options.downloadImages, doc.title || 'google-doc')
            .then(imgs => {
              // Filter images by selection if provided
              return (selectionInfo && selectionInfo.text)
                ? filterImagesBySelection(imgs, doc)
                : imgs;
            })
        : Promise.resolve([]),

      // Fetch comments if requested (with document validation)
      options.includeComments
        ? getComments(documentId, token, doc)
            .then(cmts => {
              // Filter comments by selection if provided
              return (selectionInfo && selectionInfo.text)
                ? filterCommentsBySelection(cmts, selectionInfo)
                : cmts;
            })
        : Promise.resolve([])
    ]);

    // Extract results with graceful degradation
    const images = imagesResult.status === 'fulfilled' ? imagesResult.value : [];
    const comments = commentsResult.status === 'fulfilled' ? commentsResult.value : [];

    // Track warnings for partial failures
    const warnings = [];
    if (options.includeImages && imagesResult.status === 'rejected') {
      console.error('Failed to fetch images:', imagesResult.reason);
      warnings.push('Failed to fetch images');
    }
    if (options.includeComments && commentsResult.status === 'rejected') {
      console.error('Failed to fetch comments:', commentsResult.reason);
      warnings.push('Failed to fetch comments');
    }

    // Warn if downloading many images
    if (options.downloadImages && images.length > MAX_IMAGE_WARNING_THRESHOLD) {
      warnings.push(`${images.length} images - this may take a while`);
      console.warn(`Downloading ${images.length} images - this may take some time`);
    }

    // Step 7: Convert to markdown (will be handled by markdown-converter.js)
    const markdown = await convertToMarkdown(doc, images, comments, options);

      return {
        success: true,
        markdown: markdown,
        stats: {
          characters: markdown.length,
          images: images.length,
          comments: comments.length
        },
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      console.error('Copy failed:', error);
      throw error;
    } finally {
      // Clean up pending request
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the pending request
  pendingRequests.set(requestKey, requestPromise);

  return requestPromise;
}

/**
 * Get OAuth token using chrome.identity.launchWebAuthFlow
 * This method works with Chromium-based browsers (Arc, Brave, Dia, etc.)
 */
async function getAuthToken(forceRefresh = false) {
  // Check if we have a cached token first (unless forcing refresh)
  if (!forceRefresh) {
    const cachedToken = await getCachedToken();
    if (cachedToken) {
      return cachedToken;
    }
  }

  // Get client ID from manifest
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2.client_id;
  const scopes = manifest.oauth2.scopes.join(' ');
  const redirectUri = chrome.identity.getRedirectURL();

  // Build OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);

  // Add prompt=consent if forcing refresh to get new token
  if (forceRefresh) {
    authUrl.searchParams.set('prompt', 'consent');
  }

  return new Promise((resolve, reject) => {
    // Add timeout for OAuth flow
    const timeout = setTimeout(() => {
      reject(new Error('OAuth flow timed out. Please try again.'));
    }, OAUTH_TIMEOUT_MS);

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      (responseUrl) => {
        clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          reject(new Error(`OAuth failed: ${chrome.runtime.lastError.message}`));
          return;
        }

        if (!responseUrl) {
          reject(new Error('No response URL from OAuth flow. Did you cancel authorization?'));
          return;
        }

        // Extract access token from redirect URL
        const url = new URL(responseUrl);
        const params = new URLSearchParams(url.hash.substring(1)); // Remove # and parse
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
          reject(new Error('No access token in OAuth response'));
          return;
        }

        // Cache the token with expiration time
        const expiresAt = Date.now() + (parseInt(expiresIn) || 3600) * 1000;
        chrome.storage.local.set({
          access_token: accessToken,
          token_expires_at: expiresAt
        });

        resolve(accessToken);
      }
    );
  });
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRY_ATTEMPTS, baseDelay = BASE_RETRY_DELAY_MS) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on auth errors or client errors (4xx except 429)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // If we've exhausted retries, throw
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay: baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wrapper for fetch that automatically retries with refreshed token on 401 and handles transient errors
 */
async function fetchWithTokenRefresh(url, token, options = {}) {
  return retryWithBackoff(async () => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    let response = await fetch(url, { ...options, headers });

    // If 401, refresh token and retry once
    if (response.status === 401) {
      const newToken = await getAuthToken(true);
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    }

    // Throw error for non-ok responses to trigger retry logic
    if (!response.ok && response.status >= 500) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response;
  });
}

/**
 * Get cached token if still valid
 */
async function getCachedToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['access_token', 'token_expires_at'], (result) => {
      if (result.access_token && result.token_expires_at) {
        // Check if token is still valid (with buffer before expiry)
        if (Date.now() < result.token_expires_at - TOKEN_EXPIRY_BUFFER) {
          resolve(result.access_token);
          return;
        }
      }
      resolve(null);
    });
  });
}

// Document cache: Maps documentId -> { doc, timestamp, revisionId }
const documentCache = new Map();

// Comment cache: Maps documentId -> { comments, timestamp }
const commentCache = new Map();

/**
 * Aggressive text normalization for matching clipboard to API text
 * Removes markdown formatting, punctuation, and normalizes whitespace
 */
function aggressiveNormalize(text) {
  return text
    .toLowerCase()
    .replace(/[#\-*_>`\[\]()]/g, '') // Remove markdown characters
    .replace(/[^\w\s]/g, '') // Remove all punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Clear all caches (useful for debugging or forcing fresh data)
 */
function clearAllCaches() {
  documentCache.clear();
  commentCache.clear();
  console.log('All caches cleared');
}

// Expose cache clearing for debugging (can call from console)
if (typeof globalThis !== 'undefined') {
  globalThis.clearExtensionCaches = clearAllCaches;
}

/**
 * Fetch document content from Google Docs API with caching
 */
async function getDocumentContent(documentId, token) {
  // Check cache first
  const cached = documentCache.get(documentId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.doc;
  }

  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const response = await fetchWithTokenRefresh(url, token);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Docs API error: ${error.error.message}`);
  }

  const doc = await response.json();

  // Cache the document
  documentCache.set(documentId, {
    doc: doc,
    timestamp: Date.now(),
    revisionId: doc.revisionId
  });

  return doc;
}

/**
 * Find context text for an image by searching document paragraphs
 */
function findImageContext(doc, objectId) {
  if (!doc.body || !doc.body.content) {
    return '';
  }

  for (const element of doc.body.content) {
    if (element.paragraph && element.paragraph.elements) {
      // Check if this paragraph contains the image
      const hasImage = element.paragraph.elements.some(
        elem => elem.inlineObjectElement?.inlineObjectId === objectId
      );

      if (hasImage) {
        // Extract text from this paragraph
        let contextText = '';
        for (const elem of element.paragraph.elements) {
          if (elem.textRun && elem.textRun.content) {
            contextText += elem.textRun.content;
          }
        }
        // Clean and limit context text
        return contextText
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, IMAGE_CONTEXT_MAX_LENGTH);
      }
    }
  }

  return '';
}

/**
 * Extract and download images from document (with parallel downloads)
 */
async function extractImages(doc, token, shouldDownload = false, docTitle = 'google-doc') {
  if (!doc.inlineObjects) {
    return [];
  }

  // Sanitize document title for use in filename
  const sanitizedTitle = docTitle
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, '-') // Replace spaces with dashes for image filenames
    .replace(/\.+$/g, '') // Remove trailing dots
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .trim()
    .substring(0, IMAGE_FILENAME_MAX_LENGTH);

  // Collect all image info first
  const imageInfos = [];
  let imageIndex = 0;

  for (const [objectId, inlineObject] of Object.entries(doc.inlineObjects)) {
    const embeddedObject = inlineObject.inlineObjectProperties?.embeddedObject;
    if (!embeddedObject || !embeddedObject.imageProperties) {
      continue;
    }

    const imageUri = embeddedObject.imageProperties.contentUri ||
                     embeddedObject.imageProperties.sourceUri;

    if (!imageUri) {
      continue;
    }

    // Validate image URL is from Google domains (security check)
    const isValidGoogleUrl = /^https:\/\/.*\.google(usercontent|apis)\.com\//i.test(imageUri);
    if (!isValidGoogleUrl) {
      console.warn(`Skipping potentially unsafe image URL: ${imageUri}`);
      continue;
    }

    imageIndex++;

    // Extract title or description for better alt text
    const title = embeddedObject.title || embeddedObject.description || '';

    // Find context from surrounding text
    const context = findImageContext(doc, objectId);

    // Build filename with context if available
    let filename = sanitizedTitle;
    if (context) {
      const sanitizedContext = context
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      filename += `-${sanitizedContext}`;
    }
    filename += `-${imageIndex}.png`;

    imageInfos.push({
      objectId,
      imageUri,
      filename,
      title: title.trim()
    });
  }

  // If not downloading, just return URLs
  if (!shouldDownload) {
    return imageInfos.map(info => ({
      id: info.objectId,
      url: info.imageUri,
      mimeType: 'image/png',
      title: info.title || 'Image'
    }));
  }

  // Download all images in parallel (PERFORMANCE IMPROVEMENT)
  const downloadPromises = imageInfos.map(async (info) => {
    try {
      const response = await fetch(info.imageUri, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.warn(`Failed to download image ${info.objectId}`);
        return null;
      }

      const blob = await response.blob();

      // Download using chrome.downloads API
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          chrome.downloads.download({
            url: reader.result,
            filename: info.filename,
            saveAs: false
          });
          resolve();
        };
      });

      return {
        id: info.objectId,
        url: info.filename,
        mimeType: blob.type || 'image/png',
        title: info.title || 'Image'
      };
    } catch (error) {
      console.error(`Error downloading image ${info.objectId}:`, error);
      return null;
    }
  });

  // Wait for all downloads to complete
  const results = await Promise.all(downloadPromises);

  // Filter out failed downloads
  return results.filter(img => img !== null);
}

/**
 * Note: We no longer convert images to base64.
 * Instead, we use the original Google URLs which are:
 * - Cleaner and shorter in markdown
 * - Accessible as long as doc permissions allow
 * - Compatible with LLMs that can fetch images from URLs
 */

/**
 * Fetch comments from Google Drive API with caching and validation
 */
async function getComments(documentId, token, documentContent = null) {
  console.log(`Fetching comments for document: ${documentId}`);

  // Check cache first
  const cached = commentCache.get(documentId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`✓ Using cached comments for ${documentId} (${cached.comments.length} comments, age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
    return cached.comments;
  }

  if (cached) {
    console.log(`Cache expired for ${documentId}, fetching fresh comments from API`);
  }

  const url = `https://www.googleapis.com/drive/v3/files/${documentId}/comments?fields=*`;
  const response = await fetchWithTokenRefresh(url, token);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Drive API error: ${error.error.message}`);
  }

  const data = await response.json();

  if (!data.comments || data.comments.length === 0) {
    console.log(`No comments found for document ${documentId}`);
    return [];
  }

  console.log(`Fetched ${data.comments.length} comments from API for document ${documentId}`);

  const comments = data.comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    author: comment.author?.displayName || 'Unknown',
    quotedText: comment.quotedFileContent?.value || '',
    createdTime: comment.createdTime,
    resolved: comment.resolved || false,
    replies: (comment.replies || []).map(reply => ({
      content: reply.content,
      author: reply.author?.displayName || 'Unknown',
      createdTime: reply.createdTime
    }))
  }));

  // Validate comments belong to this document (if content provided)
  const validatedComments = documentContent
    ? validateCommentsAgainstDocument(comments, documentContent, documentId)
    : comments;

  console.log(`After validation: ${validatedComments.length} comments for document ${documentId}`);

  // Cache the validated comments
  commentCache.set(documentId, {
    comments: validatedComments,
    timestamp: Date.now()
  });

  return validatedComments;
}

/**
 * Validate that comments actually belong to the document
 * Filters out comments whose quoted text doesn't appear in the document
 */
function validateCommentsAgainstDocument(comments, doc, documentId) {
  // Build full document text
  let fullText = '';
  if (doc.body && doc.body.content) {
    for (const element of doc.body.content) {
      if (element.paragraph && element.paragraph.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun && elem.textRun.content) {
            fullText += elem.textRun.content;
          }
        }
      }
    }
  }

  // Normalize for matching
  const normalizedFullText = aggressiveNormalize(fullText);
  console.log(`Document ${documentId} has ${fullText.length} characters of content`);

  // Filter comments whose quoted text appears in the document
  const validComments = comments.filter(comment => {
    // If no quoted text, skip validation (might be a general/image comment)
    if (!comment.quotedText || comment.quotedText.trim().length === 0) {
      console.log(`Comment "${comment.content.substring(0, 30)}..." has no quoted text, including it`);
      return true;
    }

    const normalizedQuoted = aggressiveNormalize(comment.quotedText);

    // Check if quoted text appears in document
    const isValid = normalizedFullText.includes(normalizedQuoted);

    if (!isValid) {
      console.warn(`[DOC ${documentId}] INVALID COMMENT FILTERED: "${comment.quotedText.substring(0, 50)}..." not found in document. Comment author: ${comment.author}`);
    }

    return isValid;
  });

  const filteredCount = comments.length - validComments.length;
  if (filteredCount > 0) {
    console.warn(`Filtered out ${filteredCount} invalid comments for document ${documentId}`);
  }

  return validComments;
}

/**
 * Filter document content by selection
 * Finds content elements that overlap with the selected text
 */
function filterDocumentBySelection(doc, selectionInfo) {
  const selectedText = selectionInfo.text.trim();

  // If no selection text, return original document
  if (!selectedText) {
    return doc;
  }

  // Build full text from document with position mapping
  let fullText = '';
  const elementMap = [];

  // Helper function to extract text from a content element
  function extractElementText(element) {
    if (!element.paragraph) {
      return '';
    }

    let text = '';
    const elements = element.paragraph.elements || [];

    for (const elem of elements) {
      if (elem.textRun && elem.textRun.content) {
        text += elem.textRun.content;
      } else if (elem.inlineObjectElement) {
        // Images don't have text but take up space
        text += ' ';
      }
    }

    return text;
  }

  // Build text with position mapping
  for (const element of doc.body.content) {
    const startPos = fullText.length;
    const elementText = extractElementText(element);
    fullText += elementText;

    elementMap.push({
      element: element,
      startPos: startPos,
      endPos: fullText.length,
      text: elementText
    });
  }

  const normalizedFullText = aggressiveNormalize(fullText);
  const normalizedSelection = aggressiveNormalize(selectedText);

  // Try to find selection in full text with fuzzy matching
  let selectionStart = normalizedFullText.indexOf(normalizedSelection);

  // If exact match fails, try finding a substantial chunk (first FUZZY_MATCH_CHUNK_SIZE chars)
  if (selectionStart === -1 && normalizedSelection.length > FUZZY_MATCH_CHUNK_SIZE) {
    const selectionChunk = normalizedSelection.substring(0, FUZZY_MATCH_CHUNK_SIZE);
    selectionStart = normalizedFullText.indexOf(selectionChunk);
  }

  // If still no match, try last FUZZY_MATCH_CHUNK_SIZE chars
  if (selectionStart === -1 && normalizedSelection.length > FUZZY_MATCH_CHUNK_SIZE) {
    const selectionChunk = normalizedSelection.substring(normalizedSelection.length - FUZZY_MATCH_CHUNK_SIZE);
    const chunkPos = normalizedFullText.indexOf(selectionChunk);

    if (chunkPos !== -1) {
      // Found the end, estimate the start
      selectionStart = Math.max(0, chunkPos - (normalizedSelection.length - FUZZY_MATCH_CHUNK_SIZE));
    }
  }

  if (selectionStart === -1) {
    return doc; // Fallback to full document
  }

  const selectionEnd = selectionStart + normalizedSelection.length;

  // Filter elements that overlap with selection
  // Pre-normalize all element text once to avoid repeated normalization
  const normalizedElementTexts = elementMap.map(item => aggressiveNormalize(item.text));

  const selectedElements = [];
  let currentPos = 0;

  for (let i = 0; i < elementMap.length; i++) {
    const item = elementMap[i];
    const normalizedItemText = normalizedElementTexts[i];
    const itemStart = currentPos;
    const itemEnd = currentPos + normalizedItemText.length;

    // Check if this element overlaps with selection
    if (itemEnd > selectionStart && itemStart < selectionEnd) {
      selectedElements.push(item.element);
    }

    currentPos = itemEnd + 1; // +1 for space between elements
  }

  // Return modified document with only selected elements
  return {
    ...doc,
    body: {
      ...doc.body,
      content: selectedElements
    }
  };
}

/**
 * Filter comments by selection
 * Includes comments whose quotedText appears in the selected text
 */
function filterCommentsBySelection(comments, selectionInfo) {
  const selectedText = selectionInfo.text.trim();

  if (!selectedText) {
    return comments;
  }

  const normalizedSelection = aggressiveNormalize(selectedText);

  const filteredComments = comments.filter(comment => {
    if (!comment.quotedText) {
      return false;
    }

    const normalizedQuoted = aggressiveNormalize(comment.quotedText);

    // Check if the quoted text appears in the selection
    const isInSelection = normalizedSelection.includes(normalizedQuoted);

    return isInSelection;
  });

  return filteredComments;
}

/**
 * Filter images by selection
 * Includes only images that are referenced in the selected document elements
 */
function filterImagesBySelection(images, filteredDoc) {
  // Extract all inline object IDs from the filtered document
  const selectedImageIds = new Set();

  for (const element of filteredDoc.body.content) {
    if (element.paragraph?.elements) {
      for (const elem of element.paragraph.elements) {
        if (elem.inlineObjectElement) {
          const imageId = elem.inlineObjectElement.inlineObjectId;
          selectedImageIds.add(imageId);
        }
      }
    }
  }

  // Filter images to only those in selection
  const filteredImages = images.filter(img => selectedImageIds.has(img.id));

  return filteredImages;
}

// convertToMarkdown is loaded from markdown-converter.js via importScripts
