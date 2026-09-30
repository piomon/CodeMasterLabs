import type {CollectionConfig} from 'payload'
import {privateAccess} from '@/lib/access'
import {TOPICS} from '@/lib/lead-validation'
import {PRIVACY_VERSION} from '@/lib/submission-policy'
export const Leads:CollectionConfig={slug:'leads',labels:{singular:'Zapytanie',plural:'Zapytania'},admin:{useAsTitle:'email',group:'SALES',defaultColumns:['createdAt','name','email','topic','status'],description:'Zapytania z formularza i kreatora. Powiadomienia SMTP zawieraja tylko odnosnik do CMS, bez tresci zapytania i zalacznikow.'},access:privateAccess,fields:[
 {name:'notificationStatus',type:'select',options:['pending','sent','failed','legacy'],defaultValue:'pending',index:true,admin:{readOnly:true}},
 {name:'notificationAttempts',type:'number',defaultValue:0,admin:{readOnly:true}},
 {name:'notificationNextAttemptAt',type:'date',index:true,admin:{readOnly:true}},
 {name:'notificationSentAt',type:'date',admin:{readOnly:true}},
 {name:'notificationLastError',type:'text',admin:{readOnly:true}},
 {name:'submissionKey',type:'text',required:true,unique:true,index:true,admin:{hidden:true}},
 {name:'name',label:'Imie',type:'text',required:true,maxLength:100},{name:'email',label:'Email',type:'email',required:true},{name:'company',label:'Firma',type:'text',maxLength:160},{name:'phone',label:'Telefon',type:'text',maxLength:32},
 {name:'topic',label:'Temat',type:'select',options:[...TOPICS],required:true},{name:'message',label:'Wiadomosc',type:'textarea',required:true,maxLength:5000},{name:'timeline',label:'Termin',type:'text'},{name:'budget',label:'Budzet',type:'text'},{name:'nda',label:'Potrzebuje NDA',type:'checkbox'},
 {name:'privacyAccepted',label:'Potwierdzono informacje o prywatnosci',type:'checkbox',required:true},{name:'privacyVersion',type:'text',defaultValue:PRIVACY_VERSION},
 {name:'locale',type:'select',options:['pl','en'],defaultValue:'pl'},{name:'source',label:'Zrodlo',type:'select',options:['contact','chat'],defaultValue:'contact'},
 {name:'attachment',label:'Prywatny zalacznik',type:'upload',relationTo:'private-files'},{name:'status',label:'Status',type:'select',options:['new','replied','in-progress','closed'],defaultValue:'new'},{name:'internalNotes',label:'Notatki wewnetrzne',type:'textarea'}]}
