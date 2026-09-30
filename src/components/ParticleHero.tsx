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
 return <section className="hero cosmic-hero" id="top" aria-labelledby="hero-heading">
  <div className="hero-content container">
   <p className="eyebrow hero-eyebrow"><span className="status-dot"/>{s.heroEyebrow}</p>
   <div className="particle-stage">
    <h1 id="hero-heading" ref={heading}>{lines.map((line,i)=><span key={i} data-particle-line="">{line}</span>)}</h1>
    <canvas ref={canvas} aria-hidden="true"/>
   </div>
   <p className="hero-lead">{s.heroLead}</p>
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