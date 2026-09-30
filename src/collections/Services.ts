import type {CollectionConfig} from 'payload'
import {contentAccess,orderField,localText,localArea,visualField} from '@/lib/access'
export const Services:CollectionConfig={slug:'services',labels:{singular:'Usluga',plural:'Uslugi'},admin:{useAsTitle:'title',group:'CONTENT'},access:contentAccess,defaultSort:'order',versions:{drafts:true,maxPerDoc:10},fields:[orderField,localText('title','Nazwa',true),localArea('description','Opis',true),localText('shortLabel','Krotka etykieta'),visualField,localText('outcome','Korzysc')]}
