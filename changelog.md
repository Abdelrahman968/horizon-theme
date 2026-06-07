# Changelog

All notable changes to **Horizon Themes** will be documented in this file.

---

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

## Fixed an issue

- where the sidebar settings panel was not displaying correctly
- where the theme scheduler was not working correctly
- where the backup & restore feature was not working correctly
- where the random theme feature was not working correctly
- where the HorizonTags feature was not working correctly
- where the Horizon Product Icons feature was not working correctly
- where the live theme preview feature was not working correctly
- where the sidebar settings panel was not working correctly
- where the theme scheduler was not working correctly
- where the backup & restore feature was not working correctly
- where the random theme feature was not working correctly
- where the HorizonTags feature was not working correctly
- where the Horizon Product Icons feature was not working correctly
- where the live theme preview feature was not working correctly

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
