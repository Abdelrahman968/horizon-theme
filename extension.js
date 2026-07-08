var {
    defineProperty: $,
    getOwnPropertyNames: J,
    getOwnPropertyDescriptor: K,
  } = Object,
  L = Object.prototype.hasOwnProperty;

const jsonc = require("jsonc-parser");

var h = new WeakMap(),
  M = (f) => {
    var T = h.get(f),
      r;
    if (T) return T;
    if (
      ((T = $({}, "__esModule", { value: !0 })),
      (f && typeof f === "object") || typeof f === "function")
    )
      J(f).map(
        (o) =>
          !L.call(T, o) &&
          $(T, o, {
            get: () => f[o],
            enumerable: !(r = K(f, o)) || r.enumerable,
          }),
      );
    return (h.set(f, T), T);
  };
var Q = (f, T) => {
  for (var r in T)
    $(f, r, {
      get: T[r],
      enumerable: !0,
      configurable: !0,
      set: (o) => (T[r] = () => o),
    });
};
var k = {};
Q(k, { deactivate: () => deactivate, activate: () => activate });
module.exports = M(k);

var vscode = require("vscode");

// Running in VS Code for the Web (vscode.dev / github.dev) vs desktop.
const isWeb = vscode.env.uiKind === vscode.UIKind.Web;
const td = new TextDecoder();
const te = new TextEncoder();

// ══════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════
const EXTENSION_VERSION = "3.9.0";
const EXTENSION_ID = "horizon-core.horizon-theme";

// Shared list of Horizon color themes (used by the webview theme grid,
// the random-theme command, and the new quick-switch status bar item).
const HORIZON_THEMES = [
  "horizon-core.deep-blue",
  "horizon-core.dark-plus",
  "horizon-core.modern-light",
  "horizon-themes-ganyu-dark",
  "horizon-themes-furina-dark",
  "horizon-themes-scaramouche-dark",
  "horizon-themes-columbina-dark",
  "horizon-themes-citlali-dark",
  "horizon-themes-skirk-dark",
  "horizon-themes-wanderer-dark",
  "horizon-themes-mizuki-dark",
  "horizon-themes-sandrone-dark",
  "horizon-themes-yaemiko-dark",
  "horizon-themes-kafka-dark",
  "horizon-themes-firefly-dark",
  "horizon-themes-ruanmei-dark",
  "horizon-themes-robin-dark",
  "horizon-themes-aventurine-dark",
  "horizon-themes-march7th-dark",
  "horizon-themes-cyrene-dark",
  "horizon-themes-danheng-dark",
];

// Friendly display names for the quick-switch picker.
const themeLabel = (id) =>
  id
    .replace(/^horizon-(core|themes)[-.]?/, "")
    .replace(/-dark$/, "")
    .replace(/[-.]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ══════════════════════════════════════════════
// HORIZON ICONS ENGINE
// ══════════════════════════════════════════════
var W = {
  "/": [
    ["folderNames", "folderNamesExpanded"],
    ["Folder", "FolderX"],
  ],
  "*.": [["fileExtensions"]],
  "": [["fileNames"]],
};
var O = (f, T, r, o) => {
  for (let [E, I] of Object.entries(T)) {
    if (I?.constructor !== Array)
      throw Error(`The icon association for '${E}' is not an array.`);
    for (let N of I) {
      let [, X = "", z] = /^(\/|\*\.)?(.+)/.exec(N),
        [A, B = [""]] = W[X];
      A.forEach((G, D) => {
        let b = o(r(f, E + B[D]));
        if (b === o(-1))
          throw (
            (G = G === "folderNames" ? "folder" : "file"),
            Error(`The ${G} icon '${E}' doesn't exist.`)
          );
        for (let H of y(z)) f[G][H] = b;
      });
    }
  }
};
var y = (f) => {
  let T = [f];
  f.match(/\(.+?\)/g)?.forEach((r) => {
    T = r
      .slice(1, -1)
      .split("|")
      .flatMap((o) => T.map((E) => E.replace(r, o)));
  });
  return T.flatMap((r) => (r.includes("?") ? U(r) : r));
};
var U = (f) => {
  let T = [f];
  for (let r of f.match(/.\?/g))
    T = T.flatMap((o) => [o.replace(r, ""), o.replace(r[1], "")]);
  return T;
};
var applyHorizonIcons = async (f) => {
  if (isWeb) {
    // Writing to the extension's installation files isn't possible in
    // VS Code for the Web, so custom icon associations are unsupported there.
    vscode.window.showWarningMessage(
      "✦ Horizon: Custom icon associations require VS Code Desktop and are not available in VS Code for the Web.",
    );
    return;
  }
  let T = JSON.stringify(f),
    base = vscode.extensions.getExtension(EXTENSION_ID).extensionUri,
    customUri = vscode.Uri.joinPath(base, "custom.json"),
    iconUri = vscode.Uri.joinPath(base, "fileicons", "icon-theme.json"),
    bkUri = vscode.Uri.joinPath(base, "fileicons", "icon-theme.json.bk");

  let existing = null;
  try {
    existing = td.decode(await vscode.workspace.fs.readFile(customUri));
  } catch {
    /* custom.json doesn't exist yet */
  }
  if (existing !== null) {
    if (T === existing) return;
  } else {
    const orig = await vscode.workspace.fs.readFile(iconUri);
    await vscode.workspace.fs.writeFile(bkUri, orig);
  }
  let o = jsonc.parse(td.decode(await vscode.workspace.fs.readFile(bkUri))),
    E = Object.values(o.iconDefinitions).map((I) => I.iconPath);
  O(
    o,
    f,
    (I, N) => E.indexOf(`i/${N}.svg`),
    (I) => I.toString(),
  );
  await vscode.workspace.fs.writeFile(customUri, te.encode(JSON.stringify(f)));
  await vscode.workspace.fs.writeFile(iconUri, te.encode(JSON.stringify(o)));
};

// ══════════════════════════════════════════════
// QUICK ICON PICKER
// ══════════════════════════════════════════════
// Lets the user browse every icon bundled with Horizon Icons and assign it
// to a file extension, file name, or folder name — without hand-editing
// `horizonTheme.customIconAssociations`. Desktop only (see applyHorizonIcons).
async function pickHorizonIcon() {
  if (isWeb) {
    vscode.window.showWarningMessage(
      "✦ Horizon: Custom icon associations require VS Code Desktop and are not available in VS Code for the Web.",
    );
    return;
  }

  let iconNames;
  try {
    const base = vscode.extensions.getExtension(EXTENSION_ID).extensionUri;
    const iconUri = vscode.Uri.joinPath(base, "fileicons", "icon-theme.json");
    const theme = jsonc.parse(
      td.decode(await vscode.workspace.fs.readFile(iconUri)),
    );
    iconNames = [
      ...new Set(
        Object.values(theme.iconDefinitions)
          .map((d) => d.iconPath)
          .filter((p) => p.startsWith("i/") && p.endsWith(".svg"))
          .map((p) => p.slice(2, -4)),
      ),
    ].sort();
  } catch (e) {
    vscode.window.showErrorMessage(
      "✦ Horizon: Could not read the icon list — " + e.message,
    );
    return;
  }

  const icon = await vscode.window.showQuickPick(iconNames, {
    title: "✦ Horizon Icons — pick an icon",
    placeHolder: "Search for an icon (e.g. rust, docker, python)",
    matchOnDescription: true,
  });
  if (!icon) return;

  const kind = await vscode.window.showQuickPick(
    [
      {
        label: "File Extension",
        detail: "e.g. type 'rs' to match every *.rs file",
        prefix: "*.",
      },
      {
        label: "File Name",
        detail: "e.g. type 'Cargo.toml' to match that exact file",
        prefix: "",
      },
      {
        label: "Folder Name",
        detail: "e.g. type 'src' to match folders named src",
        prefix: "/",
      },
    ],
    { title: `✦ Apply '${icon}' icon to…` },
  );
  if (!kind) return;

  const pattern = await vscode.window.showInputBox({
    title: `✦ Horizon Icons — ${kind.label}`,
    placeHolder:
      kind.prefix === "*." ? "rs" : kind.prefix === "/" ? "src" : "Cargo.toml",
    prompt: `Enter the ${kind.label.toLowerCase()} to associate with the '${icon}' icon`,
    validateInput: (v) => (v?.trim() ? null : "Please enter a value"),
  });
  if (!pattern) return;

  const key = kind.prefix + pattern.trim().replace(/^[*./]+/, "");

  const cfg = vscode.workspace.getConfiguration("horizonTheme");
  const cur = cfg.get("customIconAssociations") || {};
  const list = Array.isArray(cur[icon]) ? [...cur[icon]] : [];
  if (!list.includes(key)) list.push(key);
  const next = { ...cur, [icon]: list };

  try {
    await applyHorizonIcons(next);
    await cfg.update(
      "customIconAssociations",
      next,
      vscode.ConfigurationTarget.Global,
    );
    vscode.window.showInformationMessage(
      `✦ Horizon: '${icon}' icon applied to ${key}`,
    );
  } catch (e) {
    vscode.window.showErrorMessage("✦ Horizon: " + e.message);
  }
}

// ══════════════════════════════════════════════
// EXPORT THEME PALETTE
// ══════════════════════════════════════════════
// Generates a shareable SVG swatch sheet for the active Horizon theme —
// useful for posting on social media or quickly comparing palettes.
async function exportThemePalette() {
  try {
    const themeId = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme");
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    const themeDef = (ext.packageJSON.contributes?.themes || []).find(
      (t) => t.id === themeId || t.label === themeId,
    );
    if (!themeDef) {
      vscode.window.showWarningMessage(
        `✦ Horizon: '${themeId}' isn't a Horizon theme — palette export only works for Horizon themes.`,
      );
      return;
    }

    const themeUri = vscode.Uri.joinPath(ext.extensionUri, themeDef.path);
    let themeContent = td.decode(await vscode.workspace.fs.readFile(themeUri));
    // Remove BOM if present
    if (themeContent.charCodeAt(0) === 0xfeff) {
      themeContent = themeContent.slice(1);
    }
    const themeJson = jsonc.parse(themeContent);
    const c = themeJson.colors || {};

    const swatchKeys = [
      ["editor.background", "Editor BG"],
      ["editor.foreground", "Editor FG"],
      ["activityBar.background", "Activity Bar"],
      ["statusBar.background", "Status Bar"],
      ["titleBar.activeBackground", "Title Bar"],
      ["button.background", "Accent"],
      ["terminal.ansiRed", "Red"],
      ["terminal.ansiGreen", "Green"],
      ["terminal.ansiYellow", "Yellow"],
      ["terminal.ansiBlue", "Blue"],
      ["terminal.ansiMagenta", "Magenta"],
      ["terminal.ansiCyan", "Cyan"],
    ];
    const swatches = swatchKeys
      .filter(([k]) => c[k])
      .map(([k, label]) => ({ color: c[k], label }));
    if (!swatches.length) {
      vscode.window.showWarningMessage(
        "✦ Horizon: No recognizable colors were found in this theme.",
      );
      return;
    }

    const cellW = 160,
      cellH = 110,
      cols = 4,
      headerH = 46;
    const rows = Math.ceil(swatches.length / cols);
    const width = cellW * cols,
      height = headerH + cellH * rows;
    const bg = c["editor.background"] || "#1c2330";
    const fg = c["editor.foreground"] || "#ffffff";

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="100%" height="100%" fill="${bg}"/>`;
    svg += `<text x="16" y="30" font-family="sans-serif" font-size="20" fill="${fg}">${themeDef.label}</text>`;
    swatches.forEach((s, i) => {
      const col = i % cols,
        row = Math.floor(i / cols);
      const x = col * cellW,
        y = headerH + row * cellH;
      svg += `<rect x="${x + 10}" y="${y + 8}" width="${cellW - 20}" height="${
        cellH - 32
      }" rx="8" fill="${s.color}" stroke="${fg}" stroke-opacity="0.15"/>`;
      svg += `<text x="${x + 10}" y="${y + cellH - 10}" font-family="sans-serif" font-size="12" fill="${fg}">${
        s.label
      } — ${s.color}</text>`;
    });
    svg += `</svg>`;

    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(
        `${themeDef.label.replace(/[^\w-]+/g, "_")}-palette.svg`,
      ),
      filters: { "SVG Image": ["svg"] },
    });
    if (!uri) return;
    await vscode.workspace.fs.writeFile(uri, te.encode(svg));
    vscode.window.showInformationMessage(
      `✦ Horizon: Palette exported to ${uri.path.split("/").pop()}`,
    );
  } catch (e) {
    vscode.window.showErrorMessage("✦ Horizon: " + e.message);
  }
}

// ══════════════════════════════════════════════
// HORIZON TAGS CONFIG
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// CACHED CONFIG — read once, invalidated on change
// ══════════════════════════════════════════════
let _cfg = null;
function getTagsConfig() {
  if (_cfg) return _cfg;
  const c = vscode.workspace.getConfiguration("horizonTags");
  const denylist = c.get("denylistTags") || [];
  _cfg = {
    supportedLanguages: c.get("supportedLanguages") || [],
    denylistTags: denylist,
    tagColorList: c.get("colors") || [],
    colorStyle: c.get("hightlightType") || "color",
    allowEverywhere: c.get("allowEverywhere") || false,
    denylistTagsFormattedEndings: denylist.map((t) => `</${t}>`),
    denylistTagsFormattedBeginnings: denylist.map((t) => `<${t}>`),
    denylistTagsFormattedBeginningsWithWhitespaces: denylist.map(
      (t) => `<${t} `,
    ),
    denylistTagsFormattedBeginningsWithLinebreaks: denylist.map((t) => `<${t}`),
  };
  return _cfg;
}
function invalidateTagsConfig() {
  _cfg = null;
}

// Legacy aliases so existing references keep working (will remove in next refactor)
const supportedLanguages = (() => ({
  get: () => getTagsConfig().supportedLanguages,
}))();
const denylistTags = (() => getTagsConfig().denylistTags)();
const tagColorList = (() => getTagsConfig().tagColorList)();
const colorStyle = (() => getTagsConfig().colorStyle)();
const denylistTagsFormattedEndings = (() =>
  getTagsConfig().denylistTagsFormattedEndings)();
const denylistTagsFormattedBeginnings = (() =>
  getTagsConfig().denylistTagsFormattedBeginnings)();
const denylistTagsFormattedBeginningsWithWhitespaces = (() =>
  getTagsConfig().denylistTagsFormattedBeginningsWithWhitespaces)();
const denylistTagsFormattedBeginningsWithLinebreaks = (() =>
  getTagsConfig().denylistTagsFormattedBeginningsWithLinebreaks)();

const isolatedRightBracketsDecorationTypes =
  vscode.window.createTextEditorDecorationType({ color: "#e2041b" });
