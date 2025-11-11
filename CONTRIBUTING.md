# Contributing to Google Docs Copy for LLMs

Thank you for your interest in contributing! 🎉

This guide will help you get started with contributing to this project.

---

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/google-docs-copy-extension.git
   cd google-docs-copy-extension
   ```
3. **Load the extension** in Chrome (see [INSTALL.md](INSTALL.md))
4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

---

## 🛠️ Development Setup

### Prerequisites
- Google Chrome, Arc, Brave, or any Chromium-based browser
- Google account for OAuth testing
- Text editor (VS Code, Sublime, etc.)
- Basic knowledge of JavaScript and Chrome extensions

### Loading for Development
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder
5. Make changes and click reload icon to test

### Testing Changes
After making changes:
1. Click reload icon on extension card at `chrome://extensions/`
2. Refresh any open Google Docs tabs
3. Test your changes thoroughly

---

## 📝 Code Style

### JavaScript
- Use ES6+ features (async/await, arrow functions, etc.)
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

### Code Example
```javascript
/**
 * Fetch comments from Google Drive API with caching
 * @param {string} documentId - Google Docs document ID
 * @param {string} token - OAuth access token
 * @param {object} documentContent - Document content for validation
 * @returns {Promise<Array>} Array of comment objects
 */
async function getComments(documentId, token, documentContent = null) {
  // Implementation
}
```

### File Organization
- `background.js` - Service worker, OAuth, API calls, caching
- `content.js` - UI injection, clipboard, user interactions
- `markdown-converter.js` - Document to markdown conversion
- `settings/` - Settings page HTML and JavaScript
- `ui/` - Styles for button, dropdown, notifications

---

## 🧪 Testing

### Manual Testing Checklist
Before submitting a PR, test:

**Core Features:**
- [ ] All 4 copy modes work
- [ ] Selection-based copy works
- [ ] Settings are applied correctly
- [ ] Comments are included/filtered correctly
- [ ] Images work (both URLs and downloads)
- [ ] Download as .md file works

**Edge Cases:**
- [ ] Document with no comments
- [ ] Document with no images
- [ ] Very large documents (50+ pages)
- [ ] Documents with tables
- [ ] Documents with complex formatting
- [ ] Multiple selections (Ctrl+click)
- [ ] Empty selections

**Error Handling:**
- [ ] Invalid document ID
- [ ] Network errors
- [ ] Rate limiting
- [ ] OAuth expiration
- [ ] Extension context invalidation

### Debugging
**Service Worker Console:**
```
chrome://extensions/ → Extension details → "Inspect views: service worker"
```

**Content Script Console:**
```
Right-click in Google Docs → Inspect → Console tab
```

**Clear Caches:**
```javascript
// In Service Worker console
clearExtensionCaches()
```

---

## 🐛 Reporting Bugs

### Before Reporting
1. Check [existing issues](https://github.com/YOUR-USERNAME/google-docs-copy-extension/issues)
2. Try with extension reloaded and page refreshed
3. Check Service Worker console for error details

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g. Chrome 120]
- OS: [e.g. macOS 14.0]
- Extension version: [e.g. 1.0.0]

**Console Logs**
Paste any relevant error messages from Service Worker console.
```

---

## 💡 Feature Requests

### Before Requesting
1. Check if feature already exists in settings
2. Search existing issues/PRs
3. Consider if it fits the project scope

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other approaches you've thought about.

**Additional context**
Any other context or screenshots.
```

---

## 🔀 Pull Request Process

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes
- Follow code style guidelines
- Add comments for complex logic
- Test thoroughly

### 3. Commit Your Changes
```bash
git add .
git commit -m "Add feature: description of what you did"
```

**Commit Message Guidelines:**
- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issue numbers when applicable

**Good examples:**
- `Add support for Google Sheets export`
- `Fix comment validation for nested replies`
- `Improve markdown table formatting`
- `Update documentation for OAuth setup`

### 4. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 5. Submit Pull Request
1. Go to the [original repository](https://github.com/YOUR-USERNAME/google-docs-copy-extension)
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Wait for review!

### Pull Request Template
```markdown
**Description**
What does this PR do?

**Related Issue**
Fixes #(issue number)

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
How has this been tested?

**Checklist**
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] All tests pass
- [ ] No new warnings
```

---

## 📚 Areas for Contribution

### High Priority
- [ ] Add unit tests
- [ ] Support for Google Sheets
- [ ] Better table formatting
- [ ] Improved code block detection
- [ ] Performance optimizations

### Medium Priority
- [ ] Additional export formats (HTML, PDF)
- [ ] Batch document processing
- [ ] Template system for output
- [ ] Custom markdown flavors
- [ ] Browser compatibility (Firefox, Edge)

### Documentation
- [ ] Video tutorials
- [ ] More examples
- [ ] Translation to other languages
- [ ] API documentation
- [ ] Architecture diagrams

### Nice to Have
- [ ] Dark mode for settings page
- [ ] Keyboard shortcut customization UI
- [ ] Export to note-taking apps
- [ ] Collaborative features
- [ ] Chrome Web Store screenshots

---

## 🎨 Design Guidelines

### UI/UX Principles
- **Simplicity**: Keep UI minimal and intuitive
- **Speed**: Fast operations, show progress for long tasks
- **Clarity**: Clear labels, helpful tooltips
- **Consistency**: Match Google Docs design language

### Button & Dropdown
- Blue color scheme to match Google Docs
- Icons should be clear and recognizable
- Hover states for better feedback
- Animations should be subtle

### Notifications
- Success (green), error (red), warning (orange), loading (blue)
- Auto-dismiss after 4 seconds (except loading)
- Clear, actionable messages

---

## 🔐 Security

### OAuth Credentials
- **Never** commit OAuth client IDs
- Each user/installation should use their own credentials
- Include instructions for setup, not actual credentials

### API Keys
- No API keys should be in code
- Use environment variables for any secrets
- Document setup in README

### User Data
- All processing must be local (in browser)
- No data collection or tracking
- No third-party services (except Google APIs)

---

## 📞 Getting Help

### Resources
- **Documentation**: [README.md](README.md)
- **Installation**: [INSTALL.md](INSTALL.md)
- **Issues**: [GitHub Issues](https://github.com/YOUR-USERNAME/google-docs-copy-extension/issues)

### Questions?
- Open a [Discussion](https://github.com/YOUR-USERNAME/google-docs-copy-extension/discussions)
- Comment on relevant issues
- Check existing documentation first

---

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commit history

Thank you for helping make this extension better! 🎉

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.
