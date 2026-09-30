'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { APARTMENTS, estateReducer, initialEstate, parseEstate } from '@/lib/estate-state'
import type { EstateAction, EstateState } from '@/lib/estate-state'

const KEY = 'codemaster:estate:v1'

export function useEstateWorkspace() {
 const [state, setState] = useState<EstateState>(initialEstate)
 const [loaded, setLoaded] = useState(false)
 const [storageError, setStorageError] = useState<string | null>(null)

 useEffect(() => {
  try {
   const raw = localStorage.getItem(KEY)
   const saved = parseEstate(raw)
   if (raw !== null && saved === null) setStorageError('Saved estate data is invalid. Reset the workspace to replace it.')
   else {
    if (saved) setState(saved)
    setStorageError(null)
   }
  } catch {
   setStorageError('Browser storage is unavailable. Changes cannot be saved.')
  }
  setLoaded(true)
 }, [])

 useEffect(() => {
  // Loading and saving are separate effects so the initial state cannot overwrite
  // an existing snapshot during hydration (including React Strict Mode replays).
  if (!loaded || storageError) return
  try {
   localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
   setStorageError('Browser storage is unavailable. Changes cannot be saved.')
  }
 }, [loaded, state, storageError])

 const dispatch = useCallback((action: EstateAction) => {
  if (!loaded) return
  const stamped = action.type === 'status'
   ? { ...action, at: new Date().toISOString(), eventId: globalThis.crypto?.randomUUID?.() ?? `event-${Date.now()}-${Math.random().toString(36).slice(2)}` }
   : action
  setState(previous => estateReducer(previous, stamped))
  if (action.type === 'reset') setStorageError(null)
 }, [loaded])
 const reset = useCallback(() => dispatch({ type: 'reset' }), [dispatch])
 const units = useMemo(() => APARTMENTS.map(unit => ({
  ...unit,
  status: state.statuses[unit.id],
  favorite: state.favorites.includes(unit.id),
  note: state.notes[unit.id] ?? '',
 })), [state])
 return { state, units, loaded, storageError, dispatch, reset }
}