# 🤝 Contributing to Horizon Theme

First off — thank you for taking the time to contribute! Whether it's a bug report, a new icon, a theme tweak, or a feature idea, every contribution helps make Horizon Theme better for everyone.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Icon Contributions](#icon-contributions)
- [Theme Color Contributions](#theme-color-contributions)
- [Development Setup](#development-setup)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Style](#code-style)

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/Abdelrahman968/horizon-theme.git
   cd horizon-theme
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## 🙋 How to Contribute

There are many ways to contribute, even without writing code:

- ⭐ Star the repo to show your support
- 🐛 Report bugs or broken icon mappings
- 💡 Suggest new icons or theme improvements
- 📝 Improve documentation
- 🔍 Review open pull requests
- 🌍 Share the extension with others

---

## 🐛 Reporting Bugs

Before opening an issue, please:

1. Search [existing issues](https://github.com/Abdelrahman968/horizon-theme/issues) to avoid duplicates
2. Make sure you're on the latest version of the extension

When reporting a bug, include:

- **VS Code version** (`Help → About`)
- **Extension version**
- **Operating system**
- **Description** of the issue
- **Steps to reproduce**
- **Screenshots** if applicable (especially for visual issues)

---

## 💡 Suggesting Features

Feature requests are welcome! Please open an issue and include:

- A clear description of the feature
- Why it would be useful to users
- Any references or examples (e.g., icon previews, color hex values)

---

## 🔃 Submitting a Pull Request

1. Make sure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Test your changes locally by installing the `.vsix`:
   ```bash
   vsce package
   code --install-extension horizon-theme-*.vsix
   ```
3. Push your branch and open a Pull Request on GitHub
4. Fill in the PR template with a clear description of your changes
5. Link any related issues using `Closes #issue-number`

> PRs should be focused — one feature or fix per PR makes review much easier.

---

## 🎨 Icon Contributions

When contributing a new file or folder icon:

- Icons must be in **SVG format**
- Keep icons **simple and minimal** — consistent with the existing Horizon Icons style
- Name the file according to the convention: `[name].svg` placed in `fileicons/i/`
- Register the icon in `fileicons/icon-theme.json` under `iconDefinitions`, `fileExtensions`, or `fileNames` as appropriate
- Test that the icon appears correctly in VS Code after packaging

---

## 🌈 Theme Color Contributions

When contributing color theme changes:

- Theme files live in `themes/`
- Follow the existing structure of `dark_blue_dark.json`, `dark_plus.json`, or `modern_light.json`
- Ensure sufficient **contrast ratios** for accessibility (aim for WCAG AA compliance)
- Test across multiple file types (JS, Python, Markdown, JSON, etc.)
- Include **before/after screenshots** in your PR

---

## 🛠️ Development Setup

```bash
# Install VSCE for packaging
npm install -g @vscode/vsce

# Package the extension
vsce package

# Install locally for testing
code --install-extension horizon-theme-*.vsix

# Reload VS Code to apply changes
# Ctrl+Shift+P → Developer: Reload Window
```

---

## ✍️ Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <short description>
```

| Type | When to use |
|---|---|
| `feat` | A new icon, theme variant, or feature |
| `fix` | A bug fix or broken icon mapping |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace, no logic change |
| `refactor` | Code changes that aren't a fix or feature |
| `chore` | Build process, dependency updates |

**Examples:**
```
feat(icons): add support for .astro files
fix(theme): correct comment color contrast in Deep Blue
docs(readme): update custom icon association examples
chore: bump version to 1.1.0
```

---

## 🧹 Code Style

- Use **2 spaces** for indentation in JSON files
- Keep JSON files **well-structured** and alphabetically sorted where possible
- Do not introduce unnecessary dependencies
- Follow the existing patterns in `extension.js`

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE.txt).

---

Thank you for helping make Horizon Theme better. Every contribution — big or small — is genuinely appreciated. 🙏

*— Abdelrahman Ayman*
