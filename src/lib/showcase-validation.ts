import { calendarDays, isCivilDate } from './civil-date'
export type Suite = 'garden' | 'terrace'
export const SUITE_RATES: Record<Suite, number> = { garden: 185, terrace: 245 }
export type StayPlan = { arrival: string; departure: string; guests: number; suite: Suite; nights: number; rate: number; total: number }
export type JourneyPlan = { journeyId: string; date: string; travelers: number; total: number }
export type JourneyPrice = { id: string; price: number }
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
function parse(raw: string | null): unknown {
  if (!raw || raw.length > 4096) return null
  try { return JSON.parse(raw) } catch { return null }
}
/** Stored totals are never authoritative: derive all amounts from validated selections. */
export function parseStayPlan(raw: string | null): StayPlan | null {
  const input = parse(raw)
  if (!record(input) || !isCivilDate(input.arrival) || !isCivilDate(input.departure)) return null
  if (input.suite !== 'garden' && input.suite !== 'terrace') return null
  const guests = input.guests, nights = calendarDays(input.arrival, input.departure)
  if (typeof guests !== 'number' || !Number.isInteger(guests) || guests < 1 || guests > (input.suite === 'garden' ? 2 : 4)) return null
  if (!Number.isInteger(nights) || nights < 1 || nights > 21) return null
  const rate = SUITE_RATES[input.suite]
  return { arrival: input.arrival, departure: input.departure, suite: input.suite, guests, nights, rate, total: rate * nights }
}
export function parseJourneyPlan(raw: string | null, catalog: readonly JourneyPrice[]): JourneyPlan | null {
  const input = parse(raw)
  if (!record(input) || !isCivilDate(input.date) || typeof input.journeyId !== 'string') return null
  const journey = catalog.find(item => item.id === input.journeyId), count = input.travelers
  if (!journey || !Number.isSafeInteger(journey.price) || journey.price < 0 || typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 8) return null
  const total = journey.price * count
  if (!Number.isSafeInteger(total)) return null
  return { journeyId: journey.id, date: input.date, travelers: count, total }
}
