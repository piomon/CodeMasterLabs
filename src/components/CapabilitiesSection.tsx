import Link from 'next/link'
import {Icon} from './common/Icon'
import {pagePath,pick} from '@/lib/i18n'
import type {Locale} from '@/types/site'

const capabilities=[
 {pl:['Aplikacje i platformy SaaS','Produkty webowe, portale klientów i narzędzia dostępne na każdym ekranie.'],en:['Applications & SaaS platforms','Web products, customer portals and tools that work across screens.']},
 {pl:['Systemy dla firm','CRM, obiegi pracy, panele administracyjne i systemy, które porządkują codzienną pracę.'],en:['Business systems','CRM, workflows, admin panels and systems that bring order to daily work.']},
 {pl:['Strony i doświadczenia webowe','Szybkie strony firmowe i serwisy, które jasno pokazują ofertę i ułatwiają kontakt.'],en:['Websites & digital experiences','Fast business websites that make your offer clear and starting a conversation easy.']},
 {pl:['AI i automatyzacje','Asystenci, praca z dokumentami i automatyzacje tam, gdzie rozwiązują realny problem.'],en:['AI & automation','Assistants, document workflows and automation where they solve a real problem.']},
 {pl:['Integracje i API','Łączymy istniejące narzędzia, dane i procesy, zamiast tworzyć kolejne odizolowane miejsce.'],en:['Integrations & APIs','Connecting existing tools, data and processes rather than adding another isolated system.']},
 {pl:['Rozwój i modernizacja','Usprawniamy istniejące produkty, migrujemy etapami i rozwijamy to, co już działa.'],en:['Growth & modernization','Improving existing products, migrating in stages and evolving what already works.']},
]
export function CapabilitiesSection({locale}:{locale:Locale}){
 return <section className="section capabilities-section" aria-labelledby="capabilities-title"><div className="container">
  <div className="capabilities-intro"><div><p className="eyebrow">02 / {pick(locale,'CO MOŻEMY ZBUDOWAĆ','WHAT WE CAN BUILD')}</p><h2 id="capabilities-title">{pick(locale,'Technologia dopasowana do Twojego biznesu.','Technology shaped around your business.')}</h2></div><p>{pick(locale,'Nie musisz wiedzieć, czy potrzebujesz aplikacji, integracji czy automatyzacji. Zaczynamy od tego, co ma się zmienić w Twojej firmie.','You do not need to know whether you need an app, an integration or automation. We start with what needs to change in your business.')}</p></div>
  <div className="capabilities-list">{capabilities.map((item,i)=>{const [title,description]=item[locale];return <article className="capability-item" key={i}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{description}</p></div></article>})}</div>
  <div className="capabilities-footer"><span>{pick(locale,'Nowy pomysł lub istniejący system — oba są dobrym początkiem.','A new idea or an existing system — both are good starting points.')}</span><Link href={pagePath(locale,'services')}>{pick(locale,'Poznaj obszary współpracy','Explore services')}<Icon name="arrow" size={17}/></Link></div>
 </div></section>
}