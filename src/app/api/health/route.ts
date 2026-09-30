import { NextResponse } from 'next/server'
import { getCMS } from '@/lib/site-data'

export const dynamic = 'force-dynamic'
/** Liveness/readiness probe: never expose database errors, table counts or secrets. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store, max-age=0' }
  try {
    const cms = await getCMS()
    await cms.count({ collection: 'services', overrideAccess: true })
    return NextResponse.json({ status: 'ok' }, { headers })
  } catch {
    console.error('[health] Database readiness check failed.')
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers })
  }
}
