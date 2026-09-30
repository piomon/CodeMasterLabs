'use client'
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react'
import type {Locale} from '@/types/site'
import {DeviceViewport} from './DeviceViewport'
import {SHOWCASE_PROJECTS,projectSource,projectUrl,type ProjectId} from './project-data'
import './showcase.css'
import './device-finish.css'

function ProjectFrame({id,locale,mobile=false}:{id:ProjectId;locale:Locale;mobile?:boolean}){
 const [loaded,setLoaded]=useState(false)
 const frame=useRef<HTMLIFrameElement>(null)
 useEffect(()=>{
  // SSR frames can finish loading before React attaches its onLoad listener.
  const document=frame.current?.contentDocument
  if(document?.readyState==='complete'&&document.URL!=='about:blank')setLoaded(true)
 },[])
 const project=SHOWCASE_PROJECTS.find(item=>item.id===id)!
 return <div className="project-frame">
  <iframe ref={frame} src={projectUrl(id,locale,true)} title={`${project.name} — ${mobile?(locale==='pl'?'widok telefonu':'mobile website'):(locale==='pl'?'widok komputerowy':'desktop website')}`} loading="lazy" onLoad={()=>setLoaded(true)}/>
  {!loaded&&<div className="project-frame-loading" role="status"><strong>{project.name}</strong><span>{locale==='pl'?'Otwieram prezentację…':'Opening the experience…'}</span></div>}
 </div>
}

