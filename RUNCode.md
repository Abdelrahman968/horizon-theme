# 🚀 RUNCode — Horizon Theme Build Guide

A complete guide to packaging, publishing, and managing the **Horizon Theme** VS Code extension.

---

## 📦 Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) `v18+`
- [npm](https://www.npmjs.com/) `v9+`
- A [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage) publisher account

---

## 🔧 Install VSCE

`vsce` is the official CLI tool for packaging and publishing VS Code extensions.

```bash
npm install -g @vscode/vsce
```

Verify installation:

```bash
vsce --version
```

---

## 📁 Package the Extension

Compile all extension files into a `.vsix` installable package:

```bash
vsce package
```

This will generate a file like:

```
horizon-theme-1.0.0.vsix
```

> ⚠️ Make sure your `package.json` has a valid `publisher`, `version`, and `icon` field before packaging.

---

## ✅ Pre-publish Checklist

Run this to catch any issues before publishing:

```bash
vsce ls
```

This lists all files that will be included in the package. Cross-check with your `.vscodeignore` to avoid bundling unnecessary files.

---

## 🌐 Publish to Marketplace

### Login with Personal Access Token (PAT)

```bash
vsce login <publisher-name>
```

> Generate your PAT from [Azure DevOps](https://dev.azure.com) → User Settings → Personal Access Tokens.  
> Scope required: **Marketplace → Manage**

### Publish

```bash
vsce publish
```

### Publish a Specific Version

```bash
vsce publish 1.0.1
```

### Publish with Auto Version Bump

```bash
# Patch bump: 1.0.0 → 1.0.1
vsce publish patch

# Minor bump: 1.0.0 → 1.1.0
vsce publish minor

# Major bump: 1.0.0 → 2.0.0
vsce publish major
```

---

## 🧪 Install Locally for Testing

Install the `.vsix` directly into VS Code without publishing:

```bash
code --install-extension horizon-theme-1.0.0.vsix
```

Or via VS Code UI:
`Ctrl+Shift+P` → `Extensions: Install from VSIX...`

---

## 🔄 Unpublish / Deprecate

```bash
# Unpublish a specific version
vsce unpublish horizon-core.horizon-theme@1.0.0

# Unpublish the entire extension
vsce unpublish horizon-core.horizon-theme
```

---

## 🗂️ Recommended `.vscodeignore`

Exclude unnecessary files from your package to keep it lean:

```
.vscode/
.git/
.gitignore
node_modules/
*.vsix
**/*.md
!README.md
```

---

## 📊 Useful Commands Summary

| Command | Description |
|---|---|
| `npm install -g @vscode/vsce` | Install VSCE globally |
| `vsce package` | Package into `.vsix` |
| `vsce publish` | Publish to Marketplace |
| `vsce publish patch` | Publish with patch version bump |
| `vsce login <publisher>` | Authenticate with PAT |
| `vsce ls` | List files included in package |
| `vsce unpublish <id>` | Remove extension from Marketplace |
| `code --install-extension *.vsix` | Install locally for testing |

---

## 🔗 Links

- 📦 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=horizon-core.horizon-theme)
- 🐙 [GitHub Repository](https://github.com/Abdelrahman968/horizon-theme)
- 📖 [VSCE Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

*Made with ❤️ by Abdelrahman Ayman*
