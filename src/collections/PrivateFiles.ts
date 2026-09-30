import type {CollectionConfig} from 'payload'
import path from 'node:path'
import {privateAccess} from '@/lib/access'
export const PrivateFiles:CollectionConfig={slug:'private-files',labels:{singular:'Prywatny zalacznik',plural:'Prywatne zalaczniki'},admin:{group:'SALES'},access:privateAccess,upload:{staticDir:path.resolve(process.env.PRIVATE_UPLOAD_DIR||path.join(process.cwd(),'private-uploads')),mimeTypes:['application/pdf','text/plain','image/png','image/jpeg'],disableLocalStorage:false},fields:[{name:'submissionKey',type:'text',required:true,unique:true,index:true,admin:{hidden:true}},{name:'sha256',type:'text',required:true,admin:{readOnly:true}}]}
