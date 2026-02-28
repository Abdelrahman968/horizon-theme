var {
    defineProperty: $,
    getOwnPropertyNames: J,
    getOwnPropertyDescriptor: K,
  } = Object,
  L = Object.prototype.hasOwnProperty;
var h = new WeakMap(),
  M = f => {
    var T = h.get(f),
      r;
    if (T) return T;
    if (
      ((T = $({}, '__esModule', { value: !0 })),
      (f && typeof f === 'object') || typeof f === 'function')
    )
      J(f).map(
        o =>
          !L.call(T, o) &&
          $(T, o, {
            get: () => f[o],
            enumerable: !(r = K(f, o)) || r.enumerable,
          })
      );
    return (h.set(f, T), T);
  };
var Q = (f, T) => {
  for (var r in T)
    $(f, r, {
      get: T[r],
      enumerable: !0,
      configurable: !0,
      set: o => (T[r] = () => o),
    });
};
var k = {};
Q(k, { deactivate: () => deactivate, activate: () => activate });
module.exports = M(k);

var fs = require('node:fs'),
  process = require('node:process'),
  vscode = require('vscode');

// ---------- Horizon Icons & Theme ----------

var W = {
    '/': [
      ['folderNames', 'folderNamesExpanded'],
      ['Folder', 'FolderX'],
    ],
    '*.': [['fileExtensions']],
    '': [['fileNames']],
  },
  O = (f, T, r, o) => {
    for (let [E, I] of Object.entries(T)) {
      if (I?.constructor !== Array)
        throw Error(`The icon association for '${E}' is not an array.`);
      for (let N of I) {
        let [, X = '', z] = /^(\/|\*\.)?(.+)/.exec(N),
          [A, B = ['']] = W[X];
        A.forEach((G, D) => {
          let b = o(r(f, E + B[D]));
          if (b === o(-1))
            throw (
              (G = G === 'folderNames' ? 'folder' : 'file'),
              Error(`The ${G} icon '${E}' doesn't exist.`)
            );
          for (let H of y(z)) f[G][H] = b;
        });
      }
    }
  };

var y = f => {
  let T = [f];
  f.match(/\(.+?\)/g)?.forEach(r => {
    T = r
      .slice(1, -1)
      .split('|')
      .flatMap(o => T.map(E => E.replace(r, o)));
  });
  return T.flatMap(r => (r.includes('?') ? U(r) : r));
};

var U = f => {
  let T = [f];
  for (let r of f.match(/.\?/g))
    T = T.flatMap(o => [o.replace(r, ''), o.replace(r[1], '')]);
  return T;
};

var applyHorizonIcons = f => {
  let T = JSON.stringify(f),
    r = vscode.extensions.getExtension('horizon.horizon-theme').extensionPath;
  process.chdir(r);
  if (fs.existsSync('custom.json')) {
    if (T === fs.readFileSync('custom.json', 'utf8')) return;
  } else fs.copyFileSync('icon-theme.json', 'icon-theme.json.bk');
  let o = JSON.parse(fs.readFileSync('icon-theme.json.bk', 'utf8')),
    E = Object.values(o.iconDefinitions).map(I => I.iconPath);
  O(
    o,
    f,
    (I, N) => E.indexOf(`i/${N}.svg`),
    I => I.toString()
  );
  fs.writeFileSync('custom.json', JSON.stringify(f));
  fs.writeFileSync('icon-theme.json', JSON.stringify(o));
};

// ---------- HorizonTags (Rainbow Tags) Configuration ----------

/**
 * List of supported language IDs
 * @type {string[]}
 */
const supportedLanguages = vscode.workspace
  .getConfiguration('horizonTags')
  .get('supportedLanguages');

/**
 * List of denylisted tags
 * @type {string[]}
 */
const denylistTags = vscode.workspace
  .getConfiguration('horizonTags')
  .get('denylistTags');

/**
 * Allow highlighting everywhere regardless of language
 * @type {boolean}
 */
const allowEverywhere = vscode.workspace
  .getConfiguration('horizonTags')
  .get('allowEverywhere');

/**
 * User-defined color array from settings
 * @type {string[]}
 */
const tagColorList = vscode.workspace
  .getConfiguration('horizonTags')
  .get('colors');

/**
 * Highlight style: 'color', 'background-color', or 'border'
 * @type {string}
 */
const colorStyle = vscode.workspace
  .getConfiguration('horizonTags')
  .get('hightlightType');

