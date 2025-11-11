# Installation Checklist ✓

Use this to track your progress installing the extension.

---

## 📦 Installation (Choose One)

### Option A: From Chrome Web Store (Easiest)
- [ ] Got Chrome Web Store link from publisher
- [ ] Clicked "Add to Chrome"
- [ ] Extension installed
- [ ] ✅ **Skip to Testing section below**

### Option B: Developer Installation (Testing)
- [ ] Downloaded extension folder
- [ ] Moved to permanent location (not Downloads/Temp)
- [ ] Opened `chrome://extensions/` in browser
- [ ] Turned on "Developer mode" (toggle top-right)
- [ ] Clicked "Load unpacked"
- [ ] Selected extension folder
- [ ] Extension appears in list

---

## 🧪 Testing

### First-Time Setup
- [ ] Opened a Google Doc (any doc)
- [ ] Found "Copy for LLM" button in toolbar (blue button, top-left area)
- [ ] Clicked button
- [ ] Authorized extension (first time only)
  - [ ] Clicked "Allow" to grant Google Docs access
  - [ ] Clicked "Allow" to grant Google Drive access

### Basic Copy Test
- [ ] Clicked "Copy for LLM" button
- [ ] Selected "Copy Doc as Markdown"
- [ ] Opened text editor (Notepad, TextEdit, etc.)
- [ ] Pasted (Ctrl+V / Cmd+V)
- [ ] Saw markdown text ✓

### Selection Copy Test
- [ ] In Google Doc, selected some text
- [ ] Copied selection (Ctrl+C / Cmd+C)
- [ ] Clicked "Copy for LLM" button
- [ ] Selected any mode
- [ ] Pasted
- [ ] Saw only selected text (not full doc) ✓

### Comments Test (if doc has comments)
- [ ] Clicked "Copy for LLM"
- [ ] Selected "Copy Doc + Comments"
- [ ] Pasted
- [ ] Saw comments in output ✓

### Images Test (if doc has images)
- [ ] Clicked "Copy for LLM"
- [ ] Selected "Copy Doc + Comments + Images (URLs)"
- [ ] Pasted
- [ ] Saw image links in markdown ✓

### Download Test
- [ ] Clicked "Copy for LLM"
- [ ] Selected "Download as .md File"
- [ ] File downloaded to Downloads folder ✓

### Keyboard Shortcut Test
- [ ] Pressed `Ctrl+Shift+M` (Mac: `Cmd+Shift+M`)
- [ ] Document copied automatically ✓

---

## ⚙️ Settings (Optional)

- [ ] Right-clicked extension icon → "Options"
- [ ] Settings page opened
- [ ] Reviewed available settings:
  - [ ] Quick copy mode
  - [ ] Heading style
  - [ ] Comment format
  - [ ] Include resolved comments
- [ ] Changed any settings (optional)
- [ ] Clicked "Save Settings"

---

## 🎓 Advanced (Optional)

### Customize Keyboard Shortcut
- [ ] Went to `chrome://extensions/shortcuts`
- [ ] Found "Google Docs Copy for LLMs"
- [ ] Clicked pencil icon
- [ ] Set custom shortcut
- [ ] Tested new shortcut

### Check Service Worker Logs (For Debugging)
- [ ] Went to `chrome://extensions/`
- [ ] Clicked "Inspect views: service worker"
- [ ] Opened Console tab
- [ ] Copied a doc
- [ ] Saw logs: "Fetching comments...", "After validation...", etc.

---

## ✅ Verification

If you can check all these, you're good to go:

- [x] ✓ Button appears in Google Docs
- [x] ✓ Can copy full document
- [x] ✓ Can copy selected text only
- [x] ✓ Comments are included (when requested)
- [x] ✓ Images work (when requested)
- [x] ✓ Can download as .md file
- [x] ✓ Keyboard shortcut works

---

## 🐛 Troubleshooting

### If Something Doesn't Work

**Button not showing:**
- [ ] Refreshed Google Docs page (F5)
- [ ] Checked extension is enabled at `chrome://extensions/`
- [ ] Verified I'm on a real Google Doc (URL has `/document/d/`)

**"Extension context invalidated" error:**
- [ ] Refreshed Google Docs page (F5)

**Keeps asking to re-authenticate:**
- This is normal for unpacked extensions
- [ ] Re-authorized when prompted
- OR: Wait for published version on Chrome Web Store

**Comments not showing:**
- [ ] Selected a mode that includes comments
- [ ] Checked doc actually has comments
- [ ] Clicked button again (refreshes comment cache)

**Images not showing:**
- [ ] Selected a mode with images
- [ ] Waited a few seconds for images to download
- [ ] Tried "Images (URLs)" mode instead

**Selection not working:**
- [ ] Copied selection first with Ctrl+C / Cmd+C
- [ ] Then clicked "Copy for LLM" button
- [ ] Selection is at least 20 characters

---

## 🎉 You're All Set!

Once all verification checks pass, you're ready to use the extension.

### Quick Reference

**Copy full document:**
1. Click "Copy for LLM"
2. Choose mode
3. Paste

**Copy selection:**
1. Select text (or Ctrl+C)
2. Click "Copy for LLM"
3. Choose mode
4. Paste

**Keyboard shortcut:**
- `Ctrl+Shift+M` (or `Cmd+Shift+M`)

**Settings:**
- Right-click icon → "Options"

**Change shortcut:**
- `chrome://extensions/shortcuts`

**Reload extension:**
- `chrome://extensions/` → Refresh icon

---

## 📚 More Help

- **Full Documentation**: See [README.md](README.md)
- **Quick Start**: See [INSTALL.md](INSTALL.md)
- **Issues**: Check Service Worker console for details
- **Questions**: Open an issue on GitHub

---

**Happy copying! 📋✨**
