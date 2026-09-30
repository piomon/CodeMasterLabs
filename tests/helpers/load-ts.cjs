const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript');
const root = path.resolve(__dirname, '../..');
/** Executes real project TS. Only explicitly supplied external boundaries are replaced. */
function loader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    let file = path.resolve(root, relative);
    if (!fs.existsSync(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const m = new Module(file, module);
    cache.set(file, m); m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file));
    const original = m.require.bind(m);
    m.require = name => Object.hasOwn(overrides, name) ? overrides[name] : name.startsWith('@/') ? load('src/' + name.slice(2)) : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : original(name);
    m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, file);
    return m.exports;
  }
  return load;
}
module.exports = { loader, root };
