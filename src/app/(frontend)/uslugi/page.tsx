import { ServicesPage } from '@/components/pages/ServicesPage'
import { getSiteData } from '@/lib/site-data'
import { pageMetadata } from '@/lib/metadata'
export const metadata=pageMetadata('Systemy, aplikacje i automatyzacja | CodeMaster','Oprogramowanie dopasowane do procesu firmy. Sprawdź zakres i działające demonstracje.','/uslugi')
export default async function Page(){return <ServicesPage data={await getSiteData('pl')} locale="pl"/>}
