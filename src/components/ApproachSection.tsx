import {Button} from './common/Button'
import {pagePath,pick} from '@/lib/i18n'
import type {Locale} from '@/types/site'

export function ApproachSection({locale}:{locale:Locale}){
 const points=locale==='pl'?[
  ['Najpierw zrozumienie','Rozmawiamy o celu i użytkownikach. Dokumentacja techniczna nie jest potrzebna na start.'],
  ['Kierunek przed zobowiązaniem','W odpowiednich projektach możemy przygotować poglądowe demo przed pełną realizacją.'],
  ['Widoczny postęp','Pracujemy etapami. Możesz testować wersję roboczą i zgłaszać uwagi w trakcie.'],
  ['Kontrola po wdrożeniu','Panel do codziennej obsługi, jasne warunki przekazania i możliwość dalszego wsparcia.'],
 ]:[
  ['Understanding first','We talk about your goals and users. You do not need a technical specification to start.'],
  ['Direction before commitment','For suitable projects, an illustrative demo can help establish the direction before full delivery.'],
  ['Visible progress','We work in stages. You can test a working version and give feedback as we build.'],
  ['Control after launch','Tools for day-to-day management, clear handover terms and optional ongoing support.'],
 ]
 return <section className="section approach-section" aria-labelledby="approach-title"><div className="container approach-grid"><div><p className="eyebrow">05 / {pick(locale,'JAK PRACUJEMY','HOW WE WORK')}</p><h2 id="approach-title">{locale==='pl'?<>Ty znasz swój biznes.<br/><em>My zajmiemy się technologią.</em></>:<>You know your business.<br/><em>We handle the technology.</em></>}</h2></div><div className="approach-content"><p>{pick(locale,'Bez technicznego żargonu i bez wielomiesięcznej pracy za zamkniętymi drzwiami. Projekt powstaje we współpracy z Tobą — nie obok Ciebie.','No technical jargon or months of building behind closed doors. The product takes shape with you, not away from you.')}</p><div className="approach-points">{points.map(([title,body],i)=><article key={title}><span>{String(i+1).padStart(2,'0')} /</span><h3>{title}</h3><p>{body}</p></article>)}</div><Button href={pagePath(locale,'contact')}>{pick(locale,'Opowiedz nam o pomyśle','Tell us about your idea')}</Button></div></div></section>
}