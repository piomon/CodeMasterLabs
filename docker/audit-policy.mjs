/** Fail closed on unavailable/malformed scanners; LOW is not misreported as zero. */
export function assessAudit(report,exitCode){
 if(!report||report.error||!Number.isInteger(exitCode)||![0,1].includes(exitCode))throw new Error('npm audit unavailable or interrupted')
 const counts=report.metadata?.vulnerabilities
 if(!counts||['critical','high','moderate','low','info','total'].some(k=>!Number.isSafeInteger(counts[k])||counts[k]<0))throw new Error('Invalid vulnerability counters')
 if(counts.total!==['critical','high','moderate','low','info'].reduce((sum,k)=>sum+counts[k],0))throw new Error('Inconsistent audit counters')
 if((exitCode===0&&counts.total!==0)||(exitCode===1&&counts.total===0))throw new Error('Audit exit status contradicts report')
 if(counts.critical||counts.high||counts.moderate)throw new Error(`Dependency release blocked: critical=${counts.critical}, high=${counts.high}, moderate=${counts.moderate}`)
 return {...counts}
}
