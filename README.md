# Horizon Themes

> A deep, immersive theme collection crafted for focus and clarity —  
> paired with **Horizon Icons**, **Horizon Product Icons**, and **Horizon Tags** to bring harmony and color to your entire workspace.

---

![Horizon Banner](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/banner.png)

---

## [3.9.0]

### ✨ New Features

#### 🖼️ Export Theme Palette as Image — `horizonTheme.exportPalette`

- Reads colors directly from the active Horizon theme file
- Generates an SVG file displaying key color swatches: Editor BG/FG, Activity Bar, Status Bar, Title Bar, Accent, and terminal ANSI colors
- Includes the theme name as a header — great for sharing on social media or visually comparing themes

#### 🗂️ Set Workspace Theme (Per-Project) — `horizonTheme.setWorkspaceTheme`

- Opens a QuickPick listing all Horizon themes
- Saves the selection to Workspace settings (`.vscode/settings.json`) instead of global settings
- Each project now remembers its own theme independently

#### 🎨 Set Workspace Accent Color — `horizonTheme.setWorkspaceAccent`

- Prompts for a hex color and applies it to the Title Bar, Activity Bar, and Status Bar for the current workspace only
- Uses `workbench.colorCustomizations` at Workspace scope — ideal for visually distinguishing multiple project windows

#### 🧹 Clear Workspace Accent — `horizonTheme.clearWorkspaceAccent`

- Removes all accent color overrides (Title Bar, Activity Bar, Status Bar) from workspace settings
- Instantly restores the original theme appearance without manual editing

#### 🎉 Onboarding Walkthrough

- First install now shows a "Take the Tour" prompt opening an interactive 5-step walkthrough: Themes, Icons, Horizon Tags, Scheduler, and Workspace Customization
- Each step includes direct command links for immediate action

#### ⭐ Rate & Review Prompt

- Tracks usage count and install date; after 7 days + 50 activations, shows a one-time prompt:
  _"You've been using Horizon Themes for a while — enjoying it? A review helps a lot! 🙏"_
- **Leave a Review ⭐** → opens Marketplace reviews tab directly
- **Already Did** → saves response and never asks again
- **Remind Me Later** → resets the counter, asks again after 50 more activations
- **No Thanks** → dismisses permanently

#### 🌳 Tag Summary Tree View

- New sidebar panel listing all Horizon Tags tag pairs found in the active file, grouped by filename
- Click any entry to jump directly to that line in the editor
- Includes a Refresh button; updates automatically on file changes

#### 📋 Copy Theme Colors to Clipboard — `horizonTheme.copyColors`

- Prompts to choose output format:
  - **JSON** — `workbench.colorCustomizations` structure
  - **CSS Variables** — `--editor-background: #...` ready to paste in CSS
  - **Plain List** — `key: value` line by line
- Copies all colors of the active theme to the clipboard with a confirmation message

#### 🔤 Font Family Picker — `horizonTheme.pickFont`

- Lists 20 popular coding fonts: JetBrains Mono, Fira Code, Cascadia Code, Monaspace Neon/Argon/Xenon, Geist Mono, Maple Mono, and more
- After selection, prompts to enable or disable ligatures
- Supports typing a fully custom font family name
- Accessible from the Settings panel

#### 🎯 Context Themes (Focus Mode & Zen Mode)

- **Focus Mode Theme**: automatically switches to a configured theme when the VS Code window loses focus, and restores the original theme on return
- **Zen Mode Theme**: switches to a calmer theme when Zen Mode is activated, restores on exit
- Both configurable from the Context Themes section in the Settings panel

### ⚡ Performance Improvements

- **Debounced Tag Highlighting**: tag highlighting now waits 200 ms after the last change before running, noticeably improving performance on large files
- **Cached Config (`getTagsConfig`)**: extension settings are read once and cached; invalidated only when `horizonTags` configuration changes, reducing redundant API calls
- **Document Version Cache (`_tagCache`)**: the tag engine checks `document.version` before re-parsing — if unchanged, decorations are re-applied from cache without a full text parse; cache holds the last 20 files with automatic eviction
- **Memoized Regex (`getTagRemoverRe`)**: the regex for stripping comments and script/style blocks is built once and reused; only rebuilt when the denylist configuration changes
- **Selective Config Invalidation**: `onDidChangeConfiguration` now checks `e.affectsConfiguration('horizonTags')` before clearing the cache, avoiding unnecessary invalidations on unrelated settings changes

### ➖ New Tap

- Add Commend Tap in Extension Panel

---

## [3.8.0]

- Make extension compatible with VS Code for the Web

---

## 🗂️ File & Folder Icons

![Horizon Files Icons](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/files.png)  
![Horizon Folder Icons](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/folders.png)

Powered by **Horizon Icons** — 900+ simple, elegant icons covering every language, framework, and tool you work with daily.

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

## 🎛️ Horizon Product Icons

**New in v3.6.1** — Horizon ships with its own built-in Product Icon Theme. No additional extensions required.

<img src="https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/preview-explorer.png" alt="Preview explorer" width="400xp">

