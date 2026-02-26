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
Q(k, { deactivate: () => _, activate: () => Z });
module.exports = M(k);
var m = require('node:fs'),
  t = require('vscode');
var U = f => {
    let T = [f];
    for (let r of f.match(/.\?/g))
      T = T.flatMap(o => [o.replace(r, ''), o.replace(r[1], '')]);
    return T;
  },
  y = f => {
    let T = [f];
    return (
      f.match(/\(.+?\)/g)?.forEach(r => {
        T = r
          .slice(1, -1)
          .split('|')
          .flatMap(o => T.map(E => E.replace(r, o)));
      }),
      T.flatMap(r => (r.includes('?') ? U(r) : r))
    );
  };
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
var R = require('node:process'),
  Y = f => {
    let T = JSON.stringify(f),
      r = t.extensions.getExtension('horizon.horizon-theme').extensionPath;
    if ((R.chdir(r), m.existsSync('custom.json'))) {
      if (T === m.readFileSync('custom.json', 'utf8')) return;
    } else m.copyFileSync('icon-theme.json', 'icon-theme.json.bk');
    let o = JSON.parse(m.readFileSync('icon-theme.json.bk', 'utf8')),
      E = Object.values(o.iconDefinitions).map(I => I.iconPath);
    (O(
      o,
      f,
      (I, N) => E.indexOf(`i/${N}.svg`),
      I => I.toString()
    ),
      m.writeFileSync('custom.json', JSON.stringify(f)),
      m.writeFileSync('icon-theme.json', JSON.stringify(o)));
  },
  Z = () => {
    let T = t.workspace.getConfiguration('horizonTheme').customIconAssociations;
    if (T?.constructor === Object && Object.keys(T).length !== 0)
      try {
        Y(T);
      } catch (r) {
        t.window.showErrorMessage(r.message);
      }
  },
  _ = () => {};
