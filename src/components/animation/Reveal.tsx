'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { useMotion } from './MotionProvider'
export function Reveal({children, className = ''}: {children: ReactNode; className?: string}) {
 const ref = useRef<HTMLDivElement>(null)
 const {enabled} = useMotion()
 useEffect(() => {
  const el = ref.current; if (!el || !enabled) { if (el) el.dataset.reveal = 'ready'; return }
  if (el.getBoundingClientRect().top < innerHeight) return
  el.dataset.reveal = 'pending'
  const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.dataset.reveal = 'ready'; io.disconnect() } }, {rootMargin:'0px 0px -30px 0px'})
  io.observe(el); return () => { io.disconnect(); el.dataset.reveal = 'ready' }
 }, [enabled])
 return <div ref={ref} className={className}>{children}</div>
}
