import {pagedPath} from '@/lib/pagination'
import {ServicesPage} from '@/components/pages/ServicesPage'
import {notFound} from 'next/navigation'
import {HomeExperience} from '@/components/HomeExperience'
import {ProjectsPage,CaseStudyPage,BlogIndex,ArticlePage,PrivacyPage} from '@/components/pages/ContentPages'
import {ContactSection} from '@/components/forms/ContactSection'
import {DemoWorkbench,type DemoKind} from '@/components/DemoWorkbench'
import {EstateExperience} from '@/components/estate/EstateExperience'
import {getSiteData,getProjectPage,getProject,getArticlePage,getArticle} from '@/lib/site-data'
import {pageMetadata} from '@/lib/metadata'
import {StructuredData} from '@/components/common/StructuredData'
type Props={params:Promise<{path?:string[]}>;searchParams:Promise<{page?:string|string[]}>}
export async function generateMetadata({params,searchParams}:Props){const path=(await params).path||[],url='/en'+(path.length?'/'+path.join('/'):'');let title='CodeMaster - Software that fits your business',description='Custom systems, web applications, premium websites and automation. Direct collaboration with Piotr Montewka.'
 if(!path.length){const {settings}=await getSiteData('en');return pageMetadata(settings.seoTitle,settings.seoDescription,'/en','en',settings.seoImage)}
 if(path[0]==='projects'&&path[1]){const p=await getProject(path[1],'en');if(p){title=p.seo?.title||`${p.title} | CodeMaster`;description=p.seo?.description||p.summary}}
 if(path[0]==='blog'&&path[1]){const p=await getArticle(path[1],'en');if(p){title=p.seo?.title||`${p.title} | CodeMaster`;description=p.seo?.description||p.excerpt}}
 if(path.length===1){const labels:Record<string,string>={services:'Services',projects:'Product studies',blog:'Journal',contact:'Contact',privacy:'Privacy',cookies:'Cookies'};if(labels[path[0]])title=`${labels[path[0]]} | CodeMaster`}
  if(path[0]==='demos'&&path.length===2&&path[1]==='real-estate')return {...pageMetadata('Building A apartments | CodeMaster','Interactive property-development demo using sample browser data.',url,'en'),robots:{index:false,follow:true}}
  if(path[0]==='demos')return {...pageMetadata('Interactive product demo | CodeMaster','A functional prototype using sample browser data.',url,'en'),robots:{index:false,follow:true}}
 if(path.length===1&&['projects','blog'].includes(path[0])){const result=await (path[0]==='projects'?getProjectPage:getArticlePage)('en',(await searchParams).page);return pageMetadata(title,description,pagedPath(url,result.page),'en')}
 return pageMetadata(title,description,url,'en')
}
export default async function Page({params,searchParams}:Props){const path=(await params).path||[],d=await getSiteData('en')
 if(!path.length)return <HomeExperience data={d} locale="en"/>
 if(path[0]==='services'&&path.length===1)return <ServicesPage data={d} locale="en"/>
 if(path[0]==='projects'&&path.length===1){const result=await getProjectPage('en',(await searchParams).page);return <ProjectsPage projects={result.docs} pagination={result} locale="en"/>}
 if(path[0]==='projects'&&path.length===2){const p=await getProject(path[1],'en');if(!p)notFound();return <><CaseStudyPage project={p} locale="en"/><StructuredData type="project" path={`/en/projects/${p.slug}`} title={p.title}/></>}
 if(path[0]==='blog'&&path.length===1){const result=await getArticlePage('en',(await searchParams).page);return <BlogIndex articles={result.docs} pagination={result} locale="en"/>}
 if(path[0]==='blog'&&path.length===2){const p=await getArticle(path[1],'en');if(!p)notFound();return <><ArticlePage article={p} locale="en"/><StructuredData type="article" path={`/en/blog/${p.slug}`} title={p.title} date={p.publishedAt} author={p.author}/></>}
 if(path[0]==='demos'&&path.length===2&&['operations','approval','commerce','client-portal'].includes(path[1]))return <DemoWorkbench key={path[1]} kind={path[1] as DemoKind} locale="en"/>
  if(path[0]==='demos'&&path.length===2&&path[1]==='real-estate')return <EstateExperience locale="en"/>
 if(path[0]==='contact'&&path.length===1)return <main id="main" className="inner-page contact-page"><div id="top"/><ContactSection page settings={d.settings} home={d.home} faqs={d.faqs} locale="en"/></main>
 if(['privacy','cookies'].includes(path[0])&&path.length===1)return <PrivacyPage settings={d.settings} locale="en" cookies={path[0]==='cookies'}/>
 notFound()
}
