export function localChallengeTesting(env:NodeJS.ProcessEnv=process.env):boolean{
 try{return env.ALLOW_HTTP_LOCAL==='true'&&['localhost','127.0.0.1','[::1]'].includes(new URL(env.SERVER_URL||env.NEXT_PUBLIC_SERVER_URL||'').hostname)}catch{return false}
}
/** Static upstream URL; no user-controlled fetch destination and no token logging. */
export async function verifyChallenge(token:unknown,action:'contact'|'review',fetcher:typeof fetch=fetch):Promise<boolean>{
 const secret=process.env.TURNSTILE_SECRET_KEY
 if(typeof token!=='string'||!token||token.length>2048||!secret)return false
 try{
  const reply=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',body:new URLSearchParams({secret,response:token}),signal:AbortSignal.timeout(8000),redirect:'error',cache:'no-store',
  })
  if(!reply.ok)return false
  const result=await reply.json() as {success?:boolean;hostname?:string;action?:string}
  if(result.success!==true)return false
  // Cloudflare official test keys return dummy metadata; only loopback may use them.
  if(localChallengeTesting()&&secret==='1x0000000000000000000000000000000AA')return true
  return result.hostname===new URL((process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)||'').hostname&&result.action===action
 }catch{return false}
}
