'use client'
import { useEffect,useState, type KeyboardEvent } from 'react'
import { ProjectVisual } from '@/components/ProjectVisual'
import { Icon } from '@/components/common/Icon'
import { trackEvent } from '@/lib/analytics'
import { pick } from '@/lib/i18n'
import type { Service,Locale } from '@/types/site'
export function ServiceExperience({services,locale}:{services:Service[];locale:Locale}) {
 const [active,setActive]=useState(0)
 useEffect(()=>{const sync=()=>{const key=new URLSearchParams(location.search).get('service');const idx=services.findIndex(s=>String(s.id)===key);if(idx>=0)setActive(idx)};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[services])
 if(!services.length)return <p className="empty-state">{pick(locale,'Nie opublikowano jeszcze usług.','No services have been published yet.')}</p>
 const selectedIndex=Math.min(active,services.length-1),selected=services[selectedIndex]
 function select(index:number,updateURL=false){setActive(index);if(updateURL){if(/^https?:$/.test(location.protocol)){const url=new URL(location.href);url.searchParams.set('service',String(services[index].id));history.replaceState(null,'',url)}trackEvent('service_select',{option:services[index].shortLabel})}}
 function keydown(e:KeyboardEvent,index:number){let next=index;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(index+1)%services.length;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(index-1+services.length)%services.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=services.length-1;else return;e.preventDefault();select(next,true);document.getElementById(`service-tab-${next}`)?.focus()}
 return <div className="service-experience"><div className="service-tabs" role="tablist" aria-label={pick(locale,'Wybierz obszar usług','Choose a service')}>
 {services.map((service,i)=><button id={`service-tab-${i}`} key={service.id} type="button" role="tab" aria-selected={i===selectedIndex} aria-controls="service-panel" tabIndex={i===selectedIndex?0:-1} onClick={()=>select(i,true)} onKeyDown={e=>keydown(e,i)} onPointerEnter={e=>{if(e.pointerType==='mouse')select(i)}} className={i===selectedIndex?'active':''}><span className="service-number">0{i+1}</span><span className="service-tab-copy"><strong>{service.title}</strong><span>{service.description}</span></span><Icon name="external" size={19}/></button>)}
 </div><div id="service-panel" role="tabpanel" aria-labelledby={`service-tab-${selectedIndex}`} tabIndex={0} className="service-panel"><div className="service-panel-meta"><span><span className="status-dot"/>{selected.shortLabel}</span><small>{pick(locale,'PODGLĄD KONCEPCJI','CONCEPT PREVIEW')}</small></div><div key={selected.id} className="visual-transition"><ProjectVisual style={selected.visualStyle} locale={locale}/></div><div className="service-panel-caption"><span>{selected.outcome||selected.title}</span><Icon name="arrow" size={20}/></div></div></div>
}
