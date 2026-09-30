import Link from 'next/link'
import {Icon} from './Icon'
import {pagePath,pick,safeHref} from '@/lib/i18n'
import type {Settings,FooterContent,Locale} from '@/types/site'
export function SiteFooter({settings:s,footer,locale}:{settings:Settings;footer:FooterContent;locale:Locale}){
  return <footer className="site-footer"><div className="container"><div className="footer-top"><Link href={pagePath(locale,'home')} className="brand">{s.brandName}<span className="brand-period">.</span></Link><p>{footer.statement}</p><a href={`mailto:${s.email}`} className="footer-contact">{pick(locale,'Porozmawiajmy o Twoim projekcie','Let’s talk about your project')}<Icon name="external" size={17}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {s.brandName} · SOFTWARE HOUSE</span><span>{footer.footnote}</span><nav aria-label={pick(locale,'Linki w stopce','Footer links')}>{footer.links.map(link=><Link key={link.href} href={safeHref(link.href)}>{link.label}</Link>)}</nav><a className="back-top" href="#site-top" aria-label={pick(locale,'Na górę strony','Back to top')}><Icon name="arrow" size={16} style={{transform:'rotate(-90deg)'}}/></a></div></div></footer>
}
