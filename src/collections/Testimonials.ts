import type {CollectionConfig} from 'payload'
import {contentAccess,localText,localArea} from '@/lib/access'
export const Testimonials:CollectionConfig={slug:'testimonials',labels:{singular:'Opinia',plural:'Opinie'},admin:{useAsTitle:'name',group:'PORTFOLIO',defaultColumns:['name','rating','_status','createdAt'],description:'Opinie klientow zapisane w bazie. Zarzadzaj trescia, ocena i widocznoscia opinii.'},access:contentAccess,versions:{drafts:true},fields:[
 {name:'submissionKey',type:'text',unique:true,index:true,admin:{hidden:true},access:{read:({req})=>Boolean(req.user)}},
 {name:'consentAcceptedAt',type:'date',admin:{readOnly:true},access:{read:({req})=>Boolean(req.user)}},
 {name:'consentVersion',type:'text',admin:{readOnly:true},access:{read:({req})=>Boolean(req.user)}},
 {name:'name',label:'Imie i nazwisko klienta',type:'text',required:true},{name:'rating',label:'Ocena (1–5)',type:'number',min:1,max:5,validate:(value:unknown)=>value==null||Number.isInteger(value)?true:'Ocena musi być całkowita.'},localText('role','Stanowisko'),{name:'company',label:'Firma',type:'text'},localArea('quote','Tresc opinii',true),{name:'avatar',type:'upload',relationTo:'media'},{name:'logo',type:'upload',relationTo:'media'},{name:'videoURL',type:'text'},{name:'featured',type:'checkbox',defaultValue:true}]}
