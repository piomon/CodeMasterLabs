'use client'
import {useState} from 'react'
import {useMotion} from '../animation/MotionProvider'
/** Original CodeMaster Bot silhouette, with a reactive face. */
export function RobotMark({className=''}:{className?:string}) {
 const [gaze,setGaze]=useState({x:0,y:0})
 const {enabled}=useMotion()
 return <svg onPointerMove={event=>{const r=event.currentTarget.getBoundingClientRect();setGaze({x:(event.clientX-r.left)/r.width*2-1,y:(event.clientY-r.top)/r.height*2-1})}} onPointerLeave={()=>setGaze({x:0,y:0})} className={`robot-bot-icon ${className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 8V4H8"/>
  <rect width="16" height="12" x="4" y="8" rx="2"/>
  <path d="M2 14h2M20 14h2"/>
  <g transform={`translate(${enabled?gaze.x:0} ${enabled?gaze.y:0})`}><path d="M15 12.5v2M9 12.5v2"/><path d="M9 17q3 2 6 0" strokeWidth="1"/></g>
 </svg>
}