# Quick Installation Guide

**Choose your installation method:**

## 🚀 For End Users (If extension is published)

1. Go to Chrome Web Store link (provided by publisher)
2. Click "Add to Chrome"
3. Click "Add Extension"
4. Done! Open a Google Doc and look for the "Copy for LLM" button

---

## 🛠️ For Testing/Development (Unpacked Extension)

### Step 1: Download
- Download and extract the extension folder to a permanent location
- Don't put it in Downloads or Temp - you'll need to keep it!

### Step 2: Install in Browser
1. Open browser and go to `chrome://extensions/`
2. Turn on **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"** button
4. Select the extension folder
5. Extension appears in your extensions list ✓

### Step 3: First Use
1. Open any Google Doc
2. Look for blue **"Copy for LLM"** button in toolbar (near top-left)
3. Click it and select a copy mode
4. **First time only**: Authorize the extension
   - Click "Allow"  to grant access
   - This lets the extension read your docs
5. Your document copies to clipboard!
6. Paste into Claude, ChatGPT, or any text field

---

## ✅ Verify It's Working

### Quick Test
1. Open [any Google Doc](https://docs.google.com/)
2. Button should appear in toolbar
3. Click button → Select "Copy Doc as Markdown"
4. Open notepad and paste (Ctrl+V / Cmd+V)
5. You should see formatted markdown!

### If Button Doesn't Appear
- Refresh the page (F5)
- Check extension is enabled: `chrome://extensions/`
- Make sure you're on a real Google Doc (URL has `/document/d/`)

---

## 🎯 How to Use

### Copy Entire Document
1. Click "Copy for LLM" button
2. Choose mode:
   - **"Copy Doc as Markdown"** - Text only
   - **"Copy Doc + Comments"** - Includes comments
   - **"Copy Doc + Comments + Images"** - Everything
3. Paste into your LLM!

### Copy Selected Text Only
1. **First**: Select text in doc (or copy with Ctrl+C)
2. **Then**: Click "Copy for LLM" button
3. Choose a mode
4. Only your selection is copied!

### Keyboard Shortcut
- Press `Ctrl+Shift+M` (Mac: `Cmd+Shift+M`)
- Copies using default mode
- Change shortcut: `chrome://extensions/shortcuts`

---

## ⚙️ Settings

**Access**: Right-click extension icon → "Options"

**Customize**:
- Default copy mode for keyboard shortcut
- Heading style (# or underlined)
- Comment format (XML or blockquote)
- Include/exclude resolved comments

---

## 🐛 Common Issues

### "Keeps asking to re-authenticate"
- **Why**: Unpacked extensions have OAuth limitations
- **Fix**: This is normal for testing. Best solution = publish to Chrome Web Store
- **Workaround**: Re-authorize when asked (it remembers for a while)

### "Extension context invalidated"
- **Fix**: Just refresh the Google Doc page (F5)

### "New comments not showing"
- **Fix**: The extension now auto-refreshes! Just click the button.
- Comments are cached for 5 minutes, but cleared on every button click

### Button disappeared
- **Fix**: Refresh the page (F5)
- Check extension is still enabled

### Images not included
- Make sure you selected a mode with images:
  - ✓ "Copy Doc + Comments + Images"
  - ✗ "Copy Doc as Markdown" (text only)

---

## 📊 What Gets Copied

| Copy Mode | Text | Comments | Images |
|-----------|------|----------|--------|
| Doc as Markdown | ✓ | ✗ | ✗ |
| Doc + Comments | ✓ | ✓ | ✗ |
| Doc + Images (URLs) | ✓ | ✓ | ✓ (links) |
| Doc + Images (Download) | ✓ | ✓ | ✓ (files) |

**Format**: GitHub-flavored Markdown
**Preserves**: Bold, italic, headings, lists, tables, links, strikethrough

---

## 🔒 Privacy

✅ **What it does**:
- Reads docs you choose to copy
- Converts to markdown in your browser
- Copies to your clipboard

❌ **What it DOESN'T do**:
- No tracking or analytics
- No data sent to third parties
- No background syncing
- Can't access docs you don't have permission for

**All processing happens locally in your browser.**

---

## 🚀 Publishing to Chrome Web Store (For Owners)

If you want to share this with others properly:

### Why Publish?
- ✅ One-click install for users
- ✅ No re-authentication issues
- ✅ Automatic updates
- ✅ Verified by Google
- ✅ Better UX overall

### How to Publish
See the **"Publishing to Chrome Web Store"** section in [README.md](README.md#-publishing-to-chrome-web-store) for detailed steps.

**Summary**:
1. Create Chrome Web Store developer account ($5 one-time fee)
2. Create screenshots and assets
3. Upload extension ZIP
4. Submit for review (1-5 days)
5. Share store link with users!

---

## 💡 Tips

### For Best Results
- ✓ Use "Doc + Comments + Images (URLs)" for LLMs - fastest and works great
- ✓ Use "Download as .md File" if you want to save locally
- ✓ Copy selection first (Ctrl+C) if you only want part of the doc
- ✓ Check settings to customize output format

### For Developers
- Open Service Worker console for detailed logs: `chrome://extensions/` → "Inspect views"
- Logs show: fetching, filtering, validation, errors
- Run `clearExtensionCaches()` in console to force fresh data

---

## 📞 Need Help?

1. Check [Troubleshooting](#-common-issues) above
2. Check [README.md](README.md) for full documentation
3. Open Service Worker console to see error details
4. Report issues on GitHub

---

**You're all set! Happy copying! 🎉**
