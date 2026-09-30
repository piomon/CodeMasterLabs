'use client'

import {useEffect, useRef, useState} from 'react'
import type {ProjectProps} from '../../project-data'
import './atelier.css'

type Copy = {pl:string;en:string}
type Project = {id:string;title:Copy;category:'residential'|'interior'|'cultural';location:Copy;description:Copy;images:string[]}
const photo=(name:string)=>`/images/showcase/atelier-${name}`
const projects:Project[]=[
 {id:'01',title:{pl:'Dom między drzewami',en:'House among trees'},category:'residential',location:{pl:'Studium / dom prywatny',en:'Study / private house'},description:{pl:'Dziedziniec, który zbiera światło. Kamień, woda i cień tworzą spokojny rytm codzienności.',en:'A courtyard that gathers light. Stone, water and shadow give everyday life a quieter rhythm.'},images:[photo('courtyard.jpg'),photo('interior.jpg'),photo('detail.webp')]},
 {id:'02',title:{pl:'Cisza wnętrza',en:'The quiet interior'},category:'interior',location:{pl:'Studium / wnętrze',en:'Study / interior'},description:{pl:'Drewno i mineralna powierzchnia prowadzą wzrok ku krajobrazowi. Przestrzeń pozostawia miejsce na życie.',en:'Timber and mineral surfaces draw the eye toward the landscape. The room leaves space for life.'},images:[photo('interior.jpg'),photo('courtyard.jpg'),photo('detail.webp')]},
 {id:'03',title:{pl:'Pawilon nad wodą',en:'Pavilion by the water'},category:'cultural',location:{pl:'Studium / pawilon',en:'Study / pavilion'},description:{pl:'Niewielki gest w szerokim krajobrazie. Ciemna bryła i jedno okno kadrują chwilę zatrzymania.',en:'A small gesture in a wide landscape. A dark volume and one window frame a moment of stillness.'},images:[photo('pavilion.jpg'),photo('interior.jpg'),photo('courtyard.jpg')]},
 {id:'04',title:{pl:'Światło i próg',en:'Light & threshold'},category:'residential',location:{pl:'Studium / architektura',en:'Study / architecture'},description:{pl:'Otwarta i zamknięta przestrzeń spotykają się na granicy cienia. Architektura zaczyna się od odczucia.',en:'Open and enclosed space meet at the edge of a shadow. Architecture begins with a feeling.'},images:[photo('detail.webp'),photo('courtyard.jpg'),photo('pavilion.jpg')]}
]

