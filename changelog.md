# Changelog

All notable changes to **Horizon Themes** will be documented in this file.

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

## [3.7.0]

### ✨ New Icons

- Add folder icons: debian, gemini, yaml, zed
- Add file icons: capistrano, gemini, istanbul, jsonConfig, nixLock, rustDist, rustError, rustLint
- Rename file icons: yml => yaml, ymlApp => yamlApp, ymlCi => yamlCi, ymlConfig => yamlConfig, ymlCron => yamlCron, ymlDatabase => yamlDatabase, ymlExample => yamlExample, ymlFunding => yamlFunding, ymlPublish => yamlPublish, ymlStorage => yamlStorage, ymlTemporary => yamlTemporary

- Make extension compatible with VS Code for the Web@beta
- Add file icons: elixirApp, elixirConfig, elixirEnv, elixirLint, phoenix

- Add folder icons: claude, cursor, debian, tailwind, vitepress
- Add file icons: claude, cursor, gitCliff, gitCliffIgnore, kdl
- Rename folder icon: cursor => pointer
- Rename file icon: cursor => pointer

- Fix file icon: ejs files

## [3.6.3]

### 🔧 Fixes & Improvements

#### 🎨 Horizon Deep Blue — Color Refinements

- Unified `statusBar.background` with the editor background (`#181D27`) for a more seamless look
- Updated `statusBar.foreground` to full white (`#ffffff`) for better readability
- Fixed `statusBar.noFolderBackground` and `statusBar.debuggingBackground` to match the main background instead of transparent/accent colors
- Aligned `titleBar`, `tab`, `editorGroupHeader`, `editorHoverWidget`, and `editorSuggestWidget` colors with the sidebar panel for visual consistency
- Corrected `tab.activeBorder` to use the soft blue-white accent (`#AABCF2`) matching hover widget highlights
- Synced `sideBar.border` with the activity bar border color (`#232A35`)

#### 🚸 Add New Icon

- New EJS Icon

## [3.6.2]

### 🔧 Fixes & Improvements

#### 🐛 Bug Fixes

- Fixed an issue where the sidebar settings panel was not displaying correctly
- Fixed an issue where the theme scheduler was not working correctly
- Fixed an issue where the backup & restore feature was not working correctly
- Fixed an issue where the random theme feature was not working correctly
- Fixed an issue where the HorizonTags feature was not working correctly
- Fixed an issue where the Horizon Product Icons feature was not working correctly
- Fixed an issue where the live theme preview feature was not working correctly

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

- New button in Backup & Restore that removes all accent color overrides (Title Bar, Activity Bar, Status Bar) from workspace settings
- Instantly restores the original theme appearance without manual editing

#### 🎉 Onboarding Walkthrough

- First install now shows a "Take the Tour" prompt opening an interactive 5-step walkthrough: Themes, Icons, Horizon Tags, Scheduler, and Workspace Customization
- Each step includes direct command links for immediate action

#### ⭐ Rate & Review Prompt

- Tracks usage count and install date; after 7 days + 50 activations, shows a one-time prompt
- Options: **Leave a Review** (opens Marketplace reviews tab), **Already Did**, **Remind Me Later** (resets counter), **No Thanks** (never shows again)

#### 🌳 Tag Summary Tree View

- New sidebar panel listing all Horizon Tags tag pairs found in the active file, grouped by filename
- Click any entry to jump directly to that line in the editor
- Includes a Refresh button; updates automatically on file changes

#### 📋 Copy Theme Colors to Clipboard — `horizonTheme.copyColors`

- Prompts to choose output format: **JSON** (`workbench.colorCustomizations` structure), **CSS Variables** (`--editor-background: #...`), or **Plain List** (`key: value`)
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

#### ⚡ Performance Improvements

- **Cached Config (`getTagsConfig`)**: extension settings are now read once and cached; cache is invalidated only when `horizonTags` configuration changes via `onDidChangeConfiguration`, reducing redundant API calls
- **Document Version Cache (`_tagCache`)**: the tag engine checks `document.version` before re-parsing — if unchanged, decorations are re-applied from cache without a full text parse; cache holds up to the last 20 files with automatic eviction of the oldest
- **Memoized Regex (`getTagRemoverRe`)**: the regex for stripping comments and script/style blocks is now built once and reused; only rebuilt when the denylist configuration changes
- **Debounced Tag Highlighting**: tag highlighting now waits 200 ms after the last change before running, noticeably improving performance on large files
- **Selective Config Invalidation**: `onDidChangeConfiguration` now checks `e.affectsConfiguration('horizonTags')` before clearing the cache, avoiding unnecessary invalidations on unrelated settings changes

---

## [3.6.1]

### ✨ New Features

#### 🎛️ Built-in Horizon Product Icons

- **36 custom SVG icons** bundled directly inside the extension — no separate extension required
- Replaces VS Code's default codicons for Activity Bar, terminal, git, notifications, explorer actions, editor tabs, and status indicators
- All icons hand-crafted to match the Horizon color palette: cyan `#4fc3f7`, magenta `#e91e8c`, purple `#a78bfa`, gold `#f0c040`
- Activate via: `Preferences: Product Icon Theme` → **Horizon Product Icons**, or via the Sidebar panel

