import type { Locale } from '@/types/site'
export type PreviewTarget = { kind: 'home'; locale: Locale } | { kind: 'project' | 'article'; locale: Locale; id: number }
/** Global live-preview URLs from older releases may contain an empty collection and an id. */
export function previewTarget(query: Record<string, unknown>): PreviewTarget | null {
  const locale: Locale = query.locale === 'en' ? 'en' : 'pl'
  if (query.collection === undefined || query.collection === '') return { kind: 'home', locale }
  if (query.collection !== 'projects' && query.collection !== 'blog-posts') return null
  if (typeof query.id !== 'string' || !/^[1-9]\d*$/.test(query.id) || !Number.isSafeInteger(Number(query.id))) return null
  return { kind: query.collection === 'projects' ? 'project' : 'article', locale, id: Number(query.id) }
}
export function previewURL(collection: string | undefined, id: unknown, locale: unknown): string | null {
  const language = locale === 'en' ? 'en' : 'pl'
  if (!collection) return `/preview?locale=${language}`
  if (!previewTarget({ collection, id: String(id), locale: language })) return null
  return `/preview?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(String(id))}&locale=${language}`
}
