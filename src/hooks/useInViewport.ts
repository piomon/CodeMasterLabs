'use client'
import { useEffect, useRef, useState } from 'react'
export function useInViewport<T extends HTMLElement>(threshold = 0.15) {
 const ref = useRef<T>(null)
 const [visible, setVisible] = useState(false)
 useEffect(() => {
  const el = ref.current; if (!el) return
  const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold })
  observer.observe(el); return () => observer.disconnect()
 }, [threshold])
 return { ref, visible }
}
