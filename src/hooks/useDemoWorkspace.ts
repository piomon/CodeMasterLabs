 'use client'
import { useEffect, useState } from 'react'
import { demoReducer, initialDemo, parseDemo } from '@/lib/demo-state'
import type { DemoAction, DemoKind, DemoState } from '@/lib/demo-state'
import type { Locale } from '@/types/site'
import { trackEvent } from '@/lib/analytics'

export function useDemoWorkspace(kind: DemoKind, locale: Locale) {
 const [state, setState] = useState<DemoState>(() => initialDemo(locale))
 const [storage, setStorage] = useState<'loading' | 'saved' | 'memory' | 'invalid'>('loading')
 const key = `codemaster:demo:${kind}:${locale}:v1`
 const [loadedKey, setLoadedKey] = useState<string | null>(null)
 useEffect(() => {
  let next = initialDemo(locale)
  try {
   const raw = localStorage.getItem(key), parsed = parseDemo(raw)
   if (raw !== null && parsed === null) setStorage('invalid')
   else { next = parsed || next; setStorage('saved') }
  }
  catch { setStorage('memory') }
  setLoadedKey(key)
  setState(next)
 }, [key, locale])
 useEffect(() => {
  if (loadedKey !== key || storage === 'loading' || storage === 'invalid' || storage === 'memory') return
  try { localStorage.setItem(key, JSON.stringify(state)) }
  catch { setStorage('memory') }
 }, [state, key, storage, loadedKey])
 function dispatch(action: DemoAction) {
  if (loadedKey !== key || storage === 'loading') return
  if (action.type === 'reset') setStorage('saved')
  const at = new Date().toISOString(), id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  setState(previous => {
   const next = demoReducer(previous,action)
   if (next === previous || action.type === 'reset') return next
   return { ...next, audit: [{ id, event: action.type, at }, ...previous.audit].slice(0,100) }
  })
  trackEvent('demo_interaction', { area: kind, action: action.type })
 }
 return { state, dispatch, storage }
}
