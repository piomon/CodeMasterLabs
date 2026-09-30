import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {getShowcaseProject} from '@/components/portfolio/project-data'
import {AtelierSite} from '@/components/portfolio/sites/atelier/AtelierSite'
import {MaisonSite} from '@/components/portfolio/sites/maison/MaisonSite'
import {VeloSite} from '@/components/portfolio/sites/velo/VeloSite'
import {NoraSite} from '@/components/portfolio/sites/nora/NoraSite'
import {EmberSite} from '@/components/portfolio/sites/ember/EmberSite'
import {AuraSite} from '@/components/portfolio/sites/aura/AuraSite'

type Props={params:Promise<{locale:string;slug:string}>;searchParams:Promise<{embed?:string}>}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug,locale}=await params
 const project=getShowcaseProject(slug)
 return {title:project?`${project.name} — ${locale==='pl'?'projekt CodeMaster':'a CodeMaster project'}`:'CodeMaster',robots:{index:false,follow:true}}
}
export default async function ShowcasePage({params,searchParams}:Props){
 const {slug,locale}=await params
 const project=getShowcaseProject(slug)
 if(!project||(locale!=='pl'&&locale!=='en'))notFound()
 const embedded=(await searchParams).embed==='1'
 const pl=locale==='pl',home=pl?'/':'/en'
 const components={atelier:AtelierSite,maison:MaisonSite,velo:VeloSite,nora:NoraSite,ember:EmberSite,aura:AuraSite}
 const Site=components[project.id]
 return <>
  {!embedded&&<div className="project-return"><a href={`${home}#product`}>← CodeMaster / {pl?'Wszystkie realizacje':'All projects'}</a><span>{pl?'Autorski projekt demonstracyjny':'An original demonstration project'}</span></div>}
  <Site locale={locale} embedded={embedded}/>
  {!embedded&&<footer className="project-disclosure">{pl?'Projekt demonstracyjny CodeMaster. Marka, produkty i plany są przykładowe. Formularze nie wysyłają rezerwacji, zamówień ani danych do firmy.':'A CodeMaster demonstration. The brand, products and plans are illustrative. Forms do not send bookings, orders or data to a business.'} <a href={`${home}#contact`}>{pl?'Porozmawiajmy o Twojej stronie.':'Let’s discuss your website.'}</a></footer>}
 </>
}