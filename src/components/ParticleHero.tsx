'use client'
import { useEffect, useRef } from 'react'
import { useMotion } from './animation/MotionProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Button } from './common/Button'
import { Icon } from './common/Icon'
import { pick, pagePath } from '@/lib/i18n'
import type { Settings, HomepageContent, Locale } from '@/types/site'
import './cosmic-hero.css'

export function ParticleHero({settings:s,home,locale}:{settings:Settings;home:HomepageContent;locale:Locale}) {
 const canvas=useRef<HTMLCanvasElement>(null)
 const heading=useRef<HTMLHeadingElement>(null)
 const hero=useRef<HTMLElement>(null)
 const {paused,toggle}=useMotion()
 const prefersReduced=useReducedMotion()
 const visualEnabled=!prefersReduced&&!paused

 useEffect(()=>{
  if(!visualEnabled||!canvas.current||!heading.current)return
  let cleanup:(()=>void)|undefined
  let cancelled=false
  import('./animation/particle-engine').then(({createParticleTypography})=>{
   if(!cancelled&&canvas.current&&heading.current)cleanup=createParticleTypography(canvas.current,heading.current)
  }).catch(()=>{/* The visible HTML heading remains the accessible fallback. */})
  return()=>{cancelled=true;cleanup?.()}
 },[visualEnabled,s.heroTitle])

 const lines=s.heroTitle.split(/\r?\n/).filter(line=>line.trim())
 // CODEMASTER_PREMIUM_MOTION_20261001
 const legacyBusinessLead=pick(locale,'CodeMaster to software house tworzący aplikacje, strony WWW, systemy dla firm i rozwiązania AI. Prowadzimy projekt od koncepcji i testów po wdrożenie oraz wsparcie.','CodeMaster is a software house building custom apps, websites, business systems and AI solutions. We take projects from concept and testing through launch and ongoing support.')
 const verboseBusinessLead=pick(locale,'Tworzymy nowoczesne strony, aplikacje i systemy, które ułatwiają pracę, wspierają sprzedaż i rozwijają się razem z Twoją firmą — od pierwszego pomysłu po bezpieczne wdrożenie.','We create modern websites, applications and systems that simplify work, support sales and grow with your business — from the first idea to a secure launch.')
 const defaultBusinessLead=pick(locale,'Tworzymy strony, aplikacje i systemy, które rozwijają Twój biznes.','We create websites, applications and systems that help your business grow.')
 const previousBusinessLead=pick(locale,'Tworzymy aplikacje webowe, strony WWW i systemy dla firm, które upraszczają pracę, wspierają sprzedaż i rosną razem z Twoim biznesem — od pomysłu po bezpieczne wdrożenie i dalszy rozwój.','We build web applications, websites and business systems that simplify work, support sales and grow with your company — from the first idea through secure launch and ongoing development.')
 const businessLead=[legacyBusinessLead,previousBusinessLead,verboseBusinessLead].includes(s.heroLead.trim())?defaultBusinessLead:s.heroLead

 // CODEMASTER_HERO_EXACT_CENTER_20261002
 useEffect(()=>{
  const section=hero.current
  const title=heading.current
  const content=
   section?.querySelector<HTMLElement>(
    '.hero-content'
   )

  if(!section||!title||!content)return

  let frame=0

  const update=()=>{
   cancelAnimationFrame(frame)

   frame=requestAnimationFrame(()=>{
    const currentSection=hero.current
    const currentTitle=heading.current

    if(!currentSection||!currentTitle)return

    // CODEMASTER_HERO_ABSOLUTE_CENTER_20261002
    currentSection.style.setProperty(
     '--hero-center-shift',
     '0px',
    )

    const sectionRect=
     currentSection.getBoundingClientRect()

    const titleRect=
     currentTitle.getBoundingClientRect()

    const targetCenter=
     sectionRect.top+
     window.innerHeight/2

    const baseCenter=
     titleRect.top+
     titleRect.height/2

    const shift=
     targetCenter-
     baseCenter

    currentSection.style.setProperty(
     '--hero-center-shift',
     `${shift.toFixed(2)}px`,
    )
   })
  }

  const observer=
   typeof ResizeObserver==='undefined'
    ?null
    :new ResizeObserver(update)

  // CODEMASTER_HERO_LAYOUT_OBSERVER_20261002
  observer?.observe(title)
  observer?.observe(section)
  observer?.observe(content)

  window.addEventListener(
   'resize',
   update,
   {passive:true},
  )

  window.visualViewport?.addEventListener(
   'resize',
   update,
   {passive:true},
  )

  void document.fonts.ready
   .then(()=>update())
   .catch(()=>{})

  update()

  return()=>{
   cancelAnimationFrame(frame)

   observer?.disconnect()

   window.removeEventListener(
    'resize',
    update,
   )

   window.visualViewport?.removeEventListener(
    'resize',
    update,
   )
  }
 },[
  s.heroTitle,
  s.heroEyebrow,
  s.heroLead,
  s.primaryCTA,
  s.secondaryCTA,
  locale,
 ])
 return <section ref={hero} data-light-motion={visualEnabled?'on':'off'} className="hero cosmic-hero" id="top" aria-labelledby="hero-heading">
  <div className="hero-content container">
   <p className="eyebrow hero-eyebrow"><span className="status-dot"/>{s.heroEyebrow}</p>
   <div className="particle-stage">
    <h1 id="hero-heading" ref={heading}>{lines.map((line,i)=><span key={i} data-particle-line="">{line}</span>)}</h1>
    <canvas ref={canvas} aria-hidden="true"/>
   </div>
   <div className="hero-business-copy" data-animated-copy="led-power">
    <p className="hero-power-line hero-client-line"><span>{businessLead}</span></p>
   </div>
   <div className="hero-actions">
    <Button href={`${pagePath(locale,'home')}#product`} event="hero_cta">{['Zobacz koncepcje','Explore concepts','View concepts'].includes(s.primaryCTA)?pick(locale,'Zobacz realizacje','Explore our work'):s.primaryCTA}</Button>
    <Button href={`${pagePath(locale,'home')}#contact`} variant="secondary" event="hero_cta">{s.secondaryCTA}</Button>
   </div>
   <div className="hero-trust">{home.trustItems.slice(0,3).map(item=><span key={item.text}><Icon name="check" size={13}/>{item.text}</span>)}</div>
  </div>
   <div className="hero-bottom container">
   <a href="#services" className="scroll-cue"><span className="scroll-mark"><span/></span>{pick(locale,'ODKRYJ, CO MOŻEMY STWORZYĆ','EXPLORE WHAT WE CAN BUILD')}</a>
   <div className="hero-live"><span className="tiny-cross">+</span><span>{pick(locale,'POMYSŁ. PROJEKT. REALIZACJA.','IDEA. DESIGN. DELIVERY.')}</span></div>
   <button className="motion-toggle" onClick={toggle} disabled={prefersReduced} aria-pressed={paused} aria-label={pick(locale,paused?'Wznów animacje':'Wstrzymaj animacje',paused?'Resume animations':'Pause animations')}>
    <Icon name={paused||prefersReduced?'play':'pause'} size={12}/><span>{pick(locale,prefersReduced?'RUCH OGRANICZONY':paused?'WZNÓW RUCH':'PAUZA ANIMACJI',prefersReduced?'REDUCED MOTION':paused?'RESUME MOTION':'PAUSE MOTION')}</span>
   </button>
  </div>
 </section>
}
