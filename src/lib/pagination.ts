export type Pagination = { page: number; totalPages: number; totalDocs: number }
export function pageNumber(value: unknown): number {
  if (typeof value !== 'number' && typeof value !== 'string') return 1
  if (typeof value === 'string' && !/^[1-9]\d{0,5}$/.test(value)) return 1
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, 100000) : 1
}
export function pagedPath(base: string, page: number): string {
  const current = pageNumber(page)
  return current === 1 ? base : `${base}?page=${current}`
}