// Pre-format denylist tag patterns
const denylistTagsFormattedEndings = denylistTags.map(tag => '</' + tag + '>');
const denylistTagsFormattedBeginnings = denylistTags.map(tag => '<' + tag + '>');
const denylistTagsFormattedBeginningsWithWhitespaces = denylistTags.map(tag => '<' + tag + ' ');
const denylistTagsFormattedBeginningsWithLinebreaks = denylistTags.map(tag => '<' + tag);

/**
 * Decoration type for wrongly placed / isolated closing brackets
 * @type {vscode.TextEditorDecorationType}
 */
const isolatedRightBracketsDecorationTypes =
  vscode.window.createTextEditorDecorationType({ color: '#e2041b' });

/**
 * List of color decorator types, populated on activate
 * @type {vscode.TextEditorDecorationType[]}
 */
const tagDecoratorList = [];

// ---------- Helper: check current language ----------

function isLanguageUsed(activeEditor, id) {
  return (
    activeEditor &&
    activeEditor.document &&
    activeEditor.document.languageId === id &&
    supportedLanguages.includes(id)
  );
}

// ---------- Activate ----------

/**
 * Activates the extension
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // -------- Set Horizon theme & icons as default ----------
  vscode.workspace
    .getConfiguration()
    .update(
      'workbench.colorTheme',
      'horizon-core.deep-blue',
      vscode.ConfigurationTarget.Global
    );
  vscode.workspace
    .getConfiguration()
    .update(
      'workbench.iconTheme',
      'Horizon Icons',
      vscode.ConfigurationTarget.Global
    );

  // -------- HorizonTags: register command ----------
  const registerExtensionCommand = vscode.commands.registerCommand(
    'extension.horizonTags',
    () => {
      horizonTags(vscode.window.activeTextEditor);
    }
  );
  context.subscriptions.push(registerExtensionCommand);

  // -------- HorizonTags: reload on color config change ----------
  vscode.workspace.onDidChangeConfiguration(() => {
    const newColors = vscode.workspace
      .getConfiguration('horizonTags')
      .get('colors');
    if (
      !(
        tagColorList.length === newColors.length &&
        tagColorList.every((v, i) => v === newColors[i])
      )
    ) {
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  });

  // -------- HorizonTags: build decorator list ----------
  tagDecoratorList.length = 0;
  for (let colorIndex in tagColorList) {
    let stylePair;
    switch (colorStyle) {
      case 'background-color':
        stylePair = { backgroundColor: tagColorList[colorIndex] };
        break;
      case 'border':
        stylePair = { border: '1px solid ' + tagColorList[colorIndex] };
        break;
      default:
        stylePair = { color: tagColorList[colorIndex] };
        break;
    }
    tagDecoratorList.push(
      vscode.window.createTextEditorDecorationType(stylePair)
    );
  }

  // -------- HorizonTags: run on load ----------
  horizonTags(vscode.window.activeTextEditor);

  // -------- HorizonTags: event subscriptions ----------
  vscode.workspace.onDidOpenTextDocument(
    editor => horizonTags(editor),
    null,
    context.subscriptions
  );

  vscode.window.onDidChangeActiveTextEditor(
    editor => horizonTags(editor),
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    function (event) {
      let activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && event.document === activeEditor.document) {
        horizonTags(activeEditor);
      }
    },
    null,
    context.subscriptions
  );

  // -------- Apply Horizon Icons custom associations ----------
  const customIcons =
    vscode.workspace.getConfiguration('horizonTheme').customIconAssociations;
  if (customIcons?.constructor === Object && Object.keys(customIcons).length !== 0) {
    try {
      applyHorizonIcons(customIcons);
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }
}

// ---------- Deactivate ----------

/**
 * Deactivates the extension
 */
function deactivate() {}

module.exports = { activate, deactivate };

// ---------- HorizonTags main function ----------

/**
 * Does the actual coloring of tags
 * @param {vscode.TextEditor} activeEditor - The current editor opened in VSCode
 */
