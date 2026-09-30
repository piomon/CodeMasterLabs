import type {GlobalConfig,Field} from 'payload'
import {safeHref} from '@/lib/i18n'
import {adminOnly,localText,localArea} from '@/lib/access'
const access={read:()=>true,update:adminOnly,readVersions:adminOnly}
const links:Field={name:'links',type:'array',localized:true,fields:[{name:'label',type:'text',required:true},{name:'href',type:'text',required:true,validate:(v:unknown)=>typeof v==='string'&&safeHref(v,'')!==''?true:'Uzyj lokalnej sciezki / lub HTTPS.'}]}
export const Homepage:GlobalConfig={slug:'homepage',label:'Sekcje strony glownej',admin:{group:'CONTENT'},access,versions:{max:20},fields:[
 ...['services','projects','process','contact'].flatMap(name=>[localText(`${name}Kicker`,`${name} / etykieta`),localArea(`${name}Title`,`${name} / naglowek`),localArea(`${name}Description`,`${name} / opis`)]),localText('aboutKicker','O mnie / etykieta'),
 {name:'trustItems',label:'Konkrety pod hero',type:'array',localized:true,maxRows:3,fields:[{name:'text',type:'text',required:true},{name:'description',type:'text'}]},
 {name:'stages',label:'Etapy wspolpracy',type:'array',localized:true,maxRows:7,fields:[{name:'title',type:'text',required:true},{name:'description',type:'textarea',required:true}]},
 {name:'conversation',label:'Rozmowa w telefonie',type:'array',localized:true,fields:[{name:'side',type:'select',options:['client','me'],required:true},{name:'text',type:'textarea',required:true},{name:'stage',type:'number',min:0,max:6,required:true}]}]}
export const Navigation:GlobalConfig={slug:'navigation',label:'Nawigacja',admin:{group:'SETTINGS'},access,fields:[links,localText('cta','Przycisk kontaktu')]}
export const Footer:GlobalConfig={slug:'footer',label:'Stopka',admin:{group:'SETTINGS'},access,fields:[localArea('statement','Haslo'),localText('footnote','Podpis'),links]}
export const ContactSettings:GlobalConfig={slug:'contact-settings',label:'Prywatnosc i kontakt',admin:{group:'SETTINGS',description:'Dane prawne musza zostac potwierdzone przed publicznym wdrozeniem.'},access,fields:[{name:'legalName',label:'Pelna nazwa administratora danych',type:'text'},{name:'legalAddress',label:'Adres administratora danych',type:'textarea'},{name:'retentionDescription',label:'Okres przechowywania',type:'textarea',localized:true},{name:'hostingProvider',label:'Dostawca hostingu / lokalizacja',type:'text'},{name:'privacyReviewed',label:'Informacja prawna zweryfikowana przed publikacja',type:'checkbox',defaultValue:false}]}
export const SocialLinks:GlobalConfig={slug:'social-links',label:'Profile i linki',admin:{group:'SETTINGS'},access,fields:[links]}
export const SEO:GlobalConfig={slug:'seo',label:'SEO domyslne',admin:{group:'SETTINGS'},access,fields:[localText('title','Tytul'),localArea('description','Opis'),{name:'ogImage',type:'upload',relationTo:'media'}]}

// Internal marker prevents deleted sample collections from being seeded again.
export const InstallationState:GlobalConfig={slug:'installation-state',label:'Installation state',admin:{hidden:true},access:{read:adminOnly,update:adminOnly},fields:[{name:'contentInitializedAt',type:'date'}]}
