'use client'
import {useEffect,useRef} from 'react'
import {useMotion} from './MotionProvider'
import {Icon} from '../common/Icon'
export function ProjectCursor(){
 const ref=useRef<HTMLDivElement>(null),{enabled}=useMotion()
 useEffect(()=>{
  if(!enabled||!matchMedia('(pointer:fine)').matches)return
  let raf=0,x=0,y=0,active=false
  const move=(e:PointerEvent)=>{x=e.clientX;y=e.clientY;active=e.target instanceof Element&&!!e.target.closest('[data-cursor="project"]');if(!raf)raf=requestAnimationFrame(()=>{raf=0;if(ref.current){ref.current.style.transform=`translate3d(${x+18}px,${y+18}px,0)`;ref.current.dataset.visible=String(active)}})}
  const leave=()=>{if(ref.current)ref.current.dataset.visible='false'}
  document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave)
  return()=>{cancelAnimationFrame(raf);document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);leave()}
 },[enabled])
 return <div className="project-cursor" ref={ref} aria-hidden="true"><Icon name="external" size={24}/></div>
}
