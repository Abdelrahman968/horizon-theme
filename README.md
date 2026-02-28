# Horizon Themes

> A deep, immersive theme collection crafted for focus and clarity —  
> paired with **Horizon Icons** and **Horizon Tags** to bring harmony and color to your workspace.

---

![Horizon Banner](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/banner.png)

---

## 🎨 Color Themes

Horizon ships with **two editions**: **Core** for minimalists and **Gamers** for HoYoverse fans.

---

### 🔵 Core Edition

| Theme                             | Style |
| --------------------------------- | ----- |
| Horizon Themes Core: Deep Blue    | Dark  |
| Horizon Themes Core: Dark Plus    | Dark  |
| Horizon Themes Core: Modern Light | Light |

---

### 🎮 Gamers Edition — HoYoverse

Each character theme comes in **Light** and **Dark** variants. Select characters also include a **High Contrast** version.

#### Genshin Impact

| Character         | Light | Dark | High Contrast |
| ----------------- | ----- | ---- | ------------- |
| Citlali           | ✅    | ✅   | —             |
| Layla             | ✅    | ✅   | —             |
| Furina            | ✅    | ✅   | —             |
| Ganyu             | ✅    | ✅   | ✅            |
| Yumemizuki Mizuki | ✅    | ✅   | ✅            |
| Sandrone          | ✅    | ✅   | —             |
| Scaramouche       | ✅    | ✅   | —             |
| Wanderer          | ✅    | ✅   | —             |
| Columbina         | ✅    | ✅   | —             |
| Ill Dottore       | ✅    | ✅   | —             |
| Yae Miko          | ✅    | ✅   | —             |
| Kamisato Ayaka    | ✅    | ✅   | —             |
| Chiori            | ✅    | ✅   | —             |
| Skirk             | ✅    | ✅   | —             |

#### Honkai: Star Rail

| Character  | Light | Dark |
| ---------- | ----- | ---- |
| Robin      | ✅    | ✅   |
| Kafka      | ✅    | ✅   |
| Firefly    | ✅    | ✅   |
| Aventurine | ✅    | ✅   |
| Dan Heng   | ✅    | ✅   |
| Ruan Mei   | ✅    | ✅   |
| Cyrene     | ✅    | ✅   |
| March 7th  | ✅    | ✅   |

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

## 🏷️ Horizon Tags

Intelligently colors all tag pairs in your files with smart denylist handling, supporting custom tags, meta tags, and self-closing tags.

### Example - Text color mode

![Example](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/example_color.png)

### Example - Background color mode

![Example](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/example_bgcolor.png)

### Example - Border color mode

![Example](https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/example_border.png)

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

### Activate Tag Coloring

Horizon Tags works automatically for supported languages.

---

## ⚙️ Configuration

### Tag colors - `horizonTags.colors`

A list of color strings for tag highlighting — can include alpha values and any number of colors.

```json
{
  "horizonTags.colors": ["#d26", "red", "rgba(100, 200, 100, 0.5)"]
}
```

### Coloring style - `horizonTags.highlightType`

Determines the highlighting style for tags:

- `color` → text color
- `background-color` → background
- `border` → border color

```json
{
  "horizonTags.highlightType": "color"
}
```

### Switch for unsupported languages - `horizonTags.allowEverywhere`

If true, tags will be colored in all file types. Default is false.

```json
{
  "horizonTags.allowEverywhere": true
}
```

### Supported languages - `horizonTags.supportedLanguages`

A list of language IDs affected by this extension.

```json
{
  "horizonTags.supportedLanguages": ["html", "xml", "vue"]
}
```

### Excluded tags - `horizonTags.denylistTags`

Tags that won't be colored.

```json
{
  "horizonTags.denylistTags": ["html", "head", "body"]
}
```

---

## 🎨 Custom Icon Associations

You can customize icon associations in your VS Code `settings.json`:

```json
"horizonTheme.customIconAssociations": {
  "js": ["/my-js-folder", "*.js-extension"],
  "tsConfig": ["tsconfig.build.json"]
}
```

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

---

## 📄 License

MIT © Abdelrahman Ayman