**Icons included:**

| Area         | Icons                                                                |
| ------------ | -------------------------------------------------------------------- |
| Activity Bar | Explorer, Search, Source Control, Debug, Extensions, Output, Testing |
| Terminal     | New Terminal, Kill Terminal                                          |
| Status Bar   | Settings, Sync, Bell, Bell-dot                                       |
| Explorer     | New File, New Folder, Collapse All, Refresh                          |
| Tree         | Chevron Right, Chevron Down                                          |
| Editor tabs  | Close, Close (unsaved), Split                                        |
| Git          | Commit, Branch, Sync                                                 |
| Indicators   | Error, Warning, Info, Check                                          |

#### 🔍 Live Theme Preview

- Hover over any theme card in the sidebar to preview it instantly before applying
- **Disabled by default** — toggle with the "Preview OFF/ON" button or in the Settings tab
- Configurable delay from 50 ms to 800 ms

#### ⚙️ Sidebar Settings Panel

- 4-tab UI: **Themes** / **Settings** / **Changes** / **About**
- Editor appearance controls: font size, line height, font ligatures, minimap, bracket pair colors
- Cursor style (6 options) and cursor blinking animation (5 options)
- Color customization: override 4 accent colors via live color pickers
- HorizonTags highlight style selector (color / background / border)

#### 🌅 Theme Scheduler

- Automatically switches between a day theme and a night theme at configurable times
- Checks every 60 seconds to apply the correct theme

#### 📦 Backup & Restore

- **Export** all settings (theme, icons, colors, scheduler, editor prefs) to JSON
- **Import** settings from a JSON backup
- **Reset to Defaults** with confirmation dialog

#### 🎲 Random Theme

- New command: `Horizon: Apply Random Theme` — picks a random theme from the full library

---

## [2.0.2] — 2026-02-26

- Reduce Size

## [2.0.1] — 2026-02-26

- Fix some issues

## [2.0.0] — 2026-02-26

### ✨ New Features

#### 🏷️ Horizon Tags

- Introduced **Horizon Tags** — intelligent tag-pair colorization for HTML, XML, Vue, and more
- Supports custom tags, meta tags, and self-closing tags
- Smart denylist handling to exclude unwanted tags
- Three highlight modes: `color`, `background-color`, and `border`

#### 🎮 Gamers Edition — HoYoverse (+46 Themes)

**Genshin Impact**

| Character         | Light | Dark | High Contrast |
| ----------------- | :---: | :--: | :-----------: |
| Citlali           |  ✅   |  ✅  |       —       |
| Layla             |  ✅   |  ✅  |       —       |
| Furina            |  ✅   |  ✅  |       —       |
| Ganyu             |  ✅   |  ✅  |      ✅       |
| Yumemizuki Mizuki |  ✅   |  ✅  |      ✅       |
| Sandrone          |  ✅   |  ✅  |       —       |
| Scaramouche       |  ✅   |  ✅  |       —       |
| Wanderer          |  ✅   |  ✅  |       —       |
| Columbina         |  ✅   |  ✅  |       —       |
| Ill Dottore       |  ✅   |  ✅  |       —       |
| Yae Miko          |  ✅   |  ✅  |       —       |
| Kamisato Ayaka    |  ✅   |  ✅  |       —       |
| Chiori            |  ✅   |  ✅  |       —       |
| Skirk             |  ✅   |  ✅  |       —       |

**Honkai: Star Rail**

| Character  | Light | Dark |
| ---------- | :---: | :--: |
| Robin      |  ✅   |  ✅  |
| Kafka      |  ✅   |  ✅  |
| Firefly    |  ✅   |  ✅  |
| Aventurine |  ✅   |  ✅  |
| Dan Heng   |  ✅   |  ✅  |
| Ruan Mei   |  ✅   |  ✅  |
| Cyrene     |  ✅   |  ✅  |
| March 7th  |  ✅   |  ✅  |

---

## [1.0.1] — 2026-02-26

### 🔧 Fixes & Improvements

- Renamed id & label of **Horizon Deep Blue** → `Horizon Themes Core: Deep Blue`
- Renamed id & label of **Horizon Dark Plus** → `Horizon Themes Core: Dark Plus`
- Renamed id & label of **Horizon Modern Light** → `Horizon Themes Core: Modern Light`
- Renamed id & label of **Horizon Icons** → `Horizon Icons`

---

## [1.0.0] — 2026-02-26

### 🎉 Initial Release

#### 🎨 Color Themes

| Theme                             | Style |
| --------------------------------- | ----- |
| Horizon Themes Core: Deep Blue    | Dark  |
| Horizon Themes Core: Dark Plus    | Dark  |
| Horizon Themes Core: Modern Light | Light |

#### 🗂️ File Icons

- Bundled **Horizon Icons** — 700+ icons for files and folders
- Support for custom icon associations via `horizonTheme.customIconAssociations`

---

## 🔮 Upcoming

- Token colors & syntax highlighting improvements
- Additional Hoyoverse character themes
- More product icon overrides

---

_For issues or suggestions, please open an issue on the repository._  
_Contact: **se.abdelrahman968@gmail.com**_
