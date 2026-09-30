import Link from 'next/link'
import { pagedPath, type Pagination } from '@/lib/pagination'
import { pick } from '@/lib/i18n'
import type { Locale } from '@/types/site'
export function ContentPagination({ value, base, locale }: { value?: Pagination; base: string; locale: Locale }) {
  if (!value || value.totalPages <= 1) return null
  return <nav className="content-pagination" aria-label={pick(locale, 'Strony tre\u015bci', 'Content pages')}>
    {value.page > 1 ? <Link rel="prev" href={pagedPath(base, value.page - 1)}>{pick(locale, 'Poprzednia', 'Previous')}</Link> : <span/>}
    <span>{value.page} / {value.totalPages}</span>
    {value.page < value.totalPages ? <Link rel="next" href={pagedPath(base, value.page + 1)}>{pick(locale, 'Nast\u0119pna', 'Next')}</Link> : <span/>}
  </nav>
}
