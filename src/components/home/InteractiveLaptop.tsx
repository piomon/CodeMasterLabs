'use client'
import {useEffect,useRef} from 'react'
import Link from 'next/link'
import {useMotion} from '../animation/MotionProvider'
import {EstateExperience} from '../estate/EstateExperience'
import {pick} from '@/lib/i18n'
import type {Locale} from '@/types/site'

export function InteractiveLaptop({locale}:{locale:Locale}){
 const stage=useRef<HTMLDivElement>(null)
 const {enabled}=useMotion()
 useEffect(()=>{
  const el=stage.current
  if(!el||!enabled)return
  let visible=false,frame=0
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(!visible)el.style.setProperty('--cm-parallax','0px')},{rootMargin:'100px'})
  observer.observe(el)
  const update=()=>{
   if(!visible||document.hidden||el.matches(':focus-within'))return
   cancelAnimationFrame(frame)
   frame=requestAnimationFrame(()=>{
    const rect=el.getBoundingClientRect()
    const progress=(rect.top+rect.height/2-window.innerHeight/2)/window.innerHeight
    el.style.setProperty('--cm-parallax',`${Math.max(-18,Math.min(18,progress*26))}px`)
   })
  }
  window.addEventListener('scroll',update,{passive:true})
  window.addEventListener('resize',update,{passive:true})
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);el.style.setProperty('--cm-parallax','0px')}
 },[enabled])
 const href=`${locale==='en'?'/en':''}/demos/real-estate`
 return <div className="cm-architecture">
   <p className="cm-device-kicker">01 / FORMA — {pick(locale,'SPRZEDAŻ NIERUCHOMOŚCI','RESIDENTIAL SALES')}</p>
  <div className="cm-display" ref={stage}>
   <div className="cm-shadow" aria-hidden="true"/>
   <div className="cm-float">
    <div className="cm-lid">
     <div className="cm-screen" aria-label={pick(locale,'Interaktywna aplikacja FORMA','Interactive FORMA application')}>
      <EstateExperience locale={locale} embedded/>
     </div>
    </div>
    <div className="cm-hinge" aria-hidden="true"/>
    <div className="cm-deck" aria-hidden="true"/>
   </div>
  </div>
  <div className="cm-product-caption">
   <p>{pick(locale,'Działająca demonstracja z danymi przykładowymi. Fotografie są ilustracyjne, a zmiany pozostają w Twojej przeglądarce — to nie realizacja klienta.','A working demonstration with sample data. Photography is illustrative and changes stay in your browser — this is not a client deployment.')}</p>
   <Link href={href}>{pick(locale,'Otwórz produkt na całym ekranie','Open the full experience')} <span aria-hidden="true">↗</span></Link>
  </div>
 </div>
}