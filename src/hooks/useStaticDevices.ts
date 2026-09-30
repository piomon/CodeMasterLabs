'use client'
import {useSyncExternalStore} from 'react'
const query='(max-width: 1100px), (pointer: coarse)'
function subscribe(callback:()=>void){
 const media=window.matchMedia(query)
 media.addEventListener('change',callback)
 return()=>media.removeEventListener('change',callback)
}
// Static on the server: mobile clients never briefly start downloading the 3D scene.
export function useStaticDevices(){
 return useSyncExternalStore(subscribe,()=>window.matchMedia(query).matches,()=>true)
}