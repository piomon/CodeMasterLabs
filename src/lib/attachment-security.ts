import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises'
import path from 'node:path'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import sharp from 'sharp'
import {scanBytes} from './antivirus'
import {fileType,MAX_ATTACHMENT} from './form-security'
import {assertPassivePDF} from './pdf-policy'
const exec=promisify(execFile)
let activeScans=0
export async function inspectAttachment(bytes:Buffer,name:string):Promise<{mime:string;extension:string}>{
 if(activeScans>=2)throw new Error('SCANNER_BUSY')
 activeScans++
 try{return await inspect(bytes,name)}finally{activeScans--}
}
async function inspect(bytes:Buffer,name:string):Promise<{mime:string;extension:string}>{
 if(bytes.length===0||bytes.length>MAX_ATTACHMENT||name.length>180||/[\\/:\x00]/.test(name)||name.startsWith('.')||/\.(exe|com|bat|cmd|ps1|php|js|html|svg)\./i.test(name))throw new Error('ATTACHMENT_INVALID')
 const type=fileType(bytes,name);if(!type)throw new Error('ATTACHMENT_INVALID')
 const root=process.env.QUARANTINE_DIR||path.join(process.cwd(),'.quarantine')
 await mkdir(root,{recursive:true,mode:0o700})
 const dir=await mkdtemp(path.join(root,'scan-')),file=path.join(dir,`upload.${type.extension}`)
 try{
  await writeFile(file,bytes,{mode:0o600,flag:'wx'})
  const verdict=await scanBytes(bytes)
  if(verdict!=='CLEAN')throw new Error(verdict==='INFECTED'?'ATTACHMENT_INFECTED':'SCANNER_UNAVAILABLE')
  if(type.extension==='pdf'){
   try{
    await exec('qpdf',['--check',file],{timeout:10000,maxBuffer:65536})
    const result=await exec('qpdf',['--json=2','--json-stream-data=none',file],{timeout:10000,maxBuffer:8*1024*1024})
    assertPassivePDF(JSON.parse(result.stdout))
   }catch{throw new Error('ATTACHMENT_INVALID')}
  }else if(type.mime.startsWith('image/')){
   try{await sharp(bytes,{limitInputPixels:16000000,failOn:'warning'}).raw().toBuffer()}catch{throw new Error('ATTACHMENT_INVALID')}
  }
  return type
 }finally{await rm(dir,{recursive:true,force:true})}
}
