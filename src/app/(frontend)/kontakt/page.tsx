import {ContactSection} from '@/components/forms/ContactSection'
import {getSiteData} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
export const metadata=pageMetadata('Porozmawiajmy o projekcie | CodeMaster','Nie musisz miec gotowej specyfikacji. Opowiedz, co chcesz usprawnic.','/kontakt')
export default async function Page(){const d=await getSiteData('pl');return <main id="main" className="inner-page contact-page"><div id="top"/><ContactSection page settings={d.settings} home={d.home} faqs={d.faqs} locale="pl"/></main>}
