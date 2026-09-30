import type {Locale} from '@/types/site'

export type ProjectId = 'atelier'|'maison'|'velo'|'nora'|'ember'|'aura'
export type ProjectProps = {locale:Locale;embedded?:boolean}
export type ShowcaseProject = {
 id:ProjectId
 name:string
 sector:{pl:string;en:string}
 description:{pl:string;en:string}
 accent:string
}

export const SHOWCASE_PROJECTS:readonly ShowcaseProject[] = [
 {id:'atelier',name:'ATELIER',sector:{pl:'Architektura',en:'Architecture'},description:{pl:'Przestrzeń, proporcje i materiały. Portfolio pracowni z pełnoekranową galerią projektów.',en:'Space, proportion and materials. An architecture practice with an immersive project gallery.'},accent:'#d9cfba'},
 {id:'maison',name:'MAISON',sector:{pl:'Hotel butikowy',en:'Boutique hospitality'},description:{pl:'Spokojny świat gościnności. Apartamenty, doświadczenia i interaktywny planer pobytu.',en:'A considered world of hospitality. Suites, experiences and an interactive stay planner.'},accent:'#bb9573'},
 {id:'velo',name:'VÉLO',sector:{pl:'Sport i design',en:'Sport & design'},description:{pl:'Energia na dwóch kołach. Kolekcja rowerów, wybór konfiguracji i zapis własnego zestawu.',en:'Energy on two wheels. A bicycle collection, configuration choices and a saved personal setup.'},accent:'#d9ff43'},
 {id:'nora',name:'NŌRA',sector:{pl:'Pielęgnacja',en:'Botanical skincare'},description:{pl:'Botaniczna identyfikacja i świadoma pielęgnacja. Odkrywanie produktów oraz dobór rytuału.',en:'Botanical identity and considered skincare. Product discovery and a personal routine builder.'},accent:'#d0dbb1'},
 {id:'ember',name:'EMBER',sector:{pl:'Restauracja',en:'Dining'},description:{pl:'Ogień, sezon i wspólny stół. Autorskie menu, opowieść o kuchni i planer wizyty.',en:'Fire, season and a shared table. A considered menu, a kitchen story and a visit planner.'},accent:'#e9a17d'},
 {id:'aura',name:'AURA',sector:{pl:'Podróże',en:'Travel & adventure'},description:{pl:'Mniej pośpiechu, więcej świata. Odkrywanie kierunków i szczegółowe plany podróży.',en:'Less hurry, more world. Destination discovery and detailed travel itineraries.'},accent:'#a5cddd'},
] as const

export function getShowcaseProject(id:string){return SHOWCASE_PROJECTS.find(project=>project.id===id)}
export function projectUrl(id:ProjectId,locale:Locale,embedded=false){
 return `/showcase/${locale}/${id}${embedded?'?embed=1':''}`
}

export function projectSource(project:ShowcaseProject,locale:Locale){
 return `// ${project.name} · ${project.sector[locale]}
// src/components/portfolio/project-data.ts
import type { Locale } from '@/types/site'

export const project = {
  id: '${project.id}',
  name: '${project.name}',
  accent: '${project.accent}',
}

export function projectUrl(locale: Locale) {
  return \`/showcase/\${locale}/\${project.id}\`
}

// ${locale==='pl'?'Ten sam projekt. Dwa prawdziwe widoki.':'One project. Two real responsive views.'}
const desktop = { width: 1440, height: 900 }
const mobile  = { width: 390, height: 844 }

// Next.js · React · TypeScript
// ${locale==='pl'?'Interakcje i treści dostępne w pełnej prezentacji.':'Explore every interaction in the full experience.'}`
}