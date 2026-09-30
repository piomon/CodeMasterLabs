/** Pure, bounded demo domain. No API calls, payment handling or external AI. */
export type DemoKind = 'operations' | 'approval' | 'commerce' | 'client-portal'
export type TaskStatus = 'planned' | 'active' | 'done'
export type Decision = 'pending' | 'approved' | 'rejected'
export type Task = { id: string; title: string; owner: string; status: TaskStatus }
export type Proposal = { id: string; title: string; context: string; action: string; decision: Decision }
export type Product = { id: string; name: string; price: number; stock: number }
export type Order = { id: string; total: number; quantity: number; status: 'new' | 'shipped' }
export type Note = { id: string; text: string }
export type DemoFile = { id: string; name: string; size: number }
export type DemoState = {
 version: 1; tasks: Task[]; proposals: Proposal[]; products: Product[];
 cart: Record<string, number>; orders: Order[]; notes: Note[]; files: DemoFile[];
 portalApproved: boolean; audit: { id: string; event: string; at: string }[];
}
export type DemoAction =
 | { type: 'task.add'; id: string; title: string }
 | { type: 'task.status'; id: string; status: TaskStatus }
 | { type: 'proposal.decide'; id: string; decision: Exclude<Decision, 'pending'> }
 | { type: 'cart.change'; id: string; delta: number }
 | { type: 'order.create'; id: string }
 | { type: 'order.ship'; id: string }
 | { type: 'stock.add'; id: string }
 | { type: 'note.add'; id: string; text: string }
 | { type: 'file.add'; id: string; name: string; size: number }
 | { type: 'portal.approve' }
 | { type: 'reset'; locale: 'pl' | 'en' }
