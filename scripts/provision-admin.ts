import {readFileSync,writeFileSync} from 'node:fs'
import {randomBytes} from 'node:crypto'
import {getPayload} from 'payload'
import config from '../src/payload.config'
// Values arrive through a read-only operator file, never command-line arguments.
const input=JSON.parse(readFileSync('/run/operator/admin.json','utf8')) as {email:string;name:string}
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)||input.name.length<2)throw new Error('Invalid administrator details')
const cms=await getPayload({config})
try{
 if((await cms.count({collection:'users',overrideAccess:true})).totalDocs){console.log('Existing administrator retained.');process.exitCode=0}
 else{
  const password=randomBytes(30).toString('base64url')
  await cms.create({collection:'users',overrideAccess:true,context:{allowBootstrap:true},data:{name:input.name,email:input.email,password}})
  writeFileSync('/run/operator/admin-credentials.txt',`CMS: ${(process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)}/admin\nEmail: ${input.email}\nPassword: ${password}\n`,{mode:0o600,flag:'wx'})
  console.log('Administrator created. Credentials written to the operator-only file; not logged.')
 }
}finally{await cms.destroy()}
