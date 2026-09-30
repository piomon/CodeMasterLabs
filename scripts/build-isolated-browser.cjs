const fs = require('node:fs'), path = require('node:path');
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript');
const out = path.resolve(process.argv[2] || '.test-browser-fixture');
fs.mkdirSync(out, { recursive: true });
for (const name of ['turnstile-client', 'civil-date', 'showcase-validation', 'reliable-submission']) {
  const source = fs.readFileSync(path.resolve('src/lib/' + name + '.ts'), 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, strict: true } }).outputText;
  fs.writeFileSync(path.join(out, name + '.js'), result.replace(/from '(\.\/[^']+)'/g, "from '$1.js'"));
}
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated client contract fixture - NOT the CodeMaster application</title><body><h1>Isolated browser test fixture</h1><button id="trigger">Send enquiry</button><script nonce="local-test-nonce" type="module">import * as client from './turnstile-client.js';import * as dates from './civil-date.js';window.client=client;window.dates=dates;window.fixtureReady=true;</script></body></html>`);
console.log(out);

// Browser policy in some CI sandboxes forbids all URL navigation. This equivalent
// CommonJS wrapper runs the unmodified TS function bodies in about:blank, without
// changing browser policy or mocking DOM/crypto. It is NOT a framework build.
const bundles = ['turnstile-client','civil-date'].map((name,index) => {
 const text=fs.readFileSync(path.resolve('src/lib/'+name+'.ts'),'utf8');
 const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 return `window.${index===0?'client':'dates'}=(()=>{const m={exports:{}};((exports,module)=>{${js}})(m.exports,m);return m.exports})();`;
}).join('\n');
fs.writeFileSync(path.join(out,'fixture.js'),bundles+'\nwindow.fixtureReady=true;');
