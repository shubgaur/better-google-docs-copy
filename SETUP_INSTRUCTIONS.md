# Quick Setup Guide

Follow these steps to get the extension working:

## ⚠️ Before You Start

You need to create icon files. The extension won't load without them.

### Quick Fix: Create Placeholder Icons

Run these commands in your terminal:

```bash
cd google-docs-copy-extension/icons

# On macOS (using built-in tools):
# Create 16x16 icon
sips -z 16 16 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/DocumentIcon.icns --out icon16.png 2>/dev/null || echo "Creating 16x16 placeholder..."

# Create 48x48 icon
sips -z 48 48 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/DocumentIcon.icns --out icon48.png 2>/dev/null || echo "Creating 48x48 placeholder..."

# Create 128x128 icon
sips -z 128 128 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/DocumentIcon.icns --out icon128.png 2>/dev/null || echo "Creating 128x128 placeholder..."
```

**Alternative**: Use any image editing tool to create three PNG files (16x16, 48x48, 128x128) and save them in the `icons/` folder.

## 1️⃣ Google Cloud Setup (10 minutes)

### A. Create Project
1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "Google Docs Copy Extension"
4. Click "Create"

### B. Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search "Google Docs API" → Click → "Enable"
3. Search "Google Drive API" → Click → "Enable"

### C. Configure OAuth Consent
1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: **External** (or Internal if you have Workspace)
3. Click "Create"
4. Fill in:
   - App name: `Google Docs Copy Extension`
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. Scopes: Click "Save and Continue" (skip for now)
7. Test users: Click "Add Users" → Add your email
8. Click "Save and Continue"

### D. Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Chrome Extension**
4. Name: `Google Docs Copy Extension`
5. Click "Create"
6. **COPY THE CLIENT ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

## 2️⃣ Update manifest.json

1. Open `manifest.json` in a text editor
2. Find line 32: `"client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com"`
3. Replace with your actual Client ID
4. Save the file

## 3️⃣ Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top-right)
4. Click "Load unpacked"
5. Select the `google-docs-copy-extension` folder
6. **COPY THE EXTENSION ID** (looks like: `abcdefghijklmnop`)

## 4️⃣ Update OAuth with Extension ID

1. Go back to Google Cloud Console
2. "APIs & Services" → "Credentials"
3. Click the pencil icon next to your OAuth client
4. Add the Extension ID to the "Application ID" field
5. Click "Save"

## 5️⃣ Test It!

1. Open any Google Doc
2. Look for the blue "Copy for LLM" button in the toolbar
3. Click it → Select "Copy Doc as Markdown"
4. Authorize when prompted (first time only)
5. Paste into Claude/ChatGPT!

## ✅ You're Done!

The extension is now ready to use.

## 📝 Next Steps

- Customize keyboard shortcut at `chrome://extensions/shortcuts`
- Configure settings: Right-click extension icon → Options
- Share with team: See README.md for instructions

## 🆘 Problems?

### Can't find the button?
- Refresh the Google Docs page
- Check extension is enabled at `chrome://extensions/`

### Authorization fails?
- Make sure you added yourself as a Test User in OAuth consent screen
- Check that Extension ID matches in OAuth credentials

### Images not copying?
- Large images take time (10-20 seconds)
- Check your internet connection
- Try "Doc only" mode first to test

## 🎨 Want Better Icons?

Create or download icons and replace the placeholder files:
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

Suggested tools:
- Figma (free)
- Canva (free)
- Or search "free icon generator" online
