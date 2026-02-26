# Horizon Theme

> A deep, immersive dark theme crafted for focus and clarity —
> paired with Horizon Icons to bring harmony to your workspace.

---

## Color Themes

Horizon ships with **three carefully crafted themes**:

### 🌑 Horizon Dark

A rich, neutral dark theme — easy on the eyes during long coding sessions.

### 🌊 Horizon Deep Blue

The signature theme. Deep navy backgrounds with cool blue accents that feel
like coding at the bottom of the ocean.

### ☀️ Horizon Light

A clean, minimal light theme for those who prefer a bright workspace.

---

## File Icons

Powered by **Horizon Icons** — 700+ simple, elegant icons covering every language,
framework, and tool you work with daily.

**Supported file types include:**

- JavaScript / TypeScript (+ JSX, TSX, Vue, Svelte, Astro…)
- Python, Ruby, Rust, Go, Java, C/C++, C#, PHP, Swift, Kotlin…
- JSON, YAML, TOML, XML, Markdown, CSV…
- Docker, Git, CI/CD configs, environment files…
- Images, fonts, audio, video, archives and more

**Supported folder types include:**

- `src`, `dist`, `assets`, `components`, `pages`, `api`
- `node_modules`, `.git`, `docker`, `ci`, `test`
- And many more specialized folders

---

## Installation

1. Open **VS Code**
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for **Horizon Theme**
4. Click **Install**

### Activate Color Theme

`Ctrl+K` `Ctrl+T` → Select **Horizon Deep Blue**, **Horizon Dark**, or **Horizon Light**

### Activate File Icons

`Ctrl+Shift+P` → `Preferences: File Icon Theme` → Select **Horizon Icons**

---

## Custom Icon Associations

You can customize icon associations in your VS Code `settings.json`:

```json
"horizonTheme.customIconAssociations": {
  "js": ["/my-js-folder", "*.js-extension"],
  "tsConfig": ["tsconfig.build.json"]
}
```

**Format guide:**

- Folder names: `/[name]`
- File extensions: `*.[name]`
- File names: `[name]`

Reload VS Code (`Developer: Reload Window`) to apply changes.

---

## Author

Made with ❤️ by **Abdelrahman Ayman**

[![GitHub](https://img.shields.io/badge/GitHub-Abdelrahman968-181717?style=flat&logo=github)](https://github.com/Abdelrahman968)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abdelrahman968-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/abdelrahman968/)
[![Facebook](https://img.shields.io/badge/Facebook-Abdelrahman.968-1877F2?style=flat&logo=facebook)](https://www.facebook.com/Abdelrahman.968)

---

## Credits

- File icons inspired by PKief's [Material Icon Theme] and Google's [Material Symbols]
- Icon set based on [Mizu Icons] by cdfzo
- Built with passion for the developer community

If there is a logo anyone wishes taken down, please open an issue.

[Material Icon Theme]: https://github.com/material-extensions/vscode-material-icon-theme
[Material Symbols]: https://github.com/google/material-design-icons
[Mizu Icons]: https://marketplace.visualstudio.com/items?itemName=cdfzo.mizu

---

## License

MIT © Abdelrahman Ayman
