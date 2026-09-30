/** Local, fail-closed acceptance runner. Never deploys, edits DNS, or runs Docker. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { runNpm } from './lib/run-npm.mjs'

const require = createRequire(import.meta.url)
const root = process.cwd(), reportDir = path.join(root, 'reports', 'functional-local')
mkdirSync(reportDir, { recursive: true })
const report = {
  schemaVersion: 1, startedAt: new Date().toISOString(), scope: 'Local application acceptance; no VPS or Docker operations.',
  status: 'BLOCKED', FUNCTIONAL_CHECKS_PASSED: false, COMMERCIAL_RELEASE_READY: false,
  reasons: [], checks: [], note: 'A passing run is bounded evidence, not a guarantee of no defects or a production certificate.'
}
function save() { report.finishedAt = new Date().toISOString(); writeFileSync(path.join(reportDir, 'acceptance.json'), JSON.stringify(report, null, 2) + '\n') }
try { if (existsSync('.env')) process.loadEnvFile('.env') } catch { report.reasons.push('The local .env file cannot be read.') }
for (const name of ['next', 'react', 'payload', 'typescript', 'eslint', '@playwright/test']) {
  try { require.resolve(name) } catch { report.reasons.push(`Install the real project dependency: ${name}.`) }
}
if (!existsSync('package-lock.json')) report.reasons.push('A verified root package-lock.json is required; run npm run resolve:lock then npm ci.')
if (process.env.E2E_DATABASE_IS_DISPOSABLE !== 'true') report.reasons.push('Explicitly set E2E_DATABASE_IS_DISPOSABLE=true only in a separate test copy with a disposable database.')
if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) report.reasons.push('A disposable administrator and E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are required. No CMS tests are skipped.')
if ((process.env.PAYLOAD_SECRET || '').length < 32) report.reasons.push('Generate a unique local PAYLOAD_SECRET with npm run setup.')
if (process.env.E2E_BASE_URL) report.reasons.push('Unset E2E_BASE_URL for this runner. It must start its own localhost:3000 application, not reuse another server.')
if (!/^file:/.test(process.env.DATABASE_URL || '')) report.reasons.push('This runner supports the dedicated local SQLite test database only.')
if (process.env.NODE_ENV === 'production') report.reasons.push('Unset NODE_ENV=production before running the local acceptance suite.')
if (report.reasons.length) {
  save(); console.error('BLOCKED: no application acceptance was performed.\n' + report.reasons.map(value => '- ' + value).join('\n'))
  process.exitCode = 2
} else {
  const env = { ...process.env, CI: '1', E2E_REQUIRE_PERSISTENCE: 'true', E2E_BASE_URL: '', SERVER_URL: 'http://localhost:3000', NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000', ALLOW_HTTP_LOCAL: 'true', PAYLOAD_DROP_DATABASE: 'false', SEED_CONTENT: 'false' }
  const stages = ['check:source', 'generate:types', 'generate:importmap', 'lint', 'typecheck', 'typecheck:domain', 'test', 'build', 'test:browser', 'audit:deps']
  report.status = 'RUNNING'; save()
  for (const stage of stages) {
    console.log(`\n[APPLICATION ACCEPTANCE] ${stage}`)
    const start = Date.now()
    let result
    try { result = runNpm(['run', stage], { cwd: root, env, encoding: 'utf8', maxBuffer: 48 * 1024 * 1024, timeout: stage === 'test:browser' ? 1800000 : 600000 }) }
    catch (error) { result = { status: null, stdout: '', stderr: error instanceof Error ? error.message : 'Process could not start' } }
    const file = stage.replaceAll(':', '-') + '.log'
    writeFileSync(path.join(reportDir, file), String(result.stdout || '') + '\n' + String(result.stderr || ''))
    const passed = !result.error && result.status === 0
    report.checks.push({ stage, passed, exitCode: result.status, durationMs: Date.now() - start, log: file })
    save()
    if (!passed) { report.status = 'FAIL'; report.reasons.push(`Stage ${stage} failed. Later stages were not run.`); process.exitCode = 1; break }
  }
  if (!process.exitCode) { report.status = 'PASS'; report.FUNCTIONAL_CHECKS_PASSED = true }
  save(); console.log(`${report.status}: reports/functional-local/acceptance.json`)
}
