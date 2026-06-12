var {
    defineProperty: $,
    getOwnPropertyNames: J,
    getOwnPropertyDescriptor: K,
  } = Object,
  L = Object.prototype.hasOwnProperty;
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
const EXTENSION_VERSION = "3.6.1";
const EXTENSION_ID = "horizon-core.horizon-theme";

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
    iconUri = vscode.Uri.joinPath(base, "icon-theme.json"),
    bkUri = vscode.Uri.joinPath(base, "icon-theme.json.bk");

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
  let o = JSON.parse(td.decode(await vscode.workspace.fs.readFile(bkUri))),
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
// HORIZON TAGS CONFIG
// ══════════════════════════════════════════════
const supportedLanguages = vscode.workspace
  .getConfiguration("horizonTags")
  .get("supportedLanguages");
const denylistTags = vscode.workspace
  .getConfiguration("horizonTags")
  .get("denylistTags");
const allowEverywhere = vscode.workspace
  .getConfiguration("horizonTags")
  .get("allowEverywhere");
const tagColorList = vscode.workspace
  .getConfiguration("horizonTags")
  .get("colors");
const colorStyle = vscode.workspace
  .getConfiguration("horizonTags")
  .get("hightlightType");

const denylistTagsFormattedEndings = denylistTags.map((t) => `</${t}>`);
const denylistTagsFormattedBeginnings = denylistTags.map((t) => `<${t}>`);
const denylistTagsFormattedBeginningsWithWhitespaces = denylistTags.map(
  (t) => `<${t} `,
);
const denylistTagsFormattedBeginningsWithLinebreaks = denylistTags.map(
  (t) => `<${t}`,
);

const isolatedRightBracketsDecorationTypes =
  vscode.window.createTextEditorDecorationType({ color: "#e2041b" });
const tagDecoratorList = [];

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
  const check = () => {
    const c = vscode.workspace.getConfiguration("horizonTheme");
    if (!c.get("scheduler.enabled")) return;
    const dt = c.get("scheduler.dayTheme"),
      nt = c.get("scheduler.nightTheme");
    if (!dt || !nt) return;
    const now = new Date(),
      mm = now.getHours() * 60 + now.getMinutes();
    const [dh, dm] = (c.get("scheduler.dayStart") || "08:00")
      .split(":")
      .map(Number);
    const [nh, nm] = (c.get("scheduler.nightStart") || "20:00")
      .split(":")
      .map(Number);
    const target = mm >= dh * 60 + dm && mm < nh * 60 + nm ? dt : nt;
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
  check();
  schedulerInterval = setInterval(check, 60000);
  context.subscriptions.push({
    dispose: () => clearInterval(schedulerInterval),
  });
}

// ══════════════════════════════════════════════
// WHAT'S NEW
// ══════════════════════════════════════════════
async function checkWhatsNew(context) {
  const last = context.globalState.get("horizonLastVersion");
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
      dayTheme: hc.get("scheduler.dayTheme") || "horizon-core.modern-light",
      nightTheme: hc.get("scheduler.nightTheme") || "horizon-core.deep-blue",
      dayStart: hc.get("scheduler.dayStart") || "08:00",
      nightStart: hc.get("scheduler.nightStart") || "20:00",
    },
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
            const data = JSON.parse(
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
function activate(context) {
  const wc = vscode.workspace.getConfiguration();
  const cur = wc.get("workbench.colorTheme");
  if (!cur || cur === "Default Dark+" || cur === "Default Dark Modern") {
    wc.update(
      "workbench.colorTheme",
      "horizon-core.deep-blue",
      vscode.ConfigurationTarget.Global,
    );
    wc.update(
      "workbench.iconTheme",
      "Horizon Icons",
      vscode.ConfigurationTarget.Global,
    );
  }

  checkWhatsNew(context);

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
    "horizonTheme.exportSettings": () =>
      globalProvider?._view?.webview.postMessage({ command: "triggerExport" }),
    "horizonTheme.importSettings": () =>
      globalProvider?._view?.webview.postMessage({ command: "triggerImport" }),
    "horizonTheme.resetSettings": () =>
      globalProvider?._view?.webview.postMessage({ command: "triggerReset" }),
    "horizonTheme.randomTheme": () =>
      globalProvider?._view?.webview.postMessage({ command: "triggerRandom" }),
  };
  for (const [id, fn] of Object.entries(cmds))
    context.subscriptions.push(vscode.commands.registerCommand(id, fn));

  startScheduler(context);

  vscode.workspace.onDidChangeConfiguration(() => {
    const nc = vscode.workspace.getConfiguration("horizonTags").get("colors");
    if (
      !(
        tagColorList.length === nc.length &&
        tagColorList.every((v, i) => v === nc[i])
      )
    )
      vscode.commands.executeCommand("workbench.action.reloadWindow");
  });

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
  vscode.workspace.onDidChangeTextDocument(
    (e) => {
      const ae = vscode.window.activeTextEditor;
      if (ae && e.document === ae.document) horizonTags(ae);
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

/* TABS */
.tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--brd)}
.tab{padding:8px 2px;text-align:center;cursor:pointer;font-size:8px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--txt2);border-bottom:2px solid transparent;transition:all .15s;user-select:none}
.tab:hover{color:var(--a1);background:var(--g1)}.tab.active{color:var(--a1);border-bottom-color:var(--a1);background:var(--g1)}
.ti{font-size:11px;display:block;margin-bottom:2px}

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
    <span class="hb v">v3.6.1</span>
    <span class="hb l">MIT License</span>
    <span class="hb y">© 2026 Abdelrahman</span>
  </div>
