import {languagePaths} from './i18n'
import type {Metadata} from 'next'
import type {Locale,Media,ID} from '@/types/site'
export const serverURL=(process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)||'http://localhost:3000'
export function pageMetadata(title:string,description:string,path:string,locale:Locale='pl',image?:Media|ID|null):Metadata{
 const requested=new URL(path,serverURL),url=requested.toString(),paths=languagePaths(requested.pathname)
 let cover='/og-codemaster.png'
 if(image&&typeof image==='object'&&typeof image.url==='string'){try{const candidate=new URL(image.url,serverURL);if(candidate.origin===new URL(serverURL).origin&&/^https?:$/.test(candidate.protocol))cover=candidate.href}catch{/* Keep safe default. */}}
 const languages=paths?{pl:new URL(paths.pl+requested.search,serverURL).href,en:new URL(paths.en+requested.search,serverURL).href,'x-default':new URL(paths.pl+requested.search,serverURL).href}:undefined
 return{title,description,metadataBase:new URL(serverURL),alternates:{canonical:url,languages},openGraph:{type:'website',siteName:'CodeMaster',title,description,url,locale:locale==='pl'?'pl_PL':'en_GB',images:[{url:cover,alt:image&&typeof image==='object'?image.alt||title:title}]},twitter:{card:'summary_large_image',title,description,images:[cover]}}
}
export function safeJSON(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c')}
