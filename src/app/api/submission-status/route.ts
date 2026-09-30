import { getCMS } from '@/lib/site-data'
import { actorKey, originAllowed, verifyToken } from '@/lib/form-security'
import { TOKEN_RECOVERY_MAX_AGE } from '@/lib/submission-policy'
import { claimRateSlot } from '@/lib/rate-limit'
import { BodyError, readBody } from '@/lib/http-body'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
function reply(data: object, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...(status === 429 ? { 'Retry-After': '900' } : {}) } })
}
/** The signed, high-entropy token is a receipt capability. Never return the saved message. */
export async function POST(req: Request) {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) return reply({ code: 'UNAVAILABLE' }, 503)
  if (!originAllowed(req.headers, process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')) return reply({ code: 'ORIGIN' }, 403)
  const checked = verifyToken(req.headers.get('x-form-token') || '', secret, Date.now(), TOKEN_RECOVERY_MAX_AGE)
  if (!checked.ok) return reply({ code: 'TOKEN_INVALID' }, 403)
  if (!/^application\/json(?:;|$)/i.test(req.headers.get('content-type') || '')) return reply({ code: 'FORMAT' }, 415)
  try {
    let body: unknown
    try { body = JSON.parse((await readBody(req, 256)).toString('utf8')) }
    catch (error) { if (error instanceof BodyError) throw error; return reply({ code: 'FORMAT' }, 400) }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1) return reply({ code: 'VALIDATION' }, 422)
    const kind = (body as { kind?: unknown }).kind
    if (kind !== 'contact' && kind !== 'review') return reply({ code: 'VALIDATION' }, 422)
    const cms = await getCMS()
    if (!await claimRateSlot(cms, actorKey(req.headers, secret), 'receipt', 40)) return reply({ code: 'RATE_LIMIT' }, 429)
    const collection = kind === 'contact' ? 'leads' as const : 'testimonials' as const
    const result = await cms.find({ collection, where: { submissionKey: { equals: checked.key } }, overrideAccess: true, depth: 0, limit: 1, ...(kind === 'review' ? { draft: true } : {}) })
    const doc = result.docs[0]
    return reply(doc ? { state: 'saved', reference: String(doc.id) } : { state: 'missing' })
  } catch (error) {
    if (error instanceof BodyError) return reply({ code: error.code }, error.status)
    return reply({ code: 'UNAVAILABLE' }, 503)
  }
}
