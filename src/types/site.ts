export type Locale = 'pl' | 'en'
export type ID = string | number
export type Media = { id: ID; url?: string | null; alt?: string | null; width?: number; height?: number }
export type VisualStyle = 'dashboard' | 'mobile' | 'ai' | 'web'
export type Service = { id: ID; title: string; description: string; shortLabel: string; visualStyle: VisualStyle; outcome?: string; order: number }
export type Project = {
 id: ID; slug: string; title: string; category: string; summary: string; result?: string;
 visualStyle: VisualStyle; featured: boolean; concept: boolean; order: number;
 client?: string; image?: Media | ID | null; sections?: { heading: string; body: string }[];
 technologies?: { name: string }[]; seo?: { title?: string; description?: string };
 updatedAt?: string;
}
export type Testimonial = { id: ID; quote: string; name: string; role?: string; company?: string }
export type Stage = { title: string; description: string }
export type Message = { side: 'client' | 'me'; text: string; stage: number }
export type Settings = {
 brandName: string; brandSuffix: string; founderName: string; founderRole: string;
 email: string; phone?: string; privacyInfo?: {legalName?:string;legalAddress?:string;retentionDescription?:string;hostingProvider?:string;privacyReviewed?:boolean}; founderPhoto?: Media | ID | null; announcement: string;
 heroEyebrow: string; heroTitle: string; heroLead: string; primaryCTA: string; secondaryCTA: string;
 trustHeadline: string; trustCopy: string; aboutCopy: string;
 seoTitle: string; seoDescription: string; seoImage?: Media | ID | null;
}
export type HomepageContent = {
 servicesKicker: string; servicesTitle: string; servicesDescription: string;
 projectsKicker: string; projectsTitle: string; projectsDescription: string;
 processKicker: string; processTitle: string; processDescription: string;
 aboutKicker: string; contactKicker: string; contactTitle: string; contactDescription: string;
 trustItems: { text: string; description?: string }[];
 stages: Stage[]; conversation: Message[];
}
export type NavLink = { label: string; href: string }
export type NavigationContent = { links: NavLink[]; cta: string }
export type FooterContent = { statement: string; footnote: string; links: NavLink[] }
export type Article = { id: ID; slug: string; title: string; excerpt: string; publishedAt: string;
 author: string; cover?: Media | ID | null; sections: { heading: string; body: string }[];
 tags?: { name: string }[]; relatedPosts?: (Article | ID)[]; seo?: { title?: string; description?: string } }
export type FAQ = { id: ID; question: string; answer: string }
export type SiteData = { settings: Settings; home: HomepageContent; nav: NavigationContent;
 footer: FooterContent; services: Service[]; projects: Project[]; testimonials: Testimonial[]; faqs: FAQ[]; articles: Article[] }
