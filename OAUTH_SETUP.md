# OAuth Setup for Chrome Web Store

This guide explains how to configure OAuth for your Chrome extension when publishing to the Chrome Web Store.

## Overview

This extension uses `chrome.identity.getAuthToken()`, which is Google's recommended approach for Chrome extensions authenticating with Google APIs. This provides:
- ✅ **No redirect URI configuration needed** - Chrome handles it automatically
- ✅ **Better user experience** - Properly sized OAuth window
- ✅ **Automatic token management** - Chrome manages token caching and refresh
- ✅ **Simpler setup** - Just configure the OAuth client and enable APIs

## The Problem

When you publish an extension to the Chrome Web Store, it gets assigned a unique extension ID (e.g., `faciokbjemdddkjokcajndenapikgcml`). For OAuth to work correctly, your Google Cloud Console OAuth client must be configured with this exact extension ID.

If you see authentication errors, it means your OAuth client is either:
1. Not configured as a Chrome Extension type
2. Configured with a different extension ID
3. Not properly set up in Google Cloud Console
4. Missing required API enablement

## Step-by-Step Setup

### 1. Get Your Extension ID

Your published extension ID from Chrome Web Store is:
```
faciokbjemdddkjokcajndenapikgcml
```

You can also find it:
- In the Chrome Web Store developer dashboard
- In the URL of your extension's store page
- At `chrome://extensions/` when the extension is installed

### 2. Create or Update OAuth Client in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Select your project (or create a new one)

3. Navigate to **APIs & Services > Credentials**

4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

5. For **Application type**, select **"Chrome extension"** (or "Chrome app")

   > **Note:** If you don't see "Chrome extension" as an option, select "Web application" instead. As of 2025, Google Cloud Console may not show the Chrome extension option, but the extension will still work with a Web application OAuth client when using `chrome.identity.getAuthToken()`.

6. For **Item ID** (or **Application ID**), enter your extension ID:
   ```
   faciokbjemdddkjokcajndenapikgcml
   ```

7. **Important:** You do NOT need to configure any redirect URIs. The `chrome.identity.getAuthToken()` API handles this automatically.

8. Click **"Create"**

9. Copy the generated Client ID (it will look like: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`)

### 3. Enable Required APIs

Make sure these APIs are enabled in your Google Cloud project:

1. Navigate to **APIs & Services > Library**

2. Search for and enable:
   - **Google Docs API**
   - **Google Drive API**

### 4. Update manifest.json

Update the `oauth2.client_id` in your `manifest.json` with the new client ID:

```json
"oauth2": {
  "client_id": "YOUR-NEW-CLIENT-ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/documents.readonly",
    "https://www.googleapis.com/auth/drive.readonly"
  ]
}
```

### 5. Repackage and Resubmit

1. Update the extension version in `manifest.json`
2. Create a new ZIP package
3. Upload to Chrome Web Store
4. Resubmit for review

## Verification

To test if OAuth is working:

1. Install the extension from the Chrome Web Store
2. Open any Google Doc
3. Click the "Copy for LLM" button
4. You should see a **properly-sized** Google account picker in a popup window
5. Authorize the extension
6. Try copying a document

If you see authentication errors, double-check:
- ✅ Extension ID matches exactly (no typos)
- ✅ OAuth client type is "Chrome extension" or "Web application"
- ✅ Google Docs API and Drive API are enabled
- ✅ Client ID in manifest.json is correct
- ✅ You did NOT configure any redirect URIs (Chrome handles this automatically)

## Developer Mode vs Published Extension

**Important:** OAuth behaves differently in developer mode (unpacked extension) vs published extension:

- **Developer Mode**: The extension ID changes every time you load the unpacked extension, so OAuth will frequently break
- **Published Extension**: The extension ID is permanent, so OAuth works reliably

For testing during development:
1. Create a separate OAuth client for your local development extension ID
2. Use that client ID when testing locally
3. Switch to the production client ID before publishing

## Why No Redirect URI Configuration?

This extension uses `chrome.identity.getAuthToken()`, which is the recommended Google API for Chrome extensions. Unlike `chrome.identity.launchWebAuthFlow()` (used for third-party OAuth providers), `getAuthToken()`:

- **Automatically handles redirect URIs** - No manual configuration needed
- **Uses Chrome's built-in OAuth flow** - Better integration with the browser
- **Provides better window sizing** - No tiny popup windows
- **Manages token refresh** - Automatic token lifecycle management

The older approach (`launchWebAuthFlow`) required manually configuring redirect URIs like `https://faciokbjemdddkjokcajndenapikgcml.chromiumapp.org/`, but this is no longer necessary with the new implementation.

## Security Notes

- Never commit OAuth client secrets to public repositories
- Each environment (dev/staging/production) should have its own OAuth client
- Regularly rotate client credentials if exposed
- Use the narrowest OAuth scopes possible (we use `readonly` scopes)

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
If you see this error, it means you're using an older version of the extension. Update to version 1.2 or later, which uses `chrome.identity.getAuthToken()` and doesn't require redirect URI configuration.

### "OAuth2 not granted or invalid" error
- Verify extension ID matches exactly
- Check OAuth client type is "Chrome extension" or "Web application"
- Ensure APIs are enabled
- Make sure Client ID in manifest.json is correct

### "Invalid scope" error
- Verify Google Docs API is enabled
- Verify Google Drive API is enabled
- Check scope URLs are correct in manifest.json

### "Access denied" error during auth flow
- User needs to have access to the document
- User needs to grant permissions during OAuth flow
- Check if user's Google Workspace has restrictions

### OAuth works locally but not in production
- You're likely using a dev OAuth client with local extension ID
- Create a new OAuth client with the published extension ID
- Update manifest.json with production client ID before publishing

### Popup window is too small
If you're on an older version (before 1.2), update to the latest version which uses `chrome.identity.getAuthToken()` for properly-sized OAuth windows.

## Resources

- [Chrome Identity API Documentation](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Web Store Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
