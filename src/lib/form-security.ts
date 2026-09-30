import {createHmac,randomBytes,timingSafeEqual,createHash} from 'node:crypto'
import {isIP} from 'node:net'
export const MAX_ATTACHMENT=5*1024*1024,MAX_BODY=6*1024*1024,WINDOW_MS=15*60*1000
export function signToken(secret:string,now=Date.now(),nonce=randomBytes(24).toString('hex')){const data=`${now}.${nonce}`;return `${data}.${createHmac('sha256',secret).update(data).digest('hex')}`}
export function verifyToken(token:string,secret:string,now=Date.now(),maxAge=30*60*1000):{ok:true;key:string}|{ok:false;reason:string}{
 const parts=token.split('.');if(parts.length!==3||!/^\d{13}$/.test(parts[0])||! /^[a-f0-9]{48}$/.test(parts[1])||! /^[a-f0-9]{64}$/.test(parts[2]))return{ok:false,reason:'invalid'}
 const age=now-Number(parts[0]);if(age<500||age>maxAge)return{ok:false,reason:'expired-or-too-fast'}
 const expected=createHmac('sha256',secret).update(`${parts[0]}.${parts[1]}`).digest();const supplied=Buffer.from(parts[2],'hex')
 if(expected.length!==supplied.length||!timingSafeEqual(expected,supplied))return{ok:false,reason:'invalid'}
 return{ok:true,key:createHash('sha256').update(token).digest('hex')}
}
export function actorKey(headers:Headers,secret:string){
 // Only trust this header when the reverse proxy removes the inbound value and sets its own.
 const trusted=process.env.TRUSTED_CLIENT_IP_HEADER?.toLowerCase()
 const input=trusted?headers.get(trusted):null
 const address=input&&input.length<=64&&isIP(input)>0?input:'unverified-global'
 return createHmac('sha256',secret).update(address).digest('hex')
}
export function fileType(bytes:Uint8Array,name:string):{mime:string;extension:string}|null{
 const ext=name.toLowerCase().split('.').pop(),b=Buffer.from(bytes)
 if(ext==='pdf'&&b.subarray(0,5).toString()==='%PDF-')return{mime:'application/pdf',extension:'pdf'}
 if(ext==='png'&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return{mime:'image/png',extension:'png'}
 if((ext==='jpg'||ext==='jpeg')&&b[0]===255&&b[1]===216&&b[2]===255)return{mime:'image/jpeg',extension:'jpg'}
 if(ext==='txt'){try{const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text))return{mime:'text/plain',extension:'txt'}}catch{return null}}
 return null
}
export function originAllowed(headers:Headers,serverURL:string){try{return headers.get('origin')===new URL(serverURL).origin}catch{return false}}

export function isUniqueConflict(error:unknown):boolean {
 const seen=new Set<object>()
 let current=error
 for(let depth=0;depth<8&&current&&typeof current==='object'&&!seen.has(current);depth++) {
  seen.add(current)
  const e=current as {code?:string;data?:{errors?:{message?:string;path?:string}[]};message?:string;cause?:unknown}
  if(e.code==='23505'||e.code==='SQLITE_CONSTRAINT_UNIQUE')return true
  if(e.data?.errors?.some(x=>['key','submissionKey'].includes(x.path||'')&&/unique|already|exists/i.test(x.message||'')))return true
  if(/unique constraint|duplicate key|must be unique/i.test(e.message||''))return true
  current=e.cause
 }
 return false
}
