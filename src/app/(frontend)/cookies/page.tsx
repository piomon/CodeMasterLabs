import {PrivacyPage} from '@/components/pages/ContentPages'
import {getSiteData} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
export const metadata=pageMetadata("Cookies | CodeMaster",'Informacje o prywatnosci i dzialaniu witryny.','/cookies')
export default async function Page(){return <PrivacyPage settings={(await getSiteData('pl')).settings} locale="pl" cookies={true}/>}