const tagDecoratorList = [];

// ══════════════════════════════════════════════
// STATUS BAR ITEMS
// ══════════════════════════════════════════════
// Quick theme switcher — click to pick a Horizon theme without opening the sidebar.
const themeStatusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100,
);
themeStatusBarItem.text = "✦ Horizon";
themeStatusBarItem.tooltip = "Horizon: Quick switch theme";
themeStatusBarItem.command = "horizonTheme.quickSwitch";

// Tag-pair counter — shows how many matched tag pairs Horizon Tags found
// in the active editor, click to toggle highlighting everywhere.
const tagCountStatusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  99,
);
tagCountStatusBarItem.command = "horizonTheme.toggleTagsEverywhere";

function isLanguageUsed(e, id) {
  return (
    e &&
    e.document &&
    e.document.languageId === id &&
    supportedLanguages.includes(id)
  );
}

// ══════════════════════════════════════════════
// THEME SCHEDULER
// ══════════════════════════════════════════════
let schedulerInterval = null;
function startScheduler(context) {
  if (schedulerInterval) clearInterval(schedulerInterval);
  const applyTheme = (target) => {
    const cur = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme");
    if (cur !== target)
      vscode.workspace
        .getConfiguration()
        .update(
          "workbench.colorTheme",
          target,
          vscode.ConfigurationTarget.Global,
        );
  };
  const check = () => {
    const c = vscode.workspace.getConfiguration("horizonTheme");
    if (!c.get("scheduler.enabled")) return;
    const dt = c.get("scheduler.dayTheme"),
      nt = c.get("scheduler.nightTheme");
    if (!dt || !nt) return;

    // "Follow System Appearance" — switch based on the OS/editor light vs
    // dark mode instead of a fixed daily schedule.
    if (c.get("scheduler.followSystem")) {
      const kind = vscode.window.activeColorTheme.kind;
      const isLight = kind === vscode.ColorThemeKind.Light;
      applyTheme(isLight ? dt : nt);
      return;
    }

    const now = new Date(),
      mm = now.getHours() * 60 + now.getMinutes();
    const [dh, dm] = (c.get("scheduler.dayStart") || "08:00")
      .split(":")
      .map(Number);
    const [nh, nm] = (c.get("scheduler.nightStart") || "20:00")
      .split(":")
      .map(Number);
    const target = mm >= dh * 60 + dm && mm < nh * 60 + nm ? dt : nt;
    applyTheme(target);
  };
  check();
  schedulerInterval = setInterval(check, 60000);
  context.subscriptions.push({
    dispose: () => clearInterval(schedulerInterval),
  });
  // React immediately when the OS appearance changes (light/dark switch),
  // rather than waiting for the next 60s poll.
  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      const c = vscode.workspace.getConfiguration("horizonTheme");
      if (c.get("scheduler.enabled") && c.get("scheduler.followSystem"))
        check();
    }),
  );
}

// ══════════════════════════════════════════════
// WHAT'S NEW
// ══════════════════════════════════════════════
async function checkWhatsNew(context) {
  const last = context.globalState.get("horizonLastVersion");
  if (last === undefined) {
    // First install — offer the interactive walkthrough instead of the changelog.
    await context.globalState.update("horizonLastVersion", EXTENSION_VERSION);
    const a = await vscode.window.showInformationMessage(
      "✦ Welcome to Horizon Themes! Want a quick tour of themes, icons & tags?",
      "Take the Tour",
      "Dismiss",
    );
    if (a === "Take the Tour")
      vscode.commands.executeCommand(
        "workbench.action.openWalkthrough",
        `${EXTENSION_ID}#horizonWelcome`,
      );
    return;
  }
  if (last !== EXTENSION_VERSION) {
    await context.globalState.update("horizonLastVersion", EXTENSION_VERSION);
    const a = await vscode.window.showInformationMessage(
      `✦ Horizon Themes ${EXTENSION_VERSION} — Built-in Product Icons, new themes & more!`,
      "What's New",
      "Dismiss",
    );
    if (a === "What's New") {
      vscode.commands.executeCommand(
        "workbench.view.extension.horizon-sidebar",
      );
      setTimeout(() => {
        if (globalProvider?._view)
          globalProvider._view.webview.postMessage({
            command: "openTab",
            tab: "changelog",
          });
      }, 800);
    }
  }
}

// ══════════════════════════════════════════════
// CONFIG HELPER
// ══════════════════════════════════════════════
function sendConfigToWebview(webview) {
  const wc = vscode.workspace.getConfiguration("workbench");
  const hc = vscode.workspace.getConfiguration("horizonTheme");
  const ec = vscode.workspace.getConfiguration("editor");
  webview.postMessage({
    command: "configData",
    theme: wc.get("colorTheme"),
    iconTheme: wc.get("iconTheme"),
    productIconTheme: wc.get("productIconTheme") || "Default",
    allowEverywhere: vscode.workspace
      .getConfiguration("horizonTags")
      .get("allowEverywhere"),
    tagStyle:
      vscode.workspace.getConfiguration("horizonTags").get("hightlightType") ||
      "color",
    livePreviewEnabled: hc.get("livePreview.enabled") ?? false,
    livePreviewDelay: hc.get("livePreview.delay") ?? 150,
    fontSize: ec.get("fontSize") || 14,
    lineHeight: ec.get("lineHeight") || 1.5,
    fontLigatures: ec.get("fontLigatures") || false,
    cursorStyle: ec.get("cursorStyle") || "line",
    cursorBlinking: ec.get("cursorBlinking") || "blink",
    minimap:
      vscode.workspace.getConfiguration("editor.minimap").get("enabled") ??
      true,
    bracketPairs: ec.get("bracketPairColorization.enabled") ?? true,
    scheduler: {
      enabled: hc.get("scheduler.enabled") || false,
      followSystem: hc.get("scheduler.followSystem") || false,
      dayTheme: hc.get("scheduler.dayTheme") || "horizon-core.modern-light",
      nightTheme: hc.get("scheduler.nightTheme") || "horizon-core.deep-blue",
      dayStart: hc.get("scheduler.dayStart") || "08:00",
      nightStart: hc.get("scheduler.nightStart") || "20:00",
    },
    focusModeTheme: hc.get("focusModeTheme") || "",
    zenModeTheme: hc.get("zenModeTheme") || "",
  });
}

// ══════════════════════════════════════════════
// SIDEBAR PROVIDER
// ══════════════════════════════════════════════
let globalProvider = null;
class HorizonSettingsProvider {
  static viewType = "horizonTheme.settingsView";
  constructor(uri, ctx) {
    this._uri = uri;
    this._ctx = ctx;
    this._view = undefined;
    this._previewOrig = null;
  }

  resolveWebviewView(wv, _c, _t) {
    this._view = wv;
    wv.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._uri],
    };
    wv.webview.html = getWebviewContent();
    wv.webview.onDidReceiveMessage(async (m) => {
      switch (m.command) {
        case "setTheme":
          this._previewOrig = null;

          await vscode.workspace
            .getConfiguration()
            .update(
              "workbench.colorTheme",
              m.theme,
              vscode.ConfigurationTarget.Global,
            );
          break;
        case "previewTheme":
          if (!this._previewOrig)
            this._previewOrig = vscode.workspace
              .getConfiguration("workbench")
              .get("colorTheme");
          await vscode.workspace
            .getConfiguration()
            .update(
              "workbench.colorTheme",
              m.theme,
              vscode.ConfigurationTarget.Global,
            );
          break;
        case "restoreTheme":
          if (this._previewOrig) {
            await vscode.workspace
              .getConfiguration()
              .update(
                "workbench.colorTheme",
                this._previewOrig,
                vscode.ConfigurationTarget.Global,
              );
            this._previewOrig = null;
          }
          break;
        case "setIconTheme":
          await vscode.workspace
            .getConfiguration()
            .update(
              "workbench.iconTheme",
              m.theme || null,
              vscode.ConfigurationTarget.Global,
            );
          break;
        case "setProductIconTheme":
          await vscode.workspace
            .getConfiguration()
            .update(
              "workbench.productIconTheme",
              m.theme || "Default",
              vscode.ConfigurationTarget.Global,
            );
          break;
        case "updateColor": {
          const cfg = vscode.workspace.getConfiguration("horizonTheme");
          const cur = cfg.get("customIconAssociations") || {};
          cur[m.key] = m.value;
          await cfg.update(
            "customIconAssociations",
            cur,
            vscode.ConfigurationTarget.Global,
          );
          break;
        }
        case "updateSetting":
          await vscode.workspace
            .getConfiguration()
            .update(m.key, m.value, vscode.ConfigurationTarget.Global);
          break;
        case "saveScheduler": {
          const cfg = vscode.workspace.getConfiguration("horizonTheme");
          await cfg.update(
            "scheduler.enabled",
            m.enabled,
            vscode.ConfigurationTarget.Global,
          );
          await cfg.update(
            "scheduler.followSystem",
            !!m.followSystem,
            vscode.ConfigurationTarget.Global,
          );
          await cfg.update(
            "scheduler.dayTheme",
            m.dayTheme,
            vscode.ConfigurationTarget.Global,
          );
          await cfg.update(
            "scheduler.nightTheme",
            m.nightTheme,
            vscode.ConfigurationTarget.Global,
          );
          await cfg.update(
            "scheduler.dayStart",
            m.dayStart,
            vscode.ConfigurationTarget.Global,
          );
          await cfg.update(
            "scheduler.nightStart",
            m.nightStart,
            vscode.ConfigurationTarget.Global,
          );
          startScheduler(this._ctx);
          vscode.window.showInformationMessage("✦ Horizon Scheduler saved!");
          break;
        }
        case "exportSettings": {
          const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file("horizon-settings.json"),
            filters: { JSON: ["json"] },
          });
          if (!uri) break;
          const hc = vscode.workspace.getConfiguration("horizonTheme");
          const data = {
            _meta: {
              version: EXTENSION_VERSION,
              exportedAt: new Date().toISOString(),
              copyright: `© 2026 Abdelrahman - MIT License`,
            },
            colorTheme: vscode.workspace
              .getConfiguration("workbench")
              .get("colorTheme"),
            iconTheme: vscode.workspace
              .getConfiguration("workbench")
              .get("iconTheme"),
            productIconTheme: vscode.workspace
              .getConfiguration("workbench")
              .get("productIconTheme"),
            customAssociations: hc.get("customIconAssociations"),
            horizonTags: {
              colors: vscode.workspace
                .getConfiguration("horizonTags")
                .get("colors"),
              hightlightType: vscode.workspace
                .getConfiguration("horizonTags")
                .get("hightlightType"),
              allowEverywhere: vscode.workspace
                .getConfiguration("horizonTags")
                .get("allowEverywhere"),
              supportedLanguages: vscode.workspace
                .getConfiguration("horizonTags")
                .get("supportedLanguages"),
            },
            scheduler: {
              enabled: hc.get("scheduler.enabled"),
              followSystem: hc.get("scheduler.followSystem"),
              dayTheme: hc.get("scheduler.dayTheme"),
              nightTheme: hc.get("scheduler.nightTheme"),
              dayStart: hc.get("scheduler.dayStart"),
              nightStart: hc.get("scheduler.nightStart"),
            },
            editorPrefs: {
              livePreviewEnabled: hc.get("livePreview.enabled"),
              livePreviewDelay: hc.get("livePreview.delay"),
              fontSize: vscode.workspace
                .getConfiguration("editor")
                .get("fontSize"),
              lineHeight: vscode.workspace
                .getConfiguration("editor")
                .get("lineHeight"),
              fontLigatures: vscode.workspace
                .getConfiguration("editor")
                .get("fontLigatures"),
              cursorStyle: vscode.workspace
                .getConfiguration("editor")
                .get("cursorStyle"),
              cursorBlinking: vscode.workspace
                .getConfiguration("editor")
                .get("cursorBlinking"),
              minimapEnabled: vscode.workspace
                .getConfiguration("editor.minimap")
                .get("enabled"),
              bracketPairs: vscode.workspace
                .getConfiguration("editor")
                .get("bracketPairColorization.enabled"),
            },
          };
          await vscode.workspace.fs.writeFile(
            uri,
            te.encode(JSON.stringify(data, null, 2)),
          );
          vscode.window.showInformationMessage(
            `✦ Settings exported to ${uri.path.split("/").pop()}`,
          );
          break;
        }
        case "importSettings": {
          const uris = await vscode.window.showOpenDialog({
            filters: { JSON: ["json"] },
            canSelectMany: false,
          });
          if (!uris?.[0]) break;
          try {
            const data = jsonc.parse(
              td.decode(await vscode.workspace.fs.readFile(uris[0])),
            );
            const wc = vscode.workspace.getConfiguration();
            if (data.colorTheme)
              await wc.update(
                "workbench.colorTheme",
                data.colorTheme,
                vscode.ConfigurationTarget.Global,
              );
            if (data.iconTheme)
              await wc.update(
                "workbench.iconTheme",
                data.iconTheme,
                vscode.ConfigurationTarget.Global,
              );
            if (data.productIconTheme)
              await wc.update(
                "workbench.productIconTheme",
                data.productIconTheme,
                vscode.ConfigurationTarget.Global,
              );
            if (data.customAssociations)
              await vscode.workspace
                .getConfiguration("horizonTheme")
                .update(
                  "customIconAssociations",
                  data.customAssociations,
                  vscode.ConfigurationTarget.Global,
                );
            if (data.horizonTags) {
              const ht = vscode.workspace.getConfiguration("horizonTags");
              for (const [k, v] of Object.entries(data.horizonTags))
                await ht.update(k, v, vscode.ConfigurationTarget.Global);
            }
            if (data.scheduler) {
              const hc = vscode.workspace.getConfiguration("horizonTheme");
              for (const [k, v] of Object.entries(data.scheduler))
                await hc.update(
                  `scheduler.${k}`,
                  v,
                  vscode.ConfigurationTarget.Global,
                );
              startScheduler(this._ctx);
            }
            if (data.editorPrefs) {
              const ep = data.editorPrefs,
                hc = vscode.workspace.getConfiguration("horizonTheme"),
                ec = vscode.workspace.getConfiguration("editor");
              if (ep.livePreviewEnabled != null)
                await hc.update(
                  "livePreview.enabled",
                  ep.livePreviewEnabled,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.livePreviewDelay)
                await hc.update(
                  "livePreview.delay",
                  ep.livePreviewDelay,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.fontSize)
                await ec.update(
                  "fontSize",
                  ep.fontSize,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.lineHeight)
                await ec.update(
                  "lineHeight",
                  ep.lineHeight,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.fontLigatures != null)
                await ec.update(
                  "fontLigatures",
                  ep.fontLigatures,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.cursorStyle)
                await ec.update(
                  "cursorStyle",
                  ep.cursorStyle,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.cursorBlinking)
                await ec.update(
                  "cursorBlinking",
                  ep.cursorBlinking,
                  vscode.ConfigurationTarget.Global,
                );
              if (ep.minimapEnabled != null)
                await vscode.workspace
                  .getConfiguration("editor.minimap")
                  .update(
                    "enabled",
                    ep.minimapEnabled,
                    vscode.ConfigurationTarget.Global,
                  );
              if (ep.bracketPairs != null)
                await ec.update(
                  "bracketPairColorization.enabled",
                  ep.bracketPairs,
                  vscode.ConfigurationTarget.Global,
                );
            }
            vscode.window.showInformationMessage(
              "✦ Horizon settings imported!",
            );
            sendConfigToWebview(wv.webview);
          } catch (e) {
            vscode.window.showErrorMessage(
              "Horizon: Import failed — " + e.message,
            );
          }
          break;
        }
        case "pickFont":
          vscode.commands.executeCommand("horizonTheme.pickFont");
          break;
        case "clearWorkspaceAccent":
          vscode.commands.executeCommand("horizonTheme.clearWorkspaceAccent");
          break;
        case "resetSettings": {
          const ok = await vscode.window.showWarningMessage(
            "Reset ALL Horizon settings to defaults?",
            "Reset",
            "Cancel",
          );
          if (ok !== "Reset") break;
          const wc = vscode.workspace.getConfiguration();
          await wc.update(
            "workbench.colorTheme",
            "horizon-core.deep-blue",
            vscode.ConfigurationTarget.Global,
          );
          await wc.update(
            "workbench.iconTheme",
            "Horizon Icons",
            vscode.ConfigurationTarget.Global,
          );
          await wc.update(
            "workbench.productIconTheme",
            "Default",
            vscode.ConfigurationTarget.Global,
          );
          const hc = vscode.workspace.getConfiguration("horizonTheme");
          await hc.update(
            "scheduler.enabled",
            false,
            vscode.ConfigurationTarget.Global,
          );
          await hc.update(
            "livePreview.enabled",
            false,
            vscode.ConfigurationTarget.Global,
          );
          await hc.update(
            "customIconAssociations",
            {},
            vscode.ConfigurationTarget.Global,
          );
          vscode.window.showInformationMessage("✦ Horizon reset to defaults.");
          sendConfigToWebview(wv.webview);
          break;
        }
        case "openExternal":
          vscode.env.openExternal(vscode.Uri.parse(m.url));
          break;
        case "copyToClipboard":
          await vscode.env.clipboard.writeText(m.text);
          vscode.window.showInformationMessage("✦ Copied to clipboard!");
          break;
        case "getConfig":
          sendConfigToWebview(wv.webview);
          break;
      }
    });
  }
}

