import {ProjectsPage} from '@/components/pages/ContentPages'
import {getProjectPage} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
import {pagedPath} from '@/lib/pagination'
type Props={searchParams:Promise<{page?:string|string[]}>}
export async function generateMetadata({searchParams}:Props){const result=await getProjectPage('pl',(await searchParams).page);return pageMetadata('Projekty i koncepcje | CodeMaster','Kontekst, problem i kierunek rozwiazania. Zobacz portfolio CodeMaster.',pagedPath('/realizacje',result.page))}
export default async function Page({searchParams}:Props){const result=await getProjectPage('pl',(await searchParams).page);return <ProjectsPage projects={result.docs} pagination={result} locale="pl"/>}
