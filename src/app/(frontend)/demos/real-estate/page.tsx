import { EstateExperience } from '@/components/estate/EstateExperience'
import { pageMetadata } from '@/lib/metadata'

export const metadata = {
 ...pageMetadata('Osiedle A | CodeMaster', 'Interaktywny pokaz mieszkań na danych demonstracyjnych.', '/demos/real-estate'),
 robots: { index: false, follow: true },
}

export default function Page() {
 return <EstateExperience locale="pl" />
}