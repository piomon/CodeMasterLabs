'use client'
import {RefreshRouteOnSave} from '@payloadcms/live-preview-react'
import {useRouter} from 'next/navigation'
/** Mounted only after server-side CMS authentication in /preview. */
export function LivePreviewRefresh(){
 const router=useRouter()
 return <RefreshRouteOnSave refresh={()=>router.refresh()} serverURL={process.env.NEXT_PUBLIC_SERVER_URL||'http://localhost:3000'}/>
}
