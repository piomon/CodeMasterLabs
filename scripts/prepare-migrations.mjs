import {existsSync,mkdirSync,readdirSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
if(existsSync('.env'))process.loadEnvFile('.env')
if(process.env.DATABASE_URL&&!process.env.DATABASE_URL.startsWith('file:'))throw new Error('This release supports SQLite only; use a separately reviewed PostgreSQL deployment.')
const provider='sqlite'
const dir=`src/migrations/${provider}`
mkdirSync(dir,{recursive:true})
if(readdirSync(dir).some(name=>/^\d.*\.ts$/.test(name)))throw new Error('Migrations already exist. Use npm run migrate:create -- descriptive-name for subsequent reviewed changes.')
const result=spawnSync(process.execPath,['node_modules/payload/bin.js','migrate:create','initial','--force-accept-warning'],{stdio:'inherit',env:{...process.env,NODE_ENV:'production',SEED_CONTENT:'false',PAYLOAD_MIGRATING:'true',PAYLOAD_DROP_DATABASE:'false'}})
if(result.error)throw result.error
if(result.status!==0)process.exitCode=result.status??1
else console.log(`Initial ${provider} migration generated. Review and commit it before applying to a fresh database. Never apply an initial migration to a development-pushed database.`)
