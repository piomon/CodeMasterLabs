import {getPayload} from 'payload'
import config from '../src/payload.config'
const cms=await getPayload({config})
try{
 if(!process.env.LEAD_NOTIFY_EMAIL)throw new Error('LEAD_NOTIFY_EMAIL required')
 await cms.sendEmail({to:process.env.LEAD_NOTIFY_EMAIL,subject:'CodeMaster: test konfiguracji SMTP',text:'To jest techniczny test SMTP. Potwierdz jego odbior przed publikacja. Ten test nie potwierdza automatycznie SPF, DKIM ani DMARC.'})
 console.log('SMTP accepted the test message. Confirm receipt and SPF/DKIM/DMARC in the real mailbox.')
}finally{await cms.destroy()}
