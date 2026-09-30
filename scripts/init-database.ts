/** Explicit one-time initializer for a NEW single-node SQLite database only.
 * It never starts an HTTP server and never pushes a schema to an existing database. */
import {existsSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import type {Payload} from 'payload'
if(existsSync('.env'))process.loadEnvFile('.env')
const url=process.env.DATABASE_URL
if(!url||!url.startsWith('file:')||url.includes(':memory:')||url.includes('?'))throw new Error('db:init supports only a new local SQLite file. PostgreSQL is not supported by this release.')
const filename=url.startsWith('file://')?fileURLToPath(url):path.resolve(url.slice(5))
if(existsSync(filename))throw new Error('Database already exists. Refusing automatic schema push. Use explicit reviewed migrations for updates.')
mkdirSync(path.dirname(filename),{recursive:true})
// Exclusive creation makes a concurrent initializer fail instead of touching an existing file.
const fd=openSync(filename,'wx',0o600);closeSync(fd)
let cms:Payload|undefined,success=false
Object.assign(process.env,{NODE_ENV:'development',DATABASE_URL:`file:${filename}`,PAYLOAD_DROP_DATABASE:'false'})
try{
 const {getPayload}=await import('payload')
 const {default:config}=await import('../src/payload.config')
 cms=await getPayload({config})
 await cms.count({collection:'users',overrideAccess:true})
 success=true
 console.log('New SQLite database initialized. No administrator account was created.')
}finally{
 await cms?.destroy()
 if(!success)for(const suffix of ['','-wal','-shm']){const file=filename+suffix;if(existsSync(file))unlinkSync(file)}
}
