import {notFound} from 'next/navigation'
import {ArticlePage} from '@/components/pages/ContentPages'
import {getArticle} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
import {StructuredData} from '@/components/common/StructuredData'
type Props={params:Promise<{slug:string}>}
export async function generateMetadata({params}:Props){const {slug}=await params,p=await getArticle(slug,'pl');return p?pageMetadata(p.seo?.title||`${p.title} | CodeMaster`,p.seo?.description||p.excerpt,`/blog/${slug}`):{}}
export default async function Page({params}:Props){const {slug}=await params,p=await getArticle(slug,'pl');if(!p)notFound();return <><ArticlePage article={p} locale="pl"/><StructuredData title={p.title} path={`/blog/${slug}`} type="article" date={p.publishedAt} author={p.author}/></>}
