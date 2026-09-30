import {getCMS} from '@/lib/site-data'
import {actorKey,signToken} from '@/lib/form-security'
import {claimRateSlot} from '@/lib/rate-limit'
export const runtime='nodejs'
export const dynamic='force-dynamic'
export async function GET(req:Request){
 const secret=process.env.PAYLOAD_SECRET;if(!secret)return Response.json({error:'Form temporarily unavailable.'},{status:503})
 try{const cms=await getCMS();if(!await claimRateSlot(cms,actorKey(req.headers,secret),'token',40))return Response.json({error:'Too many requests.'},{status:429,headers:{'Retry-After':'900','Cache-Control':'no-store'}})
 return Response.json({token:signToken(secret),siteKey:process.env.TURNSTILE_SITE_KEY||''},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
 catch(error){console.error('contact-token storage unavailable',{type:error instanceof Error?error.name:'Unknown'});return Response.json({error:'Form temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}
