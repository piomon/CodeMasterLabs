'use client'
import Link from 'next/link'
import { useRef, type PointerEvent } from 'react'
import { useMotion } from '@/components/animation/MotionProvider'
import { Icon } from './Icon'
import { trackEvent, type AnalyticsEvent } from '@/lib/analytics'
export function Button({href,children,variant='primary',event,className=''}:{href:string;children:React.ReactNode;variant?:'primary'|'secondary'|'text';event?:AnalyticsEvent;className?:string}) {
 const bounds = useRef<DOMRect | null>(null)
 const {enabled} = useMotion()
 function move(e:PointerEvent<HTMLAnchorElement>) {
  if (!enabled || e.pointerType !== 'mouse' || !bounds.current) return
  const r=bounds.current
  e.currentTarget.style.setProperty('--mx',`${(e.clientX-r.left-r.width/2)*.08}px`)
  e.currentTarget.style.setProperty('--my',`${(e.clientY-r.top-r.height/2)*.12}px`)
 }
 return <Link href={href} className={`button button-${variant} ${className}`} onPointerEnter={e=>{bounds.current=e.currentTarget.getBoundingClientRect()}} onPointerMove={move} onPointerLeave={e=>{e.currentTarget.style.setProperty('--mx','0px');e.currentTarget.style.setProperty('--my','0px')}} onClick={()=>{if(event)trackEvent(event,{location:href})}}><span>{children}</span><Icon name={variant==='text'?'external':'arrow'} size={18}/></Link>
}