// ══════════════════════════════════════════════
// ACTIVATE
// ══════════════════════════════════════════════
async function activate(context) {
  const wc = vscode.workspace.getConfiguration();
  const cur = wc.get("workbench.colorTheme");
  if (!cur || cur === "Default Dark+" || cur === "Default Dark Modern") {
    await wc.update(
      "workbench.colorTheme",
      "horizon-core.deep-blue",
      vscode.ConfigurationTarget.Global,
    );
    await wc.update(
      "workbench.iconTheme",
      "Horizon Icons",
      vscode.ConfigurationTarget.Global,
    );
  }

  checkWhatsNew(context);
  checkRatePrompt(context);

  // Tag Summary sidebar tree view
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "horizonTheme.tagSummary",
      tagSummaryProvider,
    ),
  );

  const provider = new HorizonSettingsProvider(context.extensionUri, context);
  globalProvider = provider;
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HorizonSettingsProvider.viewType,
      provider,
    ),
  );

  const cmds = {
    "extension.horizonTags": () => horizonTags(vscode.window.activeTextEditor),
    "horizonTheme.openSettings": () =>
      vscode.commands.executeCommand(
        "workbench.view.extension.horizon-sidebar",
      ),
    "horizonTheme.exportSettings": async () => {
      if (!globalProvider?._view) {
        await vscode.commands.executeCommand(
          "workbench.view.extension.horizon-sidebar",
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      globalProvider?._view?.webview.postMessage({ command: "triggerExport" });
    },
    "horizonTheme.importSettings": async () => {
      if (!globalProvider?._view) {
        await vscode.commands.executeCommand(
          "workbench.view.extension.horizon-sidebar",
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      globalProvider?._view?.webview.postMessage({ command: "triggerImport" });
    },
    "horizonTheme.resetSettings": async () => {
      if (!globalProvider?._view) {
        await vscode.commands.executeCommand(
          "workbench.view.extension.horizon-sidebar",
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      globalProvider?._view?.webview.postMessage({ command: "triggerReset" });
    },
    "horizonTheme.randomTheme": async () => {
      if (!globalProvider?._view) {
        await vscode.commands.executeCommand(
          "workbench.view.extension.horizon-sidebar",
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      globalProvider?._view?.webview.postMessage({ command: "triggerRandom" });
    },
    "horizonTheme.quickSwitch": async () => {
      const cur = vscode.workspace
        .getConfiguration("workbench")
        .get("colorTheme");
      const items = HORIZON_THEMES.map((id) => ({
        label: `${id === cur ? "$(check) " : ""}${themeLabel(id)}`,
        description: id,
        id,
      }));
      const pick = await vscode.window.showQuickPick(items, {
        title: "✦ Horizon — Quick Switch Theme",
        placeHolder: "Select a theme",
        matchOnDescription: true,
      });
      if (pick)
        await vscode.workspace
          .getConfiguration()
          .update(
            "workbench.colorTheme",
            pick.id,
            vscode.ConfigurationTarget.Global,
          );
    },
    "horizonTheme.pickIcon": () => pickHorizonIcon(),
    "horizonTheme.toggleTagsEverywhere": async () => {
      const cfg = vscode.workspace.getConfiguration("horizonTags");
      const next = !cfg.get("allowEverywhere");
      await cfg.update(
        "allowEverywhere",
        next,
        vscode.ConfigurationTarget.Global,
      );
      vscode.window.showInformationMessage(
        `✦ Horizon Tags: highlighting ${
          next
            ? "enabled for all file types"
            : "restricted to supported languages"
        }.`,
      );
      horizonTags(vscode.window.activeTextEditor);
    },
    "horizonTheme.exportPalette": () => exportThemePalette(),
    "horizonTheme.setWorkspaceTheme": async () => {
      if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showWarningMessage(
          "✦ Horizon: Open a folder or workspace first to set a project-specific theme.",
        );
        return;
      }
      const cur = vscode.workspace
        .getConfiguration("workbench")
        .get("colorTheme");
      const items = HORIZON_THEMES.map((id) => ({
        label: `${id === cur ? "$(check) " : ""}${themeLabel(id)}`,
        description: id,
        id,
      }));
      const pick = await vscode.window.showQuickPick(items, {
        title: "✦ Horizon — Theme for This Workspace",
        placeHolder:
          "This theme will apply only when this folder/workspace is open",
        matchOnDescription: true,
      });
      if (!pick) return;
      await vscode.workspace
        .getConfiguration()
        .update(
          "workbench.colorTheme",
          pick.id,
          vscode.ConfigurationTarget.Workspace,
        );
      vscode.window.showInformationMessage(
        `✦ Horizon: '${themeLabel(pick.id)}' set for this workspace.`,
      );
    },
    "horizonTheme.setWorkspaceAccent": async () => {
      if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showWarningMessage(
          "✦ Horizon: Open a folder or workspace first.",
        );
        return;
      }
      const input = await vscode.window.showInputBox({
        title: "✦ Horizon — Workspace Accent Color",
        placeHolder: "#9d4edd",
        prompt:
          "Enter a hex color to tint the title bar, activity bar & status bar for this workspace only",
        validateInput: (v) =>
          /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((v || "").trim())
            ? null
            : "Enter a valid hex color (e.g. #9d4edd)",
      });
      if (!input) return;
      const hex = input.trim();
      const wcfg = vscode.workspace.getConfiguration();
      const cc = wcfg.get("workbench.colorCustomizations") || {};
      const next = {
        ...cc,
        "titleBar.activeBackground": hex,
        "titleBar.activeForeground": "#ffffff",
        "activityBar.background": hex,
        "activityBar.foreground": "#ffffff",
        "statusBar.background": hex,
        "statusBar.foreground": "#ffffff",
      };
      await wcfg.update(
        "workbench.colorCustomizations",
        next,
        vscode.ConfigurationTarget.Workspace,
      );
      vscode.window.showInformationMessage(
        `✦ Horizon: Workspace accent color set to ${hex}.`,
      );
    },
    "horizonTheme.copyColors": () => copyThemeColors(),
    "horizonTheme.refreshTagSummary": () => tagSummaryProvider.refresh(),
    "horizonTheme.jumpToTag": async (uri, line, char) => {
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);
      const pos = new vscode.Position(line, char);
      editor.selection = new vscode.Selection(pos, pos);
      editor.revealRange(
        new vscode.Range(pos, pos),
        vscode.TextEditorRevealType.InCenter,
      );
    },
    "horizonTheme.pickFont": async () => {
      // Popular coding fonts — user can also type any family name.
      const FONTS = [
        "JetBrains Mono",
        "Fira Code",
        "Cascadia Code",
        "Source Code Pro",
        "Hack",
        "Inconsolata",
        "Consolas",
        "Courier New",
        "IBM Plex Mono",
        "Roboto Mono",
        "Ubuntu Mono",
        "Anonymous Pro",
        "Input Mono",
        "Monaspace Neon",
        "Monaspace Argon",
        "Monaspace Xenon",
        "Comic Mono",
        "Victor Mono",
        "Geist Mono",
        "Maple Mono",
      ];
      const cur =
        vscode.workspace.getConfiguration("editor").get("fontFamily") || "";
      const items = [
        { label: "$(pencil) Type a custom font name…", id: "__custom__" },
        ...FONTS.map((f) => ({
          label: `${cur.includes(f) ? "$(check) " : ""}${f}`,
          description: cur.includes(f) ? "current" : "",
          id: f,
        })),
      ];
      const pick = await vscode.window.showQuickPick(items, {
        title: "✦ Horizon — Choose Editor Font",
        placeHolder: `Current: ${cur || "default"}`,
        matchOnDescription: true,
      });
      if (!pick) return;
      let fontName = pick.id;
      if (fontName === "__custom__") {
        fontName = await vscode.window.showInputBox({
          title: "✦ Horizon — Custom Font Family",
          placeHolder: "e.g. 'My Font', monospace",
          value: cur,
          prompt: "Enter the CSS font-family value to use in the editor",
        });
        if (!fontName) return;
      }
      await vscode.workspace
        .getConfiguration()
        .update(
          "editor.fontFamily",
          fontName,
          vscode.ConfigurationTarget.Global,
        );
      const ligPick = await vscode.window.showInformationMessage(
        `✦ Horizon: Font set to "${fontName}". Enable ligatures?`,
        "Yes",
        "No",
      );
      if (ligPick === "Yes")
        await vscode.workspace
          .getConfiguration()
          .update(
            "editor.fontLigatures",
            true,
            vscode.ConfigurationTarget.Global,
          );
      else if (ligPick === "No")
        await vscode.workspace
          .getConfiguration()
          .update(
            "editor.fontLigatures",
            false,
            vscode.ConfigurationTarget.Global,
          );
    },
    "horizonTheme.clearWorkspaceAccent": async () => {
      if (!vscode.workspace.workspaceFolders?.length) return;
      const wcfg = vscode.workspace.getConfiguration();
      const cc = { ...(wcfg.get("workbench.colorCustomizations") || {}) };
      [
        "titleBar.activeBackground",
        "titleBar.activeForeground",
        "activityBar.background",
        "activityBar.foreground",
        "statusBar.background",
        "statusBar.foreground",
      ].forEach((k) => delete cc[k]);
      await wcfg.update(
        "workbench.colorCustomizations",
        Object.keys(cc).length ? cc : undefined,
        vscode.ConfigurationTarget.Workspace,
      );
      vscode.window.showInformationMessage(
        "✦ Horizon: Workspace accent color cleared.",
      );
    },
  };
  for (const [id, fn] of Object.entries(cmds))
    context.subscriptions.push(vscode.commands.registerCommand(id, fn));

  context.subscriptions.push(themeStatusBarItem, tagCountStatusBarItem);
  themeStatusBarItem.show();

  startScheduler(context);

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("horizonTags")) {
      invalidateTagsConfig();
      invalidateTagRemoverRe();
      _tagCache.clear();
    }
    const nc = vscode.workspace.getConfiguration("horizonTags").get("colors");
    if (
      !(
        tagColorList.length === nc.length &&
        tagColorList.every((v, i) => v === nc[i])
      )
    )
      vscode.commands.executeCommand("workbench.action.reloadWindow");
  });

  // Focus / Zen Mode theme switching
  vscode.window.onDidChangeWindowState(
    (state) => {
      const hc = vscode.workspace.getConfiguration("horizonTheme");
      const focusTheme = hc.get("focusModeTheme");
      if (!focusTheme) return;
      const wc = vscode.workspace.getConfiguration();
      if (!state.focused) {
        wc.update(
          "workbench.colorTheme",
          focusTheme,
          vscode.ConfigurationTarget.Global,
        );
      } else {
        const prev = hc.get("_preFocusTheme");
        if (prev)
          wc.update(
            "workbench.colorTheme",
            prev,
            vscode.ConfigurationTarget.Global,
          );
      }
    },
    null,
    context.subscriptions,
  );

  // Zen mode theme switching via window state change (avoids overriding built-in command)
  let _inZenMode = false;
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(async (state) => {
      const hc = vscode.workspace.getConfiguration("horizonTheme");
      const zenTheme = hc.get("zenModeTheme");
      if (!zenTheme) return;
      const isZen = !!state.active; // active = false when zen mode hides UI
      if (isZen === _inZenMode) return;
      _inZenMode = isZen;
      const wc = vscode.workspace.getConfiguration();
      if (isZen) {
        const cur = wc.get("workbench.colorTheme");
        await hc.update("_preZenTheme", cur, vscode.ConfigurationTarget.Global);
        await wc.update(
          "workbench.colorTheme",
          zenTheme,
          vscode.ConfigurationTarget.Global,
        );
      } else {
        const prev = hc.get("_preZenTheme");
        if (prev)
          await wc.update(
            "workbench.colorTheme",
            prev,
            vscode.ConfigurationTarget.Global,
          );
      }
    }),
  );

  tagDecoratorList.length = 0;
  for (let i in tagColorList) {
    let s;
    switch (colorStyle) {
      case "background-color":
        s = { backgroundColor: tagColorList[i] };
        break;
      case "border":
        s = { border: "1px solid " + tagColorList[i] };
        break;
      default:
        s = { color: tagColorList[i] };
    }
    tagDecoratorList.push(vscode.window.createTextEditorDecorationType(s));
  }

  horizonTags(vscode.window.activeTextEditor);
  vscode.workspace.onDidOpenTextDocument(
    (e) => horizonTags(e),
    null,
    context.subscriptions,
  );
  vscode.window.onDidChangeActiveTextEditor(
    (e) => horizonTags(e),
    null,
    context.subscriptions,
  );
  const debouncedHorizonTags = debounce(horizonTags, 200);
  vscode.workspace.onDidChangeTextDocument(
    (e) => {
      const ae = vscode.window.activeTextEditor;
      if (ae && e.document === ae.document) debouncedHorizonTags(ae);
    },
    null,
    context.subscriptions,
  );

  const ci =
    vscode.workspace.getConfiguration("horizonTheme").customIconAssociations;
  if (ci?.constructor === Object && Object.keys(ci).length) {
    applyHorizonIcons(ci).catch((e) =>
      vscode.window.showErrorMessage(e.message),
    );
  }
}

