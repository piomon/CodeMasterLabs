import type {LeadInput} from './lead-validation'
export const PRIVACY_VERSION='2026-09-29'
export const TOKEN_NEW_MAX_AGE=30*60*1000
export const TOKEN_RECOVERY_MAX_AGE=24*60*60*1000
/** Retry receipts are only reusable for the same normalized, whitelisted data. */
export function sameLead(existing:Record<string,unknown>,incoming:LeadInput):boolean {
 return Object.entries(incoming).every(([key,value])=>{
  const previous=existing[key]
  if(typeof value==='boolean')return Boolean(previous)===value
  return String(previous??'')===String(value)
 })
}
export function sameReview(existing:Record<string,unknown>,data:{name:string;quote:string;rating:number}):boolean {
 return existing.name===data.name&&existing.quote===data.quote&&existing.rating===data.rating
}
export function passwordProblem(value:unknown):string|undefined {
 if(typeof value!=='string'||value.length<14||value.length>128)return 'Use a password or passphrase of 14 to 128 characters.'
 if(/[\x00-\x1f\x7f]/.test(value)||!value.trim())return 'Password contains invalid characters.'
 return undefined
}
