import {HomeExperience} from '@/components/HomeExperience'
import {getSiteData} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
export async function generateMetadata(){const {settings}=await getSiteData('pl');return pageMetadata(settings.seoTitle,settings.seoDescription,'/','pl',settings.seoImage)}
export default async function Page(){return <HomeExperience data={await getSiteData('pl')} locale="pl"/>}
