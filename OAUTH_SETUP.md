# OAuth Setup for Chrome Web Store

This guide explains how to configure OAuth for your Chrome extension when publishing to the Chrome Web Store.

## Overview

**Important: As of 2025, Google has deprecated the "Chrome app" OAuth client type AND is blocking `chromiumapp.org` redirect URIs.** This extension now uses `chrome.identity.launchWebAuthFlow()` with a **Web Application** OAuth client using the standard loopback redirect URI `http://127.0.0.1`.

## The Problem

When you publish an extension to the Chrome Web Store, it gets assigned a unique extension ID (e.g., `faciokbjemdddkjokcajndenapikgcml`). For OAuth to work correctly, your Google Cloud Console OAuth client must be configured correctly.

If you see authentication errors like **"Error 400: invalid_request - Custom URI scheme is not supported on Chrome apps"**, it means:
1. Google is blocking the deprecated `chromiumapp.org` custom URI scheme
2. You need to create a new "Web application" OAuth client
3. You need to configure the redirect URI as `http://127.0.0.1`

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

5. For **Application type**, select **"Web application"**

   > **Critical:** Do NOT use "Chrome app" or "Chrome extension" - these are deprecated and cause the "Custom URI scheme is not supported" error.

6. **Name**: Give it a descriptive name like "Better Google Docs Copy Extension"

7. **Authorized redirect URIs**: Click "ADD URI" and enter:
   ```
   http://127.0.0.1
   ```

   This is the standard loopback redirect URI for installed/native applications. Google now blocks the deprecated `chromiumapp.org` custom URI scheme.

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
4. You should see the Google account picker in a popup window
5. Authorize the extension
6. Try copying a document

If you see authentication errors, double-check:
- ✅ OAuth client type is "Web application" (NOT "Chrome app")
- ✅ Redirect URI is configured: `http://127.0.0.1`
- ✅ Google Docs API and Drive API are enabled
- ✅ Client ID in manifest.json is correct

## Developer Mode vs Published Extension

**Important:** OAuth behaves differently in developer mode (unpacked extension) vs published extension:

- **Developer Mode**: The extension ID changes every time you load the unpacked extension, so OAuth will frequently break
- **Published Extension**: The extension ID is permanent, so OAuth works reliably

For testing during development:
1. Create a separate OAuth client for your local development extension ID
2. Use that client ID when testing locally
3. Switch to the production client ID before publishing

## Why Web Application OAuth Client with Loopback URI?

As of 2025, Google has deprecated the "Chrome app" OAuth client type AND is blocking `chromiumapp.org` custom URI schemes, which causes the error:
```
Error 400: invalid_request - Custom URI scheme is not supported on Chrome apps
```

The solution is to use a **Web Application** OAuth client with `chrome.identity.launchWebAuthFlow()` using the standard loopback redirect URI:

- ✅ **Works in 2025** - Not deprecated like Chrome App OAuth clients
- ✅ **Standard redirect URI** - Uses `http://127.0.0.1` (standard for installed/native apps)
- ✅ **Not blocked by Google** - Loopback URIs are supported and recommended
- ✅ **Compatible** - Works with all Chrome extensions
- ⚠️ **Small popup window** - Unfortunately, `launchWebAuthFlow()` doesn't allow controlling window size (this is a Chrome API limitation)

## Security Notes

- Never commit OAuth client secrets to public repositories
- Each environment (dev/staging/production) should have its own OAuth client
- Regularly rotate client credentials if exposed
- Use the narrowest OAuth scopes possible (we use `readonly` scopes)

## Troubleshooting

### "Error 400: invalid_request - Custom URI scheme is not supported on Chrome apps"
This error means Google is blocking the deprecated `chromiumapp.org` custom URI scheme. **Solution:**
1. Delete or don't use the old "Chrome app" OAuth client or any client with `chromiumapp.org` redirect URIs
2. Create a new "Web application" OAuth client as described above
3. Configure the redirect URI: `http://127.0.0.1`
4. Update manifest.json with the new client ID

### "Error 400: redirect_uri_mismatch"
- Verify the redirect URI in your OAuth client matches: `http://127.0.0.1`
- Make sure you're using "Web application" OAuth client type
- Ensure there are no typos or extra characters in the redirect URI

### "OAuth2 not granted or invalid" error
- Check OAuth client type is "Web application" (NOT "Chrome app")
- Verify redirect URI is `http://127.0.0.1`
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
Unfortunately, this is a limitation of the `chrome.identity.launchWebAuthFlow()` API - there's no way to control the window size. This is a known Chrome API limitation and affects all extensions using this approach. The alternative (`chrome.identity.getAuthToken()`) no longer works with deprecated Chrome App OAuth clients.

## Resources

- [Chrome Identity API Documentation](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Web Store Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
