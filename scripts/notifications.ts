import {getPayload} from 'payload'
import config from '../src/payload.config'
import {notifyLead} from '../src/lib/lead-notification'
const cms=await getPayload({config})
try {
 const batch=await cms.find({collection:'leads',overrideAccess:true,depth:0,limit:20,sort:'createdAt',where:{and:[{notificationStatus:{equals:'pending'}},{or:[{notificationNextAttemptAt:{exists:false}},{notificationNextAttemptAt:{less_than_equal:new Date().toISOString()}}]}]}})
 const results={sent:0,retry:0,failed:0,skipped:0}
 for(const lead of batch.docs)results[await notifyLead(cms,lead.id)]++
 console.log(JSON.stringify({component:'notification-worker',...results}))
}finally{await cms.destroy()}
