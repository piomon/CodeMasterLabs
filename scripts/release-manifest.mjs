import {readFileSync,existsSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
const pkg=JSON.parse(readFileSync('package.json','utf8'))
const read=path=>existsSync(path)?JSON.parse(readFileSync(path,'utf8')):null
const git=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'})
const manifest={generatedAt:new Date().toISOString(),sourceCommit:git.status===0?git.stdout.trim():null,node:process.version,npm:spawnSync('npm',['--version'],{encoding:'utf8'}).stdout?.trim(),dependencies:pkg.dependencies,lockSHA256:existsSync('package-lock.json')?createHash('sha256').update(readFileSync('package-lock.json')).digest('hex'):null,resolution:read('reports/runtime/dependency-resolution.json'),sourceChecks:read('reports/source-check.json'),releaseVerification:read('reports/release-verification/result.json'),dockerImageDigest:null,commercialReleaseReady:false,note:'This source manifest is not a production acceptance decision. See protected VPS evidence and the complete required gate table.'}
mkdirSync('reports/runtime',{recursive:true});writeFileSync('reports/runtime/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('Wrote reports/runtime/manifest.json; no unexecuted checks marked PASS.')
