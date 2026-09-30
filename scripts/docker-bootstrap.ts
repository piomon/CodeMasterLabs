import {getPayload,type Payload} from 'payload'
import config from '../src/payload.config'
import {passwordProblem} from '../src/lib/submission-policy'

const email=(process.env.CODEMASTER_ADMIN_EMAIL||'admin@codemaster.local').trim().toLowerCase()
const password=(process.env.CODEMASTER_ADMIN_PASSWORD||'').trim()
const name=(process.env.CODEMASTER_ADMIN_NAME||'CodeMaster Admin').trim()

const problem=passwordProblem(password)
if(problem)throw new Error(problem)

let cms:Payload|undefined
try{
 cms=await getPayload({config})
 const existing=await cms.count({collection:'users',overrideAccess:true})
 if(existing.totalDocs===0){
  await cms.create({
   collection:'users',
   overrideAccess:true,
   context:{allowBootstrap:true},
   data:{name,email,password},
  })
  cms.logger.info(`Local Docker administrator created: ${email}`)
 }else{
  cms.logger.info('Administrator already exists: Docker bootstrap skipped account creation.')
 }
}finally{
 await cms?.destroy()
}
