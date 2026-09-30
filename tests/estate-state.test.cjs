const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript')
const file = path.resolve(__dirname, '../src/lib/estate-state.ts')
const source = fs.readFileSync(file, 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const compiled = new Module(file, module)
compiled.filename = file
compiled.paths = Module._nodeModulePaths(path.dirname(file))
compiled._compile(output, file)
const { APARTMENTS, initialEstate, estateReducer, parseEstate } = compiled.exports
const first = APARTMENTS[0].id
const second = APARTMENTS[1].id

test('48 stable building A apartments over 12 floors with distinct IDs and realistic amounts', () => {
 assert.equal(APARTMENTS.length, 48)
 assert.equal(new Set(APARTMENTS.map(unit => unit.id)).size, 48)
 assert.deepEqual(new Set(APARTMENTS.map(unit => unit.floor)), new Set(Array.from({ length: 12 }, (_, i) => i + 1)))
 assert.ok(APARTMENTS.every(unit => unit.building === 'A' && unit.area > 30 && unit.price > 300000 && unit.balcony > 0))
 assert.deepEqual(initialEstate(), initialEstate())
})

test('statuses update with bounded, caller-stamped history, unknown units and invalid statuses are ignored', () => {
 const initial = initialEstate()
 const next = estateReducer(initial, { type: 'status', id: first, status: 'available', at: '2026-01-01T12:00:00.000Z', eventId: 'event-1' })
 assert.equal(next.statuses[first], 'available')
 assert.deepEqual(next.history, [{ id: 'event-1', unitId: first, status: 'available', at: '2026-01-01T12:00:00.000Z' }])
 assert.equal(estateReducer(next, { type: 'status', id: 'missing', status: 'sold' }), next)
 assert.equal(estateReducer(next, { type: 'status', id: first, status: 'invalid' }), next)
 assert.equal(estateReducer(next, { type: 'status', id: second, status: 'sold', at: 'invalid', eventId: 'event-2' }), next)
 let state = initial
 for (let i = 0; i < 110; i++) {
  state = estateReducer(state, { type: 'status', id: second, status: i % 2 ? 'available' : 'sold', at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(), eventId: `event-${i}` })
 }
 assert.equal(state.history.length, 100)
})

test('favorites toggle, notes edit and clear, reset restores defaults', () => {
 let state = estateReducer(initialEstate(), { type: 'favorite', id: first })
 assert.deepEqual(state.favorites, [first])
 state = estateReducer(state, { type: 'note', id: first, text: 'South-facing terrace' })
 assert.equal(state.notes[first], 'South-facing terrace')
 assert.equal(estateReducer(state, { type: 'note', id: first, text: 'x'.repeat(1001) }), state)
 state = estateReducer(state, { type: 'note', id: first, text: '' })
 assert.equal(first in state.notes, false)
 state = estateReducer(state, { type: 'favorite', id: first })
 assert.deepEqual(state.favorites, [])
 assert.deepEqual(estateReducer(state, { type: 'reset' }), initialEstate())
})

test('snapshots validate version, schema, bounds, IDs and statuses without coercion', () => {
 const initial = initialEstate()
 assert.deepEqual(parseEstate(JSON.stringify(initial)), initial)
 assert.equal(parseEstate(null), null)
 assert.equal(parseEstate('{'), null)
 const rejects = [
  { ...initial, version: 2 },
  { ...initial, statuses: { ...initial.statuses, [first]: 'invalid' } },
  { ...initial, statuses: { ...initial.statuses, unknown: 'sold' } },
  { ...initial, statuses: { ...initial.statuses, [first]: 1 } },
  { ...initial, favorites: ['unknown'] },
  { ...initial, favorites: [first, first] },
  { ...initial, notes: { unknown: 'text' } },
  { ...initial, notes: { [first]: 'x'.repeat(1001) } },
  { ...initial, history: [{ id: 'event-1', unitId: 'unknown', status: 'sold', at: '2026-01-01T12:00:00.000Z' }] },
  { ...initial, history: Array.from({ length: 101 }, (_, i) => ({ id: `e-${i}`, unitId: first, status: 'sold', at: '2026-01-01T12:00:00.000Z' })) },
 ]
 for (const value of rejects) assert.equal(parseEstate(JSON.stringify(value)), null)
})