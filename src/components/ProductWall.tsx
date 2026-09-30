'use client'
import {useState} from 'react'
import {Icon} from './common/Icon'
import {trackEvent} from '@/lib/analytics'
import {pick} from '@/lib/i18n'
import type {Locale} from '@/types/site'

const projectRows={
 pl:[
  ['Portal klienta','Design review','Do akceptacji'],
  ['Obieg dokumentów','API + role','W budowie'],
  ['Panel operacyjny','Responsive QA','Gotowe'],
 ],
 en:[
  ['Client portal','Design review','For approval'],
  ['Document flow','API + roles','In progress'],
  ['Operations panel','Responsive QA','Ready'],
 ]
}

export function ProductWall({locale}:{locale:Locale}){
 const [selected,setSelected]=useState(0)
 const [approved,setApproved]=useState(false)
 const rows=projectRows[locale]
 return <div className="product-wall" aria-label={pick(locale,'Interaktywny podgląd procesu tworzenia produktu','Interactive product delivery preview')}>
  <div className="product-wall-glow" aria-hidden="true"/>
  <div className="product-wall-note note-feedback"><span className="note-icon"><Icon name="spark" size={15}/></span><div><small>FEEDBACK / DEMO</small><strong>{pick(locale,'Tak. Właśnie o to chodzi.','Yes. That is exactly it.')}</strong><span>{pick(locale,'Komentarz staje się częścią produktu.','Feedback becomes part of the product.')}</span></div></div>
  <div className="product-wall-code" aria-hidden="true">
   <div className="window-top"><span><i/><i/><i/></span><small>codemaster / product.tsx</small></div>
   <div className="code-shell"><aside><span>explorer</span><b>app</b><i>components</i><i className="active">workspace</i><i>workflow</i><i>api</i><i>cms</i></aside><pre><code><span className="code-dim">// product follows the process</span>{'\n'}<span className="code-key">export default</span> function Workspace() {'{'}{'\n'}  return ({'\n'}    &lt;<span className="code-tag">Delivery</span>{'\n'}      context={'{'}business{'}'}{'\n'}      feedback={'{'}live{'}'}{'\n'}      approval={'{'}humanFirst{'}'}{'\n'}    /&gt;{'\n'}  ){'\n'}{'}'}</code></pre></div>
  </div>
  <div className="product-browser">
   <div className="product-browser-top"><span><i/><i/><i/></span><div><Icon name="lock" size={10}/><small>codemaster / product demo</small></div><span className="browser-live"><i/>{pick(locale,'INTERAKTYWNE','INTERACTIVE')}</span></div>
   <div className="product-browser-bar"><strong>CodeMaster.</strong><span>{pick(locale,'DEMO PRODUKTU / DANE PRZYKŁADOWE','PRODUCT DEMO / SAMPLE DATA')}</span><small>{pick(locale,'Podgląd klienta','Client preview')} ↗</small></div>
   <div className="product-browser-body">
    <aside className="product-side"><span className="side-label">WORKSPACE</span>{['grid','layers','file','chat','chart'].map((icon,i)=><button key={icon} className={i===selected?'active':''} onClick={()=>{setSelected(i%rows.length);trackEvent('demo_interaction',{area:'product_wall',item:i})}} aria-label={pick(locale,'Zmień widok produktu','Change product view')}><Icon name={icon as 'grid'} size={14}/></button>)}</aside>
    <div className="product-main">
     <div className="product-main-head"><div><small>{pick(locale,'PROJEKT / WERSJA 08','PROJECT / VERSION 08')}</small><h3>{pick(locale,'Twój produkt.\nW działającym podglądzie.','Your product.\nIn a working preview.')}</h3></div><div className="version-pill"><span/>v0.8.4</div></div>
     <div className="product-kpis"><div><span>{pick(locale,'Obszary systemu','System areas')}</span><strong>{rows.length}</strong><small>DEMO</small></div><div><span>{pick(locale,'Otwarte uwagi','Open feedback')}</span><strong>{approved?'0':'1'}</strong><small>{approved?pick(locale,'1 zamknięta','1 resolved'):pick(locale,'do decyzji','to review')}</small></div><div><span>{pick(locale,'Gotowe obszary','Ready areas')}</span><strong>{approved?2:1} / {rows.length}</strong><small>{pick(locale,'status demo','demo status')}</small></div></div>
     <div className="product-table"><div className="table-head"><span>{pick(locale,'Obszar','Area')}</span><span>{pick(locale,'Etap','Stage')}</span><span>Status</span><span/></div>{rows.map((r,i)=><button key={r[0]} className={selected===i?'selected':''} onClick={()=>setSelected(i)}><span><i className={`row-dot row-${i}`}/><b>{r[0]}</b></span><span>{r[1]}</span><span><em>{i===2||approved&&i===0?pick(locale,'Gotowe','Ready'):r[2]}</em></span><Icon name="external" size={12}/></button>)}</div>
    </div>
   </div>
  </div>
  <div className="product-wall-mobile" aria-hidden="true"><div className="mobile-island"/><div className="mobile-mini-head"><span>CM</span><small>{pick(locale,'Dzisiaj','Today')}</small></div><strong>{rows[selected][0]}</strong><small>{pick(locale,'Aktualny status projektu','Current project state')}</small><div className="mobile-progress"><i style={{width:selected===2?'92%':'68%'}}/></div><div className="mobile-feed"><span/><span/><span/></div></div>
  <button className={`product-wall-approval ${approved?'approved':''}`} onClick={()=>{setApproved(v=>!v);trackEvent('demo_interaction',{area:'product_wall',action:'approval'})}} aria-pressed={approved}><span><Icon name={approved?'check':'shield'} size={17}/></span><div><small>HUMAN APPROVAL</small><strong>{approved?pick(locale,'Zatwierdzone do wdrożenia','Approved for delivery'):pick(locale,'Czeka na Twoją decyzję','Waiting for your decision')}</strong><em>{pick(locale,'Kliknij, aby zmienić stan','Click to change state')}</em></div><Icon name="arrow" size={15}/></button>
 </div>
}
