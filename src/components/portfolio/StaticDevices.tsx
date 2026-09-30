'use client'
import {useEffect,useRef,type ReactNode} from 'react'
import type {Locale} from '@/types/site'
import {PhoneScreen} from './PhoneScreen'

export function StaticDevices({desktop,mobile,locale}:{desktop:ReactNode;mobile:ReactNode;locale:Locale}){
 const root=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const element=root.current
  if(!element)return
  const resize=new ResizeObserver(()=>{
   element.querySelectorAll<HTMLElement>('[data-screen-width]').forEach(screen=>{
    screen.style.setProperty('--screen-scale',String(screen.clientWidth/Number(screen.dataset.screenWidth)))
   })
  })
  element.querySelectorAll('[data-screen-width]').forEach(screen=>resize.observe(screen))
  return()=>resize.disconnect()
 },[])
 return <div ref={root} className="static-devices" data-renderer="static" data-scene-open="true" aria-label={locale==='pl'?'Otwarte urządzenia — interaktywne prezentacje':'Open devices — interactive presentations'}>
  <div className="static-laptop">
   <div className="static-laptop-lid"><span className="static-camera" aria-hidden="true"/>
    <div className="static-laptop-screen" data-screen-width="1440"><div className="static-screen-content">{desktop}</div></div>
    <span className="static-device-brand" aria-hidden="true"/>
   </div>
   <div className="static-laptop-base" aria-hidden="true"><i/></div>
  </div>
  <div className="static-phone">
   <span className="phone-side-button phone-side-action" aria-hidden="true"/><span className="phone-side-button phone-side-volume" aria-hidden="true"/><span className="phone-side-button phone-side-power" aria-hidden="true"/>
   <div className="static-phone-screen" data-screen-width="390"><div className="static-screen-content">
    <PhoneScreen>{mobile}</PhoneScreen>
   </div></div>
  </div>
  <p className="static-devices-note">{locale==='pl'?'Przewijaj strony na ekranach lub otwórz pełną realizację poniżej.':'Scroll inside the screens or open the full experience below.'}</p>
 </div>
}