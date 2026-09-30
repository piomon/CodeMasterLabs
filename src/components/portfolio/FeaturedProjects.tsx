import Link from 'next/link'
import { pagePath, pick } from '@/lib/i18n'
import type { Project, HomepageContent, Locale } from '@/types/site'
/** Published CMS content supplements, but never masquerades as, the fixed demo brands. */
export function FeaturedProjects({ projects, home, locale }: { projects: Project[]; home: HomepageContent; locale: Locale }) {
  if (!projects.length) return null
  return <div className="showcase-cms" aria-labelledby="featured-projects-title">
    <p className="eyebrow">{home.projectsKicker}</p>
    <h3 id="featured-projects-title">{home.projectsTitle}</h3>
    <p>{home.projectsDescription}</p>
    <ul>{projects.map(project => <li key={project.id}>
      <Link href={pagePath(locale, 'projects', project.slug)}>{project.title} <span aria-hidden="true">&#8599;</span></Link>
      <small>{project.concept ? pick(locale, 'Koncepcja', 'Concept') : pick(locale, 'Projekt klienta', 'Client project')} / {project.category}</small>
    </li>)}</ul>
    <Link href={pagePath(locale, 'projects')}>{pick(locale, 'Wszystkie opisy projekt\u00f3w', 'All project studies')}</Link>
  </div>
}
