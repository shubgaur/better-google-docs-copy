# Google Docs Copy for LLMs 📋

**Copy Google Docs as markdown for Claude, ChatGPT, and other AI assistants—with one click.** Download [here.](https://chromewebstore.google.com/detail/better-google-docs-copy/faciokbjemdddkjokcajndenapikgcml?authuser=0&hl=en)

---

## The Problem

You want to share a Google Doc with an LLM, so you copy it as markdown. But then:

- **Comments are missing:** There's no way to copy comments without copying them one by one
- **Image URLs are giant:** Google gives you massive, ugly URLs that crush your context window
- **You lose context:** Your LLM can't see the full picture without comments and clean image references

**This extension solves that.** Copy clean markdown with comments and images included—without wasting your context window on enormous URLs.

---

## What Makes It Special

- **Copy selected text or entire documents** - Choose what you need
- **Include images and comment threads** - Complete context for your LLM
- **Download as `.md` files** - Save for later or share easily
- **Privacy-first** - All processing happens locally in your browser

<img width="1206" height="1166" alt="screenshot Cold Plunge - Google Doc… 11-11-2025@2x" src="https://github.com/user-attachments/assets/414000b6-a7dc-4d3f-b373-05b9458871e9" />

---

## How to Use

### Installation
1. Install from [Chrome Web Store](https://chromewebstore.google.com/detail/better-google-docs-copy/faciokbjemdddkjokcajndenapikgcml?authuser=0&hl=en)
2. First time: Click "Copy for LLM" button in any Google Doc and authorize access
3. Done! Start copying documents by selecting a specific mode.

---

## Settings

Right-click extension icon → **Options** to customize:

- **Heading Style**: ATX (`# Heading`) or Setext (underlined)
- **Comment Format**: XML tags, Blockquote style, or Quoted Context (shows comments at end with text snippets)
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

**For Developers**: If you're setting up OAuth for publishing, see [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed configuration instructions.

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

**Q: Is this open source?**
A: Yeah, do whatever with it

**Q: Does it require internet?**
A: Yes, needs internet to fetch docs from Google APIs.

**Q: Can I copy private documents?**
A: Yes, as long as you have access to them in Google Docs.

**Q: Why does it need Drive API access?**
A: Google stores comments in Drive, not the Docs API.

**Q: Can I export to other formats?**
A: Currently only markdown. Too lazy to add anything else lol

**Q: Does formatting get preserved?**
A: Yes! **Bold**, *italic*, ~~strikethrough~~, `code`, links, headings, lists, and tables are all preserved.

Have fun!
