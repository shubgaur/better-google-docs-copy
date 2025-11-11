# Google Docs Copy for LLMs 📋

**Copy Google Docs as markdown for Claude, ChatGPT, and other AI assistants—with one click.**

Stop wrestling with copy-paste formatting issues. This Chrome extension converts Google Docs to clean markdown, preserving formatting, images, and comments perfectly.

---

## Why Use This?

**Perfect for:**
- Sharing documents with AI assistants (Claude, ChatGPT, Gemini, etc.)
- Converting docs to markdown for documentation
- Building knowledge bases
- Creating notes with proper formatting
- Preserving comment threads when sharing drafts

**What makes it special:**
- Copy selected text or entire documents
- Include images and comment threads
- Download as `.md` files
- Fast caching system (no waiting for re-copies)
- Privacy-first: All processing happens locally

---

## How to Use

### Installation
1. Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/[ITEM-ID]) *(Coming soon)*
2. First time: Click "Copy for LLM" button in any Google Doc and authorize access
3. Done! Start copying documents

### Basic Usage
1. Open any Google Doc
2. Click the **"Copy for LLM"** button in the toolbar (top-left)
3. Choose your mode:
   - **Doc Only** → Clean markdown text
   - **Doc + Comments** → Includes comment threads
   - **Doc + Images** → Includes images as Google URLs or downloads
   - **Download as .md** → Saves file to Downloads folder
4. Paste into your AI assistant (Ctrl+V / Cmd+V)

### Copy Selected Text
1. Select text you want (or press Ctrl+C to copy)
2. Click "Copy for LLM" button
3. Extension detects your selection and copies only that part
4. Images and comments in selection are included too

**Note**: Selection must be at least 20 characters

### Keyboard Shortcut
- **Ctrl+Shift+M** (Mac: Cmd+Shift+M) to quick-copy with your default mode
- Customize: `chrome://extensions/shortcuts` → Find extension → Edit

---

## Settings

Right-click extension icon → **Options** to customize:

- **Quick Copy Mode**: Default mode for keyboard shortcut
- **Heading Style**: ATX (`# Heading`) or Setext (underlined)
- **Comment Format**: XML or Blockquote style
- **Include Resolved Comments**: Toggle resolved comments on/off

---

## Authentication

**First-time setup:**
1. Click the "Copy for LLM" button
2. Authorize with your Google account
3. Grant Google Docs and Drive access

**Why authorization is needed:**
- Google Docs API: Read document content
- Google Drive API: Access comments

**Note**: When installed from Chrome Web Store, you'll stay authenticated. If using unpacked/developer mode, you may need to re-authorize occasionally due to OAuth limitations.

---

## Privacy & Security

### What this extension does:
- ✅ Reads docs you choose to copy
- ✅ Fetches comments on those docs
- ✅ Converts to markdown locally in your browser
- ✅ Copies result to clipboard or downloads as file

### What it does NOT do:
- ❌ No data collection or tracking
- ❌ No analytics
- ❌ No data sent to third-party servers
- ❌ Cannot access docs without your permission

**All processing happens locally.** The only network requests are to Google's official APIs to fetch your own documents.

### Permissions explained:
| Permission | Why Needed |
|------------|------------|
| `identity` | OAuth authentication with Google |
| `storage` | Save settings and cache responses |
| `clipboardWrite` | Copy markdown to clipboard |
| `downloads` | Save .md files |
| Google Docs API | Read document content |
| Google Drive API | Read comments |

---

## FAQ

**Q: Does this work with Google Sheets or Slides?**
A: Not yet. Currently supports Google Docs only.

**Q: What browsers are supported?**
A: Chrome, Arc, Brave, Edge, and any Chromium-based browser.

**Q: Does it work on mobile?**
A: No, Chrome extensions don't work on mobile browsers.

**Q: What markdown flavor does it use?**
A: GitHub-flavored Markdown (GFM).

**Q: Is this open source?**
A: Yes! MIT License—free to use, modify, and distribute.

**Q: Does it require internet?**
A: Yes, needs internet to fetch docs from Google APIs.

**Q: Can I copy private documents?**
A: Yes, as long as you have access to them in Google Docs.

**Q: Why does it need Drive API access?**
A: Google stores comments in Drive, not the Docs API.

**Q: Can I export to other formats?**
A: Currently only markdown. Other formats planned for future releases.

**Q: Does formatting get preserved?**
A: Yes! **Bold**, *italic*, ~~strikethrough~~, `code`, links, headings, lists, and tables are all preserved.

---

## Troubleshooting

**Button not appearing?**
- Refresh the page (F5)
- Check extension is enabled: `chrome://extensions/`
- Verify you're on a Google Doc (URL has `/document/d/`)

**"Extension context invalidated" error?**
- Refresh the Google Docs page (F5)

**Comments not showing up?**
- Button click auto-refreshes comments (no cache)
- Check Service Worker console: `chrome://extensions/` → Extension details → "Inspect views"

**Images not appearing?**
- Wait longer (large images take time)
- Try "Images (URLs)" mode instead of "Download"
- Check your internet connection

**Selection not working?**
- Copy text first (Ctrl+C / Cmd+C)
- Then click "Copy for LLM" button
- Selection must be at least 20 characters

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ways to help:**
- Report bugs
- Suggest features
- Improve docs
- Submit pull requests
- Star the repo

---

## Credits

**Created by**: [Shub Gaur](https://github.com/shubgaur)
**License**: MIT
**Built with**: Pure vanilla JavaScript (no dependencies)

---

**Questions?** Open an issue on [GitHub](https://github.com/shubgaur/better-google-docs-copy)
