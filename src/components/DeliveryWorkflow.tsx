'use client'
import {useEffect,useRef,useState} from 'react'
import {Icon} from './common/Icon'
import {pick} from '@/lib/i18n'
import {trackEvent} from '@/lib/analytics'
import type {Locale,HomepageContent} from '@/types/site'
const stagesPL=[
 ['Problem','Najpierw nazywamy, co dziś naprawdę zabiera czas.'],
 ['Research','Mapujemy użytkowników, dane, ryzyka i integracje.'],
 ['Kierunek','Powstaje architektura informacji i pierwsze decyzje produktowe.'],
 ['Funkcjonalne demo','Oglądasz działającą wersję zanim zamykamy pełny zakres.'],
 ['Budowa','Regularne wersje, review i widoczny postęp zamiast czarnej skrzynki.'],
 ['QA i wdrożenie','Testy, bezpieczeństwo, monitoring i spokojne uruchomienie.'],
 ['Rozwój','Produkt rośnie wtedy, kiedy biznes faktycznie tego potrzebuje.'],
]
const stagesEN=[
 ['Problem','First we name what is actually wasting time today.'],['Research','We map users, data, risks and integrations.'],['Direction','Information architecture and product decisions take shape.'],['Functional demo','You see a working version before the full scope is locked.'],['Build','Regular releases, review and visible progress instead of a black box.'],['QA & launch','Testing, security, monitoring and a controlled release.'],['Growth','The product evolves when the business genuinely needs it.'],
]
export function DeliveryWorkflow({locale,home}:{locale:Locale;home?:HomepageContent}){
 const stages=home?.stages?.length?home.stages.slice(0,7).map(s=>[s.title,s.description]):locale==='pl'?stagesPL:stagesEN
 const [active,setActive]=useState(0)
 const refs=useRef<(HTMLButtonElement|null)[]>([])
 useEffect(()=>{const nodes=refs.current.filter(Boolean) as HTMLButtonElement[];if(!nodes.length)return;const obs=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible){const idx=Number((visible.target as HTMLElement).dataset.step);if(Number.isFinite(idx))setActive(idx)}},{rootMargin:'-35% 0px -45%',threshold:[.1,.35,.6]});nodes.forEach(n=>obs.observe(n));return()=>obs.disconnect()},[])
 const s=stages[Math.min(active,stages.length-1)]
 return <div className="delivery-story">
  <div className="delivery-copy"><p className="eyebrow">03 / {home?.processKicker||'BUILD TOGETHER'}</p><h2>{home?.processTitle||pick(locale,'Od problemu do wdrozenia.','From problem to launch.')}</h2><p className="section-description">{home?.processDescription}</p><div className="delivery-steps">{stages.map((item,i)=><button key={item[0]} ref={el=>{refs.current[i]=el}} data-step={i} className={active===i?'active':active>i?'complete':''} onClick={()=>{setActive(i);trackEvent('demo_interaction',{area:'delivery',step:i})}}><span>{active>i?<Icon name="check" size={12}/>:String(i+1).padStart(2,'0')}</span><div><strong>{item[0]}</strong><p>{item[1]}</p></div><Icon name="arrow" size={14}/></button>)}</div></div>
  <div className="delivery-sticky"><div className="delivery-window"><div className="delivery-window-top"><span><i/><i/><i/></span><small>codemaster / collaboration</small><em><i/> DEMO WORKFLOW</em></div><div className="delivery-progressbar">{stages.map((_,i)=><i key={i} className={i<=active?'done':''}/>)}</div><div className="delivery-stage-ui"><div className="delivery-stage-head"><small>{String(active+1).padStart(2,'0')} / {String(stages.length).padStart(2,'0')}</small><strong>{s[0]}</strong><span>{pick(locale,'wersja robocza','working version')}</span></div>{active===0&&<div className="problem-map"><div><small>INPUT</small><strong>{pick(locale,'„Co dziś zabiera najwięcej czasu?”','“What takes the most time today?”')}</strong></div><span>→</span><div><small>OUTCOME</small><strong>{pick(locale,'Jasny problem do rozwiązania','A clear problem to solve')}</strong></div></div>}{active===1&&<div className="research-board"><span>USER / ADMIN</span><span>DOCUMENTS</span><span>API</span><span>SECURITY</span><span>WORKFLOW</span><i/><i/><i/></div>}{active===2&&<div className="wireframe-board"><div/><div/><div/><div/><span>{pick(locale,'kierunek produktu','product direction')}</span></div>}{active===3&&<div className="prototype-panel"><aside><i/><i/><i/></aside><div className="prototype-content"><div/><div/><div/><button onClick={()=>setActive(Math.min(4,stages.length-1))}>{pick(locale,'Zatwierdź','Approve')}</button></div></div>}{active===4&&<div className="code-review"><pre><span>+ </span>approval.required = true{'\n'}<span>+ </span>auditTrail.enabled = true{'\n'}<span>+ </span>mobile.touchTarget = 44{'\n'}<em>3 changes ready for review</em></pre><div><span>CM</span><p>{pick(locale,'Wersja robocza gotowa do sprawdzenia.','Working version ready for review.')}</p></div></div>}{active===5&&<div className="qa-board">{[['Typecheck','CHECKLIST'],['Accessibility','CHECKLIST'],['Responsive','CHECKLIST'],['Security','CHECKLIST'],['Deploy','CHECKLIST']].map(([a,b],i)=><div key={a}><Icon name={i===4?'arrow':'check'} size={13}/><span>{a}</span><strong>{b}</strong></div>)}</div>}{active===6&&<div className="growth-board"><div className="growth-chart"><i/><i/><i/><i/><i/></div><p>{pick(locale,'Nowe potrzeby dokładamy etapami — bez przebudowy wszystkiego od zera.','New needs are added in stages — without rebuilding everything from scratch.')}</p></div>}</div><div className="delivery-footer"><span><Icon name="code" size={13}/>{pick(locale,'Kod i dokumentacja','Code & documentation')}</span><span><Icon name="shield" size={13}/>{pick(locale,'Testy i kontrola dostępu','Testing & access control')}</span><span><Icon name="layers" size={13}/>{pick(locale,'Wdrożenie i rozwój','Launch & growth')}</span></div></div></div>
 </div>
}
