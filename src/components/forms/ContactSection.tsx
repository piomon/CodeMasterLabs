import {ContactForm} from '../ContactForm'
import {Icon} from '../common/Icon'
import {pick} from '@/lib/i18n'
import type {Settings,HomepageContent,FAQ,Locale} from '@/types/site'
import './concise-contact.css'

export function ContactSection({settings:s,home,faqs,locale,page=false}:{settings:Settings;home:HomepageContent;faqs:FAQ[];locale:Locale;page?:boolean}){
 const Heading=page?'h1':'h2'
 return <section className="section contact-section concise-contact" id="contact">
  <div className="container contact-grid">
   <div className="contact-copy">
    <p className="eyebrow">{pick(locale,'POROZMAWIAJMY','LET’S TALK')}</p>
    <Heading>{home.contactTitle}</Heading>
    <p className="section-description">{home.contactDescription}</p>
    <a className="contact-email" href={`mailto:${s.email}`}>{s.email}<Icon name="external" size={20}/></a>
    {s.phone&&<a className="contact-phone" href={`tel:${s.phone.replace(/[^+\d]/g,'')}`}>{s.phone}</a>}
    <div className="concise-faq">{faqs.slice(0,3).map(f=><details key={f.id}>
     <summary>{f.question}<Icon name="plus" size={14}/></summary><p>{f.answer}</p>
    </details>)}</div>
   </div>
   <ContactForm locale={locale} email={s.email}/>
  </div>
 </section>
}