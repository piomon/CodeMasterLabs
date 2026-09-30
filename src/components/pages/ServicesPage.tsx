import { ServiceExperience } from '../services/ServiceExperience'
import { ContactSection } from '../forms/ContactSection'
import { CapabilitiesSection } from '../CapabilitiesSection'
import { ApproachSection } from '../ApproachSection'
import { DeliveryWorkflow } from '../DeliveryWorkflow'
import { Button } from '../common/Button'
import { pagePath,pick } from '@/lib/i18n'
import type { Locale, SiteData } from '@/types/site'
export function ServicesPage({data,locale}:{data:SiteData;locale:Locale}) {
  return <main id="main" className="inner-page"><div className="container"><header className="page-intro"><p className="eyebrow">CODEMASTER / {pick(locale,'USŁUGI','SERVICES')}</p><h1>{data.home.servicesTitle}</h1><p>{data.home.servicesDescription}</p><Button href={pagePath(locale,'contact')} className="page-intro-cta">{pick(locale,'Porozmawiajmy o projekcie','Let’s talk about your project')}</Button></header></div><CapabilitiesSection locale={locale}/><section className="section services-deep-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">02 / {pick(locale,'W PRAKTYCE','IN PRACTICE')}</p><h2>{pick(locale,'Różne wyzwania.\nJeden dobry proces.','Different challenges.\nOne clear process.')}</h2></div><p className="section-description">{pick(locale,'Wybierz obszar, żeby zobaczyć przykładowy kierunek interfejsu. To wizualizacje koncepcyjne, nie prezentacja wdrożeń u klientów.','Choose an area to see an illustrative interface direction. These are concept visuals, not claims of client deployments.')}</p></div><ServiceExperience services={data.services} locale={locale}/></div></section><ApproachSection locale={locale}/><section className="section delivery-section"><div className="container"><DeliveryWorkflow locale={locale} home={data.home}/></div></section><ContactSection settings={data.settings} home={data.home} faqs={data.faqs} locale={locale}/></main>
}
