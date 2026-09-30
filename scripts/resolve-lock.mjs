/** Atomic, explicit public-registry resolution. Never leaves a fabricated root lock on failure. */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdirSync,mkdtempSync,rmSync,renameSync} from 'node:fs'
import {runNpm} from './lib/run-npm.mjs'
import {createHash} from 'node:crypto'
import {tmpdir} from 'node:os'
import path from 'node:path'
const root=process.cwd(),pkg=JSON.parse(readFileSync('package.json','utf8'))
function valid(lock){
 if(lock.lockfileVersion!==3||!lock.packages?.[''])throw new Error('Expected npm lockfile v3')
 for(const kind of ['dependencies','devDependencies']){
  const actual=lock.packages[''][kind]||{},expected=pkg[kind]||{}
  if(Object.keys(actual).length!==Object.keys(expected).length||Object.entries(expected).some(([k,v])=>actual[k]!==v))throw new Error(`Root ${kind} differ from package.json`)
 }
 for(const [key,value] of Object.entries(lock.packages)){
  if(!key)continue
  if(value.link||!value.integrity||!value.resolved?.startsWith('https://registry.npmjs.org/'))throw new Error(`Unverified package origin/integrity: ${key}`)
  if((key==='node_modules/payload'||/^node_modules\/@payloadcms\/[^/]+$/.test(key))&&value.version!==pkg.dependencies.payload)throw new Error(`Mixed Payload version: ${key}`)
 }
 for(const [key,wanted] of Object.entries(pkg.dependencies))if(/^\d+\.\d+\.\d+$/.test(wanted)&&lock.packages['node_modules/'+key]?.version!==wanted)throw new Error(`Exact dependency not resolved: ${key}`)
}
let current
if(existsSync('package-lock.json')){try{const text=readFileSync('package-lock.json','utf8');valid(JSON.parse(text));current=text}catch{ /* Resolve cleanly below, retaining original on failure. */ }}
if(!current){
 const temporary=mkdtempSync(path.join(tmpdir(),'codemaster-lock-'))
 try{
  writeFileSync(path.join(temporary,'package.json'),JSON.stringify(pkg,null,2)+'\n')
  const seed=existsSync('package-lock.json')?'package-lock.json':'release/package-lock.bootstrap.json'
  if(existsSync(seed))copyFileSync(seed,path.join(temporary,'package-lock.json'))
  const result=runNpm(['install','--package-lock-only','--ignore-scripts','--no-fund','--audit=false','--registry=https://registry.npmjs.org/'],{cwd:temporary,stdio:'inherit',timeout:300000,env:{...process.env,NODE_ENV:'development',npm_config_include:'dev'}})
  if(result.error||result.status!==0)throw new Error('Registry lock resolution failed. Existing lock was not changed; no release is certified.')
  const text=readFileSync(path.join(temporary,'package-lock.json'),'utf8');valid(JSON.parse(text))
  const stage=path.join(root,'.package-lock.next-'+process.pid);writeFileSync(stage,text);renameSync(stage,path.join(root,'package-lock.json'));current=text
 }finally{rmSync(temporary,{recursive:true,force:true})}
}
mkdirSync('reports/runtime',{recursive:true})
writeFileSync('reports/runtime/dependency-resolution.json',JSON.stringify({status:'PASS',time:new Date().toISOString(),lockSHA256:createHash('sha256').update(current).digest('hex'),scope:'Registry resolution only; installation, vulnerability scans and runtime acceptance remain mandatory.'},null,2)+'\n')
console.log('Public-registry lock verified. Next: npm ci and acceptance tests.')
