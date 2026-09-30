import { setChallengeSiteKey, challengeToken } from './turnstile-client'
import { ReliableSubmission, RequestNotSentError, type SubmissionReceipt, type SubmissionReply } from './reliable-submission'
import type { ReviewInput } from './review-validation'
export type ContactResponse = SubmissionReply
export async function requestContactToken(signal?: AbortSignal): Promise<string> {
  const response = await fetch('/api/contact-token', { credentials: 'same-origin', cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error('CONTACT_UNAVAILABLE')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !('token' in data) || typeof data.token !== 'string' || !/^\d{13}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(data.token)) throw new Error('CONTACT_UNAVAILABLE')
  setChallengeSiteKey('siteKey' in data ? data.siteKey : undefined)
  return data.token
}
async function readReply(response: Response): Promise<SubmissionReply> {
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('CONTACT_UNAVAILABLE')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !('ok' in data) || typeof data.ok !== 'boolean') throw new Error('CONTACT_UNAVAILABLE')
  return { ...(data as SubmissionReply), ok: response.ok && data.ok, status: response.status }
}
async function proof(action: 'contact' | 'review') {
  try { return await challengeToken(action) } catch { throw new RequestNotSentError() }
}
export async function submitContact(data: FormData, token: string): Promise<ContactResponse> {
  data.set('cf-turnstile-response', await proof('contact'))
  return readReply(await fetch('/api/contact', { method: 'POST', body: data, credentials: 'same-origin', signal: AbortSignal.timeout(60000), headers: { 'X-Form-Token': token } }))
}
async function recover(kind: 'contact' | 'review', token: string): Promise<SubmissionReceipt> {
  const response = await fetch('/api/submission-status', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json', 'X-Form-Token': token }, body: JSON.stringify({ kind }) })
  if (!response.ok) throw new Error('RECEIPT_UNAVAILABLE')
  const data = await response.json() as Partial<SubmissionReceipt>
  if (data?.state === 'saved' && 'reference' in data && typeof data.reference === 'string' && /^[1-9]\d*$/.test(data.reference)) return { state: 'saved', reference: data.reference }
  if (data?.state === 'missing') return { state: 'missing' }
  throw new Error('RECEIPT_UNAVAILABLE')
}
export function createContactSubmission() {
  return new ReliableSubmission<FormData>({ token: requestContactToken, send: submitContact, recover: token => recover('contact', token), clone: value => { const copy = new FormData(); for (const [key, item] of value.entries()) copy.append(key, item); return copy } })
}
export function createReviewSubmission() {
  return new ReliableSubmission<ReviewInput & { website: string }>({ token: requestContactToken, recover: token => recover('review', token), clone: value => ({ ...value }), send: async (value, token) => {
    const challengeToken = await proof('review')
    return readReply(await fetch('/api/reviews', { method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(60000), headers: { 'Content-Type': 'application/json', 'X-Form-Token': token }, body: JSON.stringify({ ...value, challengeToken }) }))
  } })
}