</div>

<!-- TABS -->
<div class="tabs">
  <div class="tab active" onclick="swTab('themes',this)"><span class="ti">◈</span>Themes</div>
  <div class="tab" onclick="swTab('settings',this)"><span class="ti">⚙</span>Settings</div>
  <div class="tab" onclick="swTab('changelog',this)"><span class="ti">📋</span>Changes</div>
  <div class="tab" onclick="swTab('about',this)"><span class="ti">✦</span>About</div>
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
    <div class="sg">
      <div><div class="slb">☀ Day theme</div><select class="sel" id="sday"><option value="horizon-core.modern-light">Modern Light</option><option value="horizon-core.deep-blue">Deep Blue</option><option value="horizon-themes-ganyu-light">Ganyu Light</option><option value="horizon-themes-furina-light">Furina Light</option><option value="horizon-themes-robin-light">Robin Light</option></select></div>
      <div><div class="slb">🌙 Night theme</div><select class="sel" id="snight"><option value="horizon-core.deep-blue">Deep Blue</option><option value="horizon-core.dark-plus">Dark Plus</option><option value="horizon-themes-kafka-dark">Kafka</option><option value="horizon-themes-scaramouche-dark">Scaramouche</option><option value="horizon-themes-skirk-dark">Skirk</option></select></div>
      <div><div class="slb">☀ Day starts</div><input type="time" class="timp" id="sdayT" value="08:00"></div>
      <div><div class="slb">🌙 Night starts</div><input type="time" class="timp" id="snightT" value="20:00"></div>
    </div>
    <button class="btn bg" onclick="saveSch()">✦ Save Scheduler</button>
  </div>

  <div class="sec">
    <div class="st">📦 Backup &amp; Restore</div>
    <button class="btn bn" onclick="doExp()">↑ Export All Settings</button>
    <button class="btn bp" onclick="doImp()">↓ Import Settings</button>
    <button class="btn br" onclick="doRst()">↺ Reset to Defaults</button>
  </div>
</div>

<!-- ════ CHANGELOG ════ -->
<div class="panel" id="panel-changelog">
  <div class="sec">
    <div class="st">Release History</div>
    <div class="cli"><div class="clv"><span class="cvb">v3.6.1</span><span class="cvd">2026</span><span class="cvt cn">LATEST</span></div><ul class="cll"><li>Built-in Horizon Product Icons (no extension needed)</li><li>Activity Bar, terminal, git, notifications &amp; explorer icons styled for Horizon</li><li>Live Preview disabled by default — toggle in Settings tab or header button</li><li>Full editor appearance controls (font, cursor, minimap, ligatures)</li><li>Theme Scheduler with day/night auto-switch</li><li>Export/Import/Reset settings backup system</li><li>4-tab sidebar UI — Themes / Settings / Changes / About</li><li>Sandrone, Yae Miko, Wanderer, Ayaka, Chiori, Skirk themes</li></ul></div>
    <div class="cli"><div class="clv"><span class="cvb">v2.0.2</span><span class="cvd">2026</span><span class="cvt cm">UPDATE</span></div><ul class="cll"><li>Sidebar settings panel with Activity Bar integration</li><li>Theme Scheduler (auto day/night switching)</li><li>Export / Import settings as JSON</li><li>What's New notification on updates</li><li>Deep Blue promoted as recommended default</li></ul></div>
    <div class="cli"><div class="clv"><span class="cvb">v2.0.0</span><span class="cvd">2026</span><span class="cvt cs2">MAJOR</span></div><ul class="cll"><li>Full rewrite of extension architecture</li><li>HSR: Cyrene, March 7th added</li><li>Genshin: Citlali, Layla, Mizuki, Sandrone</li><li>HorizonTags merged into core extension</li><li>Horizon Icons v2 — 400+ new file icons</li><li>Light variants for all Hoyoverse themes</li></ul></div>
    <div class="cli"><div class="clv"><span class="cvb">v1.2.0</span><span class="cvd">2026</span><span class="cvt cn">NEW</span></div><ul class="cll"><li>Aventurine, Dan Heng, Yae Miko, Dottore</li><li>New Deep Blue core variant</li><li>Improved semantic token coloring</li></ul></div>
    <div class="cli"><div class="clv"><span class="cvb">v1.0.0</span><span class="cvd">2026</span><span class="cvt cm">INITIAL</span></div><ul class="cll"><li>Initial release: Kafka, Firefly, Robin, Ganyu, Furina</li><li>Columbina, Scaramouche, Ruan Mei, Core Dark Plus</li><li>Horizon Icons v1 · HorizonTags rainbow highlighting</li></ul></div>
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
      <div class="stat"><span class="sn">400+</span><span class="sl">Icons</span></div>
      <div class="stat"><span class="sn">3.6.1</span><span class="sl">Version</span></div>
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
      <div class="igr"><span class="igk">Version</span><span class="igv">3.6.1</span></div>
      <div class="igr"><span class="igk">License</span><span class="igv g">MIT</span></div>
      <div class="igr"><span class="igk">VS Code req.</span><span class="igv">^1.90.0</span></div>
      <div class="igr"><span class="igk">Language</span><span class="igv">JavaScript ES2022</span></div>
      <div class="igr"><span class="igk">Copyright</span><span class="igv">© 2026 Abdelrahman</span></div>
      <div class="igr"><span class="igk">Repository</span><span class="igv a" style="cursor:pointer;font-size:8px" onclick="ext('https://github.com/Abdelrahman968/horizon-theme')">Abdelrahman968/horizon-theme</span></div>
    </div>
  </div>

  <div style="text-align:center;padding:8px 0 3px;font-size:8px;color:var(--txt3);letter-spacing:.3px">
    Made with ♥ for the Coders community
  </div>
