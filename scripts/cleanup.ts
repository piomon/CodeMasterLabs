import {getPayload} from 'payload'
import config from '../src/payload.config'
const cms=await getPayload({config})
try{
 let expired=0,leads=0,files=0
 for(let batchNumber=0;batchNumber<100;batchNumber++){
  const batch=await cms.find({collection:'form-attempts',overrideAccess:true,where:{expiresAt:{less_than:new Date().toISOString()}},limit:100,depth:0})
  if(!batch.docs.length)break
  for(const doc of batch.docs){await cms.delete({collection:'form-attempts',id:doc.id,overrideAccess:true});expired++}
 }
 // Retention is opt-in, affects CLOSED enquiries only, and never defaults silently.
 const setting=process.env.LEAD_RETENTION_DAYS
 if(setting){
  const days=Number(setting)
  if(!Number.isInteger(days)||days<1||days>36500)throw new Error('Invalid LEAD_RETENTION_DAYS')
  const cutoff=new Date(Date.now()-days*86400000).toISOString()
  for(let batchNumber=0;batchNumber<100;batchNumber++){
   const batch=await cms.find({collection:'leads',overrideAccess:true,where:{and:[{status:{equals:'closed'}},{updatedAt:{less_than:cutoff}}]},limit:100,depth:0})
   if(!batch.docs.length)break
   for(const lead of batch.docs){
    const id=typeof lead.attachment==='object'?lead.attachment?.id:lead.attachment
    await cms.delete({collection:'leads',id:lead.id,overrideAccess:true});leads++
    if(id){const linked=await cms.count({collection:'leads',overrideAccess:true,where:{attachment:{equals:id}}});if(!linked.totalDocs){await cms.delete({collection:'private-files',id,overrideAccess:true});files++}}
   }
  }
 }
 // Attachments committed before a failed lead insert cannot remain forever.
 const orphanCutoff=new Date(Date.now()-24*60*60*1000).toISOString()
 let after:number|string|undefined
 for(let batchNumber=0;batchNumber<100;batchNumber++){
  const batch=await cms.find({collection:'private-files',overrideAccess:true,where:{and:[{createdAt:{less_than:orphanCutoff}},...(after?[{id:{greater_than:after}}]:[])]},sort:'id',limit:100,depth:0})
  if(!batch.docs.length)break
  for(const file of batch.docs){const linked=await cms.count({collection:'leads',overrideAccess:true,where:{attachment:{equals:file.id}}});if(!linked.totalDocs){await cms.delete({collection:'private-files',id:file.id,overrideAccess:true});files++}}
  after=batch.docs.at(-1)?.id
 }
 console.log(JSON.stringify({component:'cleanup',expired,leads,files,timestamp:new Date().toISOString()}))
}finally{await cms.destroy()}