export function ProjectShowcase({locale,children}:{locale:Locale;children?:ReactNode}){
 const [selected,setSelected]=useState<ProjectId>('atelier')
 const [mode,setMode]=useState<'preview'|'code'>('preview')
 const [copied,setCopied]=useState(false)
 const [copyError,setCopyError]=useState(false)
 const [hydrated,setHydrated]=useState(false)
 useEffect(()=>setHydrated(true),[])
 const project=SHOWCASE_PROJECTS.find(item=>item.id===selected)!
 const index=SHOWCASE_PROJECTS.indexOf(project)
 const pl=locale==='pl'
 const choose=(id:ProjectId)=>{setSelected(id);setCopied(false);setCopyError(false)}
 const source=projectSource(project,locale)
 const copy=async()=>{
  try{await navigator.clipboard.writeText(source);setCopied(true);setCopyError(false)}
  catch{setCopyError(true)}
 }
 const desktop=<div className="showcase-browser">
  <div className="showcase-browser-bar">
   <span className="browser-traffic" aria-hidden="true"><i/><i/><i/></span>
   <label><span className="sr-only">{pl?'Projekt na ekranie laptopa':'Project on the laptop screen'}</span>
    <select value={selected} onChange={event=>choose(event.target.value as ProjectId)} disabled={!hydrated}>
     {SHOWCASE_PROJECTS.map(item=><option key={item.id} value={item.id}>{item.name} / {item.sector[locale]}</option>)}
    </select>
   </label>
   <span className="browser-mode">
    <button onClick={()=>setMode('preview')} aria-pressed={mode==='preview'} disabled={!hydrated}>{pl?'Podgląd':'Preview'}</button>
    <button onClick={()=>setMode('code')} aria-pressed={mode==='code'} disabled={!hydrated}>{'</>'} {pl?'Kod':'Code'}</button>
   </span>
  </div>
  {mode==='preview'?<ProjectFrame key={selected} id={selected} locale={locale}/>:
   <div className="showcase-code">
    <div className="code-file"><span>project-data.ts</span><span>TypeScript / React</span></div>
    <pre><code>{source.split('\n').map((line,i)=><span className={`code-line${line.trim().startsWith('//')?' comment':/^(import|export|const)/.test(line)?' declaration':''}`} key={i}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{line||' '}</span>)}</code></pre>
    <button className="code-copy" onClick={copy}>{copied?(pl?'Skopiowano':'Copied'):(pl?'Kopiuj fragment':'Copy snippet')}</button>
    <p className="code-copy-status" role="status">{copyError?(pl?'Schowek jest niedostępny. Zaznacz tekst i skopiuj ręcznie.':'Clipboard unavailable. Select the text and copy it manually.'):copied?(pl?'Fragment znajduje się w schowku.':'The snippet is in your clipboard.'):''}</p>
   </div>}
 </div>
 const mobile=<ProjectFrame key={selected} id={selected} locale={locale} mobile/>
 return <section className="project-showcase" id="product" aria-labelledby="showcase-heading">
  <span className="home-anchor" id="work" aria-hidden="true"/>
  <div className="showcase-heading container">
   <div><p className="eyebrow">01 / {pl?'REALIZACJE':'SELECTED WORK'}</p><h2 id="showcase-heading">{pl?'Różne marki.':'Different brands.'}<br/><em>{pl?'Wyjątkowe doświadczenia.':'Distinct experiences.'}</em></h2></div>
   <div className="showcase-intro"><span className="showcase-count">06<span> / </span></span><p>{pl?'Sześć odrębnych projektów. Od pierwszego wrażenia po ostatni detal — na dużym i małym ekranie.':'Six distinct projects. From the first impression to the final detail — on screens big and small.'}</p><small>{pl?'Autorskie, działające projekty demonstracyjne.':'Original, working demonstration projects.'}</small></div>
  </div>
  <div className="showcase-studio" style={{'--project-accent':project.accent} as CSSProperties}>
   <div className="showcase-studio-line container"><span>CODEMASTER / PROJECT VIEWER</span><span>{pl?'PRAWDZIWE STRONY. DWA EKRANY.':'REAL WEBSITES. TWO SCREENS.'}</span></div>
   <DeviceViewport locale={locale} desktop={desktop} mobile={mobile}/>
  </div>
  <div className="container showcase-bottom">
   <div className="showcase-select" role="group" aria-label={pl?'Wybór realizacji':'Choose a project'}>
    {SHOWCASE_PROJECTS.map((item,i)=><button key={item.id} type="button" aria-pressed={item.id===selected} disabled={!hydrated} onClick={()=>choose(item.id)} style={{'--project-accent':item.accent} as CSSProperties}>
     <span className="showcase-project-number">{String(i+1).padStart(2,'0')}</span><strong>{item.name}</strong><span className="showcase-project-sector">{item.sector[locale]}</span><span className="showcase-project-arrow" aria-hidden="true">↗</span>
    </button>)}
   </div>
   <div className="showcase-project-detail" aria-live="polite">
    <div><span className="showcase-detail-number">{String(index+1).padStart(2,'0')} / 06</span><h3>{project.name} <span>{project.sector[locale]}</span></h3><p>{project.description[locale]}</p></div>
    <div className="showcase-detail-actions"><button type="button" onClick={()=>setMode(mode==='preview'?'code':'preview')} aria-pressed={mode==='code'} disabled={!hydrated}>{'</>'} {mode==='preview'?(pl?'Pokaż kod':'Show code'):(pl?'Pokaż stronę':'Show website')}</button><a href={projectUrl(selected,locale)}>{pl?'Otwórz pełną realizację':'Open the full experience'} <span aria-hidden="true">↗</span></a></div>
   </div>
   <p className="showcase-fineprint">{pl?'Prezentacje przykładowych marek, nie deklaracje wdrożeń u klientów. W każdej możesz sprawdzić działające funkcje.':'Sample-brand experiences, not claims of client deployments. Explore the working features in each one.'}</p>
   {children}
   <noscript><p>{pl?'Animacja 3D wymaga JavaScript. Pełne strony możesz otworzyć bezpośrednio:':'The 3D animation requires JavaScript. Open any website directly:'}</p><ul>{SHOWCASE_PROJECTS.map(item=><li key={item.id}><a href={projectUrl(item.id,locale)}>{item.name}</a></li>)}</ul></noscript>
  </div>
 </section>
}