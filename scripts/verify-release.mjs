/** Real fail-closed integration gate. Uses a disposable database and test account.
 * Does not publish, touch the production DB or report unrun stages as PASS. */
import {spawn} from 'node:child_process'
import {existsSync,mkdirSync,writeFileSync,openSync,closeSync,rmSync,writeSync,cpSync} from 'node:fs'
import {randomBytes,randomUUID} from 'node:crypto'
import path from 'node:path'
import {createServer} from 'node:net'
const root=process.cwd(),reportDir=path.join(root,'reports/release-verification')
const work=path.join(root,'.qa-release',randomUUID()),checks=[]
mkdirSync(work,{recursive:true});mkdirSync(reportDir,{recursive:true})
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const address=server.address();const value=typeof address==='object'&&address?address.port:0;server.close(()=>resolve(value))})})
if(!port)throw new Error('Cannot allocate a local test port.')
const url=`http://127.0.0.1:${port}`,password=randomBytes(32).toString('base64url')
const env={...process.env,CI:'1',NEXT_TELEMETRY_DISABLED:'1',NODE_ENV:'production',
 PAYLOAD_SECRET:randomBytes(48).toString('hex'),DATABASE_URL:`file:${path.join(work,'qa.db').replaceAll('\\','/')}`,
 MEDIA_DIR:path.join(work,'media'),PRIVATE_UPLOAD_DIR:path.join(work,'private-uploads'),QUARANTINE_DIR:path.join(work,'quarantine'),
 NEXT_PUBLIC_SERVER_URL:url,E2E_BASE_URL:url,ALLOW_HTTP_LOCAL:'true',ALLOW_SQLITE_PRODUCTION:'single-node',
 PAYLOAD_DROP_DATABASE:'false',SEED_CONTENT:'false',TRUSTED_CLIENT_IP_HEADER:'',
 CODEMASTER_ADMIN_EMAIL:'acceptance@example.test',CODEMASTER_ADMIN_NAME:'Acceptance Test',CODEMASTER_ADMIN_PASSWORD:password,
 E2E_ADMIN_EMAIL:'acceptance@example.test',E2E_ADMIN_PASSWORD:password,E2E_REQUIRE_PERSISTENCE:'true',
 SERVER_URL:url,SMTP_HOST:'',SMTP_USER:'',SMTP_PASS:'',SMTP_FROM:'',LEAD_NOTIFY_EMAIL:'',ALLOW_REMOTE_E2E:'',TURNSTILE_SITE_KEY:'1x00000000000000000000AA',TURNSTILE_SECRET_KEY:'1x0000000000000000000000000000000AA'}
mkdirSync(env.MEDIA_DIR,{recursive:true});mkdirSync(env.PRIVATE_UPLOAD_DIR,{recursive:true})
let server,serverFd
function report(){writeFileSync(path.join(reportDir,'result.json'),JSON.stringify({date:new Date().toISOString(),scope:'Installed Next/Payload production build and real disposable SQLite database; unrun checks are not PASS.',checks},null,2))}
async function run(name,executable,args,extra={}){
 console.log(`\n[release] ${name}`);const started=Date.now(),fd=openSync(path.join(reportDir,`${name}.log`),'w')
 return new Promise((resolve,reject)=>{
  const child=spawn(executable,args,{cwd:root,env:{...env,...extra},stdio:['inherit','pipe','pipe'],timeout:15*60*1000,killSignal:'SIGTERM',shell:process.platform==='win32'&&executable==='npm.cmd'})
  child.stdout.on('data',chunk=>{process.stdout.write(chunk);writeSync(fd,chunk)})
  child.stderr.on('data',chunk=>{process.stderr.write(chunk);writeSync(fd,chunk)})
  let complete=false
  function finish(code,error){if(complete)return;complete=true;closeSync(fd);checks.push({name,status:!error&&code===0?'PASS':'FAIL',exitCode:code,durationMs:Date.now()-started});report();if(error||code!==0)reject(error||new Error(`${name} failed (${code}). See reports/release-verification.`));else resolve()}
  child.on('error',error=>finish(null,error));child.on('exit',code=>finish(code))
 })
}
const node=process.execPath,npm=process.platform==='win32'?'npm.cmd':'npm'
try{
 if(!existsSync('node_modules/next/package.json'))await run('install',npm,['ci','--no-fund','--fetch-retries=0','--fetch-timeout=20000'],{NODE_ENV:'development',npm_config_include:'dev'})
 await run('unit-tests',npm,['test'])
 await run('source-syntax',node,['scripts/check-source.cjs'])
 await run('database-migrations',node,['node_modules/payload/bin.js','migrate'])
 await run('seed-test-content',node,['node_modules/tsx/dist/cli.mjs','scripts/seed.ts'])
 await run('test-administrator',node,['node_modules/tsx/dist/cli.mjs','scripts/docker-bootstrap.ts'])
 await run('generate-importmap',node,['node_modules/payload/bin.js','generate:importmap'])
 await run('generate-types',node,['node_modules/payload/bin.js','generate:types'])
 await run('lint',node,['node_modules/eslint/bin/eslint.js','src','scripts','--ext','.ts,.tsx,.mjs,.cjs'])
 await run('production-build',node,['node_modules/next/dist/bin/next','build','--webpack'])
 await run('typecheck',node,['node_modules/typescript/bin/tsc','--noEmit'])
 await run('browser-install',node,['node_modules/@playwright/test/cli.js','install','chromium'])
 serverFd=openSync(path.join(reportDir,'server.log'),'w')
 cpSync('.next/static','.next/standalone/.next/static',{recursive:true});cpSync('public','.next/standalone/public',{recursive:true})
 server=spawn(node,['--import','./docker/production-preflight.mjs','.next/standalone/server.js'],{env:{...env,PORT:String(port),HOSTNAME:'127.0.0.1'},cwd:root,stdio:['ignore',serverFd,serverFd]})
 let serverError;server.on('error',error=>{serverError=error})
 const start=Date.now();let ready=false
  while(Date.now()-start<120000){if(serverError)throw serverError;if(server.exitCode!==null)throw new Error('Production server exited; inspect server.log.');try{const reply=await fetch(`${url}/api/health`,{signal:AbortSignal.timeout(3000)});if(reply.ok){ready=true;break}}catch{/* The server may still be starting. */}await new Promise(resolve=>setTimeout(resolve,1000))}
 if(!ready)throw new Error('Production health check failed.')
 checks.push({name:'production-health',status:'PASS'});report()
 await run('e2e',node,['node_modules/@playwright/test/cli.js','test'])
 console.log('\nExecuted release checks passed. Deployment, HTTPS, SMTP, backup restore, legal review and Lighthouse still require target-environment acceptance.')
}catch(error){checks.push({name:'release-gate',status:'FAIL',error:error instanceof Error?error.message:String(error)});report();console.error(error);process.exitCode=1}
finally{
 if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(resolve=>setTimeout(resolve,1500));if(server.exitCode===null)server.kill('SIGKILL')}
 if(serverFd!==undefined)closeSync(serverFd)
 rmSync(work,{recursive:true,force:true});report()
}
