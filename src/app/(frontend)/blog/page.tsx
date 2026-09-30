import {BlogIndex} from '@/components/pages/ContentPages'
import {getArticlePage} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
import {pagedPath} from '@/lib/pagination'
type Props={searchParams:Promise<{page?:string|string[]}>}
export async function generateMetadata({searchParams}:Props){const result=await getArticlePage('pl',(await searchParams).page);return pageMetadata('Notatki o produkcie | CodeMaster','O projektowaniu oprogramowania, procesie wspolpracy i dobrych decyzjach.',pagedPath('/blog',result.page))}
export default async function Page({searchParams}:Props){const result=await getArticlePage('pl',(await searchParams).page);return <BlogIndex articles={result.docs} pagination={result} locale="pl"/>}
