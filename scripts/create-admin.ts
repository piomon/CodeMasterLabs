import {createInterface} from 'node:readline/promises'
import {stdin,stdout} from 'node:process'
import {getPayload,type Payload} from 'payload'
import config from '../src/payload.config'
import {randomBytes} from 'node:crypto'
let cms:Payload|undefined
const prompt=createInterface({input:stdin,output:stdout})
try{
 const email=(await prompt.question('Administrator email: ')).trim()
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Invalid email')
 const name=(await prompt.question('Administrator name: ')).trim();if(name.length<2)throw new Error('Name is required')
 cms=await getPayload({config})
 const existing=await cms.count({collection:'users',overrideAccess:true})
 if(existing.totalDocs){throw new Error('An administrator already exists. Create additional accounts from the authenticated CMS.')}
 const password=randomBytes(24).toString('base64url')
 await cms.create({collection:'users',overrideAccess:true,context:{allowBootstrap:true},data:{name,email,password}})
 console.log('\nAdministrator created. Save this password securely; it is shown only here:')
 console.log(password)
 console.log('\nLog in at /admin. Never put the password in source control or public screenshots.')
}catch(error){console.error(error instanceof Error?error.message:'Administrator creation failed');process.exitCode=1}finally{prompt.close();await cms?.destroy()}
