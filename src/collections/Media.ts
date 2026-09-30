import type {CollectionConfig} from 'payload'
import path from 'node:path'
import {privateAccess} from '@/lib/access'
export const Media:CollectionConfig={slug:'media',admin:{useAsTitle:'alt',group:'CONTENT',description:'Publiczne obrazy. Nie wgrywaj tu dokumentow klientow.'},access:{...privateAccess,read:()=>true},upload:{staticDir:path.resolve(process.env.MEDIA_DIR||path.join(process.cwd(),'media')),mimeTypes:['image/jpeg','image/png','image/webp'],imageSizes:[{name:'thumbnail',width:480},{name:'large',width:1600}],adminThumbnail:'thumbnail'},fields:[{name:'alt',label:'Tekst alternatywny',type:'text',localized:true,required:true}]}