</div>

<script>
const vscode = acquireVsCodeApi();
let previewOn = false, prevTmr = null;
const THEMES=['horizon-core.deep-blue','horizon-core.dark-plus','horizon-core.modern-light','horizon-themes-ganyu-dark','horizon-themes-furina-dark','horizon-themes-scaramouche-dark','horizon-themes-columbina-dark','horizon-themes-citlali-dark','horizon-themes-skirk-dark','horizon-themes-wanderer-dark','horizon-themes-mizuki-dark','horizon-themes-sandrone-dark','horizon-themes-yaemiko-dark','horizon-themes-kafka-dark','horizon-themes-firefly-dark','horizon-themes-ruanmei-dark','horizon-themes-robin-dark','horizon-themes-aventurine-dark','horizon-themes-march7th-dark','horizon-themes-cyrene-dark','horizon-themes-danheng-dark'];

// Year
const CY = new Date().getFullYear();
document.getElementById('yr').textContent = CY;
document.querySelectorAll('.yr2,.yr3').forEach(e=>e.textContent=CY);

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
function saveSch(){vscode.postMessage({command:'saveScheduler',enabled:document.getElementById('togSch').classList.contains('on'),dayTheme:document.getElementById('sday').value,nightTheme:document.getElementById('snight').value,dayStart:document.getElementById('sdayT').value,nightStart:document.getElementById('snightT').value});}

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
  if(m.scheduler){const sc=m.scheduler;if(sc.enabled)document.getElementById('togSch')?.classList.add('on');if(sc.dayTheme){const s=document.getElementById('sday');if(s)s.value=sc.dayTheme;}if(sc.nightTheme){const s=document.getElementById('snight');if(s)s.value=sc.nightTheme;}if(sc.dayStart){const s=document.getElementById('sdayT');if(s)s.value=sc.dayStart;}if(sc.nightStart){const s=document.getElementById('snightT');if(s)s.value=sc.nightStart;}}
});

vscode.postMessage({command:'getConfig'});
</script>
</body>
</html>`;
}

// ══════════════════════════════════════════════
// HORIZON TAGS ENGINE
// ══════════════════════════════════════════════
function horizonTags(activeEditor) {
  if (!activeEditor || !activeEditor.document) return;
  if (
    !supportedLanguages.includes(activeEditor.document.languageId) &&
    allowEverywhere === false
  )
    return;
  let text = activeEditor.document.getText();
  let map = tagDecoratorList.map(() => []);
  const tagRemover = (s) => {
    let m;
    const cb = "([\\s\\S])*?";
    const re = new RegExp(
      [
        `<!--${cb}-->`,
        `<script( ${cb})?>${cb}</script>`,
        ...(isLanguageUsed(activeEditor, "vue")
          ? [`{{${cb}}}`, `="${cb}"`]
          : []),
      ].join("|"),
      "gm",
    );
    while ((m = re.exec(s))) {
      const n = m[0].length;
      s = s.substring(0, m.index) + " ".repeat(n) + s.substring(m.index + n);
    }
    return s;
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
}
