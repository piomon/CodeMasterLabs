import type {MetadataRoute} from 'next'
import {getCMS} from '@/lib/site-data'
import {serverURL} from '@/lib/metadata'
import {pagePath,languagePaths} from '@/lib/i18n'
export const dynamic='force-dynamic'
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const cms=await getCMS(),entries:MetadataRoute.Sitemap=[]
 const add=(path:string,lastModified?:string)=>{const pairs=languagePaths(path);entries.push({url:new URL(path,serverURL).href,...(lastModified?{lastModified}:{}),...(pairs?{alternates:{languages:{pl:new URL(pairs.pl,serverURL).href,en:new URL(pairs.en,serverURL).href}}}:{})})}
 for(const locale of ['pl','en'] as const){
  for(const name of ['home','services','projects','blog','contact','privacy','cookies'] as const)add(pagePath(locale,name))
  for(const collection of ['projects','blog-posts'] as const){
   let page=1,more=true
   while(more){
    const batch=await cms.find({collection,locale,overrideAccess:false,limit:100,page,depth:0,sort:'id',select:{slug:true,updatedAt:true}})
    for(const item of batch.docs)add(pagePath(locale,collection==='projects'?'projects':'blog',item.slug),item.updatedAt)
    more=Boolean(batch.hasNextPage);page++
    if(entries.length>48000||page>480)throw new Error('Sitemap exceeds single-file capacity; deploy a sitemap index before exceeding 48000 content URLs.')
   }
  }
 }
 return entries
}
