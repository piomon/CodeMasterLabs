'use client'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {useStaticDevices} from '@/hooks/useStaticDevices'
const MotionContext = createContext({ enabled: false, paused: false, reduced: true, toggle: () => {} })
export function MotionProvider({children}: {children: ReactNode}) {
 const prefersReduced = useReducedMotion()
 const staticDevices = useStaticDevices()
 const reduced = prefersReduced || staticDevices
 const [paused, setPaused] = useState(false)
 const enabled = !reduced && !paused
 useEffect(() => { document.documentElement.dataset.motion = enabled ? 'on' : 'off' }, [enabled])
 const value = useMemo(() => ({ enabled, paused, reduced, toggle: () => setPaused(p => !p) }), [enabled, paused, reduced])
 return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
export const useMotion = () => useContext(MotionContext)
