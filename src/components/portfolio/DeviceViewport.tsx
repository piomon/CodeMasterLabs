'use client'
import {useEffect,useRef,useState,type ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {useMotion} from '../animation/MotionProvider'
import type {Locale} from '@/types/site'
import type {DeviceScene} from './device-scene'
import {useStaticDevices} from '@/hooks/useStaticDevices'
import {StaticDevices} from './StaticDevices'
import {PhoneScreen} from './PhoneScreen'

export function DeviceViewport({locale,desktop,mobile}:{locale:Locale;desktop:ReactNode;mobile:ReactNode}){
 const host=useRef<HTMLDivElement>(null)
 const scene=useRef<DeviceScene|null>(null)
 const {paused,reduced}=useMotion()
 const staticMotion=paused||reduced
 const staticDevices=useStaticDevices()
 const motionRef=useRef(staticMotion)
 motionRef.current=staticMotion
 const [surfaces,setSurfaces]=useState<{desktop:HTMLDivElement;mobile:HTMLDivElement}|null>(null)
 const [opened,setOpened]=useState(false)
 const [failed,setFailed]=useState(false)
 const [loading,setLoading]=useState(true)
 const pl=locale==='pl'
 useEffect(()=>{
  if(staticDevices||failed||!host.current)return
  setLoading(true);setOpened(false)
  const element=host.current
  let cancelled=false,started=false
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting)||started)return
   started=true;observer.disconnect()
   import('./device-scene').then(({createDeviceScene})=>createDeviceScene(element,{
    reduced:motionRef.current,
    onSurfaces:(desktop,mobile)=>{if(!cancelled)setSurfaces({desktop,mobile})},
    onOpen:()=>{if(!cancelled)setOpened(true)},
    onError:()=>{if(!cancelled){setSurfaces(null);setFailed(true)}},
   })).then(instance=>{
    if(cancelled){instance.dispose();return}
    scene.current=instance;setLoading(false)
   }).catch(()=>{if(!cancelled){setSurfaces(null);setFailed(true);setLoading(false)}})
  },{rootMargin:'650px'})
  observer.observe(element)
  return()=>{cancelled=true;observer.disconnect();scene.current?.dispose();scene.current=null}
 },[failed,staticDevices])
 useEffect(()=>{scene.current?.setReducedMotion(staticMotion)},[staticMotion])
 const boot=<div className="device-boot" aria-hidden="true"><img src="/images/showcase/device-mark.svg" alt=""/><span><i/></span></div>
 if(staticDevices)return <StaticDevices desktop={desktop} mobile={mobile} locale={locale}/>
 if(failed)return <div className="showcase-fallback">
  <p>{pl?'Podgląd bez 3D — przeglądarka nie udostępniła WebGL. Wszystkie projekty pozostają dostępne.':'Preview without 3D — WebGL is unavailable in this browser. All projects are still accessible.'}</p>
   <StaticDevices desktop={desktop} mobile={mobile} locale={locale}/>
 </div>
 return <div className={`device-experience${opened?' is-open':''}`} data-scene-open={opened}>
  <div className="device-scene-host" ref={host} role="img" aria-label={pl?'MacBook i iPhone — prezentacja 3D':'MacBook and iPhone — 3D presentation'}/>
  {loading&&<div className="device-loading" role="status"><span/>{pl?'Przygotowuję scenę 3D…':'Preparing the 3D scene…'}</div>}
  {!opened&&!loading&&<button className="device-open-button" onClick={()=>scene.current?.open()}>{pl?'Przewiń, aby otworzyć — lub kliknij':'Scroll to open — or click'} <span aria-hidden="true">↓</span></button>}
  {surfaces&&createPortal(<div className="device-display-content">
   <div className="device-live-screen" inert={!opened}>{desktop}</div>
   {boot}
  </div>,surfaces.desktop)}
  {surfaces&&createPortal(<div className="device-display-content device-mobile-content">
   <div className="device-live-screen" inert={!opened}><PhoneScreen>{mobile}</PhoneScreen></div>
   {boot}
  </div>,surfaces.mobile)}
 </div>
}