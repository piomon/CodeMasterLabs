import {NextResponse,type NextRequest} from 'next/server'
export function proxy(req:NextRequest){
 const path=req.nextUrl.pathname
 // The first account is always created from a local, operator-controlled CLI.
 if(/^\/api\/users\/first-register\/?$/.test(path))return NextResponse.json({error:'Public registration disabled.'},{status:403})
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64'),development=process.env.NODE_ENV!=='production'
 const csp=["default-src 'self'",`script-src 'self' 'nonce-${nonce}' ${development?"'unsafe-eval'":"'strict-dynamic'"}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self' data:",`connect-src 'self' https://challenges.cloudflare.com ${development?'ws: wss:':''}`,"frame-src 'self' https://challenges.cloudflare.com", "worker-src 'self' blob:","object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'self'"].join('; ')
 const headers=new Headers(req.headers);headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',csp);headers.set('x-cm-locale',path==='/en'||path.startsWith('/en/')||(path==='/preview'&&req.nextUrl.searchParams.get('locale')==='en')?'en':'pl')
 const res=NextResponse.next({request:{headers}})
 res.headers.set('Content-Security-Policy',csp)
 res.headers.set('Referrer-Policy','strict-origin-when-cross-origin');res.headers.set('X-Content-Type-Options','nosniff');res.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()')
 if(path.startsWith('/api/')||path.startsWith('/admin')||path.startsWith('/preview'))res.headers.set('X-Robots-Tag','noindex, nofollow')
 if(path.startsWith('/api/')||path.startsWith('/admin')||path.startsWith('/preview'))res.headers.set('Cache-Control','private, no-store')
 if(path.startsWith('/api/private-files/file/')){res.headers.set('Content-Disposition','attachment');res.headers.set('Cache-Control','private, no-store')}
 if(process.env.NODE_ENV==='production'&&((process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)||'').startsWith('https://'))res.headers.set('Strict-Transport-Security','max-age=31536000')
 return res
}
export const config={matcher:['/api/:path*','/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)']}
