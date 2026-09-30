/** Runs before the standalone server. No bypass for a public production origin. */
export function validateEnvironment(env=process.env){
 const fail=message=>{throw new Error(`Production configuration: ${message}`)}
 const secret=env.PAYLOAD_SECRET||''
 if(secret.length<64||/replace|example|changeme/i.test(secret))fail('supply a freshly generated PAYLOAD_SECRET (48 random bytes minimum).')
 let url;try{url=new URL(env.SERVER_URL||env.NEXT_PUBLIC_SERVER_URL)}catch{fail('NEXT_PUBLIC_SERVER_URL is invalid.')}
 if(env.SERVER_URL&&env.NEXT_PUBLIC_SERVER_URL&&env.SERVER_URL.replace(/\/$/,'')!==env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/,''))fail('SERVER_URL and NEXT_PUBLIC_SERVER_URL must be identical.')
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)fail('canonical URL must be a bare HTTP(S) origin.')
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&env.ALLOW_HTTP_LOCAL==='true'
 if(!local&&(url.protocol!=='https:'||url.pathname!=='/'||url.username||url.password||url.search||url.hash))fail('canonical URL must be a bare HTTPS origin.')
 if(env.ALLOW_SQLITE_PRODUCTION!=='single-node'||!env.DATABASE_URL?.startsWith('file:'))fail('this installer supports explicit single-node SQLite only.')
 if(env.SEED_CONTENT!=='false'||env.PAYLOAD_DROP_DATABASE!=='false')fail('automatic seeding/database dropping must be disabled.')
 if(env.CLAMAV_PORT&&(!/^\d+$/.test(env.CLAMAV_PORT)||Number(env.CLAMAV_PORT)<1||Number(env.CLAMAV_PORT)>65535))fail('CLAMAV_PORT out of range.')
 if(env.LEAD_RETENTION_DAYS&&(!/^\d+$/.test(env.LEAD_RETENTION_DAYS)||Number(env.LEAD_RETENTION_DAYS)<1||Number(env.LEAD_RETENTION_DAYS)>36500))fail('LEAD_RETENTION_DAYS out of range.')
 if(!local){
  for(const key of ['SMTP_HOST','SMTP_USER','SMTP_PASS','SMTP_FROM','LEAD_NOTIFY_EMAIL','SITE_CONTACT_EMAIL','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','CLAMAV_HOST'])if(!env[key])fail(`${key} is required.`)
  for(const key of ['SMTP_FROM','LEAD_NOTIFY_EMAIL','SITE_CONTACT_EMAIL'])if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env[key]||'')||/\.invalid$/i.test(env[key]))fail(`${key} must be a configured real mailbox address.`)
  if(!['465','587'].includes(env.SMTP_PORT))fail('SMTP_PORT must be 465 or 587.')
  if(env.TRUSTED_CLIENT_IP_HEADER!=='x-real-ip')fail('use the installed Nginx overwriting x-real-ip header.')
  if(/^[123]x0{8}/.test(env.TURNSTILE_SITE_KEY)||/^[123]x0{8}/.test(env.TURNSTILE_SECRET_KEY))fail('Turnstile test keys are forbidden on public origins.')
  if(env.ALLOW_HTTP_LOCAL==='true')fail('ALLOW_HTTP_LOCAL is forbidden on public origins.')
 }
 return {local}
}