export function AtelierSite({locale,embedded=false}:ProjectProps){
 const pl=locale==='pl'
 const t=(value:Copy)=>value[locale]
 const [filter,setFilter]=useState<'all'|Project['category']>('all')
 const [active,setActive]=useState<Project|null>(null)
 const [slide,setSlide]=useState(0)
 const [menuOpen,setMenuOpen]=useState(false)
 const dialog=useRef<HTMLDialogElement>(null)
 const visible=projects.filter(item=>filter==='all'||item.category===filter)
 const openProject=(project:Project)=>{setActive(project);setSlide(0);dialog.current?.showModal()}
 const closeProject=()=>dialog.current?.close()
 const step=(delta:number)=>setSlide(current=>active?(current+delta+active.images.length)%active.images.length:0)
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(!dialog.current?.open||!active)return;if(event.key==='ArrowLeft')setSlide(current=>(current-1+active.images.length)%active.images.length);if(event.key==='ArrowRight')setSlide(current=>(current+1)%active.images.length)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[active])
 const closeMenu=()=>setMenuOpen(false)
 return <div className="project-site atelier-site" id="top">
  <header className="at-header at-shell">
   <a className="at-brand" href="#top" onClick={closeMenu}>ATELIER<small>{pl?'PRACOWNIA ARCHITEKTURY':'ARCHITECTURE PRACTICE'}</small></a>
   <button className="at-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="atelier-navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?(pl?'ZAMKNIJ':'CLOSE'):(pl?'MENU':'MENU')}</button>
   <nav id="atelier-navigation" className="at-nav" data-open={menuOpen} aria-label={pl?'Nawigacja główna':'Main navigation'}>
    <a href="#approach" onClick={closeMenu}>{pl?'Podejście':'Approach'}</a><a href="#projects" onClick={closeMenu}>{pl?'Projekty':'Projects'}</a><a href="#process" onClick={closeMenu}>{pl?'Proces':'Process'}</a><a className="at-contact-link" href="#contact" onClick={closeMenu}>{pl?'Porozmawiajmy ↗':'Let’s talk ↗'}</a>
   </nav>
  </header>
  <main>
   <section className="at-hero at-shell" aria-labelledby="at-hero-title">
    <div className="at-hero-top"><h1 id="at-hero-title">Form<br/><span>& feeling.</span></h1><div className="at-hero-note"><span className="at-kicker">01 / {pl?'Architektura odczuwania':'Architecture of feeling'}</span><p>{pl?'Projektujemy miejsca, w których światło, materia i codzienność mówią jednym głosem.':'We imagine places where light, material and everyday life speak with one voice.'}</p></div></div>
    <div className="at-hero-visual"><img src={photo('courtyard.jpg')} alt={pl?'Kamienny dziedziniec z drzewem oliwnym w popołudniowym świetle':'Limestone courtyard and olive tree in afternoon light'} fetchPriority="high"/><div className="at-image-label"><strong>{pl?'Dom między drzewami':'House among trees'}</strong><span>01 — {pl?'STUDIUM ARCHITEKTONICZNE':'ARCHITECTURAL STUDY'}</span></div></div>
   </section>
   <section className="at-intro at-shell" id="approach"><span className="at-kicker">02 / {pl?'Nasza perspektywa':'Our perspective'}</span><div><h2>{pl?<>Nie wypełniamy przestrzeni. <em>Pozwalamy jej oddychać.</em></>:<>We don’t fill space. <em>We let it breathe.</em></>}</h2><p>{pl?'Interesuje nas to, co zostaje po pierwszym wrażeniu: ciężar materiału pod dłonią, cień przesuwający się po ścianie, widok, do którego się wraca. Każde studium zaczyna się od uważnego patrzenia.':'What interests us is what remains after the first impression: the weight of a material beneath your hand, a shadow moving across a wall, a view you return to. Every study begins with close observation.'}</p></div></section>
   <section className="at-shell" id="projects" aria-labelledby="at-project-heading"><div className="at-rule at-section-head"><h2 id="at-project-heading">{pl?'Wybrane studia':'Selected studies'}<span style={{color:'var(--at-accent)'}}>.</span></h2><p>{pl?'Zbiór wizualnych idei o przestrzeni, relacji i świetle. Otwórz projekt, by zobaczyć galerię.':'A collection of visual ideas about space, connection and light. Open a study to explore its gallery.'}</p></div>
    <div className="at-filters" aria-label={pl?'Filtruj projekty':'Filter projects'}>{(['all','residential','interior','cultural'] as const).map(key=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>setFilter(key)}>{({all:pl?'Wszystkie':'All',residential:pl?'Domy':'Homes',interior:pl?'Wnętrza':'Interiors',cultural:pl?'Pawilony':'Pavilions'})[key]}</button>)}</div>
    <div className="at-project-grid">{visible.map(project=><article className="at-project-card" key={project.id}><button type="button" onClick={()=>openProject(project)} aria-label={`${pl?'Otwórz projekt':'Open study'}: ${t(project.title)}`}><div className="at-project-image"><img src={project.images[0]} alt={t(project.title)} loading="lazy"/><span aria-hidden="true">↗</span></div><div className="at-project-meta"><h3>{t(project.title)}</h3><span>{project.id}<br/>{t(project.location)}</span></div></button></article>)}</div>
   </section>
   <section className="at-material"><div className="at-shell at-material-grid"><div className="at-material-copy"><span className="at-number">03 / {pl?'Materia':'Material'}</span><h2>{pl?'Materia pamięta światło.':'Material remembers light.'}</h2><p>{pl?'Nie wybieramy faktur z katalogu. Interesuje nas, jak kamień nabiera patyny, jak drewno pracuje z porami roku i jak prosta powierzchnia ożywa o konkretnej godzinie.':'We don’t choose textures from a catalogue. We are drawn to the way stone takes on a patina, timber responds to the seasons, and a simple surface comes alive at a particular hour.'}</p></div><div className="at-material-image"><img src={photo('interior.jpg')} alt={pl?'Wnętrze z drewnianymi schodami i światłem wpadającym przez okno':'Timber interior with daylight entering through a tall window'} loading="lazy"/></div></div></section>
   <section className="at-process at-shell" id="process"><div className="at-process-head"><h2>{pl?<>Od spojrzenia<br/>do miejsca.</>:<>From seeing<br/>to being.</>}</h2><p>{pl?'Dobry projekt nie zaczyna się od odpowiedzi. Zaczyna się od pytań o miejsce, rytm dnia i ludzi, którzy będą w nim żyć.':'A good project does not begin with an answer. It starts with questions about the site, the rhythm of a day, and the people who will live there.'}</p></div><div className="at-process-list">
    <article><span>01 / {pl?'OBSERWACJA':'OBSERVATION'}</span><h3>{pl?'Słuchamy miejsca':'Listen to the place'}</h3><p>{pl?'Światło, kontekst i codzienne rytuały budują pierwszy szkic.':'Light, context and daily rituals make the first sketch.'}</p></article>
    <article><span>02 / {pl?'REDUKCJA':'REDUCTION'}</span><h3>{pl?'Szukamy istoty':'Find the essence'}</h3><p>{pl?'Odejmujemy to, co zbędne, aż proporcje zaczynają mówić same.':'We take away the unnecessary until proportion speaks for itself.'}</p></article>
    <article><span>03 / {pl?'DOŚWIADCZENIE':'EXPERIENCE'}</span><h3>{pl?'Myślimy o życiu':'Make room for life'}</h3><p>{pl?'Projekt nabiera sensu dopiero wtedy, gdy ktoś może poczuć się w nim u siebie.':'A space comes into its own when someone can feel at home in it.'}</p></article>
   </div></section>
   <section className="at-statement"><div className="at-shell"><span className="at-kicker">04 / {pl?'Jedna myśl':'One thought'}</span><p>{pl?'Najważniejsza część przestrzeni to to, co się w niej wydarzy.':'The most important part of a space is what happens within it.'}</p></div></section>
  </main>
  <footer className="at-footer at-shell" id="contact"><span className="at-kicker">05 / {pl?'Następny rozdział':'The next chapter'}</span><h2>{pl?'Zacznijmy od rozmowy.':'Let’s begin with a conversation.'}</h2><a className="at-mail" href={pl?'/#contact':'/en#contact'} target={embedded?'_top':undefined}>{pl?'Poznaj studio CodeMaster ↗':'Meet CodeMaster studio ↗'}</a><div className="at-footer-bottom"><span>ATELIER — {pl?'AUTORSKIE STUDIUM CYFROWE':'AN AUTHORED DIGITAL STUDY'}</span><a href="#top">{pl?'WRÓĆ NA GÓRĘ ↑':'BACK TO TOP ↑'}</a></div></footer>
  <dialog ref={dialog} className="at-dialog" onClose={()=>setActive(null)} aria-label={active?t(active.title):undefined}>
   {active&&<><div className="at-dialog-top"><span className="at-kicker">{active.id} / {t(active.location)}</span><button type="button" onClick={closeProject} aria-label={pl?'Zamknij galerię':'Close gallery'}>×</button></div><div className="at-dialog-image"><img src={active.images[slide]} alt={`${t(active.title)} — ${pl?'zdjęcie':'image'} ${slide+1}`} /><div className="at-gallery-controls"><button type="button" onClick={()=>step(-1)} aria-label={pl?'Poprzednie zdjęcie':'Previous image'}>←</button><button type="button" onClick={()=>step(1)} aria-label={pl?'Następne zdjęcie':'Next image'}>→</button></div></div><div className="at-dialog-copy"><div><span className="at-kicker">{pl?'STUDIUM PRZESTRZENI':'SPATIAL STUDY'}</span><h2>{t(active.title)}</h2><span className="at-gallery-count">{String(slide+1).padStart(2,'0')} / {String(active.images.length).padStart(2,'0')}</span></div><p>{t(active.description)}</p></div></>}
  </dialog>
 </div>
}