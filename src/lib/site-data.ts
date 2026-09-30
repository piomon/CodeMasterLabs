import {pageNumber} from './pagination'
import 'server-only'
import {cache} from 'react'
import {getPayload} from 'payload'
import config from '@payload-config'
import * as defaults from './defaults'
import type {SiteData,Locale,Project,Article} from '@/types/site'
export const getCMS=cache(()=>getPayload({config}))
export const getSiteData=cache(async(locale:Locale='pl'):Promise<SiteData>=>{
 const p=await getCMS()
 const [settings,home,nav,footer,services,projects,testimonials,faqs,seo,social,privacy,articles]=await Promise.all([
  p.findGlobal({slug:'site-settings',locale,overrideAccess:false,depth:1}),p.findGlobal({slug:'homepage',locale,overrideAccess:false}),p.findGlobal({slug:'navigation',locale,overrideAccess:false}),p.findGlobal({slug:'footer',locale,overrideAccess:false}),
  p.find({collection:'services',locale,overrideAccess:false,sort:'order',limit:20}),p.find({collection:'projects',locale,overrideAccess:false,sort:'order',depth:1,limit:12,where:{featured:{equals:true}}}),p.find({collection:'testimonials',locale,overrideAccess:false,limit:12,where:{featured:{equals:true}}}),p.find({collection:'faqs',locale,overrideAccess:false,sort:'order',limit:20}),p.findGlobal({slug:'seo',locale,overrideAccess:false}),p.findGlobal({slug:'social-links',locale,overrideAccess:false}),p.findGlobal({slug:'contact-settings',locale,overrideAccess:false}),p.find({collection:'blog-posts',locale,overrideAccess:false,sort:'-publishedAt',limit:3,depth:1})
 ])
 // Defaults fill missing text fields only. Unpublished collection documents are never replaced with public demo records.
 const merge=<T,>(base:T,value:object):T=>({...base,...Object.fromEntries(Object.entries(value).filter(([,v])=>v!==null&&v!==undefined&&v!==''))}) as T
 const result:SiteData={settings:merge(defaults.settings[locale],settings),home:merge(defaults.homepage[locale],home),nav:merge(defaults.navigation[locale],nav),footer:merge(defaults.footer[locale],footer),services:services.docs as unknown as SiteData['services'],projects:projects.docs.filter(d=>d.featured) as unknown as Project[],testimonials:testimonials.docs as unknown as SiteData['testimonials'],faqs:faqs.docs as unknown as SiteData['faqs'],articles:articles.docs as unknown as Article[]}
 result.settings.privacyInfo=privacy as unknown as SiteData['settings']['privacyInfo']
 result.settings.seoImage=seo.ogImage as SiteData['settings']['seoImage']
 if(seo.title)result.settings.seoTitle=String(seo.title);if(seo.description)result.settings.seoDescription=String(seo.description)
 if(Array.isArray(social.links)){const links=social.links.filter((link):link is typeof link & {label:string;href:string}=>typeof link.label==='string'&&typeof link.href==='string');result.footer.links=[...result.footer.links,...links]}
 return result
})
export const getProjects=cache(async(locale:Locale)=>{const p=await getCMS();return(await p.find({collection:'projects',locale,overrideAccess:false,sort:'order',limit:100,depth:1})).docs as unknown as Project[]})
export const getProject=cache(async(slug:string,locale:Locale)=>{const p=await getCMS();return(await p.find({collection:'projects',where:{slug:{equals:slug}},locale,overrideAccess:false,depth:1,limit:1})).docs[0] as unknown as Project|undefined})
export const getArticles=cache(async(locale:Locale)=>{const p=await getCMS();return(await p.find({collection:'blog-posts',locale,overrideAccess:false,sort:'-publishedAt',depth:1,limit:100})).docs as unknown as Article[]})
export const getArticle=cache(async(slug:string,locale:Locale)=>{const p=await getCMS();return(await p.find({collection:'blog-posts',where:{slug:{equals:slug}},locale,overrideAccess:false,depth:1,limit:1})).docs[0] as unknown as Article|undefined})

/** Bounded public pages: entries beyond the old fixed 100-document cap remain reachable. */
async function contentPage<T>(collection:'projects'|'blog-posts',locale:Locale,requested:unknown) {
 const cms=await getCMS(),page=pageNumber(requested)
 const query={collection,locale,overrideAccess:false as const,sort:collection==='projects'?'order':'-publishedAt',depth:1,limit:12}
 let result=await cms.find({...query,page})
 const totalPages=Math.max(1,result.totalPages),actual=Math.min(page,totalPages)
 if(actual!==page)result=await cms.find({...query,page:actual})
 return {docs:result.docs as unknown as T[],page:actual,totalPages,totalDocs:result.totalDocs}
}
export const getProjectPage=cache((locale:Locale,page:unknown=1)=>contentPage<Project>('projects',locale,page))
export const getArticlePage=cache((locale:Locale,page:unknown=1)=>contentPage<Article>('blog-posts',locale,page))
