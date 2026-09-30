const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Readable } = require('node:stream');
const { DatabaseSync } = require('node:sqlite');
const { loader } = require('./helpers/load-ts.cjs');

// Real HTTP, multipart parsing, signed tokens, rate limiter and SQLite uniqueness.
// This deliberately small storage adapter IS NOT the Payload ORM or its ACL implementation.
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE docs (id INTEGER PRIMARY KEY, collection TEXT NOT NULL, receipt TEXT, body TEXT NOT NULL, UNIQUE(collection, receipt))');
const read = row => ({ ...JSON.parse(row.body), id: row.id });
const cms = {
  async create({ collection, data }) {
    const result = db.prepare('INSERT INTO docs(collection, receipt, body) VALUES(?,?,?)').run(collection, data.submissionKey || data.key || null, JSON.stringify(data));
    return { ...structuredClone(data), id: Number(result.lastInsertRowid) };
  },
  async find({ collection, where, page = 1, limit = 10, overrideAccess, draft }) {
    let docs = db.prepare('SELECT * FROM docs WHERE collection=? ORDER BY id DESC').all(collection).map(read);
    if (where?.submissionKey?.equals) docs = docs.filter(d => d.submissionKey === where.submissionKey.equals);
    // Model the public boundary for contract tests, not a substitute for real ACL tests.
    if (overrideAccess === false && !draft) docs = docs.filter(d => d._status === 'published');
    return { docs: docs.slice((page - 1) * limit, page * limit), totalDocs: docs.length, totalPages: Math.ceil(docs.length / limit) };
  },
  async findByID({ collection, id }) { const row = db.prepare('SELECT * FROM docs WHERE collection=? AND id=?').get(collection, id); if (!row) throw new Error('not found'); return read(row); },
};
const secret = 'LOCAL-TEST-ONLY-NOT-A-DEPLOYMENT-SECRET-'.repeat(2);
process.env.PAYLOAD_SECRET = secret;
process.env.TURNSTILE_SITE_KEY = 'test-double-key';
let scans = 0, proofs = 0, challengeOK = true;
const load = loader({
  '@/lib/site-data': { getCMS: async () => cms },
  '@/lib/turnstile': { verifyChallenge: async token => { proofs++; return challengeOK && token === 'provider-double-proof'; } },
  '@/lib/attachment-security': { inspectAttachment: async () => { scans++; return { mime: 'text/plain', extension: 'txt' }; } },
});
const routes = Object.fromEntries(['contact', 'reviews', 'submission-status', 'contact-token'].map(name => ['/api/' + name, load('src/app/api/' + name + '/route.ts')]));
const security = load('src/lib/form-security.ts');
const nativeFetch = global.fetch;
let origin, server;
const count = collection => db.prepare('SELECT count(*) AS n FROM docs WHERE collection=?').get(collection).n;
const token = () => security.signToken(secret, Date.now() - 1000);
const valid = { name: 'Test Customer', email: 'test@example.invalid', message: 'Please build a sample business application for our team.', topic: 'web', privacyAccepted: 'true', locale: 'pl', source: 'contact' };
function form(changes = {}, file = false) { const f = new FormData(); Object.entries({ ...valid, ...changes }).forEach(([k, v]) => f.append(k, String(v))); f.append('cf-turnstile-response', 'provider-double-proof'); if (file) f.append('attachment', new File(['Synthetic test brief'], 'brief.txt', { type: 'text/plain' })); return f; }
function post(path, body, t, extra = {}) { return nativeFetch(origin + path, { method: 'POST', body, headers: { origin, 'X-Form-Token': t, ...extra } }); }
const receipt = (t, kind = 'contact', extra = {}) => post('/api/submission-status', JSON.stringify({ kind }), t, { 'Content-Type': 'application/json', ...extra });
const reviewBody = changes => JSON.stringify({ name: 'Demo Reader', quote: 'A synthetic review for regression testing only.', rating: 5, consent: true, locale: 'pl', website: '', challengeToken: 'provider-double-proof', ...changes });
test.before(async () => {
  server = http.createServer(async (incoming, outgoing) => {
    try {
      const method = incoming.method, route = routes[new URL(incoming.url, origin).pathname];
      const request = new Request(origin + incoming.url, { method, headers: incoming.headers, ...(method !== 'GET' && method !== 'HEAD' ? { body: Readable.toWeb(incoming), duplex: 'half' } : {}) });
      const response = route?.[method] ? await route[method](request) : new Response('', { status: 405 });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch { outgoing.writeHead(500); outgoing.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`; process.env.SERVER_URL = origin;
});
test.beforeEach(() => { db.exec('DELETE FROM docs'); scans = 0; proofs = 0; challengeOK = true; });
test.after(async () => { global.fetch = nativeFetch; server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); db.close(); });

test('HTTP/SQLite: concurrent identical requests produce one lead and one reference', async () => {
  const t = token(), responses = await Promise.all(Array.from({ length: 8 }, () => post('/api/contact', form(), t)));
  assert.ok(responses.every(r => r.status === 200)); const refs = await Promise.all(responses.map(r => r.json()));
  assert.equal(new Set(refs.map(r => r.reference)).size, 1); assert.equal(count('leads'), 1);
});
test('HTTP/SQLite: receipt only exposes state/reference, never private lead content', async () => {
  const t = token(); await post('/api/contact', form({}, true), t);
  const r = await receipt(t), data = await r.json(); assert.equal(r.status, 200); assert.deepEqual(Object.keys(data).sort(), ['reference', 'state']);
  assert.equal(data.state, 'saved'); assert.match(r.headers.get('cache-control'), /no-store/); assert.equal(count('private-files'), 1);
  assert.ok(!JSON.stringify(data).includes(valid.email));
});
test('HTTP/SQLite: receipt recovery needs no fresh proof and no new file scan', async () => {
  const t = token(); await post('/api/contact', form({}, true), t); challengeOK = false;
  const before = { scans, proofs }, r = await receipt(t); assert.equal((await r.json()).state, 'saved'); assert.deepEqual({ scans, proofs }, before);
  assert.equal(count('leads'), 1); assert.equal(count('private-files'), 1);
});
test('HTTP/SQLite: a different valid token cannot discover another receipt', async () => {
  await post('/api/contact', form(), token()); assert.deepEqual(await (await receipt(token())).json(), { state: 'missing' });
});
test('HTTP/SQLite: missing origin and foreign origin fail closed', async () => {
  assert.equal((await receipt(token(), 'contact', { origin: 'https://foreign.invalid' })).status, 403);
  assert.equal((await nativeFetch(origin + '/api/submission-status', { method: 'POST', headers: { 'X-Form-Token': token(), 'Content-Type': 'application/json' }, body: '{"kind":"contact"}' })).status, 403);
});
test('HTTP/SQLite: forged/expired receipts cannot read persistence', async () => {
  for (const t of [token().slice(0, -2) + 'ZZ', security.signToken(secret, Date.now() - 86400001), 'x', '']) assert.equal((await receipt(t)).status, 403);
});
test('HTTP/SQLite: receipt has bounded body, strict schema and content type', async () => {
  const headers = { 'Content-Type': 'application/json' };
  assert.equal((await post('/api/submission-status', 'x'.repeat(257), token(), headers)).status, 413);
  for (const value of [{ kind: 'admin' }, { kind: 'contact', id: 1 }, [], {}, null]) assert.equal((await post('/api/submission-status', JSON.stringify(value), token(), headers)).status, 422);
  assert.equal((await post('/api/submission-status', 'broken', token(), headers)).status, 400);
  assert.equal((await post('/api/submission-status', '{}', token())).status, 415);
});
test('HTTP/SQLite: 40 receipt slots enforced by real unique database index', async () => {
  const t = token(); for (let i = 0; i < 40; i++) assert.equal((await receipt(t)).status, 200);
  const r = await receipt(t); assert.equal(r.status, 429); assert.equal(r.headers.get('retry-after'), '900');
});
test('HTTP/SQLite: failed anti-bot verification never persists a lead', async () => {
  challengeOK = false; assert.equal((await post('/api/contact', form(), token())).status, 403); assert.equal(count('leads'), 0); assert.equal(count('private-files'), 0);
});
test('HTTP/SQLite: duplicate receipt does not spend another creation quota slot', async () => {
  const t = token(); await post('/api/contact', form(), t); for (let i = 0; i < 10; i++) assert.equal((await post('/api/contact', form(), t)).status, 200);
  assert.equal(db.prepare("SELECT count(*) n FROM docs WHERE collection='form-attempts' AND receipt LIKE 'contact:%'").get().n, 1);
});
test('HTTP/SQLite: a changed request gets a conflict, not fake success', async () => {
  const t = token(); await post('/api/contact', form(), t); assert.equal((await post('/api/contact', form({ message: 'A completely different request under the old identity.' }), t)).status, 409); assert.equal(count('leads'), 1);
});
test('HTTP/SQLite: submitted review is a draft and can recover its receipt', async () => {
  const t = token(), r = await post('/api/reviews', reviewBody(), t, { 'Content-Type': 'application/json' }); assert.equal(r.status, 201);
  assert.equal((await (await receipt(t, 'review')).json()).state, 'saved');
  assert.equal((await (await nativeFetch(origin + '/api/reviews')).json()).reviews.length, 0);
  assert.equal(db.prepare("SELECT body FROM docs WHERE collection='testimonials'").get().body.includes('consentVersion'), true);
});
test('HTTP/SQLite: missing consent, fractional rating and unknown fields rejected', async () => {
  for (const patch of [{ consent: false }, { rating: 2.5 }, { locale: 'xx' }, { _status: 'published' }]) assert.equal((await post('/api/reviews', reviewBody(patch), token(), { 'Content-Type': 'application/json' })).status, 422);
  assert.equal(count('testimonials'), 0);
});
test('HTTP/SQLite: empty and out-of-range review pages are normalized', async () => {
  let body = await (await nativeFetch(origin + '/api/reviews?page=999')).json(); assert.deepEqual([body.page, body.pages, body.total], [1, 1, 0]);
  for (let i = 0; i < 13; i++) await cms.create({ collection: 'testimonials', data: { name: 'Published demo', quote: 'Synthetic public content', rating: i === 0 ? -5 : 4, _status: 'published' } });
  body = await (await nativeFetch(origin + '/api/reviews?page=999')).json(); assert.deepEqual([body.page, body.pages, body.total, body.reviews.length], [2, 2, 13, 1]); assert.equal(body.reviews[0].rating, null);
});
test('Client + HTTP + SQLite: lost committed response is recovered without duplicate submit', async () => {
  let lose = true, sends = 0, clientProofs = 0;
  const client = loader({ './turnstile-client': { setChallengeSiteKey() {}, challengeToken: async () => { clientProofs++; return 'provider-double-proof'; } } })('src/lib/contact-client.ts');
  global.fetch = async (input, init = {}) => {
    const path = String(input), response = await nativeFetch(new URL(path, origin), { ...init, headers: { origin, ...(init.headers || {}) } });
    if (path === '/api/contact') { sends++; if (lose) { lose = false; await response.arrayBuffer(); throw new TypeError('simulated response lost after commit'); } }
    return response;
  };
  try {
    const operation = client.createContactSubmission(); await assert.rejects(operation.submit(form({}, true))); assert.equal(operation.pending, true); assert.equal(count('leads'), 1);
    const result = await operation.submit(form({ message: 'Changed input must not be silently used while pending.' }));
    assert.equal(result.ok, true); assert.equal(operation.pending, false); assert.equal(sends, 1); assert.equal(clientProofs, 1); assert.equal(count('leads'), 1);
  } finally { global.fetch = nativeFetch; }
});
