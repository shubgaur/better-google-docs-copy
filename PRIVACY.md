# Privacy Policy for Google Docs Copy for LLMs

**Last Updated:** December 2024

## Overview

Google Docs Copy for LLMs ("the Extension") is a Chrome browser extension that helps users convert Google Docs content to markdown format for use with Large Language Models (LLMs).

## Data Collection and Usage

### What Data We Access

The Extension accesses the following data from your Google account:

1. **Google Docs Content** (Read-Only)
   - Document text, formatting, images, and comments
   - Accessed only when you explicitly click the "Copy for LLM" button
   - Used solely to convert content to markdown format

2. **Google Drive Metadata** (Read-Only)
   - Document titles and image metadata
   - Used to provide meaningful filenames and image descriptions

### What We DON'T Collect

- We do NOT collect, store, or transmit your personal data to any external servers
- We do NOT track your browsing history
- We do NOT sell or share your data with third parties
- We do NOT store your Google Docs content

## How Your Data is Handled

1. **Local Processing Only**
   - All document conversion happens locally in your browser
   - No data is sent to external servers
   - Converted markdown is copied to your clipboard or downloaded to your computer

2. **Authentication**
   - Uses Chrome's built-in OAuth system
   - Your Google credentials are managed securely by Chrome, not by this extension
   - Access tokens are cached locally by Chrome and never transmitted externally

3. **User Settings**
   - Minimal settings (heading style, comment format) are stored using Chrome's sync storage
   - Settings may sync across your Chrome instances if you're signed into Chrome

## Permissions Justification

The Extension requests the following permissions:

- **`identity`**: To authenticate with your Google account using OAuth
- **`storage`**: To save your preferences (heading style, comment format, etc.)
- **`clipboardWrite`**: To copy markdown content to your clipboard
- **`notifications`**: To show success/error messages (currently unused, may be removed)
- **`downloads`**: To download markdown files to your computer
- **`https://docs.google.com/*`**: To inject the "Copy for LLM" button into Google Docs
- **`https://www.googleapis.com/*`**: To access Google Docs and Drive APIs
- **`https://*.googleusercontent.com/*`**: To access document images

## Data Security

- All data processing occurs locally in your browser
- We use HTTPS for all API communications
- OAuth tokens are managed securely by Chrome's identity API
- No data is stored on external servers

## Third-Party Services

The Extension communicates only with:

1. **Google APIs** (docs.googleapis.com, drive.googleapis.com)
   - To fetch document content and metadata
   - Subject to [Google's Privacy Policy](https://policies.google.com/privacy)

2. **Google User Content** (googleusercontent.com)
   - To access document images
   - Subject to [Google's Privacy Policy](https://policies.google.com/privacy)

## Your Rights

You have the right to:

- Revoke the Extension's access to your Google account at any time via [Google Account Permissions](https://myaccount.google.com/permissions)
- Uninstall the Extension at any time from Chrome's extension settings
- Request information about how your data is processed

## Changes to This Policy

We may update this Privacy Policy from time to time. The "Last Updated" date at the top will indicate when changes were made. Continued use of the Extension after changes constitutes acceptance of the updated policy.

## Contact

For questions, concerns, or data privacy requests related to this Extension, please file an issue on our GitHub repository:

https://github.com/shubgaur/better-google-docs-copy

## Compliance

This Extension complies with:

- Chrome Web Store Developer Program Policies
- Google API Services User Data Policy
- GDPR requirements for data processing

## Open Source

This Extension is open source. You can review the code and verify our privacy claims at:

https://github.com/shubgaur/better-google-docs-copy
