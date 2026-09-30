import '@fontsource-variable/dm-sans'
import '@fontsource-variable/cormorant-garamond'
import '@fontsource/anton'
import '@fontsource/ibm-plex-mono/400.css'
import '@/components/portfolio/sites/site-base.css'
import './showcase-root.css'
import {notFound} from 'next/navigation'

export default async function ShowcaseLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params
 if(locale!=='pl'&&locale!=='en')notFound()
 return <html lang={locale}><body>{children}</body></html>
}