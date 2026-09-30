/** Explicit owner action; never mass-resend historical enquiries. */
import {getPayload} from 'payload'
import config from '../src/payload.config'
const raw=process.argv[2]
if(!raw||!/^[1-9][0-9]{0,14}$/.test(raw)||!Number.isSafeInteger(Number(raw)))throw new Error('Provide one valid lead ID.')
const cms=await getPayload({config})
try{
 const id=Number(raw),lead=await cms.findByID({collection:'leads',id,overrideAccess:true,depth:0})
 if(lead.notificationStatus!=='failed')throw new Error('Only a FAILED notification may be explicitly requeued. Sent/legacy items are protected.')
 await cms.update({collection:'leads',id,overrideAccess:true,data:{notificationStatus:'pending',notificationAttempts:0,notificationNextAttemptAt:new Date().toISOString(),notificationLastError:null}})
 console.log(JSON.stringify({component:'notification-retry',reference:String(id),status:'QUEUED_NOT_SENT'}))
}finally{await cms.destroy()}
