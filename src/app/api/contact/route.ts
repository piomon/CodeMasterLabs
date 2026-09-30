import type {DataFromCollectionSlug} from 'payload'
import {createHash,randomUUID} from 'node:crypto'
import {getCMS} from '@/lib/site-data'
import {validateLead} from '@/lib/lead-validation'
import {verifyChallenge} from '@/lib/turnstile'
import {inspectAttachment} from '@/lib/attachment-security'
import {actorKey,verifyToken,originAllowed,MAX_BODY,MAX_ATTACHMENT,isUniqueConflict} from '@/lib/form-security'
import {claimRateSlot} from '@/lib/rate-limit'
import {readBody,BodyError,oneValuePerField} from '@/lib/http-body'
import {PRIVACY_VERSION,TOKEN_NEW_MAX_AGE,TOKEN_RECOVERY_MAX_AGE,sameLead} from '@/lib/submission-policy'
export const runtime='nodejs'
export const dynamic='force-dynamic'
const fields=new Set(['name','email','company','phone','topic','message','timeline','budget','nda','privacyAccepted','source','locale','website','attachment','cf-turnstile-response'])
function answer(data:object,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===429?{'Retry-After':'900'}:status===503?{'Retry-After':'60'}:{})}})}
export async function POST(req:Request) {
 const secret=process.env.PAYLOAD_SECRET,serverURL=process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL||'http://localhost:3000'
 if(!secret)return answer({ok:false,code:'UNAVAILABLE',error:'Formularz jest chwilowo niedostepny.'},503)
 if(!originAllowed(req.headers,serverURL))return answer({ok:false,code:'ORIGIN',error:'Niedozwolone zrodlo zapytania.'},403)
 if(!/^multipart\/form-data(?:;|$)/i.test(req.headers.get('content-type')||''))return answer({ok:false,code:'FORMAT',error:'Niepoprawny format.'},415)
 const token=req.headers.get('x-form-token')||'',checked=verifyToken(token,secret,Date.now(),TOKEN_RECOVERY_MAX_AGE)
 if(!checked.ok)return answer({ok:false,code:'TOKEN_INVALID',error:'Token wygasl. Wyslij ponownie formularz, aby pobrac nowy token.'},403)
 try {
  const cms=await getCMS()
  if(!await claimRateSlot(cms,actorKey(req.headers,secret),'contact-attempt',40))return answer({ok:false,code:'RATE_LIMIT',error:'Zbyt wiele prob. Sprobuj pozniej lub napisz e-mail.'},429)
  const body=await readBody(req,MAX_BODY)
  let form:FormData
  try{form=await new Response(new Uint8Array(body),{headers:{'Content-Type':req.headers.get('content-type')!}}).formData()}catch{return answer({ok:false,code:'FORMAT'},400)}
  if(!oneValuePerField(form,fields))return answer({ok:false,code:'DUPLICATE_OR_UNKNOWN_FIELD'},422)
  if(String(form.get('website')||'').trim())return answer({ok:true,reference:'received'})
  const result=validateLead(Object.fromEntries([...form.entries()].filter(([,value])=>typeof value==='string')))
  if(!result.ok)return answer({ok:false,code:'VALIDATION',error:'Sprawdz zaznaczone pola.',fields:result.errors},422)
  const en=result.data.locale==='en',key=checked.key
  const attachment=form.get('attachment')
  if(attachment!==null&&!(attachment instanceof File))return answer({ok:false,code:'ATTACHMENT_INVALID'},422)
  if(attachment instanceof File&&attachment.size>MAX_ATTACHMENT)return answer({ok:false,code:'ATTACHMENT_SIZE',error:en?'Maximum attachment size: 5 MB.':'Maksymalny rozmiar zalacznika: 5 MB.'},413)
  const bytes=attachment instanceof File&&attachment.size?Buffer.from(await attachment.arrayBuffer()):undefined
  const fileHash=bytes?createHash('sha256').update(bytes).digest('hex'):undefined
  const findLead=async()=>(await cms.find({collection:'leads',where:{submissionKey:{equals:key}},limit:1,depth:0,overrideAccess:true})).docs[0]
  const receipt=async(existing:DataFromCollectionSlug<'leads'>)=>{
   let sameFile=!bytes&&!existing.attachment
   if(bytes&&existing.attachment){
    const id=typeof existing.attachment==='object'?existing.attachment.id:existing.attachment
    const stored=await cms.findByID({collection:'private-files',id,overrideAccess:true,depth:0})
    sameFile=stored.sha256===fileHash
   }
   if(!sameLead(existing as unknown as Record<string,unknown>,result.data)||!sameFile)return answer({ok:false,code:'IDEMPOTENCY_CONFLICT',error:en?'This submission was already saved with different content. Reload before sending a new enquiry.':'To zgloszenie zapisano juz z inna trescia. Odswiez strone przed wyslaniem nowego zapytania.'},409)
   return answer({ok:true,reference:String(existing.id)})
  }
  const existing=await findLead()
  if(existing)return await receipt(existing)
  // A lost HTTP response can be recovered for 24h, but an old token cannot create new data.
  if(Date.now()-Number(token.split('.')[0])>TOKEN_NEW_MAX_AGE)return answer({ok:false,code:'TOKEN_EXPIRED',error:en?'The form token expired. Please submit again.':'Token formularza wygasl. Wyslij ponownie.'},403)
  if(!await claimRateSlot(cms,actorKey(req.headers,secret),'contact',8))return answer({ok:false,code:'RATE_LIMIT',error:en?'Too many submissions. Please try later.':'Zbyt wiele zgloszen. Sprobuj pozniej.'},429)
  if(!await verifyChallenge(form.get('cf-turnstile-response'),'contact'))return answer({ok:false,code:'CHALLENGE',error:en?'Please complete the anti-bot verification.':'Potwierdz weryfikacje antybotowa i sprobuj ponownie.'},403)
  let attachmentID:DataFromCollectionSlug<'private-files'>['id']|undefined
  if(bytes&&attachment instanceof File){
   const detected=await inspectAttachment(bytes,attachment.name)
   const findFile=async()=>(await cms.find({collection:'private-files',where:{submissionKey:{equals:key}},limit:1,depth:0,overrideAccess:true})).docs[0]
   let stored=await findFile()
   if(!stored){
    try{stored=await cms.create({collection:'private-files',overrideAccess:true,data:{submissionKey:key,sha256:fileHash!},file:{data:bytes,mimetype:detected.mime,name:`brief-${randomUUID()}.${detected.extension}`,size:bytes.length}})}
    catch(error){if(!isUniqueConflict(error))throw error;stored=await findFile();if(!stored)throw error}
   }
   if(stored.sha256!==fileHash)return answer({ok:false,code:'IDEMPOTENCY_CONFLICT',error:en?'The attachment differs from the previous attempt. Reload before a new submission.':'Zalacznik rozni sie od poprzedniej proby. Odswiez strone przed nowym zgloszeniem.'},409)
   attachmentID=stored.id
  }
  try {
   const lead=await cms.create({collection:'leads',overrideAccess:true,data:{...result.data,submissionKey:key,attachment:attachmentID,status:'new',privacyVersion:PRIVACY_VERSION,notificationStatus:'pending',notificationNextAttemptAt:new Date().toISOString()}})
   // Durable outbox: the notification timer retries delivery; HTTP success means DB commit.
   return answer({ok:true,reference:String(lead.id)})
  } catch(error){if(!isUniqueConflict(error))throw error;const retry=await findLead();if(!retry)throw error;return await receipt(retry)}
 } catch(error) {
  if(error instanceof BodyError)return answer({ok:false,code:error.code,error:'Niepoprawne lub zbyt duze zapytanie.'},error.status)
  if(error instanceof Error&&error.message.startsWith('ATTACHMENT_'))return answer({ok:false,code:error.message,error:'Zalacznik jest uszkodzony, aktywny lub nie przeszedl kontroli bezpieczenstwa.'},422)
  console.error(JSON.stringify({component:'contact',code:'PERSISTENCE_OR_SCANNER_UNAVAILABLE'}))
  return answer({ok:false,code:'UNAVAILABLE',error:'Nie udalo sie potwierdzic zapisu. Ponow probe bez odswiezania strony albo napisz e-mail.'},503)
 }
}
