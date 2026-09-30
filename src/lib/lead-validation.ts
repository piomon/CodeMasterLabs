export const TOPICS = ['system','web','automation','website','commerce','modernization','unknown'] as const
export type Topic = typeof TOPICS[number]
export type LeadInput = { name:string; email:string; company:string; phone:string; topic:Topic; message:string; timeline:string; budget:string; nda:boolean; privacyAccepted:true; source:'contact'|'chat'; locale:'pl'|'en' }
export type ValidationResult = {ok:true; data:LeadInput} | {ok:false; errors:Record<string,string>}
export const LEAD_LIMITS = { name:100, email:254, company:160, phone:32, message:5000, timeline:160, budget:100 } as const
export type LeadTextField = keyof typeof LEAD_LIMITS
/** The chat step and final API use exactly the same validation rules. */
export function validateLeadField(field: LeadTextField, value: unknown, locale: 'pl'|'en' = 'pl'): string | undefined {
  const en = locale === 'en', text = typeof value === 'string' ? value.trim() : ''
  const minimum = field === 'name' ? 2 : field === 'message' ? 20 : field === 'email' ? 1 : 0
  if (text.length < minimum) return en ? `Use at least ${minimum} characters.` : `Wpisz co najmniej ${minimum} znak\u00f3w.`
  if (text.length > LEAD_LIMITS[field]) return en ? `Use at most ${LEAD_LIMITS[field]} characters.` : `Maksymalnie ${LEAD_LIMITS[field]} znak\u00f3w.`
  const controls = field === 'message' ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/
  if (controls.test(text)) return en ? 'Invalid characters.' : 'Niedozwolone znaki.'
  if (field === 'email' && (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(text) || text.includes('..') || text.endsWith('.'))) return en ? 'Enter a valid email address.' : 'Podaj poprawny adres e-mail.'
  if (field === 'phone' && text && !/^[+()\d .-]{5,32}$/.test(text)) return en ? 'Check the phone number.' : 'Sprawd\u017a numer telefonu.'
  return undefined
}
export function validateLead(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok:false, errors:{form:'Invalid request.'} }
  const value = input as Record<string, unknown>, errors: Record<string,string> = {}, locale = value.locale === 'en' ? 'en' : 'pl'
  const texts = {} as Record<LeadTextField,string>
  for (const field of Object.keys(LEAD_LIMITS) as LeadTextField[]) {
    texts[field] = typeof value[field] === 'string' ? value[field].trim() : ''
    const error = validateLeadField(field, value[field], locale)
    if (error) errors[field] = error
  }
  if (!(TOPICS as readonly unknown[]).includes(value.topic)) errors.topic = locale === 'en' ? 'Choose a topic.' : 'Wybierz temat.'
  const accepted = value.privacyAccepted === true || value.privacyAccepted === 'true' || value.privacyAccepted === 'on'
  if (!accepted) errors.privacyAccepted = locale === 'en' ? 'Please read the privacy information.' : 'Zapoznaj si\u0119 z informacj\u0105 o prywatno\u015bci.'
  if (value.locale !== undefined && value.locale !== 'pl' && value.locale !== 'en') errors.locale = 'Invalid locale.'
  if (value.source !== undefined && value.source !== 'contact' && value.source !== 'chat') errors.source = 'Invalid source.'
  if (Object.keys(errors).length) return {ok:false, errors}
  return {ok:true, data:{...texts, topic:value.topic as Topic, privacyAccepted:true, nda:value.nda === true || value.nda === 'on' || value.nda === 'true', source:value.source === 'chat' ? 'chat' : 'contact', locale}}
}
export function topicLabels(locale:'pl'|'en'):Record<Topic,string> {
  return locale === 'en' ? {system:'Business system',web:'Web application',automation:'Automation / AI',website:'Premium website',commerce:'E-commerce',modernization:'Existing product',unknown:'Let\u2019s explore the options'} : {system:'System dla firmy',web:'Aplikacja webowa',automation:'Automatyzacja / AI',website:'Strona premium',commerce:'E-commerce',modernization:'Istniej\u0105cy produkt',unknown:'Jeszcze nie wiem'}
}
