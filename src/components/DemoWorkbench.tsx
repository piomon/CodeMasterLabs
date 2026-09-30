'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import './demos/workspace-product.css'
import { Icon } from './common/Icon'
import { Dialog } from './common/Dialog'
import { OperationsPanel, ApprovalPanel, CommercePanel, PortalPanel, ActivityPanel, money } from './demos/WorkspacePanels'
import { useDemoWorkspace } from '@/hooks/useDemoWorkspace'
import { pick } from '@/lib/i18n'
import { cartSummary } from '@/lib/demo-state'
import type { DemoKind } from '@/lib/demo-state'
import type { Locale } from '@/types/site'
export type { DemoKind } from '@/lib/demo-state'
const titles: Record<DemoKind,string> = { operations:'Operations OS', approval:'Approval Console', commerce:'Commerce Operations', 'client-portal':'Client Portal' }
const kinds = Object.keys(titles) as DemoKind[]
export function DemoWorkbench({ kind, locale='pl', embedded=false }: { kind:DemoKind; locale?:Locale; embedded?:boolean }) {
 const {state,dispatch,storage}=useDemoWorkspace(kind,locale)
 const [view,setView]=useState<'workspace'|'activity'>('workspace'),[query,setQuery]=useState(''),[reset,setReset]=useState(false),[notice,setNotice]=useState('')
  useEffect(()=>{setView('workspace');setQuery('');setReset(false)},[kind,locale])
 const prefix=locale==='en'?'/en':'',cart=cartSummary(state)
  const Root = embedded ? 'div' : 'main'
  const Heading = embedded ? 'h3' : 'h1'
  const descriptions:Record<DemoKind,string>={
   operations:pick(locale,'Plan pracy zespołu, właściciele i postęp zadań.','Team workload, ownership and task progress.'),
   approval:pick(locale,'Decyzje człowieka przed wykonaniem jakiegokolwiek działania.','Human decisions before any action is taken.'),
   commerce:pick(locale,'Katalog, zapasy i realizacja zamówień w jednym miejscu.','Catalogue, stock and order fulfilment in one place.'),
   'client-portal':pick(locale,'Przegląd etapu, feedback i informacje o załącznikach.','Milestone review, feedback and attachment details.'),
  }
 const metrics=kind==='operations'?[
  [pick(locale,'Wszystkie zadania','All tasks'),state.tasks.length],
  [pick(locale,'W toku','In progress'),state.tasks.filter(t=>t.status==='active').length],
  [pick(locale,'Ukończone','Completed'),state.tasks.filter(t=>t.status==='done').length],
 ]:kind==='approval'?[
  [pick(locale,'Do decyzji','Pending'),state.proposals.filter(p=>p.decision==='pending').length],
  [pick(locale,'Zatwierdzone','Approved'),state.proposals.filter(p=>p.decision==='approved').length],
  [pick(locale,'Odrzucone','Rejected'),state.proposals.filter(p=>p.decision==='rejected').length],
 ]:kind==='commerce'?[
  [pick(locale,'Produkty w koszyku','Cart items'),cart.quantity],
  [pick(locale,'Zamówienia','Orders'),state.orders.length],
  [pick(locale,'Wartość zamówień demo','Demo order value'),money(state.orders.reduce((s,o)=>s+o.total,0),locale)],
 ]:[
  [pick(locale,'Uwagi','Feedback'),state.notes.length],
  [pick(locale,'Pliki','Files'),state.files.length],
  [pick(locale,'Etap','Milestone'),state.portalApproved?pick(locale,'Przyjęty','Approved'):pick(locale,'Review','Review')],
 ]
 const Panel={operations:OperationsPanel,approval:ApprovalPanel,commerce:CommercePanel,'client-portal':PortalPanel}[kind]
 function exportReport(){
  const report={demo:kind,exportedAt:new Date().toISOString(),disclaimer:'Sample browser data only; not a live client system.',data:state}
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a')
  a.href=url;a.download=`codemaster-${kind}-demo.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice(pick(locale,'Raport demo został przygotowany.','Demo report prepared.'))
 }
  return <Root id={embedded?undefined:'main'} className={`demo-page studio-demo${embedded?' embedded-workspace':''}`}>
   {!embedded&&<div className="workspace-outer-title"><Link href={`${prefix}/#product`}>← CodeMaster / {pick(locale,'Powrót do studia','Back to studio')}</Link><span>INTERACTIVE PRODUCT STUDY / 0{kinds.indexOf(kind)+1}</span></div>}
  <div className="workspace-frame"><aside className="workspace-sidebar"><div className="workspace-brand"><span>cm</span><div>WORKSPACE<small>{pick(locale,'Wersja demonstracyjna','Demonstration')}</small></div></div><p>{pick(locale,'Produkty','Products')}</p><nav aria-label={pick(locale,'Dema produktów','Product demos')}>{kinds.map((k,i)=><Link key={k} href={`${prefix}/demos/${k}`} aria-current={k===kind?'page':undefined}><span>0{i+1}</span>{titles[k]}<span aria-hidden="true">↗</span></Link>)}</nav><div className="workspace-local"><span className="workspace-local-dot"/><strong>{pick(locale,'Twoje dane demo','Your demo data')}</strong><p>{pick(locale,'Tylko w tej przeglądarce. Bez konta i połączeń zewnętrznych.','In this browser only. No account or external connections.')}</p><small>{storage==='saved'?pick(locale,'Zapis lokalny włączony','Local saving enabled'):storage==='invalid'?pick(locale,'Uszkodzony zapis zachowano. Przywróć dane, aby włączyć zapisywanie.','Invalid saved data preserved. Reset to enable saving.'):storage==='memory'?pick(locale,'Tryb tymczasowy — zapis niedostępny','Temporary mode — saving unavailable'):pick(locale,'Odczytywanie stanu…','Loading state…')}</small></div></aside>
    <section className="workspace-content" aria-label={titles[kind]}><header className="workspace-heading"><div><p className="eyebrow">{pick(locale,'PRZESTRZEŃ ROBOCZA / DANE PRZYKŁADOWE','WORKSPACE / SAMPLE DATA')}</p><Heading>{titles[kind]}</Heading><p className="workspace-heading-description">{descriptions[kind]}</p></div><span className="workspace-badge">{pick(locale,'DEMO · LOKALNE','DEMO · LOCAL')}</span></header>
    <div className="workspace-metrics">{metrics.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="workspace-toolbar"><div role="group" aria-label={pick(locale,'Widok demo','Demo view')}><button aria-pressed={view==='workspace'} onClick={()=>setView('workspace')}>{pick(locale,'Obszar pracy','Workspace')}</button><button aria-pressed={view==='activity'} onClick={()=>setView('activity')}>{pick(locale,'Historia','Activity')} <small>{state.audit.length}</small></button></div><label className="workspace-search"><Icon name="search" size={16}/><span className="sr-only">{pick(locale,'Szukaj w demo','Search demo')}</span><input type="search" maxLength={120} value={query} onChange={e=>{setQuery(e.target.value);setView('workspace')}} placeholder={pick(locale,'Szukaj…','Search…')}/></label></div>
    <div className="workspace-body">{view==='workspace'?<Panel state={state} dispatch={dispatch} locale={locale} query={query}/>:<ActivityPanel state={state} locale={locale}/>}</div>
     <footer className="workspace-footer"><p>{pick(locale,'Dane przykładowe · zapis w przeglądarce · bez płatności i zewnętrznego AI. Nie jest to wdrożenie klienta.','Sample data · saved in your browser · no payments or external AI. Not a client deployment.')}</p><div><button onClick={exportReport}>{pick(locale,'Eksportuj JSON','Export JSON')} ↗</button><button onClick={()=>setReset(true)}>{pick(locale,'Przywróć dane','Reset data')}</button></div></footer>
    <p className="sr-only" role="status" aria-live="polite">{notice}</p>
   </section>
  </div>
  <Dialog open={reset} onClose={()=>setReset(false)} label={pick(locale,'Przywrocic dane demo?','Restore demo data?')} className="workspace-reset"><h2 id="demo-reset-title">{pick(locale,'Przywrócić początkowe dane?','Restore sample data?')}</h2><p>{pick(locale,'Usuniesz swoje zmiany tylko z tego demo i tej wersji językowej. Pozostałe dema zostaną bez zmian.','Your changes in this demo and language will be removed. Other demos are not affected.')}</p><div className="workspace-actions"><button onClick={()=>setReset(false)}>{pick(locale,'Zachowaj zmiany','Keep changes')}</button><button className="workspace-primary" onClick={()=>{dispatch({type:'reset',locale});setQuery('');setReset(false);setNotice(pick(locale,'Przywrócono dane początkowe.','Sample data restored.'))}}>{pick(locale,'Tak, przywróć','Yes, restore')}</button></div></Dialog>
  </Root>
}
