import type {Payload,DataFromGlobalSlug,RequiredDataFromCollectionSlug} from 'payload'
import {settings,homepage,services,projects,faqs,navigation,footer} from './defaults'
import {defaultArticles} from './article-defaults'
type ContentCollection='services'|'projects'|'faqs'|'blog-posts'
/** Seed only a completely empty editorial installation. Never overwrite partial real content. */
export async function seedContent(payload:Payload){
 const state=await payload.findGlobal({slug:'installation-state',overrideAccess:true})
 if(state.contentInitializedAt){payload.logger.info('Content was already initialized: seed skipped.');return}
 const counts=await Promise.all((['services','projects','faqs','blog-posts'] as const).map(collection=>payload.count({collection,overrideAccess:true})))
 const globals=await Promise.all((['site-settings','homepage','navigation','footer','contact-settings'] as const).map(slug=>payload.findGlobal({slug,overrideAccess:true})))
 const hasEditorialGlobals=globals.some(value=>{const g=value as unknown as Record<string,unknown>;return ['email','heroTitle','servicesTitle','statement','legalName'].some(k=>typeof g[k]==='string'&&String(g[k]).trim())||['links','trustItems','conversation'].some(k=>Array.isArray(g[k])&&(g[k] as unknown[]).length>0)})
 if(counts.some(result=>result.totalDocs>0)||hasEditorialGlobals){await payload.updateGlobal({slug:'installation-state',overrideAccess:true,data:{contentInitializedAt:new Date().toISOString()}});payload.logger.info('Existing editorial content: seed skipped without overwriting.');return}
 const transactionID=await payload.db.beginTransaction()
 if(transactionID===null)throw new Error('Atomic content seeding requires database transactions.')
 const req={transactionID}
 try{
  for(const locale of ['pl','en'] as const){
   await payload.updateGlobal({slug:'site-settings',locale,overrideAccess:true,req,data:{...settings[locale],email:process.env.SITE_CONTACT_EMAIL||process.env.LEAD_NOTIFY_EMAIL||settings[locale].email} as unknown as DataFromGlobalSlug<'site-settings'>})
   await payload.updateGlobal({slug:'homepage',locale,overrideAccess:true,req,data:homepage[locale] as unknown as DataFromGlobalSlug<'homepage'>})
   await payload.updateGlobal({slug:'navigation',locale,overrideAccess:true,req,data:navigation[locale] as unknown as DataFromGlobalSlug<'navigation'>})
   await payload.updateGlobal({slug:'footer',locale,overrideAccess:true,req,data:footer[locale] as unknown as DataFromGlobalSlug<'footer'>})
  }
  async function insert<T extends ContentCollection>(collection:T,source:{pl:{id:string|number}[];en:{id:string|number}[]}){
   if(source.pl.length!==source.en.length)throw new Error(`Seed locale length mismatch: ${collection}`)
   for(let i=0;i<source.pl.length;i++){
    const {id:_id,...pl}=source.pl[i],{id:_enId,...en}=source.en[i]
    const data={...pl,_status:'published'} as unknown as RequiredDataFromCollectionSlug<T>
    const translated={...en,_status:'published'} as unknown as RequiredDataFromCollectionSlug<T>
    const doc=await payload.create({collection,locale:'pl',overrideAccess:true,req,data})
     await payload.update({collection,id:doc.id,locale:'en',overrideAccess:true,req,data:translated as never})
   }
  }
  await insert('services',services)
  await insert('projects',projects)
  await insert('faqs',faqs)
  await insert('blog-posts',defaultArticles)
  await payload.updateGlobal({slug:'installation-state',overrideAccess:true,req,data:{contentInitializedAt:new Date().toISOString()}})
  await payload.db.commitTransaction(transactionID)
 }catch(error){await payload.db.rollbackTransaction(transactionID);throw error}
 payload.logger.info('CodeMaster sample content seeded. No administrator, client claims or testimonials created.')
}
