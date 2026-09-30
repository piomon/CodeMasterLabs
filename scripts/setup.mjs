import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {randomBytes} from 'node:crypto'
const [major,minor]=process.versions.node.split('.').map(Number)
if(major<22||(major===22&&minor<16)){console.error('Node.js 22.16+ is required. Install an active Node LTS release.');process.exit(1)}
for(const dir of ['media','private-uploads','exports','reports'])mkdirSync(dir,{recursive:true})
// Never generate deployment secrets or silently select a production database.
if(!existsSync('.env')){
 if(process.env.NODE_ENV==='production'){if(!process.env.PAYLOAD_SECRET)throw new Error('Set production environment explicitly.');process.exit(0)}
 let text=readFileSync('.env.example','utf8').replace(/^PAYLOAD_SECRET=.*$/m,`PAYLOAD_SECRET=${randomBytes(48).toString('hex')}`)
 writeFileSync('.env',text,{mode:0o600});console.log('Created .env with a unique local secret. No administrator account was created.')
}else{const text=readFileSync('.env','utf8');if(/^PAYLOAD_SECRET=\s*$/m.test(text)){if(process.env.NODE_ENV==='production')throw new Error('Production secret must be configured.');writeFileSync('.env',text.replace(/^PAYLOAD_SECRET=.*$/m,`PAYLOAD_SECRET=${randomBytes(48).toString('hex')}`),{mode:0o600})}}
console.log('Local setup checked. Website: http://localhost:3000 | CMS: http://localhost:3000/admin')
