'use client'
import dynamic from 'next/dynamic'
import type {ReactNode} from 'react'
import {MotionProvider} from '@/components/animation/MotionProvider'
import {ProjectCursor} from '@/components/animation/ProjectCursor'
import {SiteHeader} from '@/components/SiteHeader'
import {CosmicBackground} from '@/components/animation/CosmicBackground'
import {SiteFooter} from './SiteFooter'
import {pick} from '@/lib/i18n'
import type {Settings,NavigationContent,FooterContent,Locale} from '@/types/site'
const Assistant=dynamic(()=>import('@/components/RobotChat').then(m=>m.RobotChat),{ssr:false})
export function SiteShell({children,settings,nav,footer,locale}:{children:ReactNode;settings:Settings;nav:NavigationContent;footer:FooterContent;locale:Locale}){
  return <MotionProvider><CosmicBackground/><div id="site-top"/><a href="#main" className="skip-link">{pick(locale,'Przejdź do treści','Skip to content')}</a><SiteHeader settings={settings} nav={nav} locale={locale}/>{children}<SiteFooter settings={settings} footer={footer} locale={locale}/><Assistant email={settings.email} locale={locale}/><ProjectCursor/></MotionProvider>
}
