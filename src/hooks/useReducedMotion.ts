'use client'
import { useSyncExternalStore } from 'react'
const query = '(prefers-reduced-motion: reduce)'
const subscribe = (callback: () => void) => { const m = window.matchMedia(query); m.addEventListener('change', callback); return () => m.removeEventListener('change', callback) }
export function useReducedMotion() { return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true) }
