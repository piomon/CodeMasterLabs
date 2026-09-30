import type {Access,Field} from 'payload'
/** All CMS accounts are trusted administrators. Public registration is disabled. */
export const adminOnly:Access=({req})=>Boolean(req.user)
export const publishedOnly:Access=({req})=>req.user?true:{_status:{equals:'published'}}
export const privateAccess={create:adminOnly,read:adminOnly,update:adminOnly,delete:adminOnly,readVersions:adminOnly}
export const contentAccess={...privateAccess,read:publishedOnly,readVersions:adminOnly}
export const localText=(name:string,label:string,required=false):Field=>({name,label,type:'text',localized:true,required})
export const localArea=(name:string,label:string,required=false):Field=>({name,label,type:'textarea',localized:true,required})
export const visualField:Field={name:'visualStyle',label:'Prezentacja produktu',type:'select',defaultValue:'dashboard',options:[{label:'Panel systemu',value:'dashboard'},{label:'Mobilny e-commerce',value:'mobile'},{label:'Automatyzacja',value:'ai'},{label:'Strona internetowa',value:'web'}]}
export const seoField:Field={name:'seo',label:'SEO',type:'group',fields:[localText('title','Tytul SEO'),localArea('description','Opis SEO')]}
export const sectionFields:Field={name:'sections',label:'Rozdzialy',type:'array',localized:true,fields:[{name:'heading',label:'Naglowek',type:'text',required:true},{name:'body',label:'Tresc (akapity oddzielone nowa linia)',type:'textarea',required:true}]}
export const orderField:Field={name:'order',label:'Kolejnosc',type:'number',defaultValue:1}
export const slugField:Field={name:'slug',label:'Adres URL',type:'text',required:true,unique:true,index:true,validate:(value:unknown)=>typeof value==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)?true:'Uzyj malych liter, cyfr i myslnikow.'}
