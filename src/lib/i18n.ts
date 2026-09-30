import type { Locale } from '@/types/site'
export const isEnglish = (locale: Locale) => locale === 'en'
export function pagePath(locale: Locale, page: 'home' | 'services' | 'projects' | 'blog' | 'contact' | 'privacy' | 'cookies', slug?: string) {
 const paths = locale === 'en'
  ? { home: '/en', services:'/en/services', projects: '/en/projects', blog: '/en/blog', contact: '/en/contact', privacy: '/en/privacy', cookies: '/en/cookies' }
  : { home: '/', services:'/uslugi', projects: '/realizacje', blog: '/blog', contact: '/kontakt', privacy: '/polityka-prywatnosci', cookies: '/cookies' }
 return paths[page] + (slug ? `/${encodeURIComponent(slug)}` : '')
}
export const pick = (locale: Locale, pl: string, en: string) => locale === 'en' ? en : pl

export function safeHref(value:string,fallback='/') {
 if(typeof value!=='string'||/[\x00-\x20\x7f\\]/.test(value)||/%0[ad]/i.test(value))return fallback
 if(/^#[\w-]+$/.test(value))return value
 if(value.startsWith('/')&&!value.startsWith('//'))return value
 if(value.startsWith('https://')) {
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:fallback}catch{return fallback}
 }
 if(/^mailto:[^\s?]+@[^\s?]+$/.test(value)||/^tel:\+?[\d()-]+$/.test(value))return value
 return fallback
}

/** Both languages share the same canonical domain; aliases redirect at the edge. */
export function languagePaths(path:string):{pl:string;en:string}|undefined {
 const clean=path!=='/'?path.replace(/\/$/,''):path
 const demo=clean.match(/^\/(?:en\/)?demos\/(operations|approval|commerce|client-portal|real-estate)$/)
 if(demo)return {pl:`/demos/${demo[1]}`,en:`/en/demos/${demo[1]}`}
 const showcase=clean.match(/^\/showcase\/(?:pl|en)\/(atelier|maison|velo|nora|ember|aura)$/)
 if(showcase)return {pl:`/showcase/pl/${showcase[1]}`,en:`/showcase/en/${showcase[1]}`} 
 for(const page of ['home','services','projects','blog','contact','privacy','cookies'] as const){
  const pl=pagePath('pl',page),en=pagePath('en',page)
  if(clean===pl||clean===en)return {pl,en}
  if(page==='projects'||page==='blog'){
   if(clean.startsWith(pl+'/'))return {pl:clean,en:en+clean.slice(pl.length)}
   if(clean.startsWith(en+'/'))return {pl:pl+clean.slice(en.length),en:clean}
  }
 }
 return undefined
}
