'use client'
import {useSyncExternalStore} from 'react'
const subscribe=(fn:()=>void)=>{document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)}
export function usePageVisible(){return useSyncExternalStore(subscribe,()=>!document.hidden,()=>true)}