function horizonTags(activeEditor) {
  // Guard: no editor or document
  if (!activeEditor || !activeEditor.document) return;

  // Guard: unsupported language
  if (
    !supportedLanguages.includes(activeEditor.document.languageId) &&
    allowEverywhere === false
  )
    return;

  // ---- Get document text ----
  let text = activeEditor.document.getText();

  // ---- Initialize decoration map (one empty array per color) ----
  let divsDecorationTypeMap = tagDecoratorList.map(() => []);

  // ---- Tag Remover: strips comments, scripts, vue interpolations ----
  const tagRemover = inputString => {
    let matchTag;
    const charactersBetweenTags = '([\\s\\S])*?';
    const regEx = new RegExp(
      [
        `<!--${charactersBetweenTags}-->`,
        `<script( ${charactersBetweenTags})?>${charactersBetweenTags}</script>`,
        ...(isLanguageUsed(activeEditor, 'vue')
          ? [`{{${charactersBetweenTags}}}`, `="${charactersBetweenTags}"`]
          : []),
      ].join('|'),
      'gm'
    );
    while ((matchTag = regEx.exec(inputString))) {
      let matchLen = matchTag[0].length;
      inputString =
        inputString.substring(0, matchTag.index) +
        ' '.repeat(matchLen) +
        inputString.substring(matchTag.index + matchLen);
    }
    return inputString;
  };

  // ---- Assign colors to tags ----
  const assignTagColors = inputText => {
    // Regex: matches all HTML/XML tags, ignoring PHP <?...?> and EJS <%...%>
    const regExTags = /(<(?!(\?|%))\/?[^]+?(?<!(\?|%))>)/g;

    let matchTags;
    const openDivStack = [];
    const rightBracketsDecorationTypes = [];
    let divsColorCount = 0;
    let roundCalculate;

    while ((matchTags = regExTags.exec(inputText))) {
      const tag = matchTags[0];

      // --- Closing tag ---
      if (tag.substring(0, 2) === '</') {
        if (denylistTagsFormattedEndings.includes(tag)) continue;

        const startPos = activeEditor.document.positionAt(matchTags.index);
        const endPos = activeEditor.document.positionAt(
          matchTags.index + tag.indexOf('>') + 1
        );
        const decoration = {
          range: new vscode.Range(startPos, endPos),
          hoverMessage: null,
        };

        if (openDivStack.length > 0) {
          roundCalculate = openDivStack.pop();
          divsColorCount = roundCalculate;
          divsDecorationTypeMap[roundCalculate].push(decoration);
        } else {
          rightBracketsDecorationTypes.push(decoration);
        }
      }

      // --- Opening tag ---
      else if (tag.substring(0, 1) === '<') {
        const matchAgainstDenylist = tag;
        const matchAgainstDenylistFirstWhitespace = tag.substring(
          0,
          tag.indexOf(' ') + 1
        );
        const matchAgainstDenylistFirstLinebreak = tag.match(/[^\r\n]+/g);

        // Denylist checks
        if (denylistTagsFormattedBeginnings.includes(matchAgainstDenylist)) continue;
        if (denylistTagsFormattedBeginningsWithWhitespaces.includes(matchAgainstDenylistFirstWhitespace)) continue;
        if (
          matchAgainstDenylistFirstLinebreak &&
          denylistTagsFormattedBeginningsWithLinebreaks.includes(
            matchAgainstDenylistFirstLinebreak[0]
          )
        ) continue;

        // Skip self-closing tags
        if (tag.slice(-2) === '/>') continue;

        // Calculate opening tag highlight range
        const startPosOpening = activeEditor.document.positionAt(matchTags.index);
        let endPosOpening;
        if (tag.indexOf(' ') !== -1) {
          // Has attributes: highlight up to first space
          endPosOpening = activeEditor.document.positionAt(
            matchTags.index + tag.indexOf(' ')
          );
        } else {
          // No attributes: highlight up to closing '>'
          endPosOpening = activeEditor.document.positionAt(
            matchTags.index + tag.indexOf('>')
          );
        }

        // Closing bracket '>' of the opening tag
        const closeTagStartPos = activeEditor.document.positionAt(
          regExTags.lastIndex - 1
        );
        const closeTagEndPos = activeEditor.document.positionAt(
          regExTags.lastIndex
        );

        const decorationOpening = {
          range: new vscode.Range(startPosOpening, endPosOpening),
          hoverMessage: null,
        };
        const closeTagDecoration = {
          range: new vscode.Range(closeTagStartPos, closeTagEndPos),
          hoverMessage: null,
        };

        roundCalculate = divsColorCount;
        openDivStack.push(roundCalculate);
        divsColorCount++;
        if (divsColorCount >= tagDecoratorList.length) divsColorCount = 0;

        divsDecorationTypeMap[roundCalculate].push(decorationOpening);
        divsDecorationTypeMap[roundCalculate].push(closeTagDecoration);
      }
    }

    // Apply decorations for all colors
    for (let tagDecorator in tagDecoratorList) {
      activeEditor.setDecorations(
        tagDecoratorList[tagDecorator],
        divsDecorationTypeMap[tagDecorator]
      );
    }

    // Apply decoration for isolated/unmatched closing brackets
    activeEditor.setDecorations(
      isolatedRightBracketsDecorationTypes,
      rightBracketsDecorationTypes
    );
  };

  // ---- Run ----
  text = tagRemover(text);
  assignTagColors(text);
}