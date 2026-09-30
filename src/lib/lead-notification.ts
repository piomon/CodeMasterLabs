import type {Payload} from 'payload'
export const MAX_NOTIFICATION_ATTEMPTS=8
/** Called by one serialized operator worker, never fire-and-forget inside HTTP. */
export async function notifyLead(cms:Payload,id:string|number,now=Date.now()):Promise<'sent'|'retry'|'failed'|'skipped'> {
 const lead=await cms.findByID({collection:'leads',id,overrideAccess:true,depth:0})
 if(lead.notificationStatus==='sent'||lead.notificationStatus==='legacy'||lead.notificationStatus==='failed')return 'skipped'
 if(lead.notificationNextAttemptAt&&new Date(lead.notificationNextAttemptAt).getTime()>now)return 'skipped'
 const attempts=Number(lead.notificationAttempts||0)+1
 if(attempts>MAX_NOTIFICATION_ATTEMPTS){await cms.update({collection:'leads',id,overrideAccess:true,data:{notificationStatus:'failed',notificationLastError:'ATTEMPT_LIMIT'}});return 'failed'}
 const next=new Date(now+Math.min(6*60*60*1000,60000*2**(attempts-1))).toISOString()
 await cms.update({collection:'leads',id,overrideAccess:true,data:{notificationAttempts:attempts,notificationNextAttemptAt:next}})
 try {
  const recipient=process.env.LEAD_NOTIFY_EMAIL
  if(!recipient)throw new Error('NOT_CONFIGURED')
  const url=new URL(`/admin/collections/leads/${encodeURIComponent(String(id))}`,process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL).href
  await cms.sendEmail({to:recipient,subject:`CodeMaster: nowe zapytanie #${id}`,text:`W CMS zapisano nowe zapytanie.\n${url}\nZaloguj sie, aby odczytac wiadomosc i prywatny zalacznik.`})
 }catch {
  const failed=attempts>=MAX_NOTIFICATION_ATTEMPTS
  await cms.update({collection:'leads',id,overrideAccess:true,data:{notificationStatus:failed?'failed':'pending',notificationLastError:'SMTP_DELIVERY_FAILED'}})
  console.error(JSON.stringify({component:'lead-notification',code:'SMTP_DELIVERY_FAILED',reference:String(id),attempt:attempts}))
  return failed?'failed':'retry'
 }
 // A crash after SMTP acceptance can duplicate the notification, not the lead (at-least-once).
 await cms.update({collection:'leads',id,overrideAccess:true,data:{notificationStatus:'sent',notificationSentAt:new Date(now).toISOString(),notificationNextAttemptAt:null,notificationLastError:null}})
 return 'sent'
}
