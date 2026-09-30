import {PrivacyPage} from '@/components/pages/ContentPages'
import {getSiteData} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
export const metadata=pageMetadata("Prywatnosc | CodeMaster",'Informacje o prywatnosci i dzialaniu witryny.','/polityka-prywatnosci')
export default async function Page(){return <PrivacyPage settings={(await getSiteData('pl')).settings} locale="pl" cookies={false}/>}
