import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

/** npm sets npm_execpath on Windows too; invoking its JS entry avoids cmd quoting. */
export function npmInvocation(args, env = process.env, platform = process.platform) {
  if (!Array.isArray(args) || args.some(value => typeof value !== 'string' || /[\r\n\0]/.test(value))) throw new TypeError('Invalid npm arguments')
  if (env.npm_execpath && existsSync(env.npm_execpath)) return { command: process.execPath, args: [env.npm_execpath, ...args] }
  if (platform === 'win32') throw new Error('Run this task through npm run so npm_execpath is available on Windows.')
  return { command: 'npm', args }
}
export function runNpm(args, options = {}) {
  const invocation = npmInvocation(args, options.env || process.env)
  return spawnSync(invocation.command, invocation.args, { ...options, shell: false })
}
