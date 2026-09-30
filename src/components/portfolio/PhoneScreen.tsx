import type {ReactNode} from 'react'

/** Shared, proportionate iOS chrome for the physical and lightweight devices. */
export function PhoneScreen({children}:{children:ReactNode}){
 return <div className="phone-screen-ui">
  <div className="phone-status" aria-hidden="true">
   <span>9:41</span><i className="phone-island"><b/></i>
   <svg viewBox="0 0 66 16" width="66" height="16" fill="currentColor">
    <path d="M1 11h3v4H1zm5-3h3v7H6zm5-4h3v11h-3zm5-3h3v14h-3z"/>
    <path d="M24 5q8-7 16 0l-2 2q-6-5-12 0zm3 4q5-4 10 0l-2 2q-3-2-6 0zm3 4q2-2 4 0l-2 2z"/>
    <rect x="45" y="2" width="18" height="12" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="47" y="4" width="14" height="8" rx="1.5"/><path d="M64 6h2v4h-2z"/>
   </svg>
  </div>
  <div className="phone-page">{children}</div>
  <div className="phone-home" aria-hidden="true"><i/></div>
 </div>
}