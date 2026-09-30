import {getPayload,type Payload} from 'payload'
import config from '../src/payload.config'
let cms:Payload|undefined
try{
 const url=new URL((process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)||'http://localhost')
 if(url.protocol!=='https:'||['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Configure the public HTTPS canonical URL.')
 if(process.env.ALLOW_HTTP_LOCAL==='true')throw new Error('Remove ALLOW_HTTP_LOCAL for public deployment.')
 if(!process.env.TRUSTED_CLIENT_IP_HEADER)throw new Error('Configure an overwriting trusted reverse proxy before enabling per-client rate limits.')
 cms=await getPayload({config})
 if(!/^\d+$/.test(process.env.LEAD_RETENTION_DAYS||'')||Number(process.env.LEAD_RETENTION_DAYS)<1||Number(process.env.LEAD_RETENTION_DAYS)>36500)throw new Error('Set LEAD_RETENTION_DAYS to the owner-approved CLOSED-enquiry retention; match the published policy.')
 const site=await cms.findGlobal({slug:'site-settings',overrideAccess:true})
 if(!site.email||/example|\.invalid$/i.test(site.email))throw new Error('Replace the placeholder site contact email in CMS.')
 const [users,privacy]=await Promise.all([cms.count({collection:'users',overrideAccess:true}),cms.findGlobal({slug:'contact-settings',overrideAccess:true})])
 if(!users.totalDocs)throw new Error('Create the first administrator with the local operator CLI.')
 if(!privacy.privacyReviewed||!privacy.legalName||!privacy.legalAddress||!privacy.hostingProvider||!privacy.retentionDescription)throw new Error('Complete and review legal/privacy information in CMS Contact settings before publication.')
 console.log('Configuration checks passed. This does not certify security, legal compliance, SMTP or hosting reliability.')
 if(!process.env.SMTP_HOST)console.warn('SMTP is not configured. Password-reset delivery will be unavailable; leads are still stored in CMS.')
}finally{await cms?.destroy()}
