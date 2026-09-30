import type {ReactNode} from 'react'
import type {Metadata,Viewport} from 'next'
import {headers} from 'next/headers'
import {SiteShell} from '@/components/common/SiteShell'
import {getSiteData} from '@/lib/site-data'
import {serverURL,safeJSON} from '@/lib/metadata'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './globals.css'
import './studio.css'
import './redesign.css'
import '@/components/homepage.css'
export const metadata:Metadata={metadataBase:new URL(serverURL),icons:{icon:'/icon.svg'},robots:{index:true,follow:true}}
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#0a0b0e',colorScheme:'dark'}
export default async function Layout({children}:{children:ReactNode}){
 const h=await headers(),locale=h.get('x-cm-locale')==='en'?'en':'pl',data=await getSiteData(locale)
  const structured={'@context':'https://schema.org','@graph':[{'@type':'ProfessionalService','@id':`${serverURL}/#studio`,name:data.settings.brandName,url:serverURL,email:data.settings.email,description:data.settings.seoDescription},{'@type':'WebSite',name:'CodeMaster',url:serverURL,inLanguage:['pl','en']}]}
 return <html lang={locale}><body><SiteShell settings={data.settings} nav={data.nav} footer={data.footer} locale={locale}>{children}</SiteShell><script nonce={h.get('x-nonce')||undefined} type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJSON(structured)}}/></body></html>
}
