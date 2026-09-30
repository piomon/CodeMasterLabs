'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dialog } from './common/Dialog'
import { Icon } from './common/Icon'
import { pagePath,pick,safeHref,languagePaths } from '@/lib/i18n'
import type { Locale,NavigationContent,Settings } from '@/types/site'
export function SiteHeader({settings:s,nav,locale}:{settings:Settings;nav:NavigationContent;locale:Locale}) {
 const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(false),[hydrated,setHydrated]=useState(false)
 useEffect(()=>{setHydrated(true)},[])
 useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>24);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[])
 const language=languagePaths(usePathname()||'/')||{pl:'/',en:'/en'}
 const links=nav.links.map(link=>/#journal$/.test(link.href)?{...link,href:pagePath(locale,'blog')}:link).map(link=>/#work(?:$|\?)/.test(link.href)?{...link,href:`${pagePath(locale,'home')}#product`,label:pick(locale,'Realizacje','Selected work')}:link)
 return <header className={`site-header ${scrolled?'is-scrolled':''}`}><div className="header-inner container">
  <Link href={pagePath(locale,'home')} className="brand" aria-label={`${s.brandName} ${pick(locale,'strona główna','home')}`}><span className="brand-symbol" aria-hidden="true"><i/><i/><i/></span><span>{s.brandName}<span className="brand-period">.</span></span></Link>
  <nav className="desktop-nav" aria-label={pick(locale,'Nawigacja główna','Main navigation')}>{links.map(link=><Link key={link.href} href={safeHref(link.href)}>{link.label}</Link>)}</nav>
   <div className="header-actions"><div className="language-switch" aria-label={pick(locale,'Język strony','Site language')}><Link href={language.pl} aria-current={locale==='pl'?'page':undefined} hrefLang="pl">PL</Link><span>/</span><Link href={language.en} aria-current={locale==='en'?'page':undefined} hrefLang="en">EN</Link></div><Link className="header-cta" href={`${pagePath(locale,'home')}#contact`}>{nav.cta}<Icon name="external" size={14}/></Link><button className="menu-trigger" onClick={()=>setOpen(true)} disabled={!hydrated} aria-expanded={open} aria-label={pick(locale,'Otwórz menu','Open menu')}><Icon name="menu"/></button></div>
   <Dialog open={open} onClose={()=>setOpen(false)} label={pick(locale,'Menu nawigacji','Navigation menu')} className="menu-dialog"><div className="menu-top"><span className="brand">{s.brandName}<span className="brand-period">.</span></span><button className="icon-button" onClick={()=>setOpen(false)} aria-label={pick(locale,'Zamknij menu','Close menu')}><Icon name="close"/></button></div><nav>{links.map((link,i)=><Link key={link.href} href={safeHref(link.href)} onClick={()=>setOpen(false)}><small>{String(i+1).padStart(2,'0')}</small>{link.label}<Icon name="external"/></Link>)}<Link href={`${pagePath(locale,'home')}#contact`} onClick={()=>setOpen(false)}><small>{String(links.length+1).padStart(2,'0')}</small>{pick(locale,'Kontakt','Contact')}<Icon name="external"/></Link></nav><div className="menu-bottom"><span>CODEMASTER<br/>{pick(locale,'SOFTWARE HOUSE / PRODUKTY CYFROWE','SOFTWARE HOUSE / DIGITAL PRODUCTS')}</span><a href={`mailto:${s.email}`}>{s.email}</a></div></Dialog>
 </div></header>
}
