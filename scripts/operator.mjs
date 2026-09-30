import {existsSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
if(existsSync('.env'))process.loadEnvFile('.env')
const allowed=new Set(['create-admin','seed','cleanup','docker-bootstrap','check-deployment','notifications'])
const operation=process.argv[2]
if(!allowed.has(operation))throw new Error('Unknown operator command.')
// Admin and maintenance CLIs must never turn development schema push on accidentally.
const env={...process.env,NODE_ENV:'production',SEED_CONTENT:'false',PAYLOAD_DROP_DATABASE:'false'}
const result=spawnSync(process.execPath,['node_modules/tsx/dist/cli.mjs',`scripts/${operation}.ts`],{env,stdio:'inherit'})
if(result.error)throw result.error
process.exitCode=result.status??1
