import Link from 'next/link'
import {ParticleHero} from './ParticleHero'
import {FeaturedProjects} from './portfolio/FeaturedProjects'
import {ProjectShowcase} from './portfolio/ProjectShowcase'
import {Reviews} from './Reviews'
import {ConversationPhone} from './ConversationPhone'
import {ContactSection} from './forms/ContactSection'
import {pick,pagePath} from '@/lib/i18n'
import type {SiteData,Locale} from '@/types/site'

export function HomeExperience({data,locale}:{data:SiteData;locale:Locale}){
 const {settings:s,home}=data
 return <main className="home-main" id="main">
   <ParticleHero settings={s} home={home} locale={locale}/>
   <ProjectShowcase locale={locale}><FeaturedProjects projects={data.projects} home={home} locale={locale}/></ProjectShowcase>

   <section className="section home-services" id="services" aria-labelledby="services-heading"><div className="container home-services-layout">
    <div className="home-section-head"><div><p className="eyebrow">02 / {home.servicesKicker.replace(/^\d+\s*\/\s*/,'')}</p><h2 id="services-heading">{home.servicesTitle}</h2></div><p>{home.servicesDescription}</p><Link className="home-service-contact" href={`${pagePath(locale,'home')}#contact`}>{pick(locale,'Porozmawiajmy o zakresie','Discuss your project')} ↗</Link></div>
    <div className="home-services-grid">{data.services.map((service,i)=><details className="home-service" name="home-services" open={i===0} key={service.id}><summary><span>{String(i+1).padStart(2,'0')}</span><strong>{service.title}</strong><span className="service-expand" aria-hidden="true">+</span></summary><p>{service.description}</p></details>)}</div>
  </div></section>

  <span className="home-anchor" id="about" aria-hidden="true"/>
  <section className="section phone-section home-process" id="process" aria-label={pick(locale,'Jak pracujemy razem','How we work together')}><div className="container"><ConversationPhone locale={locale} settings={s} conversation={home.conversation} home={home}/></div></section>

  <Reviews locale={locale}/>
  <div className="home-contact"><ContactSection settings={s} home={home} faqs={data.faqs} locale={locale}/></div>
 </main>
}