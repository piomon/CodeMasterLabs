import {runNpm} from './lib/run-npm.mjs'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {assessAudit} from '../docker/audit-policy.mjs'
mkdirSync('reports/runtime',{recursive:true})
const checks=[]
for(const [scope,flags] of [['production',['--omit=dev']],['all-including-ops',['--include=dev']]]){
 const result=runNpm(['audit',...flags,'--json','--registry=https://registry.npmjs.org/'],{encoding:'utf8',maxBuffer:24*1024*1024,timeout:180000})
 let report
 try{report=JSON.parse(result.stdout)}catch{throw new Error(`npm audit ${scope} did not return JSON evidence`)}
 writeFileSync(`reports/runtime/npm-audit-${scope}.json`,JSON.stringify(report,null,2)+'\n')
 if(result.error)throw new Error(`npm audit ${scope} failed`)
 checks.push({scope,counts:assessAudit(report,result.status)})
}
writeFileSync('reports/runtime/dependency-security.json',JSON.stringify({status:'PASS',utc:new Date().toISOString(),lockSHA256:createHash('sha256').update(readFileSync('package-lock.json')).digest('hex'),checks,scope:'Known advisories at scan time; this is not proof of absence of vulnerabilities.'},null,2)+'\n')
console.log('Both npm scopes passed the Critical/High/Moderate gate; low entries, if any, remain in the reports.')
