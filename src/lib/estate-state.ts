/** Independent, deterministic browser-only property-development demo domain. */
export type ApartmentStatus = 'available' | 'reserved' | 'sold'
export type Apartment = {
 id: string
 building: string
 floor: number
 rooms: number
 area: number // m²
 price: number // PLN
 balcony: number // m²
 exposure: string
 initialStatus: ApartmentStatus
}

const exposures = ['E', 'S', 'W', 'N', 'SE', 'SW', 'NE', 'NW']
export const APARTMENTS: Apartment[] = Array.from({ length: 12 }, (_, floor) =>
 Array.from({ length: 4 }, (_, position) => {
  const number = floor * 4 + position + 1
  const rooms = [2, 3, 2, 4][position]
  const area = Math.round(([42.37, 63.84, 49.16, 78.93][position] + floor * 0.17 + (floor % 3) * 0.11) * 100) / 100
  return {
   id: `A-${String(number).padStart(2, '0')}`,
   building: 'A',
   floor: floor + 1,
   rooms,
   area,
   price: Math.round(area * (11637 + floor * 213 + position * 97) + 3721),
   balcony: Math.round(([5.23, 8.47, 6.18, 10.35][position] + (floor % 4) * 0.13) * 100) / 100,
   exposure: exposures[(floor + position * 2) % exposures.length],
   initialStatus: (floor < 2 && position < 2 ? 'sold' : (floor + position * 3) % 9 === 0 ? 'reserved' : 'available') as ApartmentStatus,
  }
 })).flat()

export type EstateState = {
 version: 1
 statuses: Record<string, ApartmentStatus>
 favorites: string[]
 notes: Record<string, string>
 history: { id: string; unitId: string; status: ApartmentStatus; at: string }[]
}
export type EstateAction =
 | { type: 'status'; id: string; status: ApartmentStatus; at?: string; eventId?: string }
 | { type: 'favorite'; id: string }
 | { type: 'note'; id: string; text: string }
 | { type: 'reset' }

const unitIds = new Set(APARTMENTS.map(unit => unit.id))
const isStatus = (value: unknown): value is ApartmentStatus =>
 value === 'available' || value === 'reserved' || value === 'sold'
const isRecord = (value: unknown): value is Record<string, unknown> =>
 value !== null && typeof value === 'object' && !Array.isArray(value)
const isTimestamp = (value: unknown): value is string =>
 typeof value === 'string' && value.length <= 40 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
 !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value

export function initialEstate(): EstateState {
 return {
  version: 1,
  statuses: Object.fromEntries(APARTMENTS.map(unit => [unit.id, unit.initialStatus])),
  favorites: [],
  notes: {},
  history: [],
 }
}

/** Pure reducer: event timestamps and IDs, when supplied, come from the caller. */
export function estateReducer(state: EstateState, action: EstateAction): EstateState {
 if (!action || typeof action !== 'object') return state
 if (action.type === 'reset') return initialEstate()
 if (!('id' in action) || !unitIds.has(action.id)) return state
 switch (action.type) {
  case 'status': {
   if (!isStatus(action.status) || state.statuses[action.id] === action.status) return state
   if ((action.at !== undefined || action.eventId !== undefined) &&
    (!isTimestamp(action.at) || typeof action.eventId !== 'string' || !/^[\w-]{1,80}$/.test(action.eventId) ||
     state.history.some(event => event.id === action.eventId))) return state
   const event = action.at && action.eventId
    ? [{ id: action.eventId, unitId: action.id, status: action.status, at: action.at }]
    : []
   return { ...state, statuses: { ...state.statuses, [action.id]: action.status }, history: [...event, ...state.history].slice(0, 100) }
  }
  case 'favorite':
   return { ...state, favorites: state.favorites.includes(action.id)
    ? state.favorites.filter(id => id !== action.id)
    : [...state.favorites, action.id] }
  case 'note': {
   if (typeof action.text !== 'string' || action.text.length > 1000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(action.text)) return state
   if (state.notes[action.id] === action.text) return state
   const notes = { ...state.notes }
   if (action.text === '') delete notes[action.id]
   else notes[action.id] = action.text
   return { ...state, notes }
  }
  default: return state
 }
}

/** Reject invalid snapshots rather than coercing untrusted localStorage values. */
export function parseEstate(raw: string | null): EstateState | null {
 if (!raw || raw.length > 120000) return null
 try {
  const value: unknown = JSON.parse(raw)
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.statuses) ||
   !isRecord(value.notes) || !Array.isArray(value.favorites) || !Array.isArray(value.history)) return null
  if (Object.keys(value.statuses).length !== APARTMENTS.length ||
   Object.entries(value.statuses).some(([id, status]) => !unitIds.has(id) || !isStatus(status))) return null
  if (value.favorites.length > APARTMENTS.length ||
   value.favorites.some(id => typeof id !== 'string' || !unitIds.has(id)) ||
   new Set(value.favorites).size !== value.favorites.length) return null
  if (Object.keys(value.notes).length > APARTMENTS.length ||
   Object.entries(value.notes).some(([id, text]) =>
    !unitIds.has(id) || typeof text !== 'string' || !text.length || text.length > 1000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))) return null
  if (value.history.length > 100 || value.history.some(event =>
   !isRecord(event) || typeof event.id !== 'string' || !/^[\w-]{1,80}$/.test(event.id) ||
   !unitIds.has(event.unitId as string) || !isStatus(event.status) || !isTimestamp(event.at)) ||
   new Set(value.history.map(event => event.id)).size !== value.history.length) return null
  return value as EstateState
 } catch { return null }
}