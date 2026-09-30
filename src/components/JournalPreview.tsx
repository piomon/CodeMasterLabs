import Link from 'next/link'
import { Icon } from './common/Icon'
import { pagePath, pick } from '@/lib/i18n'
import type { Article, Locale } from '@/types/site'
function Art({kind}:{kind:string}){return <div className={`journal-art journal-art-${kind}`}><div className="journal-ui-top"><span>CodeMaster / notes</span><i>+</i></div>{kind==='problem'?<div className="journal-problem"><span>PROCESS</span><strong>?</strong><div><i/><i/><i/></div></div>:kind==='approval'?<div className="journal-approval"><div>AI</div><span>→</span><div className="approval-human"><Icon name="shield" size={22}/></div><small>APPROVAL REQUIRED</small></div>:<div className="journal-preview"><div className="preview-window"><span/><span/><span/></div><div className="preview-comment">feedback → shipped</div></div>}</div>}

export function JournalPreview({ locale, articles }: { locale: Locale; articles: Article[] }) {
 if (!articles.length) return null
 return <section className="section journal-section" id="journal"><div className="container">
  <div className="journal-head"><div><p className="eyebrow">06 / CODEMASTER JOURNAL</p><h2>{pick(locale,'Za dobrym kodem\nsą dobre pytania.','Good code starts\nwith good questions.')}</h2></div><Link href={pagePath(locale,'blog')} className="inline-link">{pick(locale,'Wszystkie notatki','All notes')}<Icon name="external" size={14}/></Link></div>
  <div className="journal-grid">{articles.slice(0,3).map((article,i)=><article key={article.id}>
   <Link href={pagePath(locale,'blog',article.slug)} className="journal-art-link" aria-label={article.title}><Art kind={['problem','approval','preview'][i]}/></Link>
   <p className="eyebrow">0{i+1} / PRODUCT NOTE</p><h3><Link href={pagePath(locale,'blog',article.slug)}>{article.title}</Link></h3><p>{article.excerpt}</p>
   <Link href={pagePath(locale,'blog',article.slug)} className="inline-link">{pick(locale,'Czytaj notatkę','Read note')}<Icon name="arrow" size={14}/></Link>
  </article>)}</div>
 </div></section>
}