export const DEMO_VERSION = 1
const safeID = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,79}$/.test(value) && !['__proto__','constructor','prototype','toString','valueOf','hasOwnProperty'].includes(value)
const clean = (s: string, max: number) => (typeof s === 'string' ? s : '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max)
export function initialDemo(locale: 'pl' | 'en' = 'pl'): DemoState {
 const pl = locale === 'pl'
 return {
  version: 1,
  tasks: [
    { id: 't1', title: pl ? 'Przetestować logowanie i uprawnienia zespołu terenowego' : 'Test field-team login and access permissions', owner: 'PM', status: 'active' },
    { id: 't2', title: pl ? 'Rozpisać ścieżkę akceptacji dokumentów zakupowych' : 'Map the purchase-document approval flow', owner: 'AK', status: 'planned' },
    { id: 't3', title: pl ? 'Zaimportować katalog produktów z arkusza dostawcy' : 'Import product catalogue from supplier spreadsheet', owner: 'PM', status: 'done' },
    { id: 't4', title: pl ? 'Sprawdzić synchronizację stanów z magazynem' : 'Verify stock sync with the warehouse', owner: 'MK', status: 'active' },
  ],
  proposals: [
    { id: 'a1', title: pl ? 'Odpowiedź na zapytanie ofertowe' : 'Reply to a sales enquiry', context: pl ? 'WPŁYNĘŁO: zapytanie o portal do akceptacji dokumentów dla rozproszonego zespołu. Nadawca opisuje potrzebę przekazywania plików między opiekunem projektu a klientem oraz śledzenia decyzji. Nie podano terminu uruchomienia, liczby użytkowników ani obecnego sposobu pracy. Bez tych danych nie można rzetelnie wycenić zakresu.' : 'RECEIVED: enquiry about a document-approval portal for a distributed team. The sender needs to exchange files between a project owner and a client and keep a record of decisions. Launch date, user count and the current workflow are missing. A reliable scope or quote is not possible without them.', action: pl ? 'Wyślij do ręcznego zatwierdzenia szkic odpowiedzi: „Dziękujemy za opis potrzeb. Ilu użytkowników będzie korzystać z portalu? Jak dziś przekazujecie pliki i zbieracie akceptacje? Czy macie termin uruchomienia lub wymagania dotyczące dostępu? Po doprecyzowaniu tych kwestii zaproponujemy zakres i kolejny krok.” Żadna wiadomość nie zostanie tutaj wysłana.' : 'Send a draft for human review: “Thanks for outlining the requirement. How many people will use the portal? How are files and approvals handled today? Do you have a launch date or access requirements? Once we understand these points, we can propose a scope and next step.” No message is sent from this demo.', decision: 'pending' },
    { id: 'a2', title: pl ? 'Faktura wymaga weryfikacji' : 'Invoice requires review', context: pl ? 'DOKUMENT: faktura za dostawę wyposażenia biurowego. Wartość na fakturze nie odpowiada zatwierdzonemu zamówieniu. To rozbieżność wymagająca sprawdzenia przez osobę odpowiedzialną za zakupy; na tym etapie nie ma podstaw do potwierdzenia płatności.' : 'DOCUMENT: invoice for office equipment delivery. The invoiced amount does not match the approved purchase order. The discrepancy requires review by the purchasing owner; payment must not be confirmed at this stage.', action: pl ? 'Przekaż fakturę do kolejki weryfikacji zakupów wraz z informacją o rozbieżności i poproś o porównanie pozycji z zamówieniem. Nie inicjuj przelewu ani nie zmieniaj statusu faktury na opłaconą.' : 'Route the invoice to the purchasing review queue, flag the discrepancy and ask for a line-item comparison against the purchase order. Do not initiate a transfer or mark the invoice as paid.', decision: 'pending' },
    { id: 'a3', title: pl ? 'Uzupełnienie karty projektu' : 'Update project details', context: pl ? 'NOTATKA ZE SPOTKANIA: podczas przeglądu prototypu zaproponowano przesunięcie kolejnego spotkania. Termin wymaga potwierdzenia przez opiekuna projektu przed wpisaniem go do harmonogramu widocznego dla klienta.' : 'MEETING NOTE: the team proposed moving the next review while discussing the prototype. The project owner needs to confirm the date before it appears in the client-facing schedule.', action: pl ? 'Zapisz proponowaną zmianę jako oczekującą na decyzję opiekuna. Nie aktualizuj jeszcze daty w harmonogramie i nie wysyłaj powiadomień do klienta.' : 'Save the proposed change for the project owner’s decision. Do not update the schedule or notify the client yet.', decision: 'pending' },
  ],
  products: [
   { id: 'p1', name: 'Notebook / Graphite', price: 7900, stock: 18 },
   { id: 'p2', name: 'Desk organizer / Steel', price: 12900, stock: 8 },
   { id: 'p3', name: 'Pen / Aluminium', price: 3900, stock: 24 },
  ], cart: {}, orders: [], notes: [], files: [], portalApproved: false, audit: [],
 }
}
export function cartSummary(state: DemoState) {
 return state.products.reduce((out, p) => {
  const raw = Object.hasOwn(state.cart,p.id) ? state.cart[p.id] : 0
  const quantity = Number.isSafeInteger(raw) ? Math.max(0,Math.min(p.stock,raw)) : 0
  return { quantity: out.quantity + quantity, total: out.total + p.price * quantity }
 }, { quantity: 0, total: 0 })
}
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
 if (!action || typeof action !== 'object') return state
 if ('id' in action && !safeID(action.id)) return state
 switch (action.type) {
  case 'reset': return initialDemo(action.locale)
  case 'task.add': {
   const title = clean(action.title, 120)
   return title.length < 3 || state.tasks.length >= 100 || state.tasks.some(t => t.id === action.id) ? state : { ...state, tasks: [{ id: action.id, title, owner: 'PM', status: 'planned' }, ...state.tasks] }
  }
  case 'task.status': return ['planned','active','done'].includes(action.status) && state.tasks.some(t => t.id === action.id && t.status !== action.status) ? { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, status: action.status } : t) } : state
  case 'proposal.decide': {
   if (!['approved','rejected'].includes(action.decision)) return state
   const item = state.proposals.find(p => p.id === action.id)
   return !item || item.decision !== 'pending' ? state : { ...state, proposals: state.proposals.map(p => p.id === action.id ? { ...p, decision: action.decision } : p) }
  }
  case 'cart.change': {
   const product = state.products.find(p => p.id === action.id)
   if (!product || !Number.isSafeInteger(action.delta)) return state
   const quantity = Math.max(0, Math.min(product.stock, (state.cart[action.id] || 0) + action.delta))
   if (quantity === (state.cart[action.id] || 0)) return state
   return { ...state, cart: { ...state.cart, [action.id]: quantity } }
  }
  case 'order.create': {
   const summary = cartSummary(state)
   if (!summary.quantity || state.orders.length >= 100 || state.orders.some(o => o.id === action.id)) return state
   return { ...state, products: state.products.map(p => ({ ...p, stock: p.stock - (state.cart[p.id] || 0) })), orders: [{ id: action.id, ...summary, status: 'new' }, ...state.orders], cart: {} }
  }
  case 'order.ship': if (!state.orders.some(o=>o.id===action.id&&o.status==='new')) return state; return { ...state, orders: state.orders.map(o => o.id === action.id ? { ...o, status: 'shipped' } : o) }
  case 'stock.add': if (!state.products.some(p => p.id === action.id && p.stock < 999)) return state; return { ...state, products: state.products.map(p => p.id === action.id ? { ...p, stock: Math.min(999, p.stock + 5) } : p) }
  case 'note.add': {
   const text = clean(action.text, 1000)
   return text.length < 3 || state.notes.length >= 100 || state.notes.some(n => n.id === action.id) ? state : { ...state, notes: [{ id: action.id, text }, ...state.notes], portalApproved: false }
  }
  case 'file.add': {
   const name = clean(action.name, 120)
   if (!name || state.files.length >= 100 || !Number.isSafeInteger(action.size) || action.size < 0 || action.size > 5 * 1024 * 1024 || state.files.some(f => f.id === action.id)) return state
   return { ...state, files: [{ id: action.id, name, size: action.size }, ...state.files], portalApproved: false }
  }
  case 'portal.approve': return state.portalApproved ? state : { ...state, portalApproved: true }
  default: return state
 }
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown, max = 1000): value is string => typeof value === 'string' && value.length <= max
const integer = (value: unknown, max: number): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max
const list = (value: unknown, validator: (v: Record<string, unknown>) => boolean): boolean => Array.isArray(value) && value.length <= 100 && value.every(v => record(v) && safeID(v.id) && validator(v)) && new Set(value.map(v => v.id)).size === value.length
/** Treat localStorage as untrusted input. Reject malformed or incompatible snapshots. */
export function parseDemo(raw: string | null): DemoState | null {
 if (!raw || raw.length > 250000) return null
 try {
  const s: unknown = JSON.parse(raw)
  if (!record(s) || s.version !== DEMO_VERSION || typeof s.portalApproved !== 'boolean') return null
  if (!list(s.tasks, t => text(t.title,120) && text(t.owner,30) && ['planned','active','done'].includes(String(t.status)))) return null
  if (!list(s.proposals, p => text(p.title,120) && text(p.context,1000) && text(p.action,1000) && ['pending','approved','rejected'].includes(String(p.decision)))) return null
  if (!list(s.products, p => text(p.name,120) && integer(p.price,10000000) && integer(p.stock,999))) return null
  if (!list(s.orders, o => integer(o.total,1000000000000) && integer(o.quantity,99900) && ['new','shipped'].includes(String(o.status)))) return null
  if (!list(s.notes, n => text(n.text,1000)) || !list(s.files, f => text(f.name,120) && integer(f.size,5242880))) return null
  if (!list(s.audit, a => text(a.event,100) && text(a.at,40)) || !record(s.cart) || Object.keys(s.cart).length > 100) return null
  const products = s.products as Product[]
  for (const [id, quantity] of Object.entries(s.cart)) {
   const product = products.find(p => p.id === id)
   if (!product || !integer(quantity,product.stock)) return null
  }
  return s as unknown as DemoState
 } catch { return null }
}
