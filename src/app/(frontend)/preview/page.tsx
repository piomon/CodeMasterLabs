import {headers} from 'next/headers'
import {notFound} from 'next/navigation'
import {getCMS,getSiteData} from '@/lib/site-data'
import {previewTarget} from '@/lib/preview-target'
import {CaseStudyPage,ArticlePage} from '@/components/pages/ContentPages'
import {LivePreviewRefresh} from '@/components/cms/LivePreviewRefresh'
import {HomeExperience} from '@/components/HomeExperience'
import type {Project,Article} from '@/types/site'
export const metadata={title:'CMS preview | CodeMaster',robots:{index:false,follow:false}}
export default async function Preview({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const cms=await getCMS(),auth=await cms.auth({headers:await headers()});if(!auth.user)notFound()
 const target=previewTarget(await searchParams);if(!target)notFound()
 if(target.kind==='home')return <><LivePreviewRefresh/><HomeExperience data={await getSiteData(target.locale)} locale={target.locale}/></>
 const collection=target.kind==='project'?'projects':'blog-posts'
 const doc=(await cms.find({collection,where:{id:{equals:target.id}},draft:true,locale:target.locale,overrideAccess:false,user:auth.user,limit:1})).docs[0]
 if(!doc)notFound()
 return <><LivePreviewRefresh/>{target.kind==='project'?<CaseStudyPage project={doc as unknown as Project} locale={target.locale}/>:<ArticlePage article={doc as unknown as Article} locale={target.locale}/>}</>
}