// ══════════════════════════════════════════════
// DEBOUNCE UTILITY
// ══════════════════════════════════════════════
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ══════════════════════════════════════════════
// TAG SUMMARY TREE VIEW
// ══════════════════════════════════════════════
// A sidebar tree that lists every matched Horizon Tag pair found across
// all open editors, grouped by file. Clicking an item jumps to the tag.
class TagSummaryItem extends vscode.TreeItem {
  constructor(label, opts = {}) {
    super(label, opts.collapsible ?? vscode.TreeItemCollapsibleState.None);
    if (opts.uri) this.resourceUri = opts.uri;
    if (opts.line != null) {
      this.command = {
        command: "horizonTheme.jumpToTag",
        title: "Jump to tag",
        arguments: [opts.uri, opts.line, opts.char ?? 0],
      };
      this.description = `line ${opts.line + 1}`;
      this.iconPath = new vscode.ThemeIcon("symbol-color");
    } else {
      this.iconPath = new vscode.ThemeIcon("file-code");
    }
    this.tooltip = opts.tooltip ?? label;
  }
}

class TagSummaryProvider {
  constructor() {
    this._onChange = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onChange.event;
    // Map<string fsPath, {uri, pairs: [{line,char,text}]}>
    this._data = new Map();
  }
  refresh() {
    this._onChange.fire();
  }
  updateFile(uri, pairs) {
    if (!pairs.length) {
      this._data.delete(uri.fsPath || uri.toString());
    } else {
      this._data.set(uri.fsPath || uri.toString(), { uri, pairs });
    }
    this._onChange.fire();
  }
  clearFile(uri) {
    this._data.delete(uri.fsPath || uri.toString());
    this._onChange.fire();
  }
  getTreeItem(el) {
    return el;
  }
  getChildren(el) {
    if (!el) {
      // Root — one node per file that has tags
      if (!this._data.size)
        return [
          new TagSummaryItem("No Horizon Tags found in open editors", {
            tooltip: "Open a file with matched tag pairs",
          }),
        ];
      return [...this._data.values()].map(({ uri, pairs }) => {
        const item = new TagSummaryItem(uri.path.split("/").pop(), {
          collapsible: vscode.TreeItemCollapsibleState.Expanded,
          uri,
          tooltip: uri.fsPath || uri.path,
        });
        item._pairs = pairs;
        item._uri = uri;
        return item;
      });
    }
    // Children — individual tag pairs
    if (el._pairs) {
      return el._pairs.map(
        (p) =>
          new TagSummaryItem(p.text, {
            uri: el._uri,
            line: p.line,
            char: p.char,
            tooltip: `${p.text} — line ${p.line + 1}`,
          }),
      );
    }
    return [];
  }
}

const tagSummaryProvider = new TagSummaryProvider();

// ══════════════════════════════════════════════
// COPY THEME COLORS TO CLIPBOARD
// ══════════════════════════════════════════════
async function copyThemeColors() {
  try {
    const themeId = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme");
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    const themeDef = (ext.packageJSON.contributes?.themes || []).find(
      (t) => t.id === themeId || t.label === themeId,
    );
    if (!themeDef) {
      vscode.window.showWarningMessage(
        `✦ Horizon: '${themeId}' isn't a Horizon theme.`,
      );
      return;
    }
    const themeUri = vscode.Uri.joinPath(ext.extensionUri, themeDef.path);
    let themeContent = td.decode(await vscode.workspace.fs.readFile(themeUri));
    if (themeContent.charCodeAt(0) === 0xfeff) {
      themeContent = themeContent.slice(1);
    }
    const themeJson = jsonc.parse(themeContent);
    const colors = themeJson.colors || {};
    const tokenColors = themeJson.tokenColors || [];

    const formats = [
      { label: "$(json) JSON — workbench colors", id: "json" },
      { label: "$(symbol-color) CSS Variables", id: "css" },
      { label: "$(list-flat) Plain list (name: value)", id: "list" },
    ];
    const pick = await vscode.window.showQuickPick(formats, {
      title: `✦ Horizon — Copy colors from "${themeDef.label}"`,
    });
    if (!pick) return;

    let text = "";
    if (pick.id === "json") {
      text = JSON.stringify(colors, null, 2);
    } else if (pick.id === "css") {
      text =
        ":root {\n" +
        Object.entries(colors)
          .map(([k, v]) => `  --${k.replace(/\./g, "-")}: ${v};`)
          .join("\n") +
        "\n}";
    } else {
      text = Object.entries(colors)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    }
    await vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage(
      `✦ Horizon: Colors from "${themeDef.label}" copied to clipboard (${
        Object.keys(colors).length
      } values).`,
    );
  } catch (e) {
    vscode.window.showErrorMessage("✦ Horizon: " + e.message);
  }
}

// ══════════════════════════════════════════════
// RATE & REVIEW PROMPT
// ══════════════════════════════════════════════
// Shows a one-time "Enjoying Horizon? Leave a review" nudge after the
// user has been using the extension for a while (7 days + 50 activations).
async function checkRatePrompt(context) {
  const state = context.globalState;
  // Don't show if already rated or dismissed permanently
  if (state.get("horizonRated") || state.get("horizonRateDismissed")) return;

  const installDate = state.get("horizonInstallDate") || Date.now();
  if (!state.get("horizonInstallDate"))
    await state.update("horizonInstallDate", installDate);

  const activations = (state.get("horizonActivations") || 0) + 1;
  await state.update("horizonActivations", activations);

  const daysSinceInstall = (Date.now() - installDate) / (1000 * 60 * 60 * 24);

  // Conditions: at least 7 days old AND at least 50 activations
  if (daysSinceInstall < 7 || activations < 50) return;

  const answer = await vscode.window.showInformationMessage(
    "✦ You've been using Horizon Themes for a while — enjoying it? A review on the Marketplace helps a lot! 🙏",
    "Leave a Review ⭐",
    "Already Did",
    "Remind Me Later",
    "No Thanks",
  );

  if (answer === "Leave a Review ⭐") {
    await state.update("horizonRated", true);
    vscode.env.openExternal(
      vscode.Uri.parse(
        "https://marketplace.visualstudio.com/items?itemName=horizon-core.horizon-theme&ssr=false#review-details",
      ),
    );
  } else if (answer === "Already Did") {
    await state.update("horizonRated", true);
    vscode.window.showInformationMessage("✦ Horizon: Thank you so much! 💙");
  } else if (answer === "No Thanks") {
    await state.update("horizonRateDismissed", true);
  }
  // 'Remind Me Later' — reset activations so it asks again after another 50 uses
  else if (answer === "Remind Me Later") {
    await state.update("horizonActivations", 0);
  }
}

function deactivate() {}
module.exports = { activate, deactivate };

// ══════════════════════════════════════════════
// WEBVIEW HTML
// ══════════════════════════════════════════════
function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Horizon Settings</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
/* ================================
   Default (Fallback)
================================ */
:root {
  --bg:#0d1117;
  --bg2:#161b22;
  --bg3:#1c2330;
  --bg4:#21262d;

  --a1:#4fc3f7;
  --a2:#e91e8c;
  --a3:#a78bfa;

  --gold:#f0c040;
  --green:#3fb950;
  --red:#f85149;

  --txt:#e6edf3;
  --txt2:#8b949e;
  --txt3:#6e7681;

  --brd:#30363d;
  --brd2:#21262d;

  --g1:rgba(79,195,247,.13);
  --g2:rgba(233,30,140,.1);
  --g3:rgba(167,139,250,.1);
  --gg:rgba(240,192,64,.13);
}

/* ================================
   VSCode Dark Theme
================================ */
body.vscode-dark {
  --bg:#0d1117;
  --bg2:#161b22;
  --bg3:#1c2330;
  --bg4:#21262d;

  --txt:#e6edf3;
  --txt2:#8b949e;
  --txt3:#6e7681;

  --brd:#30363d;
  --brd2:#21262d;
}

/* ================================
   VSCode Light Theme
================================ */
body.vscode-light {
  --bg:#ffffff;
  --bg2:#f6f8fa;
  --bg3:#eef1f5;
  --bg4:#e6ebf1;

  --txt:#1f2328;
  --txt2:#57606a;
  --txt3:#6e7781;

  --brd:#d0d7de;
  --brd2:#eaeef2;

  --a1:#0969da;
  --a2:#bf3989;
  --a3:#8250df;

  --gold:#bf8700;
  --green:#1a7f37;
  --red:#cf222e;

  --g1:rgba(9,105,218,.08);
  --g2:rgba(191,57,137,.06);
  --g3:rgba(130,80,223,.06);
  --gg:rgba(191,135,0,.08);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Raleway',sans-serif;background:var(--bg);color:var(--txt);font-size:12px;overflow-x:hidden;-webkit-font-smoothing:antialiased}

/* HEADER */
.hdr{padding:17px 13px 12px;text-align:center;border-bottom:1px solid var(--brd);position:relative;overflow:hidden}
.hdr::before{content:'';position:absolute;top:-50px;left:50%;transform:translateX(-50%);width:250px;height:190px;background:radial-gradient(ellipse,rgba(79,195,247,.08) 0,transparent 70%);pointer-events:none}
.logo{width:50px;height:50px;margin:0 auto 8px;position:relative;display:flex;align-items:center;justify-content:center}
.logo svg{position:absolute;inset:0;animation:spin 12s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.logo-c{width:34px;height:34px;background:linear-gradient(135deg,#4fc3f7,#e91e8c);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:#fff;z-index:1;box-shadow:0 0 20px rgba(79,195,247,.38)}
.ht{font-family:'Cinzel',serif;font-size:11.5px;font-weight:600;letter-spacing:3px;text-transform:uppercase;background:linear-gradient(90deg,#4fc3f7,#e91e8c,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:2px}
.hs{color:var(--txt2);font-size:8.5px;letter-spacing:1px}
.hbadges{display:flex;gap:3px;justify-content:center;margin-top:6px;flex-wrap:wrap}
.hb{font-size:7px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:2px 5px;border-radius:3px;border:1px solid}
.hb.v{background:rgba(79,195,247,.08);border-color:rgba(79,195,247,.25);color:var(--a1)}
.hb.l{background:rgba(63,185,80,.08);border-color:rgba(63,185,80,.25);color:var(--green)}
.hb.y{background:rgba(240,192,64,.08);border-color:rgba(240,192,64,.25);color:var(--gold)}

/* TABS - New Modern Design */
.tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px 8px 0 8px;background:transparent}
.tab{padding:8px 4px;text-align:center;cursor:pointer;transition:all .2s cubic-bezier(0.4,0,0.2,1);user-select:none;border-radius:10px;background:var(--bg2);border:1px solid var(--brd);position:relative;overflow:hidden}
.tab::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--a1),var(--a2),var(--a3));transform:scaleX(0);transition:transform .2s;border-radius:2px}
.tab:hover::before{transform:scaleX(1)}
.tab:hover{background:var(--bg3);border-color:var(--a1)}
.tab.active{background:linear-gradient(135deg,var(--g1),var(--g2));border-color:var(--a1)}
.tab.active .tab-icon{color:var(--a1);text-shadow:0 0 4px rgba(79,195,247,.5)}
.tab-icon{font-size:16px;display:block;margin-bottom:3px;transition:all .2s}
.tab-label{font-size:8px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--txt2)}
.tab.active .tab-label{color:var(--a1)}

/* COMMANDS PAGE */
.cmd-cat{font-family:'Cinzel',serif;font-size:8px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin:12px 0 6px;padding-top:3px;border-top:1px solid var(--brd2)}
.cmd-cat:first-of-type{margin-top:0;border-top:none;padding-top:0}
.cmd-item{background:var(--bg2);border:1px solid var(--brd);border-radius:8px;padding:8px 10px;margin-bottom:6px;transition:all .15s;cursor:pointer;position:relative;overflow:hidden}
.cmd-item::after{content:'📋';position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;opacity:0;transition:opacity .2s;color:var(--a1)}
.cmd-item:hover{border-color:var(--a1);background:var(--bg3);transform:translateX(2px)}
.cmd-item:hover::after{opacity:0.6}
.cmd-name{font-family:'Courier New',monospace;font-size:9px;font-weight:600;color:var(--a1);margin-bottom:3px;letter-spacing:-.2px;padding-right:20px}
.cmd-desc{font-size:8.5px;color:var(--txt);margin-bottom:3px;line-height:1.4}
.cmd-shortcut{font-size:7px;color:var(--txt2);display:flex;align-items:center;gap:4px}
.cmd-shortcut::before{content:'▶';color:var(--gold);font-size:6px}
.cmd-tip{background:linear-gradient(135deg,var(--g1),var(--g2));border:1px solid rgba(79,195,247,.2);border-radius:8px;padding:8px 10px;margin-top:12px;display:flex;gap:8px;align-items:flex-start}
.tip-icon{font-size:14px;flex-shrink:0}
.tip-text{font-size:8.5px;color:var(--txt);line-height:1.5}
kbd{background:var(--bg3);border:1px solid var(--brd);border-radius:4px;padding:2px 6px;font-size:7px;font-family:monospace}

/* Toast notification for copy */
.copy-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--a1);color:#0d1117;padding:6px 12px;border-radius:20px;font-size:10px;font-weight:600;z-index:1000;animation:fadeOut 1.5s ease forwards;box-shadow:0 4px 12px rgba(0,0,0,.3)}
@keyframes fadeOut{0%{opacity:1;transform:translateX(-50%) translateY(0)}70%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-10px)}}

/* PANELS */
.panel{display:none;padding:12px 10px}
.panel.active{display:block;animation:fi .16s ease}
@keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

