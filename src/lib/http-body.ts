/** Bounded bodies for public routes. A missing Content-Length is not a bypass. */
export class BodyError extends Error {
 constructor(public readonly status:number, public readonly code:string) { super(code) }
}
export async function readBody(request:Request, maximum:number, timeoutMs=20000):Promise<Buffer> {
 const length=request.headers.get('content-length')
 if(length!==null && (!/^\d+$/.test(length)||!Number.isSafeInteger(Number(length)))) throw new BodyError(400,'INVALID_LENGTH')
 if(length!==null && Number(length)>maximum) throw new BodyError(413,'BODY_TOO_LARGE')
 if(!request.body) throw new BodyError(400,'EMPTY_BODY')
 const reader=request.body.getReader(), chunks:Uint8Array[]=[]
 let total=0,timer:ReturnType<typeof setTimeout>|undefined
 const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new BodyError(408,'BODY_TIMEOUT')),timeoutMs)})
 try {
  while(true) {
   const {done,value}=await Promise.race([reader.read(),deadline])
   if(done)break
   total+=value.byteLength
   if(total>maximum)throw new BodyError(413,'BODY_TOO_LARGE')
   chunks.push(value)
  }
  if(length!==null && total!==Number(length))throw new BodyError(400,'LENGTH_MISMATCH')
  return Buffer.concat(chunks,total)
 } finally {
  clearTimeout(timer)
  // Cancellation must not extend the request deadline if an upstream stream hangs.
  void reader.cancel().catch(()=>{})
  reader.releaseLock()
 }
}
export function oneValuePerField(form:FormData,allowed:ReadonlySet<string>):boolean {
 const seen=new Set<string>()
 for(const [key] of form) {
  if(!allowed.has(key)||seen.has(key))return false
  seen.add(key)
 }
 return true
}
