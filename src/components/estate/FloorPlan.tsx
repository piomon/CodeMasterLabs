import type {Apartment} from '@/lib/estate-state'
import type {Locale} from '@/types/site'

/** Schematic only: the number of distinct living/bedroom spaces matches the unit. */
export function FloorPlan({unit,locale}:{unit:Apartment;locale:Locale}){
 const pl=locale==='pl'
 const bedrooms=unit.rooms-1
 const bedroomHeight=156/bedrooms
 return <svg viewBox="0 0 300 225" role="img" aria-label={pl
  ? `Poglądowy plan mieszkania ${unit.id}: ${unit.rooms} pokoje, ${unit.area} metrów kwadratowych. Nie jest dokumentacją architektoniczną.`
  : `Illustrative ${unit.rooms}-room layout for ${unit.id}, ${unit.area} square metres. Not architectural documentation.`}>
  <rect x="24" y="18" width="252" height="156" fill="#f5f4ec" stroke="#53695b" strokeWidth="3"/>
  <path d="M148 18v156M24 130h124M90 130v44" fill="none" stroke="#53695b" strokeWidth="2"/>
  <path d="M44 174v31h213v-31" fill="#e4ebdf" stroke="#53695b" strokeWidth="2" strokeDasharray="5 3"/>
  <path d="M32 19h39m40 0h26m53 0h40m45 26v22m0 55v25" stroke="#8fb9bd" strokeWidth="5"/>
  <path d="M100 173a22 22 0 0 1 22-22" fill="none" stroke="#9ba99a" strokeWidth="1.5"/>
  <rect x="36" y="48" width="30" height="12" rx="2" fill="#c3d0c0"/>
  <rect x="36" y="61" width="10" height="18" rx="2" fill="#c3d0c0"/>
  <circle cx="94" cy="77" r="13" fill="#d9cbbd"/>
  <rect x="40" y="143" width="28" height="11" rx="4" fill="#c3d0c0"/>
  <circle cx="76" cy="145" r="5" fill="#d9cbbd"/>
  <text x="92" y="114" fill="#53695b" fontSize="11" textAnchor="middle">{pl?'SALON':'LIVING'}</text>
  <text x="55" y="167" fill="#53695b" fontSize="9" textAnchor="middle">{pl?'ŁAZ.':'BATH'}</text>
  {Array.from({length:bedrooms},(_,index)=>{
   const top=18+index*bedroomHeight
   const mid=top+bedroomHeight/2
   return <g key={index}>
    {index>0&&<path d={`M148 ${top}h128`} stroke="#53695b" strokeWidth="2"/>}
    <rect x="172" y={top+11} width="29" height="18" rx="2" fill="#d5d8c9"/>
    <rect x="173" y={top+12} width="10" height="5" rx="1" fill="#f5f4ec"/>
    <path d={`M148 ${top+bedroomHeight-11}a15 15 0 0 0 15-15`} fill="none" stroke="#9ba99a" strokeWidth="1"/>
    <text x="228" y={mid+4} fill="#53695b" fontSize="10" textAnchor="middle">{pl?'POKÓJ':'ROOM'} {index+1}</text>
   </g>
  })}
  <text x="150" y="197" fill="#53695b" fontSize="11" textAnchor="middle" letterSpacing="1">{pl?'BALKON':'BALCONY'}</text>
 </svg>
}