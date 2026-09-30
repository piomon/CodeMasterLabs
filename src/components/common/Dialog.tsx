'use client'
import {useEffect,useRef,type ReactNode,type KeyboardEvent} from 'react'
export function Dialog({open,onClose,label,children,className=''}:{open:boolean;onClose:()=>void;label:string;children:ReactNode;className?:string}) {
 const ref=useRef<HTMLDialogElement>(null)
 useEffect(()=>{
  const el=ref.current;if(!el)return
  if(open&&!el.open){
   const previous=document.activeElement instanceof HTMLElement?document.activeElement:null
   el.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden'
   return()=>{if(el.open)el.close();document.body.style.overflow=old;if(previous?.isConnected)previous.focus({preventScroll:true})}
  }
  if(!open&&el.open)el.close()
 },[open])
 function trap(event:KeyboardEvent<HTMLDialogElement>){
  if(event.key!=='Tab')return
  const dialog=ref.current;if(!dialog)return
  const nodes=Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node=>node.tabIndex>=0&&node.getClientRects().length>0)
  const first=nodes[0],last=nodes[nodes.length-1],current=document.activeElement
  if(!first){event.preventDefault();dialog.focus();return}
  if(event.shiftKey&&(current===first||current===dialog)){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&(current===last||current===dialog)){event.preventDefault();first.focus()}
 }
 return <dialog ref={ref} tabIndex={-1} aria-label={label} className={`modal ${className}`} onKeyDown={trap} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-inner">{children}</div></dialog>
}