/* SECTION */
.sec{margin-bottom:14px}
.st{font-family:'Cinzel',serif;font-size:8px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--a1);margin-bottom:8px;display:flex;align-items:center;gap:5px}
.st::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--brd),transparent)}

/* FEATURED */
.feat{position:relative;border:1.5px solid var(--gold);border-radius:10px;padding:10px;margin-bottom:9px;cursor:pointer;overflow:hidden;background:linear-gradient(135deg,rgba(15,28,50,.93),rgba(10,20,40,.97));box-shadow:0 0 0 1px rgba(240,192,64,.06),0 0 20px rgba(79,195,247,.09),0 4px 12px rgba(0,0,0,.4);transition:box-shadow .2s}
.feat:hover{box-shadow:0 0 0 1px rgba(240,192,64,.16),0 0 28px rgba(79,195,247,.16),0 4px 16px rgba(0,0,0,.5)}
.feat.selected{border-color:#f0c040;box-shadow:0 0 0 1px rgba(240,192,64,.25),0 0 32px rgba(79,195,247,.2)}
.feat::before{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.03),transparent);animation:sh 4s ease-in-out infinite;pointer-events:none}
@keyframes sh{0%,100%{left:-60%}50%{left:110%}}
.fbadge{position:absolute;top:7px;right:7px;background:linear-gradient(135deg,#f0c040,#e8a800);border-radius:3px;padding:2px 5px;font-size:7px;font-weight:700;letter-spacing:1px;color:#0d1117;text-transform:uppercase}
.fchk{position:absolute;top:7px;left:8px;width:14px;height:14px;background:var(--gold);border-radius:50%;display:none;align-items:center;justify-content:center;font-size:7.5px;color:#0d1117;font-weight:700}
.feat.selected .fchk{display:flex}
.fprev{height:36px;border-radius:5px;margin-bottom:7px;background:linear-gradient(135deg,#0a141f,#0d1b2e,#112236);position:relative;overflow:hidden;border:1px solid rgba(79,195,247,.09)}
.fbar{position:absolute;top:0;left:0;right:0;height:8px;background:rgba(10,20,35,.8);display:flex;gap:2.5px;padding:1.5px 3.5px;align-items:center}
.fbar span{width:4.5px;height:4.5px;border-radius:50%}
.flines{position:absolute;top:11px;left:7px;right:7px;display:flex;flex-direction:column;gap:2.5px}
.fl{height:2px;border-radius:2px}
.fmeta{display:flex;align-items:center;gap:6px}
.fname{font-family:'Cinzel',serif;font-size:10.5px;font-weight:600;letter-spacing:.5px}
.fsub{font-size:8px;color:var(--txt2);margin-top:1px}
.ftag{margin-left:auto;font-size:7px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--gold);border:1px solid rgba(240,192,64,.28);padding:2px 5px;border-radius:3px}

/* PREVIEW HINT */
.phint{font-size:8px;color:var(--txt3);text-align:center;padding:3px 0 5px;display:flex;align-items:center;justify-content:center;gap:5px}
.ptog{font-size:7.5px;font-weight:600;color:var(--a1);cursor:pointer;padding:1px 5px;border:1px solid rgba(79,195,247,.28);border-radius:3px;transition:all .14s}
.ptog:hover{background:var(--g1)}.ptog.off{color:var(--txt3);border-color:var(--brd)}

/* THEME GRID */
.tg{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.tc{border:1px solid var(--brd);border-radius:6px;padding:6px;cursor:pointer;transition:all .15s;background:var(--bg2);position:relative;overflow:hidden}
.tc::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .15s;background:var(--g1)}
.tc:hover{border-color:var(--a1)}.tc:hover::before{opacity:1}
.tc.selected{border-color:var(--a1);box-shadow:0 0 8px var(--g1)}
.tp{height:24px;border-radius:3.5px;margin-bottom:4px;position:relative;overflow:hidden}
.tb{position:absolute;top:0;left:0;right:0;height:6px;display:flex;gap:2px;padding:1px 2.5px;align-items:center}
.td2{width:3.5px;height:3.5px;border-radius:50%}
.tchk{position:absolute;top:2.5px;right:2.5px;width:12px;height:12px;background:var(--a1);border-radius:50%;display:none;align-items:center;justify-content:center;font-size:7px;color:#000;z-index:2}
.tc.selected .tchk{display:flex}
.tn{font-size:8px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg2{font-size:7px;color:var(--txt2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.slbl{font-size:8px;color:var(--txt2);letter-spacing:.5px;text-transform:uppercase;margin:6px 0 5px;display:flex;align-items:center;gap:4px}
.slbl::after{content:'';flex:1;height:1px;background:var(--brd2)}

/* SELECT */
.sel{width:100%;background:var(--bg2);border:1px solid var(--brd);border-radius:5px;color:var(--txt);padding:6px 9px;font-family:'Raleway',sans-serif;font-size:10.5px;cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5'%3E%3Cpath d='M0 0l4.5 5 4.5-5z' fill='%234fc3f7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;transition:border-color .13s}
.sel:focus{border-color:var(--a1)}

/* COLOR ROW */
.cr{display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg2);border-radius:6px;border:1px solid var(--brd);margin-bottom:4px;transition:border-color .13s}
.cr:hover{border-color:var(--a3)}
.cs{width:24px;height:24px;border-radius:5px;cursor:pointer;border:2px solid rgba(255,255,255,.09);flex-shrink:0;transition:transform .11s;position:relative;overflow:hidden}
.cs:hover{transform:scale(1.1)}
.cs input[type="color"]{position:absolute;inset:-4px;width:calc(100% + 8px);height:calc(100% + 8px);opacity:0;cursor:pointer}
.ci{flex:1;min-width:0}
.cl{font-size:9px;font-weight:600;margin-bottom:1px}
.cd{font-size:8px;color:var(--txt2)}
.chex{font-size:8px;font-family:'Courier New',monospace;color:var(--a3);letter-spacing:.4px}

/* TOGGLE */
.tr2{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--bg2);border-radius:6px;border:1px solid var(--brd);margin-bottom:4px}
.tl2{font-size:9px;font-weight:500}
.td3{font-size:8px;color:var(--txt2);margin-top:1px}
.tog{width:28px;height:15px;background:var(--brd);border-radius:7px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.tog.on{background:var(--a1)}
.tog::after{content:'';position:absolute;top:1.5px;left:1.5px;width:12px;height:12px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.4)}
.tog.on::after{transform:translateX(13px)}

/* NUMBER / TEXT INPUT */
.nr{display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg2);border-radius:6px;border:1px solid var(--brd);margin-bottom:4px}
.nr:hover{border-color:var(--a3)}
.ni{width:56px;background:var(--bg3);border:1px solid var(--brd);border-radius:4px;color:var(--txt);padding:3.5px 6px;font-family:'Raleway',sans-serif;font-size:10px;outline:none;text-align:center}
.ni:focus{border-color:var(--a1)}

/* TIME */
.timp{background:var(--bg2);border:1px solid var(--brd);border-radius:5px;color:var(--txt);padding:5.5px 7px;font-family:'Raleway',sans-serif;font-size:10.5px;outline:none;width:100%;color-scheme:dark}
.timp:focus{border-color:var(--a1)}

/* SCHEDULER */
.sg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}
.slb{font-size:8px;color:var(--txt2);letter-spacing:.4px;margin-bottom:3px;text-transform:uppercase}

/* BUTTONS */
.btn{display:flex;align-items:center;justify-content:center;gap:5px;width:100%;padding:7px;border-radius:6px;cursor:pointer;font-family:'Raleway',sans-serif;font-size:9px;font-weight:600;letter-spacing:.4px;border:1px solid;transition:all .15s;margin-bottom:4px}
.bn{background:rgba(79,195,247,.09);border-color:rgba(79,195,247,.22);color:var(--a1)}.bn:hover{background:rgba(79,195,247,.18);border-color:var(--a1);box-shadow:0 0 8px var(--g1)}
.bp{background:rgba(167,139,250,.09);border-color:rgba(167,139,250,.2);color:var(--a3)}.bp:hover{background:rgba(167,139,250,.17);border-color:var(--a3)}
.bg{background:rgba(240,192,64,.09);border-color:rgba(240,192,64,.22);color:var(--gold);margin-top:2px}.bg:hover{background:rgba(240,192,64,.18);border-color:var(--gold);box-shadow:0 0 8px var(--gg)}
.bgrn{background:rgba(63,185,80,.09);border-color:rgba(63,185,80,.2);color:var(--green)}.bgrn:hover{background:rgba(63,185,80,.17);border-color:var(--green)}
.br{background:rgba(248,81,73,.07);border-color:rgba(248,81,73,.18);color:var(--red)}.br:hover{background:rgba(248,81,73,.14);border-color:var(--red)}

/* CHANGELOG */
.cli{border-left:2px solid var(--brd);padding:0 0 12px 10px;position:relative}
.cli:last-child{border-left-color:transparent;padding-bottom:0}
.cli::before{content:'';position:absolute;left:-4.5px;top:3.5px;width:7px;height:7px;border-radius:50%;border:2px solid var(--a1);background:var(--bg)}
.cli:first-child::before{background:var(--a1)}
.clv{display:flex;align-items:center;gap:5px;margin-bottom:4px}
.cvb{font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--a1)}
.cvd{font-size:8px;color:var(--txt2)}
.cvt{font-size:7px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:1px 4px;border-radius:2px;margin-left:auto}
.cn{background:rgba(79,195,247,.1);color:var(--a1)}.cf{background:rgba(233,30,140,.1);color:var(--a2)}.cm{background:rgba(167,139,250,.1);color:var(--a3)}.cs2{background:rgba(63,185,80,.1);color:var(--green)}
.cll{list-style:none}.cll li{font-size:9px;color:var(--txt2);padding:1.5px 0;display:flex;gap:4px}
.cll li::before{content:'▸';color:var(--a1);flex-shrink:0;font-size:7px;margin-top:1.5px}


/* ABOUT */
.abh{background:linear-gradient(135deg,rgba(79,195,247,.06),rgba(233,30,140,.06));border:1px solid var(--brd);border-radius:9px;padding:14px 10px;text-align:center;margin-bottom:10px;position:relative;overflow:hidden}
.abav{width:46px;height:46px;border-radius:50%;margin:0 auto 6px;background:linear-gradient(135deg,#4fc3f7,#e91e8c,#a78bfa);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:#fff;box-shadow:0 0 16px rgba(79,195,247,.25)}
.abn{font-family:'Cinzel',serif;font-size:11px;font-weight:600;letter-spacing:2px;margin-bottom:2px;background:linear-gradient(90deg,#4fc3f7,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.abt{font-size:8px;color:var(--txt2);letter-spacing:.8px;text-transform:uppercase;margin-bottom:3px}
.abc{font-size:7.5px;color:var(--txt3);letter-spacing:.3px}
.srow{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:8px}
.stat{background:var(--bg3);border-radius:5px;padding:6px 3px;text-align:center;border:1px solid var(--brd)}
.sn{font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:var(--a1);display:block}
.sl{font-size:7px;color:var(--txt2);letter-spacing:.4px;text-transform:uppercase}
.lbtn{display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);cursor:pointer;transition:all .15s;margin-bottom:3px;width:100%;font-family:'Raleway',sans-serif;font-size:9px;font-weight:500;text-align:left}
.lbtn:hover{border-color:var(--a1);background:var(--g1);color:var(--a1)}
.la{font-size:11px}.larr{margin-left:auto;opacity:.3;font-size:8px}

/* LICENSE */
.lb{background:var(--bg2);border:1px solid var(--brd);border-radius:6px;padding:8px 10px;margin-bottom:4px}
.lb p{font-size:8.5px;color:var(--txt2);line-height:1.65;margin-bottom:4px}.lb p:last-of-type{margin-bottom:0}
.lb .warn{font-size:7.5px;color:var(--txt3)}
.lcpy{font-family:'Courier New',monospace;font-size:7.5px;color:var(--a1);background:rgba(79,195,247,.06);padding:5px 7px;border-radius:3px;display:block;margin-top:4px;cursor:pointer;transition:background .13s;border:1px solid rgba(79,195,247,.13)}
.lcpy:hover{background:rgba(79,195,247,.12)}

/* INFO GRID */
.ig{background:var(--bg2);border:1px solid var(--brd);border-radius:6px;padding:8px 10px}
.igr{display:flex;justify-content:space-between;font-size:9px;padding:2px 0}
.igr:not(:last-child){border-bottom:1px solid var(--brd2)}
.igk{color:var(--txt2)}.igv{color:var(--txt);font-weight:500}
.igv.a{color:var(--a1)}.igv.g{color:var(--gold)}

/* SCROLL */
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--brd);border-radius:2px}::-webkit-scrollbar-thumb:hover{background:var(--a1)}
</style>
</head>
<body>

<!-- HEADER -->
<div class="hdr">
  <div class="logo">
    <svg viewBox="0 0 50 50" fill="none" width="50" height="50">
      <circle cx="25" cy="25" r="23" stroke="url(#rg)" stroke-width="1.5" stroke-dasharray="5 3"/>
      <defs><linearGradient id="rg" x1="0" y1="0" x2="50" y2="50"><stop stop-color="#4fc3f7"/><stop offset="1" stop-color="#e91e8c"/></linearGradient></defs>
    </svg>
    <div class="logo-c">
    <img src="https://raw.githubusercontent.com/Abdelrahman968/horizon-theme/refs/heads/main/assets/icon.png" alt="Horizon Themes" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
  </div>
  <div class="ht">Horizon Themes</div>
  <div class="hs">Ultimate Edition · Hoyoverse Collection</div>
  <div class="hbadges">
    <span class="hb v">v3.9.0</span>
    <span class="hb l">MIT License</span>
    <span class="hb y">© 2026 Abdelrahman</span>
  </div>
</div>

<!-- TABS -->
<div class="tabs">
  <div class="tab active" onclick="swTab('themes',this)">
    <div class="tab-icon">◈</div>
    <div class="tab-label">Themes</div>
  </div>
  <div class="tab" onclick="swTab('settings',this)">
    <div class="tab-icon">⚙</div>
    <div class="tab-label">Settings</div>
  </div>
  <div class="tab" onclick="swTab('commands',this)">
    <div class="tab-icon">⌨️</div>
    <div class="tab-label">Commands</div>
  </div>
  <div class="tab" onclick="swTab('changelog',this)">
    <div class="tab-icon">📋</div>
    <div class="tab-label">Changes</div>
  </div>
  <div class="tab" onclick="swTab('about',this)">
    <div class="tab-icon">✦</div>
    <div class="tab-label">About</div>
  </div>
</div>

<!-- ════ THEMES ════ -->
<div class="panel active" id="panel-themes">
  <div class="sec">
    <div class="st">⭐ Recommended</div>
    <div class="phint">
      <span>Hover to preview · Click to apply</span>
      <span class="ptog off" id="ptogbtn" onclick="togPrev()">Preview OFF</span>
    </div>
    <div class="feat" id="feat-db" data-theme="horizon-core.deep-blue"
         onclick="selFeat(this)" onmouseenter="prev('horizon-core.deep-blue')" onmouseleave="restore()">
      <div class="fchk">✓</div><div class="fbadge">✦ Default</div>
      <div class="fprev">
        <div class="fbar"><span style="background:#4fc3f7"></span><span style="background:#e91e8c"></span><span style="background:#a78bfa"></span><span style="background:#4ade80;margin-left:auto"></span></div>
        <div class="flines"><div class="fl" style="width:54%;background:#4fc3f7"></div><div class="fl" style="width:76%;background:#a78bfa;opacity:.5"></div><div class="fl" style="width:41%;background:#e91e8c;opacity:.6"></div></div>
      </div>
      <div class="fmeta"><div><div class="fname">Deep Blue</div><div class="fsub">Core Edition · Optimal contrast &amp; readability</div></div><div class="ftag">✦ Best Pick</div></div>
    </div>
  </div>

  <div class="sec">
    <div class="st">Core</div>
    <div class="tg">
      <div class="tc" data-theme="horizon-core.dark-plus" onclick="selTheme(this)" onmouseenter="prev('horizon-core.dark-plus')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1a1a2e,#2d2d44)"><div class="tb" style="background:#2d2d44"><div class="td2" style="background:#7c3aed"></div><div class="td2" style="background:#ec4899"></div><div class="td2" style="background:#38bdf8"></div></div></div><div class="tn">Dark Plus</div><div class="tg2">Core</div></div>
      <div class="tc" data-theme="horizon-core.modern-light" onclick="selTheme(this)" onmouseenter="prev('horizon-core.modern-light')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#f0f4f8,#dce6f0)"><div class="tb" style="background:rgba(0,0,0,.05)"><div class="td2" style="background:#0369a1"></div><div class="td2" style="background:#be185d"></div><div class="td2" style="background:#7c3aed"></div></div></div><div class="tn">Modern Light</div><div class="tg2">Core</div></div>
    </div>
  </div>

  <div class="sec">
    <div class="st">Genshin Impact</div>
    <div class="tg">
      <div class="tc" data-theme="horizon-themes-ganyu-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-ganyu-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0f1f2e,#163048)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#7dd3fc"></div><div class="td2" style="background:#c4b5fd"></div></div></div><div class="tn">Ganyu</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-furina-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-furina-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0e1a2d,#162844)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#60a5fa"></div><div class="td2" style="background:#c084fc"></div></div></div><div class="tn">Furina</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-scaramouche-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-scaramouche-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#150e28,#1e1535)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#a78bfa"></div><div class="td2" style="background:#7c3aed"></div></div></div><div class="tn">Scaramouche</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-columbina-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-columbina-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1a1420,#261a30)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#f9a8d4"></div><div class="td2" style="background:#e879f9"></div></div></div><div class="tn">Columbina</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-citlali-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-citlali-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0f1a28,#15243a)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#93c5fd"></div><div class="td2" style="background:#67e8f9"></div></div></div><div class="tn">Citlali</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-skirk-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-skirk-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0a0f1a,#111827)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#6366f1"></div><div class="td2" style="background:#8b5cf6"></div></div></div><div class="tn">Skirk</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-wanderer-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-wanderer-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#141c2a,#1c2738)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#7dd3fc"></div><div class="td2" style="background:#818cf8"></div></div></div><div class="tn">Wanderer</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-mizuki-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-mizuki-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1a1030,#251545)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#c4b5fd"></div><div class="td2" style="background:#ddd6fe"></div></div></div><div class="tn">Mizuki</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-sandrone-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-sandrone-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#2a1e0e,#3a2c15)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#fcd34d"></div><div class="td2" style="background:#f59e0b"></div></div></div><div class="tn">Sandrone</div><div class="tg2">Genshin Impact</div></div>
      <div class="tc" data-theme="horizon-themes-yaemiko-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-yaemiko-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#200d20,#2e1430)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#f0abfc"></div><div class="td2" style="background:#e879f9"></div></div></div><div class="tn">Yae Miko</div><div class="tg2">Genshin Impact</div></div>
    </div>
  </div>

  <div class="sec">
    <div class="st">Honkai: Star Rail</div>
    <div class="tg">
      <div class="tc" data-theme="horizon-themes-kafka-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-kafka-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1a0e2a,#2a1540)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#c084fc"></div><div class="td2" style="background:#a855f7"></div></div></div><div class="tn">Kafka</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-firefly-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-firefly-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#2a1a0e,#3d2515)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#fb923c"></div><div class="td2" style="background:#fbbf24"></div></div></div><div class="tn">Firefly</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-ruanmei-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-ruanmei-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0e1f1a,#162e26)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#4ade80"></div><div class="td2" style="background:#34d399"></div></div></div><div class="tn">Ruan Mei</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-robin-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-robin-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1f1520,#2e1f30)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#f9a8d4"></div><div class="td2" style="background:#fb7185"></div></div></div><div class="tn">Robin</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-aventurine-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-aventurine-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1c1a0e,#2a2710)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#fde68a"></div><div class="td2" style="background:#fbbf24"></div></div></div><div class="tn">Aventurine</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-march7th-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-march7th-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#1e0f1a,#2d1525)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#f9a8d4"></div><div class="td2" style="background:#fbcfe8"></div></div></div><div class="tn">March 7th</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-cyrene-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-cyrene-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0e1c2a,#142738)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#38bdf8"></div><div class="td2" style="background:#0ea5e9"></div></div></div><div class="tn">Cyrene</div><div class="tg2">Star Rail</div></div>
      <div class="tc" data-theme="horizon-themes-danheng-dark" onclick="selTheme(this)" onmouseenter="prev('horizon-themes-danheng-dark')" onmouseleave="restore()"><div class="tchk">✓</div><div class="tp" style="background:linear-gradient(135deg,#0f1820,#16242e)"><div class="tb" style="background:rgba(255,255,255,.04)"><div class="td2" style="background:#22d3ee"></div><div class="td2" style="background:#67e8f9"></div></div></div><div class="tn">Dan Heng</div><div class="tg2">Star Rail</div></div>
    </div>
  </div>

  <div class="sec">
    <div class="st">🗂 Icon Packs</div>
    <div class="slbl" style="margin-bottom:5px">File Icon Theme</div>
    <select class="sel" id="iconSel" onchange="setIcon(this.value)" style="margin-bottom:7px">
      <option value="Horizon Icons">✦ Horizon Icons (Recommended)</option>
      <option value="null">— None</option>
    </select>
    <div class="slbl" style="margin-bottom:5px">Product Icon Theme</div>
    <select class="sel" id="prodSel" onchange="setProd(this.value)">
      <option value="Default">◎ VS Code Default</option>
      <option value="horizon-product-icons">✦ Horizon Product Icons ✦ Built-in</option>
    </select>
    <div style="margin-top:6px;background:rgba(79,195,247,.06);border:1px solid rgba(79,195,247,.15);border-radius:6px;padding:7px 9px;">
      <div style="font-size:8.5px;font-weight:600;color:var(--a1);margin-bottom:3px;">✦ Horizon Product Icons</div>
      <div style="font-size:8px;color:var(--txt2);line-height:1.6;">+40 icons replacing VS Code's toolbar, sidebar, terminal, git &amp; notification icons — styled to match your Horizon theme. No extra extensions needed.</div>
    </div>
  </div>
</div>

<!-- ════ SETTINGS ════ -->
<div class="panel" id="panel-settings">

  <div class="sec">
    <div class="st">🔍 Live Preview</div>
    <div class="tr2">
      <div><div class="tl2">Enable Live Preview</div><div class="td3">Hover themes to preview before applying</div></div>
      <div class="tog" id="togPrev2" onclick="togPrev2Click()"></div>
    </div>
    <div class="nr">
      <div class="ci"><div class="cl">Preview Delay</div><div class="cd">ms before switching on hover (50–800)</div></div>
      <input type="number" class="ni" id="prevDelay" min="50" max="800" step="25" value="150" onchange="updS('horizonTheme.livePreview.delay',parseInt(this.value))">
    </div>
  </div>

  <div class="sec">
    <div class="st">✏ Editor Appearance</div>
    <div class="nr"><div class="ci"><div class="cl">Font Size</div><div class="cd">Editor font size (px)</div></div><input type="number" class="ni" id="fsize" min="8" max="32" value="14" onchange="updS('editor.fontSize',parseInt(this.value))"></div>
    <div class="nr"><div class="ci"><div class="cl">Line Height</div><div class="cd">Line height multiplier</div></div><input type="number" class="ni" id="lheight" min="1" max="3" step="0.1" value="1.5" onchange="updS('editor.lineHeight',parseFloat(this.value))"></div>
    <div class="tr2"><div><div class="tl2">Font Ligatures</div><div class="td3">Requires a ligature-supported font</div></div><div class="tog" id="togLig" onclick="togI('togLig','editor.fontLigatures')"></div></div>
    <div class="tr2"><div><div class="tl2">Minimap</div><div class="td3">Code overview on the right side</div></div><div class="tog" id="togMini" onclick="togI('togMini','editor.minimap.enabled')"></div></div>
    <div class="tr2"><div><div class="tl2">Bracket Pair Colors</div><div class="td3">Colorize matching bracket pairs</div></div><div class="tog" id="togBrk" onclick="togI('togBrk','editor.bracketPairColorization.enabled')"></div></div>
    <div style="margin-bottom:4px"><div class="slb" style="margin-bottom:3px">Cursor Style</div>
      <select class="sel" id="curSel" onchange="updS('editor.cursorStyle',this.value)">
        <option value="line">Line</option><option value="block">Block</option><option value="underline">Underline</option>
        <option value="line-thin">Line Thin</option><option value="block-outline">Block Outline</option><option value="underline-thin">Underline Thin</option>
      </select>
    </div>
    <div><div class="slb" style="margin-bottom:3px">Cursor Blinking</div>
      <select class="sel" id="blinkSel" onchange="updS('editor.cursorBlinking',this.value)">
        <option value="blink">Blink</option><option value="smooth">Smooth</option><option value="phase">Phase</option>
        <option value="expand">Expand</option><option value="solid">Solid</option>
      </select>
    </div>
  </div>

  <div class="sec">
    <div class="st">🎨 Color Customization</div>
    <div class="cr"><div class="cs" style="background:#4fc3f7" id="cs1"><input type="color" value="#4fc3f7" oninput="uCs('cs1','chx1',this.value)" onchange="aCs('accent1',this.value)"></div><div class="ci"><div class="cl">Primary Accent</div><div class="cd">Keywords · highlights</div></div><div class="chex" id="chx1">#4fc3f7</div></div>
    <div class="cr"><div class="cs" style="background:#e91e8c" id="cs2"><input type="color" value="#e91e8c" oninput="uCs('cs2','chx2',this.value)" onchange="aCs('accent2',this.value)"></div><div class="ci"><div class="cl">Secondary Accent</div><div class="cd">Strings · decorators</div></div><div class="chex" id="chx2">#e91e8c</div></div>
    <div class="cr"><div class="cs" style="background:#a78bfa" id="cs3"><input type="color" value="#a78bfa" oninput="uCs('cs3','chx3',this.value)" onchange="aCs('accent3',this.value)"></div><div class="ci"><div class="cl">Tertiary Accent</div><div class="cd">Functions · types</div></div><div class="chex" id="chx3">#a78bfa</div></div>
    <div class="cr"><div class="cs" style="background:#0d1117" id="cs4"><input type="color" value="#0d1117" oninput="uCs('cs4','chx4',this.value)" onchange="aCs('background',this.value)"></div><div class="ci"><div class="cl">Editor Background</div><div class="cd">Main backdrop</div></div><div class="chex" id="chx4">#0d1117</div></div>
  </div>

  <div class="sec">
    <div class="st">🏷 Horizon Tags</div>
    <div class="tr2"><div><div class="tl2">Enable Everywhere</div><div class="td3">Highlight tags in all languages</div></div><div class="tog" id="togEv" onclick="togI('togEv','horizonTags.allowEverywhere')"></div></div>
    <div class="slb" style="margin-bottom:3px">Highlight Style</div>
    <select class="sel" id="tagSty" onchange="updS('horizonTags.hightlightType',this.value)">
      <option value="color">Text Color</option><option value="background-color">Background Color</option><option value="border">Border</option>
    </select>
  </div>

  <div class="sec">
    <div class="st">🌅 Theme Scheduler</div>
    <div class="tr2" style="margin-bottom:8px"><div><div class="tl2">Auto Switch Day / Night</div><div class="td3">Changes theme automatically by time</div></div><div class="tog" id="togSch" onclick="this.classList.toggle('on')"></div></div>
    <div class="tr2" style="margin-bottom:8px"><div><div class="tl2">Follow System Appearance</div><div class="td3">Match your OS light/dark mode instead of a fixed time</div></div><div class="tog" id="togFollowSys" onclick="toggleFollowSys()"></div></div>
    <div class="sg" id="schedTimeGroup">
      <div><div class="slb">☀ Day theme</div><select class="sel" id="sday"><option value="horizon-core.modern-light">Modern Light</option><option value="horizon-core.deep-blue">Deep Blue</option><option value="horizon-themes-ganyu-light">Ganyu Light</option><option value="horizon-themes-furina-light">Furina Light</option><option value="horizon-themes-robin-light">Robin Light</option></select></div>
      <div><div class="slb">🌙 Night theme</div><select class="sel" id="snight"><option value="horizon-core.deep-blue">Deep Blue</option><option value="horizon-core.dark-plus">Dark Plus</option><option value="horizon-themes-kafka-dark">Kafka</option><option value="horizon-themes-scaramouche-dark">Scaramouche</option><option value="horizon-themes-skirk-dark">Skirk</option></select></div>
      <div id="schedDayTimeRow"><div class="slb">☀ Day starts</div><input type="time" class="timp" id="sdayT" value="08:00"></div>
      <div id="schedNightTimeRow"><div class="slb">🌙 Night starts</div><input type="time" class="timp" id="snightT" value="20:00"></div>
    </div>
    <button class="btn bg" onclick="saveSch()">✦ Save Scheduler</button>
  </div>

  <div class="sec">
    <div class="st">🎯 Context Themes</div>
    <div class="td3" style="margin-bottom:8px">Apply a specific Horizon theme in special VS Code modes.</div>
    <div><div class="slb">🎯 Focus Mode Theme <span style="font-size:8px;color:var(--txt3)">(when window loses focus)</span></div>
    <select class="sel" id="focusThmSel" onchange="updS('horizonTheme.focusModeTheme',this.value)">
      <option value="">— Disabled</option>
    </select></div>
    <div style="margin-top:7px"><div class="slb">🧘 Zen Mode Theme <span style="font-size:8px;color:var(--txt3)">(during Zen Mode)</span></div>
    <select class="sel" id="zenThmSel" onchange="updS('horizonTheme.zenModeTheme',this.value)">
      <option value="">— Disabled</option>
    </select></div>
  </div>

  <div class="sec">
    <div class="st">🔤 Font Picker</div>
    <div class="td3" style="margin-bottom:8px">Browse popular coding fonts and set them instantly.</div>
    <button class="btn bg" onclick="vscode.postMessage({command:'pickFont'})">✦ Choose Editor Font…</button>
  </div>

  <div class="sec">
    <div class="st">📦 Backup &amp; Restore</div>
    <button class="btn bn" onclick="doExp()">↑ Export All Settings</button>
    <button class="btn bp" onclick="doImp()">↓ Import Settings</button>
    <button class="btn br" onclick="doRst()">↺ Reset to Defaults</button>
    <button class="btn" style="margin-top:4px" onclick="vscode.postMessage({command:'clearWorkspaceAccent'})">🎨 Clear Workspace Accent</button>
  </div>
</div>

<!-- ════ COMMANDS ════ -->
<div class="panel" id="panel-commands">
  <div class="sec">
    <div class="st">⌨️ Available Commands</div>
    <div class="td3" style="margin-bottom:12px">All Horizon Themes commands — press <kbd style="background:var(--bg3);padding:2px 6px;border-radius:4px;font-family:monospace">Ctrl+Shift+P</kbd> and type "Horizon" to find them. <strong style="color:var(--a1)">Click any command to copy it!</strong></div>
    
    <div class="cmd-cat">🎨 Theme Commands</div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.quickSwitch')">
      <div class="cmd-name">horizonTheme.quickSwitch</div>
      <div class="cmd-desc">Quickly switch between Horizon themes from the status bar or command palette</div>
      <div class="cmd-shortcut">Click "✦ Horizon" status bar item</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.randomTheme')">
      <div class="cmd-name">horizonTheme.randomTheme</div>
      <div class="cmd-desc">Apply a random Horizon theme from the entire collection</div>
      <div class="cmd-shortcut">Sidebar → Themes → Random button</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.exportPalette')">
      <div class="cmd-name">horizonTheme.exportPalette</div>
      <div class="cmd-desc">Export current theme colors as an SVG image (color swatches)</div>
      <div class="cmd-shortcut">Great for sharing on social media</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.setWorkspaceTheme')">
      <div class="cmd-name">horizonTheme.setWorkspaceTheme</div>
      <div class="cmd-desc">Set a theme for the current workspace only (saves to .vscode/settings.json)</div>
      <div class="cmd-shortcut">Each project remembers its own theme</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.copyColors')">
      <div class="cmd-name">horizonTheme.copyColors</div>
      <div class="cmd-desc">Copy active theme colors to clipboard as JSON, CSS Variables, or plain list</div>
      <div class="cmd-shortcut">Perfect for theme customization</div>
    </div>
    
    <div class="cmd-cat">🎨 Accent &amp; Workspace</div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.setWorkspaceAccent')">
      <div class="cmd-name">horizonTheme.setWorkspaceAccent</div>
      <div class="cmd-desc">Set a custom accent color for the current workspace (Title/Activity/Status bars)</div>
      <div class="cmd-shortcut">Distinguish multiple project windows visually</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.clearWorkspaceAccent')">
      <div class="cmd-name">horizonTheme.clearWorkspaceAccent</div>
      <div class="cmd-desc">Remove workspace accent color overrides and restore original theme</div>
      <div class="cmd-shortcut">One-click reset</div>
    </div>
    
    <div class="cmd-cat">🗂️ Icon Commands</div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.pickIcon')">
      <div class="cmd-name">horizonTheme.pickIcon</div>
      <div class="cmd-desc">Browse and assign any Horizon icon to a file extension, file name, or folder name</div>
      <div class="cmd-shortcut">No manual JSON editing needed</div>
    </div>
    
    <div class="cmd-cat">🏷️ Horizon Tags Commands</div>
    
    <div class="cmd-item" onclick="copyCmd('extension.horizonTags')">
      <div class="cmd-name">extension.horizonTags</div>
      <div class="cmd-desc">Manually trigger tag highlighting in the current file</div>
      <div class="cmd-shortcut">Auto-runs on file changes</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.toggleTagsEverywhere')">
      <div class="cmd-name">horizonTheme.toggleTagsEverywhere</div>
      <div class="cmd-desc">Toggle tag highlighting for all file types (not just HTML/XML/Vue)</div>
      <div class="cmd-shortcut">Click tag counter in status bar</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.refreshTagSummary')">
      <div class="cmd-name">horizonTheme.refreshTagSummary</div>
      <div class="cmd-desc">Refresh the Tag Summary tree view in the sidebar</div>
      <div class="cmd-shortcut">Or click the refresh button in the panel</div>
    </div>
    
    <div class="cmd-cat">🔤 Editor &amp; Fonts</div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.pickFont')">
      <div class="cmd-name">horizonTheme.pickFont</div>
      <div class="cmd-desc">Choose from 20 popular coding fonts and enable/disable ligatures</div>
      <div class="cmd-shortcut">Sidebar → Settings → Font Picker</div>
    </div>
    
    <div class="cmd-cat">📦 Backup &amp; Settings</div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.openSettings')">
      <div class="cmd-name">horizonTheme.openSettings</div>
      <div class="cmd-desc">Open Horizon Themes sidebar panel</div>
      <div class="cmd-shortcut">Sidebar icon or command palette</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.exportSettings')">
      <div class="cmd-name">horizonTheme.exportSettings</div>
      <div class="cmd-desc">Export all settings (theme, icons, colors, scheduler, editor prefs) to a JSON file</div>
      <div class="cmd-shortcut">Sidebar → Settings → Export</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.importSettings')">
      <div class="cmd-name">horizonTheme.importSettings</div>
      <div class="cmd-desc">Import settings from a JSON backup file</div>
      <div class="cmd-shortcut">Sidebar → Settings → Import</div>
    </div>
    
    <div class="cmd-item" onclick="copyCmd('horizonTheme.resetSettings')">
      <div class="cmd-name">horizonTheme.resetSettings</div>
      <div class="cmd-desc">Reset all Horizon settings to factory defaults</div>
      <div class="cmd-shortcut">Sidebar → Settings → Reset</div>
    </div>
    
    <div class="cmd-cat">📋 Quick Reference</div>
    
    <div class="cmd-tip">
      <div class="tip-icon">💡</div>
      <div class="tip-text">All commands are prefixed with <strong>horizonTheme.</strong> or <strong>extension.</strong> — just type "horizon" in the command palette to see them all!</div>
    </div>
    
    <div class="cmd-tip">
      <div class="tip-icon">⚡</div>
      <div class="tip-text">Status bar items: <strong>✦ Horizon</strong> (quick theme switch) and <strong>✦ X tags</strong> (toggle tags everywhere)</div>
    </div>
  </div>
</div>

<!-- ════ CHANGELOG ════ -->
<div class="panel" id="panel-changelog">
  <div class="sec">
    <div class="st">Release History</div>
    
    <div class="cli"><div class="clv"><span class="cvb">v3.9.0</span><span class="cvd">2026</span><span class="cvt cn">LATEST</span></div><ul class="cll"><li>Export Theme Palette as Image — horizonTheme.exportPalette — Generates SVG with color swatches</li><li>Set Workspace Theme (Per-Project) — horizonTheme.setWorkspaceTheme</li><li>Set Workspace Accent Color — horizonTheme.setWorkspaceAccent</li><li>Clear Workspace Accent — horizonTheme.clearWorkspaceAccent</li><li>Onboarding Walkthrough — Interactive 5-step tour</li><li>Rate & Review Prompt — After 7 days + 50 activations</li><li>Tag Summary Tree View — Sidebar panel for Horizon Tags</li><li>Copy Theme Colors to Clipboard — JSON/CSS/Plain formats</li><li>Font Family Picker — 20 coding fonts + ligatures</li><li>Context Themes — Focus Mode & Zen Mode auto-switch</li><li>Performance Improvements — Debouncing, caching, memoized regex</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v3.8.0</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>VS Code for the Web compatibility</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v3.7.0</span><span class="cvd">2026</span><span class="cvt cs2">MAJOR</span></div><ul class="cll"><li>New folder icons: debian, gemini, yaml, zed, claude, cursor, tailwind, vitepress</li><li>New file icons: capistrano, gemini, istanbul, jsonConfig, nixLock, rustDist, rustError, rustLint, elixirApp, elixirConfig, elixirEnv, elixirLint, phoenix, claude, cursor, gitCliff, gitCliffIgnore, kdl</li><li>Renamed yml → yaml icons</li><li>Fixed ejs files icon</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v3.6.3</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>Horizon Deep Blue color refinements — statusBar, titleBar, tab colors unified</li><li>New EJS icon</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v3.6.2</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>Bug fixes: sidebar panel, scheduler, backup/restore, random theme, HorizonTags, product icons, live preview</li><li>Export Theme Palette, Workspace Theme, Workspace Accent features</li><li>Onboarding Walkthrough & Rate & Review</li><li>Tag Summary Tree View & Copy Colors</li><li>Font Family Picker & Context Themes</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v3.6.1</span><span class="cvd">2026</span><span class="cvt cn">NEW</span></div><ul class="cll"><li>Built-in Horizon Product Icons — 36 custom SVGs</li><li>Live Theme Preview — Hover to preview before applying</li><li>Sidebar Settings Panel — 4-tab UI</li><li>Theme Scheduler — Auto day/night switching</li><li>Backup & Restore — Export/Import to JSON</li><li>Random Theme command</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v2.0.2</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>Reduce Size</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v2.0.1</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>Fix some issues</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v2.0.0</span><span class="cvd">2026</span><span class="cvt cs2">MAJOR</span></div><ul class="cll"><li>Horizon Tags — Tag-pair colorization for HTML/XML/Vue</li><li>+46 HoYoverse themes — Genshin Impact & Honkai Star Rail characters</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v1.0.1</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>Renamed themes to Horizon Themes Core: Deep Blue / Dark Plus / Modern Light</li><li>Renamed Horizon Icons</li></ul></div>

    <div class="cli"><div class="clv"><span class="cvb">v1.0.0</span><span class="cvd">2026</span><span class="cvt cs2">INITIAL</span></div><ul class="cll"><li>Color Themes: Deep Blue, Dark Plus, Modern Light</li><li>Horizon Icons — 700+ file and folder icons</li></ul></div>

  </div>
</div>

<!-- ════ ABOUT ════ -->
<div class="panel" id="panel-about">
  <div class="abh">
    <div class="abav">A</div>
    <div class="abn">Abdelrahman</div>
    <div class="abt">Developer &amp; Designer · Horizon Themes</div>
    <div class="abc">Copyright © 2026 Abdelrahman. All rights reserved.</div>
    <div class="srow">
      <div class="stat"><span class="sn">40+</span><span class="sl">Themes</span></div>
      <div class="stat"><span class="sn">900+</span><span class="sl">Icons</span></div>
      <div class="stat"><span class="sn">3.9.0</span><span class="sl">Version</span></div>
    </div>
  </div>

  <div class="sec">
    <div class="st">⚖ License &amp; Rights</div>
    <div class="lb">
      <p>Horizon Ultimate Themes is distributed under the <strong style="color:var(--green)">MIT License</strong>. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, provided the following conditions are met:</p>
      <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
      <p class="warn">THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY ARISING FROM THE USE OF THE SOFTWARE.</p>
      <code class="lcpy" onclick="cpLic()" title="Click to copy">© 2026 Abdelrahman · MIT License · horizon-core · github.com/Abdelrahman968/horizon-theme</code>
    </div>
    <div style="font-size:7.5px;color:var(--txt3);padding:3px 2px;line-height:1.5">Genshin Impact &amp; Honkai: Star Rail characters and artwork are © HoYoverse Co., Ltd. This extension is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by HoYoverse.</div>
  </div>

  <div class="sec">
    <div class="st">🔗 Links</div>
     <button class="lbtn" onclick="ext('https://abdelrahman-portfolio-rho.vercel.app/')"><span class="la">👤</span>About the Developer<span class="larr">↗</span></button>
    <button class="lbtn" onclick="ext('https://github.com/Abdelrahman968/horizon-theme')"><span class="la">⬡</span>GitHub Repository<span class="larr">↗</span></button>
    <button class="lbtn" onclick="ext('https://marketplace.visualstudio.com/items?itemName=horizon-core.horizon-theme')"><span class="la">◈</span>VS Code Marketplace<span class="larr">↗</span></button>
    <button class="lbtn" onclick="ext('https://github.com/Abdelrahman968/horizon-theme/issues')"><span class="la">◎</span>Report an Issue<span class="larr">↗</span></button>
    <button class="lbtn" onclick="ext('https://github.com/Abdelrahman968/horizon-theme/blob/main/changelog.md')"><span class="la">📋</span>Full Changelog<span class="larr">↗</span></button>
    <button class="lbtn" onclick="ext('https://github.com/Abdelrahman968/horizon-theme/blob/main/LICENSE')"><span class="la">⚖</span>View License<span class="larr">↗</span></button>
  </div>

  <div class="sec">
    <div class="st">ℹ Extension Info</div>
    <div class="ig">
      <div class="igr"><span class="igk">Publisher</span><span class="igv a">horizon-core</span></div>
      <div class="igr"><span class="igk">Extension ID</span><span class="igv" style="font-size:8px">horizon-core.horizon-theme</span></div>
      <div class="igr"><span class="igk">Version</span><span class="igv">3.9.0</span></div>
      <div class="igr"><span class="igk">License</span><span class="igv g">MIT</span></div>
      <div class="igr"><span class="igk">VS Code req.</span><span class="igv">^1.90.0</span></div>
      <div class="igr"><span class="igk">Support Web</span><span class="igv">True</span></div>
      <div class="igr"><span class="igk">Language</span><span class="igv">JavaScript ES2022</span></div>
      <div class="igr"><span class="igk">Copyright</span><span class="igv">© 2026 Abdelrahman</span></div>
      <div class="igr"><span class="igk">Repository</span><span class="igv a" style="cursor:pointer;font-size:8px" onclick="ext('https://github.com/Abdelrahman968/horizon-theme')">Abdelrahman968/horizon-theme</span></div>
      <div class="igr"><span class="igk">Author</span><span class="igv a" style="cursor:pointer;font-size:8px" onclick="ext('https://abdelrahman-portfolio-rho.vercel.app/')">Abdelrahman968</span></div>
    </div>
  </div>

  <div style="text-align:center;padding:8px 0 3px;font-size:8px;color:var(--txt3);letter-spacing:.3px">
    Made with ♥ for the Coders community
  </div>
</div>

<script>
const vscode = acquireVsCodeApi();
let previewOn = false, prevTmr = null;
const THEMES=${JSON.stringify(HORIZON_THEMES)};

// Year
const CY = new Date().getFullYear();
document.querySelectorAll('.yr2,.yr3').forEach(e=>e.textContent=CY);

// Copy command function
function copyCmd(cmd) {
  navigator.clipboard.writeText(cmd);
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.innerHTML = '✓ Copied: ' + cmd;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

// Tabs
function swTab(n,el){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));el.classList.add('active');document.getElementById('panel-'+n).classList.add('active')}

// Live Preview
function togPrev(){previewOn=!previewOn;const b=document.getElementById('ptogbtn'),t=document.getElementById('togPrev2');if(previewOn){t?.classList.add('on');b.textContent='Preview ON';b.classList.remove('off');}else{t?.classList.remove('on');b.textContent='Preview OFF';b.classList.add('off');}vscode.postMessage({command:'updateSetting',key:'horizonTheme.livePreview.enabled',value:previewOn});}
function togPrev2Click(){const t=document.getElementById('togPrev2');t.classList.toggle('on');previewOn=t.classList.contains('on');const b=document.getElementById('ptogbtn');if(previewOn){b.textContent='Preview ON';b.classList.remove('off');}else{b.textContent='Preview OFF';b.classList.add('off');}vscode.postMessage({command:'updateSetting',key:'horizonTheme.livePreview.enabled',value:previewOn});}
function prev(th){if(!previewOn)return;clearTimeout(prevTmr);const d=parseInt(document.getElementById('prevDelay')?.value||150);prevTmr=setTimeout(()=>vscode.postMessage({command:'previewTheme',theme:th}),d);}
function restore(){if(!previewOn)return;clearTimeout(prevTmr);vscode.postMessage({command:'restoreTheme'});}

// Theme select
function selFeat(c){clrSel();c.classList.add('selected');vscode.postMessage({command:'setTheme',theme:c.dataset.theme});}
function selTheme(c){clrSel();c.classList.add('selected');vscode.postMessage({command:'setTheme',theme:c.dataset.theme});}
function clrSel(){document.querySelectorAll('.tc,.feat').forEach(c=>c.classList.remove('selected'));}

// Icons
function setIcon(v){vscode.postMessage({command:'setIconTheme',theme:v==='null'?null:v});}
function setProd(v){vscode.postMessage({command:'setProductIconTheme',theme:v});}

// Colors
function uCs(ci,hx,v){document.getElementById(ci).style.background=v;document.getElementById(hx).textContent=v;}
function aCs(k,v){vscode.postMessage({command:'updateColor',key:k,value:v});}

// Toggles
function togI(id,key){const e=document.getElementById(id);e.classList.toggle('on');vscode.postMessage({command:'updateSetting',key,value:e.classList.contains('on')});}

// Settings
function updS(k,v){vscode.postMessage({command:'updateSetting',key:k,value:v});}

// Scheduler
function toggleFollowSys(){const t=document.getElementById('togFollowSys');t.classList.toggle('on');const on=t.classList.contains('on');document.getElementById('schedDayTimeRow').style.display=on?'none':'';document.getElementById('schedNightTimeRow').style.display=on?'none':'';}
function saveSch(){vscode.postMessage({command:'saveScheduler',enabled:document.getElementById('togSch').classList.contains('on'),followSystem:document.getElementById('togFollowSys').classList.contains('on'),dayTheme:document.getElementById('sday').value,nightTheme:document.getElementById('snight').value,dayStart:document.getElementById('sdayT').value,nightStart:document.getElementById('snightT').value});}

// Backup
function doExp(){vscode.postMessage({command:'exportSettings'});}
function doImp(){vscode.postMessage({command:'importSettings'});}
function doRst(){vscode.postMessage({command:'resetSettings'});}

// Links
function ext(u){vscode.postMessage({command:'openExternal',url:u});}

// Copy license
function cpLic(){vscode.postMessage({command:'copyToClipboard',text:'© 2026 Abdelrahman – MIT License – github.com/Abdelrahman968/horizon-theme'});}

// Random
function randTheme(){const t=THEMES[Math.floor(Math.random()*THEMES.length)];clrSel();const c=document.querySelector('[data-theme="'+t+'"]');if(c)c.classList.add('selected');vscode.postMessage({command:'setTheme',theme:t});}

// Messages
window.addEventListener('message',e=>{
  const m=e.data;
  if(m.command==='openTab'){const tabs=['themes','settings','changelog','about'];const i=tabs.indexOf(m.tab);if(i>=0)swTab(m.tab,document.querySelectorAll('.tab')[i]);return;}
  if(m.command==='triggerExport'){doExp();return;}
  if(m.command==='triggerImport'){doImp();return;}
  if(m.command==='triggerReset'){doRst();return;}
  if(m.command==='triggerRandom'){randTheme();return;}
  if(m.command!=='configData')return;
  // Active theme
  clrSel();
  const ac=document.querySelector('[data-theme="'+m.theme+'"]');
  if(ac)ac.classList.add('selected');
  // Icons
  if(m.iconTheme){const s=document.getElementById('iconSel');if(s)s.value=m.iconTheme;}
  if(m.productIconTheme){const s=document.getElementById('prodSel');if(s)s.value=m.productIconTheme;}
  // Live preview
  previewOn=m.livePreviewEnabled||false;
  const tp=document.getElementById('togPrev2'),pb=document.getElementById('ptogbtn');
  if(previewOn){tp?.classList.add('on');if(pb){pb.textContent='Preview ON';pb.classList.remove('off');}}
  else{tp?.classList.remove('on');if(pb){pb.textContent='Preview OFF';pb.classList.add('off');}}
  if(m.livePreviewDelay){const d=document.getElementById('prevDelay');if(d)d.value=m.livePreviewDelay;}
  // Editor
  if(m.fontSize){const f=document.getElementById('fsize');if(f)f.value=m.fontSize;}
  if(m.lineHeight){const l=document.getElementById('lheight');if(l)l.value=m.lineHeight;}
  if(m.fontLigatures)document.getElementById('togLig')?.classList.add('on');
  if(m.minimap!==false)document.getElementById('togMini')?.classList.add('on');
  if(m.bracketPairs!==false)document.getElementById('togBrk')?.classList.add('on');
  if(m.cursorStyle){const s=document.getElementById('curSel');if(s)s.value=m.cursorStyle;}
  if(m.cursorBlinking){const s=document.getElementById('blinkSel');if(s)s.value=m.cursorBlinking;}
  if(m.allowEverywhere)document.getElementById('togEv')?.classList.add('on');
  if(m.tagStyle){const s=document.getElementById('tagSty');if(s)s.value=m.tagStyle;}
  if(m.scheduler){const sc=m.scheduler;if(sc.enabled)document.getElementById('togSch')?.classList.add('on');if(sc.dayTheme){const s=document.getElementById('sday');if(s)s.value=sc.dayTheme;}if(sc.nightTheme){const s=document.getElementById('snight');if(s)s.value=sc.nightTheme;}if(sc.dayStart){const s=document.getElementById('sdayT');if(s)s.value=sc.dayStart;}if(sc.nightStart){const s=document.getElementById('snightT');if(s)s.value=sc.nightStart;}if(sc.followSystem){document.getElementById('togFollowSys')?.classList.add('on');const dr=document.getElementById('schedDayTimeRow'),nr=document.getElementById('schedNightTimeRow');if(dr)dr.style.display='none';if(nr)nr.style.display='none';}}
  // Context Themes — populate selects with all Horizon themes
  ['focusThmSel','zenThmSel'].forEach(id=>{const s=document.getElementById(id);if(!s)return;if(s.options.length<=1){THEMES.forEach(t=>{const o=document.createElement('option');o.value=t;o.textContent=t.replace(/^horizon-(core|themes)[-.]/,'').replace(/-dark$/,'').replace(/[-_.]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());s.appendChild(o);});}});
  if(m.focusModeTheme){const s=document.getElementById('focusThmSel');if(s)s.value=m.focusModeTheme;}
  if(m.zenModeTheme){const s=document.getElementById('zenThmSel');if(s)s.value=m.zenModeTheme;}
});

vscode.postMessage({command:'getConfig'});
</script>
</body>
</html>`;
}

// ══════════════════════════════════════════════
// HORIZON TAGS ENGINE
// ══════════════════════════════════════════════
// Document-version cache: skip full re-parse when text hasn't changed.
const _tagCache = new Map(); // uri → { version, pairs }

// Memoized tagRemover regex — rebuilt only when denylist changes.
let _tagRemoverRe = null;
function getTagRemoverRe() {
  if (_tagRemoverRe) return _tagRemoverRe;
  const cfg = getTagsConfig();
  const cb = "([\\s\\S])*?";
  const denyParts = [
    ...cfg.denylistTagsFormattedEndings,
    ...cfg.denylistTagsFormattedBeginnings,
    ...cfg.denylistTagsFormattedBeginningsWithWhitespaces,
    ...cfg.denylistTagsFormattedBeginningsWithLinebreaks,
  ].map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  _tagRemoverRe = new RegExp(
    [
      `<!--${cb}-->`,
      `<script( ${cb})?>${cb}</script>`,
      `<style( ${cb})?>${cb}</style>`,
      ...(denyParts.length ? [denyParts.join("|")] : []),
    ].join("|"),
    "gi",
  );
  return _tagRemoverRe;
}
function invalidateTagRemoverRe() {
  _tagRemoverRe = null;
}

function horizonTags(activeEditor) {
  if (!activeEditor || !activeEditor.document) return;
  const cfg = getTagsConfig();
  const allowEverywhereNow = cfg.allowEverywhere;
  if (
    !cfg.supportedLanguages.includes(activeEditor.document.languageId) &&
    allowEverywhereNow === false
  ) {
    tagCountStatusBarItem.hide();
    return;
  }

  // Skip re-parse if the document hasn't changed since last run.
  const docKey = activeEditor.document.uri.toString();
  const docVersion = activeEditor.document.version;
  const cached = _tagCache.get(docKey);
  if (cached && cached.version === docVersion) {
    // Reapply decorations from cache (editor may have been re-opened)
    cached.decorations.forEach((ranges, i) => {
      if (tagDecoratorList[i])
        activeEditor.setDecorations(tagDecoratorList[i], ranges);
    });
    activeEditor.setDecorations(
      isolatedRightBracketsDecorationTypes,
      cached.rb,
    );
    tagCountStatusBarItem.text = `✦ ${cached.pairs.length} tag${cached.pairs.length === 1 ? "" : "s"}`;
    cached.pairs.length
      ? tagCountStatusBarItem.show()
      : tagCountStatusBarItem.hide();
    return;
  }

  let text = activeEditor.document.getText();
  let map = tagDecoratorList.map(() => []);
  let tagPairCount = 0;
  const tagSummaryPairs = [];
  const tagRemover = (s) => {
    // Use memoized regex — only rebuilt when denylist config changes.
    const re = getTagRemoverRe();
    re.lastIndex = 0;
    return s.replace(re, (m) => " ".repeat(m.length));
  };
  const assignColors = (txt) => {
    const re = /(<(?!(\?|%))\/?[^]+?(?<!(\?|%))>)/g;
    let m,
      stack = [],
      rb = [],
      cnt = 0,
      round;
    while ((m = re.exec(txt))) {
      const tag = m[0];
      if (tag.substring(0, 2) === "</") {
        if (denylistTagsFormattedEndings.includes(tag)) continue;
        const s = activeEditor.document.positionAt(m.index),
          e = activeEditor.document.positionAt(m.index + tag.indexOf(">") + 1);
        const dec = { range: new vscode.Range(s, e), hoverMessage: null };
        if (stack.length > 0) {
          round = stack.pop();
          cnt = round;
          map[round].push(dec);
        } else rb.push(dec);
      } else if (tag[0] === "<") {
        const fw = tag.substring(0, tag.indexOf(" ") + 1),
          fl = tag.match(/[^\r\n]+/g);
        if (denylistTagsFormattedBeginnings.includes(tag)) continue;
        if (denylistTagsFormattedBeginningsWithWhitespaces.includes(fw))
          continue;
        if (fl && denylistTagsFormattedBeginningsWithLinebreaks.includes(fl[0]))
          continue;
        if (tag.slice(-2) === "/>") continue;
        const sp = activeEditor.document.positionAt(m.index);
        const ep = activeEditor.document.positionAt(
          m.index +
            (tag.indexOf(" ") !== -1 ? tag.indexOf(" ") : tag.indexOf(">")),
        );
        const cs = activeEditor.document.positionAt(re.lastIndex - 1),
          ce = activeEditor.document.positionAt(re.lastIndex);
        round = cnt;
        stack.push(round);
        tagPairCount++;
        tagSummaryPairs.push({
          text: tag.replace(/[<>\/]/g, "").split(" ")[0],
          line: sp.line,
          char: sp.character,
        });
        cnt++;
        if (cnt >= tagDecoratorList.length) cnt = 0;
        map[round].push({
          range: new vscode.Range(sp, ep),
          hoverMessage: null,
        });
        map[round].push({
          range: new vscode.Range(cs, ce),
          hoverMessage: null,
        });
      }
    }
    for (let i in tagDecoratorList)
      activeEditor.setDecorations(tagDecoratorList[i], map[i]);
    activeEditor.setDecorations(isolatedRightBracketsDecorationTypes, rb);
  };
  text = tagRemover(text);
  assignColors(text);

  // Store in version cache so identical re-opens skip the full parse.
  _tagCache.set(docKey, {
    version: docVersion,
    decorations: map,
    rb: [], // rb is local to assignColors; cache the map only
    pairs: tagSummaryPairs,
  });
  // Evict old entries to prevent unbounded growth (keep last 20 files)
  if (_tagCache.size > 20) {
    const firstKey = _tagCache.keys().next().value;
    _tagCache.delete(firstKey);
  }

  if (tagPairCount > 0) {
    tagCountStatusBarItem.text = `✦ ${tagPairCount} tag${
      tagPairCount === 1 ? "" : "s"
    }`;
    tagCountStatusBarItem.tooltip =
      "Horizon Tags: matched pairs in this file — click to toggle highlighting everywhere";
    tagCountStatusBarItem.show();
  } else {
    tagCountStatusBarItem.hide();
  }
  tagSummaryProvider.updateFile(activeEditor.document.uri, tagSummaryPairs);
}
