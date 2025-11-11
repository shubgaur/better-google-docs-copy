# Publishing to GitHub 🚀

I've prepared everything for you! Follow these simple steps to publish your extension to GitHub.

---

## ✅ What's Been Done

✓ Created `.gitignore` (ignores unnecessary files)
✓ Created `LICENSE` (MIT License)
✓ Created `CONTRIBUTING.md` (contributor guidelines)
✓ Created `CODE_OF_CONDUCT.md` (community standards)
✓ Updated `README.md` (added contributing section)
✓ Initialized git repository
✓ Made initial commit with all files

---

## 🎯 Next Steps (5 minutes)

### Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Fill in details**:
   - **Repository name**: `google-docs-copy-extension` (or your preferred name)
   - **Description**: `Chrome extension to copy Google Docs as markdown for LLMs like Claude and ChatGPT`
   - **Visibility**:
     - ✅ **Public** (recommended for open source)
     - Or Private (if you want to keep it private initially)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these!)
3. **Click "Create repository"**

### Step 2: Push Your Code

GitHub will show you commands. Use these instead:

```bash
# Navigate to your extension folder (if not already there)
cd /Users/shubhankargaur/Downloads/google-docs-copy-extension

# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/google-docs-copy-extension.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR-USERNAME`** with your actual GitHub username!

### Step 3: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files!
3. README.md will display automatically

---

## 🎨 Optional: Add Repository Details

Make your repo look professional:

### Add Topics/Tags
On your GitHub repo page:
1. Click "⚙️ Settings" (gear icon near "About")
2. Add topics:
   - `chrome-extension`
   - `google-docs`
   - `markdown`
   - `llm`
   - `claude`
   - `chatgpt`
   - `productivity`
   - `javascript`

### Add Description
In the "About" section:
```
Chrome extension to copy Google Docs as markdown for LLMs. Supports comments, images, and selection-based copying.
```

### Add Website (optional)
If you publish to Chrome Web Store, add the store link here.

---

## 🔧 Update README with Your GitHub Username

After pushing, you'll want to update placeholder links:

1. Open `README.md`
2. Find and replace:
   - `YOUR-USERNAME` → your actual GitHub username
   - Update the Star History chart URL

Example:
```markdown
[![Star History Chart](https://api.star-history.com/svg?repos=shubhankargaur/google-docs-copy-extension&type=Date)](https://star-history.com/#shubhankargaur/google-docs-copy-extension&Date)
```

Then commit and push:
```bash
git add README.md
git commit -m "Update README with GitHub username"
git push
```

---

## 📝 Add Repository Badges (Optional but Cool!)

Add these badges to the top of your README.md for a professional look:

```markdown
# Google Docs Copy for LLMs 📋✨

[![GitHub stars](https://img.shields.io/github/stars/YOUR-USERNAME/google-docs-copy-extension?style=social)](https://github.com/YOUR-USERNAME/google-docs-copy-extension/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR-USERNAME/google-docs-copy-extension?style=social)](https://github.com/YOUR-USERNAME/google-docs-copy-extension/network/members)
[![GitHub issues](https://img.shields.io/github/issues/YOUR-USERNAME/google-docs-copy-extension)](https://github.com/YOUR-USERNAME/google-docs-copy-extension/issues)
[![GitHub license](https://img.shields.io/github/license/YOUR-USERNAME/google-docs-copy-extension)](https://github.com/YOUR-USERNAME/google-docs-copy-extension/blob/main/LICENSE)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/YOUR-EXTENSION-ID)](https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID)
```

(Remove the last badge until you publish to Chrome Web Store)

---

## 🚀 Publishing to Chrome Web Store

Once your code is on GitHub:

1. Follow the "Publishing to Chrome Web Store" section in README.md
2. When approved, update README.md with the Chrome Web Store link
3. Add Chrome Web Store badge

---

## 📣 Sharing Your Project

### On GitHub
- Add to your profile README
- Star your own repo (why not! 😄)
- Share in relevant GitHub topics

### Social Media
Example post:
```
🎉 Just open-sourced my Chrome extension!

"Google Docs Copy for LLMs" - Copy Google Docs as markdown with one click.
Perfect for Claude, ChatGPT, and other AI assistants.

Features:
✅ Multiple copy modes
✅ Selection-based copying
✅ Comments & images support
✅ Super fast with caching

Check it out: https://github.com/YOUR-USERNAME/google-docs-copy-extension

#OpenSource #ChromeExtension #AI #Productivity
```

### Dev Communities
Share on:
- Reddit: r/chrome_extensions, r/productivity
- Hacker News
- Product Hunt (when you publish to Chrome Web Store)
- Twitter/X with #ChromeExtension #OpenSource

---

## 🎯 Enable GitHub Features

### Issues
Already enabled by default! Users can:
- Report bugs
- Request features
- Ask questions

### Discussions (Optional)
Enable for community Q&A:
1. Go to repo Settings
2. Scroll to "Features"
3. Check "Discussions"

### Projects (Optional)
Track development progress:
1. Click "Projects" tab
2. Create new project
3. Add roadmap items

### Actions (Optional)
Could add automated testing later, but not needed initially.

---

## 📊 Analytics & Insights

After publishing, check:
- **Insights** tab: See traffic, clones, forks
- **Stars**: Track popularity
- **Network**: See forks and contributions

---

## 🔄 Future Updates

When you make changes:

```bash
# Make your changes to files

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: description of what you added"

# Push to GitHub
git push
```

---

## 🎉 You're All Set!

Your extension is now:
- ✅ Open source on GitHub
- ✅ Properly licensed (MIT)
- ✅ Ready for contributors
- ✅ Professional looking
- ✅ Easy to find and fork

**Next steps:**
1. Create the GitHub repo
2. Push your code
3. Share it!
4. (Optional) Publish to Chrome Web Store

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"
You need to set up SSH keys or use HTTPS with personal access token.

**Quick fix**: Use HTTPS instead:
```bash
git remote set-url origin https://github.com/YOUR-USERNAME/google-docs-copy-extension.git
```

### "Repository not found"
Make sure you:
- Created the repo on GitHub
- Used the correct username in the URL
- Made the repo public (or have access if private)

### "Failed to push"
Try:
```bash
git pull origin main --rebase
git push origin main
```

---

**Questions?** Check GitHub's official guide: https://docs.github.com/en/get-started

Good luck! 🚀