Activate it via the Sidebar panel → **Themes tab** → **Product Icon Theme** → select **Horizon Product Icons**.

Or via Command Palette: `Preferences: Product Icon Theme` → **Horizon Product Icons**

### Icon set

<details><summary>🏞️ <b>Available icons</b></summary><br/><img src="https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/product-icons.png" alt="Preview"></details>

## Icon sources

- [Google Icons](https://material.io/resources/icons)
- [Material Design Icons](https://materialdesignicons.com/)

---

## 🏷️ Horizon Tags

Intelligently colors all tag pairs in your files with smart denylist handling, supporting custom tags, meta tags, and self-closing tags.

### Example - Text color mode

![Example](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/example_color.png)

### Example - Background color mode

![Example](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/example_bgcolor.png)

### Example - Border color mode

![Example](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/example_border.png)

---

## 🎛️ Sidebar Settings Panel

Open the **Horizon** icon in the Activity Bar to access the full settings panel.

### Themes Tab

- Browse and apply all 40+ themes with live preview on hover
- Switch File Icon Theme & Horizon Product Icons
- Preview toggle (disabled by default to avoid accidental switches)

### Settings Tab

- **Live Preview** — enable/disable hover preview + configure delay
- **Editor Appearance** — font size, line height, ligatures, minimap, bracket colors, cursor style & blinking
- **Color Customization** — override primary, secondary, tertiary accent colors and background
- **Horizon Tags** — enable everywhere + highlight style
- **Theme Scheduler** — auto-switch day/night themes by time
- **Backup & Restore** — export/import/reset all settings

---

## 📦 Installation

1. Open **VS Code**
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for **Horizon Themes**
4. Click **Install**

### Activate Color Theme

`Ctrl+K` `Ctrl+T` → Select any theme from the list above

### Activate File Icons

`Ctrl+Shift+P` → `Preferences: File Icon Theme` → Select **Horizon Icons**

### Activate Product Icons

`Ctrl+Shift+P` → `Preferences: Product Icon Theme` → Select **Horizon Product Icons**

### Activate Tag Coloring

Horizon Tags works automatically for supported languages.

---

## ⚙️ Configuration

### Tag colors — `horizonTags.colors`

```json
{
  "horizonTags.colors": ["#d26", "red", "rgba(100, 200, 100, 0.5)"]
}
```

### Coloring style — `horizonTags.highlightType`

```json
{
  "horizonTags.highlightType": "color"
}
```

Options: `color` · `background-color` · `border`

### Switch for unsupported languages — `horizonTags.allowEverywhere`

```json
{
  "horizonTags.allowEverywhere": true
}
```

### Supported languages — `horizonTags.supportedLanguages`

```json
{
  "horizonTags.supportedLanguages": ["html", "xml", "vue"]
}
```

### Excluded tags — `horizonTags.denylistTags`

```json
{
  "horizonTags.denylistTags": ["html", "head", "body"]
}
```

### Live Preview — `horizonTheme.livePreview`

```json
{
  "horizonTheme.livePreview.enabled": false,
  "horizonTheme.livePreview.delay": 150
}
```

### Theme Scheduler — `horizonTheme.scheduler`

```json
{
  "horizonTheme.scheduler.enabled": true,
  "horizonTheme.scheduler.dayTheme": "horizon-core.modern-light",
  "horizonTheme.scheduler.nightTheme": "horizon-core.deep-blue",
  "horizonTheme.scheduler.dayStart": "08:00",
  "horizonTheme.scheduler.nightStart": "20:00"
}
```

---

## 🎨 Custom Icon Associations

```json
"horizonTheme.customIconAssociations": {
  "js": ["/my-js-folder", "*.js-extension"],
  "tsConfig": ["tsconfig.build.json"]
}
```

---

## ⌨️ Commands

| Command                       | Description                    |
| ----------------------------- | ------------------------------ |
| `Horizon: Open Settings`      | Open the Horizon sidebar panel |
| `Horizon: Export Settings`    | Export all settings to JSON    |
| `Horizon: Import Settings`    | Import settings from JSON      |
| `Horizon: Reset to Defaults`  | Reset all Horizon settings     |
| `Horizon: Apply Random Theme` | Apply a random Horizon theme   |

---

## 👤 Author

Made with ❤️ by **Abdelrahman Ayman**

[![GitHub](https://img.shields.io/badge/GitHub-Abdelrahman968-181717?style=flat&logo=github)](https://github.com/Abdelrahman968)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abdelrahman968-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/abdelrahman968/)
[![Facebook](https://img.shields.io/badge/Facebook-Abdelrahman.968-1877F2?style=flat&logo=facebook)](https://www.facebook.com/Abdelrahman.968)

---

## 🙏 Credits

- File icons inspired by PKief's [Material Icon Theme] and Google's [Material Symbols]
- Icon set based on [Mizu Icons] by cdfzo
- Horizon Tags inspired by [Rainbow Tags](https://gitlab.com/voldemortensen/rainbow-tags)
- Product icons hand-crafted for Horizon Themes

---

## 📄 License

MIT © Abdelrahman Ayman — See [LICENSE](LICENSE) for full terms.
