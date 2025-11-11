# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-01-11

### 🎉 Initial Release

**Core Features:**
- ✅ Multiple copy modes (doc only, doc + comments, doc + images)
- ✅ Selection-based copying (copy selected text only)
- ✅ Download as .md file option
- ✅ Keyboard shortcut (Ctrl+Shift+M / Cmd+Shift+M)
- ✅ Settings customization page

**Performance:**
- ✅ Parallel API calls (comments and images fetched simultaneously)
- ✅ Document caching (5-minute TTL)
- ✅ Parallel image downloads
- ✅ Rate limiting (10 requests/minute)

**Reliability:**
- ✅ Auto token refresh (no re-authentication)
- ✅ Graceful error handling
- ✅ Comment validation (filters invalid comments from other documents)
- ✅ Force refresh on button click (always gets latest comments)

**Settings:**
- ✅ Heading style (ATX or Setext)
- ✅ Comment format (XML or Blockquote)
- ✅ Include/exclude resolved comments
- ✅ Quick copy mode for keyboard shortcut

**Technical:**
- Built with Manifest V3
- Pure vanilla JavaScript (no dependencies)
- OAuth 2.0 authentication
- Google Docs API + Google Drive API integration

**Documentation:**
- Comprehensive README.md
- Quick installation guide (INSTALL.md)
- Contributing guidelines (CONTRIBUTING.md)
- Code of conduct (CODE_OF_CONDUCT.md)

---

## [Unreleased]

### Planned Features
- [ ] Support for Google Sheets
- [ ] Progress indicators for long operations
- [ ] Batch document processing
- [ ] Custom markdown templates
- [ ] Export to other formats (HTML, PDF)
- [ ] Browser compatibility (Firefox, Edge)

### Potential Improvements
- [ ] Unit tests
- [ ] Better table formatting
- [ ] Improved code block detection
- [ ] Image quality options
- [ ] Comment threading visualization
- [ ] Document metadata in output

---

## Version History

- **1.0.0** - Initial release (2025-01-11)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
