import type {Payload} from 'payload'
import {isUniqueConflict,WINDOW_MS} from './form-security'
/** Unique index is the concurrency boundary. Storage failure is not interpreted as an available slot. */
export async function claimRateSlot(payload:Payload,actor:string,scope:string,limit:number,now=Date.now()):Promise<boolean>{
 const bucket=Math.floor(now/WINDOW_MS),expiresAt=new Date((bucket+2)*WINDOW_MS).toISOString()
 for(let slot=0;slot<limit;slot++){
  try{await payload.create({collection:'form-attempts',overrideAccess:true,data:{key:`${scope}:${actor}:${bucket}:${slot}`,expiresAt}});return true}
  catch(error){if(!isUniqueConflict(error))throw error}
 }
 return false
}
