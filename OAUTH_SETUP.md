# OAuth Setup for Chrome Web Store

This guide explains how to configure OAuth for your Chrome extension when publishing to the Chrome Web Store.

## The Problem

When you publish an extension to the Chrome Web Store, it gets assigned a unique extension ID (e.g., `faciokbjemdddkjokcajndenapikgcml`). For OAuth to work correctly, your Google Cloud Console OAuth client must be configured with this exact extension ID.

If you see the error **"Bad client ID"**, it means your OAuth client is either:
1. Not configured as a Chrome Extension type
2. Configured with a different extension ID
3. Not properly set up in Google Cloud Console

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

6. For **Item ID**, enter your extension ID:
   ```
   faciokbjemdddkjokcajndenapikgcml
   ```

7. Click **"Create"**

8. Copy the generated Client ID (it will look like: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`)

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
4. You should see the Google account picker (not an error)
5. Authorize the extension
6. Try copying a document

If you still see "Bad client ID", double-check:
- ✅ Extension ID matches exactly (no typos)
- ✅ OAuth client type is "Chrome extension"
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

## Redirect URI

Chrome extensions use a special redirect URI format:
```
https://<extension-id>.chromiumapp.org/
```

For your extension:
```
https://faciokbjemdddkjokcajndenapikgcml.chromiumapp.org/
```

This is automatically handled by `chrome.identity.getRedirectURL()` in the code. You don't need to manually configure this in Google Cloud Console for Chrome extensions.

## Security Notes

- Never commit OAuth client secrets to public repositories
- Each environment (dev/staging/production) should have its own OAuth client
- Regularly rotate client credentials if exposed
- Use the narrowest OAuth scopes possible (we use `readonly` scopes)

## Troubleshooting

### "Bad client ID" error
- Verify extension ID matches exactly
- Check OAuth client type is "Chrome extension"
- Ensure APIs are enabled

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

## Resources

- [Chrome Identity API Documentation](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Web Store Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
