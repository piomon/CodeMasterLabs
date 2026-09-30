import {notFound} from 'next/navigation'
import {CaseStudyPage} from '@/components/pages/ContentPages'
import {getProject} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
import {StructuredData} from '@/components/common/StructuredData'
type Props={params:Promise<{slug:string}>}
export async function generateMetadata({params}:Props){const {slug}=await params,p=await getProject(slug,'pl');if(!p)return{};return pageMetadata(p.seo?.title||`${p.title} | CodeMaster`,p.seo?.description||p.summary,`/realizacje/${slug}`)}
export default async function Page({params}:Props){const {slug}=await params,p=await getProject(slug,'pl');if(!p)notFound();return <><CaseStudyPage project={p} locale="pl"/><StructuredData title={p.title} path={`/realizacje/${slug}`} type="project"/></>}
