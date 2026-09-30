'use client'

import {useRef, useState} from 'react'
import type {ProjectProps} from '../../project-data'
import './ember.css'
import {isCivilDate,localDate,formatCivilDate} from '@/lib/civil-date'

type Copy = {pl:string;en:string}
type Dish = {id:string;category:'small'|'fire'|'sides'|'sweet';name:Copy;description:Copy;detail:Copy;price:number}
const dishes:Dish[] = [
 {id:'bread',category:'small',name:{pl:'Chleb z paleniska',en:'Hearth bread'},description:{pl:'Masło z palonym sianem, sól morska',en:'Burnt-hay butter, sea salt'},detail:{pl:'Ciepły chleb z własnego zakwasu, wypiekany tuż przy ogniu. Podawany z ubitym masłem infuzowanym aromatem siana.',en:'Warm house-sourdough baked beside the fire. Served with whipped butter infused with the scent of toasted hay.'},price:24},
 {id:'beet',category:'small',name:{pl:'Burak / wiśnia',en:'Beetroot / sour cherry'},description:{pl:'Wędzony burak, kwaśna wiśnia, kozi ser',en:'Smoked beetroot, sour cherry, goat cheese'},detail:{pl:'Buraki pieczone przez noc w żarze. Kwaśna wiśnia i świeży kozi ser przełamują ich słodycz.',en:'Beets roasted overnight in the embers. Tart cherries and fresh goat cheese cut through their sweetness.'},price:42},
 {id:'trout',category:'small',name:{pl:'Pstrąg z jeziora',en:'Lake trout'},description:{pl:'Marynowany pstrąg, ogórek, koper',en:'Cured trout, cucumber, dill'},detail:{pl:'Delikatnie marynowany pstrąg z lokalnej hodowli, chłodny ogórek i olej koperkowy.',en:'Gently cured local trout with cool cucumber and dill oil.'},price:48},
 {id:'carrots',category:'fire',name:{pl:'Marchew w popiele',en:'Ash-roasted carrots'},description:{pl:'Młoda marchew, maślanka, pestki dyni',en:'Young carrots, cultured buttermilk, pumpkin seeds'},detail:{pl:'Młoda marchew opalana bezpośrednio w popiele, na kremie z maślanki z chrupiącymi pestkami.',en:'Young carrots scorched directly in ash, set on cultured buttermilk with crisp pumpkin seeds.'},price:58},
 {id:'duck',category:'fire',name:{pl:'Kaczka / śliwka',en:'Duck / plum'},description:{pl:'Pierś z kaczki, śliwka, czarny czosnek',en:'Duck breast, plum, black garlic'},detail:{pl:'Kaczka powoli dopiekana nad żarem. Sos z jesiennych śliwek i fermentowany czarny czosnek.',en:'Duck slowly finished over glowing coals. Autumn plum sauce and fermented black garlic.'},price:94},
 {id:'rib',category:'fire',name:{pl:'Żebro z rusztu',en:'Ember-grilled short rib'},description:{pl:'Wołowina 12h, cebula, chrzan',en:'12-hour beef, onion, horseradish'},detail:{pl:'Żebro gotowane powoli przez 12 godzin i wykańczane na ruszcie. Karmelizowana cebula i świeżo tarty chrzan.',en:'Short rib cooked slowly for 12 hours and finished on the grill. Caramelized onion and freshly grated horseradish.'},price:118},
 {id:'potato',category:'sides',name:{pl:'Ziemniaki / rozmaryn',en:'Potatoes / rosemary'},description:{pl:'Chrupiące ziemniaki, rozmaryn, sól',en:'Crisp potatoes, rosemary, salt'},detail:{pl:'Małe ziemniaki wypiekane w żarze, z rozmarynem i grubą solą.',en:'Small potatoes roasted in the embers with rosemary and coarse salt.'},price:28},
 {id:'greens',category:'sides',name:{pl:'Zielenina sezonu',en:'Seasonal greens'},description:{pl:'Liście, winegret z ognia, zioła',en:'Leaves, fire-warmed vinaigrette, herbs'},detail:{pl:'To, co najlepsze z porannego targu. Prosty winegret podgrzewany nad ogniem.',en:'The best of the morning market. A simple vinaigrette warmed over the fire.'},price:29},
 {id:'pear',category:'sweet',name:{pl:'Gruszka z żaru',en:'Ember-baked pear'},description:{pl:'Gruszka, miód gryczany, śmietanka',en:'Pear, buckwheat honey, cream'},detail:{pl:'Gruszka mięknąca powoli przy ogniu, z miodem gryczanym i lekko kwaśną śmietanką.',en:'Pear slowly softened by the fire with buckwheat honey and lightly soured cream.'},price:38},
 {id:'chocolate',category:'sweet',name:{pl:'Czekolada / sól',en:'Chocolate / sea salt'},description:{pl:'Ciemna czekolada, oliwa, sól morska',en:'Dark chocolate, olive oil, sea salt'},detail:{pl:'Intensywny mus z ciemnej czekolady, oliwa z pierwszego tłoczenia i płatki soli.',en:'Intense dark chocolate mousse, first-press olive oil and flakes of sea salt.'},price:39},
]
const categories = [
 {id:'all',pl:'Całe menu',en:'Full menu'},
 {id:'small',pl:'Na początek',en:'To begin'},
 {id:'fire',pl:'Z ognia',en:'From the fire'},
 {id:'sides',pl:'Dodatki',en:'On the side'},
 {id:'sweet',pl:'Na koniec',en:'To finish'},
] as const
type Category = typeof categories[number]['id']

export function EmberSite({locale}:ProjectProps){
 const pl=locale==='pl'
 const t=(copy:Copy)=>copy[locale]
 const [category,setCategory]=useState<Category>('all')
 const [selected,setSelected]=useState<Dish|null>(null)
 const [mobileOpen,setMobileOpen]=useState(false)
 const dialog=useRef<HTMLDialogElement>(null)
 const [date,setDate]=useState('')
 const [time,setTime]=useState('')
 const [party,setParty]=useState('2')
 const [error,setError]=useState('')
 const [plan,setPlan]=useState<{date:string;time:string;party:number}|null>(null)
 const today=localDate()
 const sunday=date&&new Date(`${date}T12:00:00`).getDay()===0
 const availableTimes=sunday?['13:00','14:00','15:00','16:00','17:00','18:00']:['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30']
 const openDish=(dish:Dish)=>{setSelected(dish);dialog.current?.showModal()}
 const makePlan=(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();setError('');setPlan(null)
  if(!isCivilDate(date)||date<localDate()){setError(pl?'Wybierz dzisiejszą lub późniejszą datę.':'Choose today or a later date.');return}
  const day=new Date(`${date}T12:00:00`).getDay()
  if(day===1||day===2){setError(pl?'W poniedziałki i wtorki odpoczywamy. Wybierz inny dzień.':'We rest on Mondays and Tuesdays. Choose another day.');return}
  if(!time||!availableTimes.includes(time)){setError(pl?'Wybierz dostępną godzinę wizyty.':'Choose an available visit time.');return}
  if(date===localDate()&&new Date(`${date}T${time}:00`).getTime()<=Date.now()){setError(pl?'Wybrana godzina już minęła. Wybierz późniejszą.':'That time has passed. Choose a later one.');return}
  const count=Number(party)
  if(!Number.isInteger(count)||count<1||count>8){setError(pl?'Wybierz od 1 do 8 osób.':'Choose between 1 and 8 guests.');return}
  setPlan({date,time,party:count})
 }
 const closeNav=()=>setMobileOpen(false)
 return <div className="project-site ember-site" lang={locale}>
  <header className="em-header">
   <a className="em-logo" href="#top" onClick={closeNav} aria-label="EMBER home">EMB<span>E</span>R</a>
   <button className="em-menu-toggle" type="button" aria-expanded={mobileOpen} aria-controls="em-navigation" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?(pl?'Zamknij':'Close'):(pl?'Menu':'Menu')} {mobileOpen?'×':'+'}</button>
   <nav id="em-navigation" className={`em-nav ${mobileOpen?'is-open':''}`} aria-label={pl?'Nawigacja główna':'Main navigation'}>
    <a href="#story" onClick={closeNav}>{pl?'O nas':'Our story'}</a><a href="#menu" onClick={closeNav}>{pl?'Menu':'Menu'}</a><a href="#hours" onClick={closeNav}>{pl?'Godziny':'Hours'}</a><a className="em-nav-cta" href="#visit" onClick={closeNav}>{pl?'Zaplanuj wizytę':'Plan a visit'} ↗</a>
   </nav>
  </header>
  <main id="top">
   <section className="em-hero" aria-labelledby="em-title"><div className="em-hero-content">
    <p className="em-overline">{pl?'Kuchnia sezonowa / żywy ogień':'Seasonal kitchen / living fire'}</p>
    <h1 id="em-title">{pl?<>Tam, gdzie<br/><i>płonie</i> smak.</>:<>Where flavor<br/><i>catches fire.</i></>}</h1>
    <div className="em-hero-bottom"><p>{pl?'Dobry ogień. Dobry stół. I czas, który warto dzielić.':'Good fire. A generous table. Time worth sharing.'}</p><a href="#menu">{pl?'Odkryj menu':'Explore the menu'} ↓</a></div>
   </div></section>
   <div className="em-marquee" aria-label={pl?'Sezonowa kuchnia z ognia':'Seasonal fire-led cooking'}>EMBER &nbsp; / &nbsp; {pl?'SEZON • OGIEŃ • WSPÓLNY STÓŁ':'SEASON • FIRE • THE SHARED TABLE'} &nbsp; / &nbsp; EMBER</div>
   <section className="em-section em-intro" id="story"><div><p className="em-kicker">01 / {pl?'Nasza filozofia':'Our philosophy'}</p><h2>{pl?<>Prawdziwe jedzenie.<br/><i>Bez pośpiechu.</i></>:<>Real food.<br/><i>No hurry.</i></>}</h2><p>{pl?'Wierzymy, że najlepsze rzeczy dzieją się przy stole. Zaczynamy od składników, które przynosi sezon. Kończymy tam, gdzie prowadzi ogień. Reszta to rozmowa, wino i jeszcze jeden kawałek chleba.':'We believe the best things happen around a table. We begin with what the season brings and follow where the fire leads. The rest is conversation, wine and one more piece of bread.'}</p></div><div className="em-intro-art"><img src="/images/showcase/ember-food.jpg" alt={pl?'Pieczona nad ogniem sezonowa potrawa na ceramicznym talerzu':'Fire-roasted seasonal dish on a ceramic plate'} loading="lazy"/></div></section>
   <section className="em-section em-menu" id="menu" aria-labelledby="em-menu-title"><div className="em-menu-top"><div><p className="em-kicker">02 / {pl?'Na stole':'At the table'}</p><h2 id="em-menu-title">{pl?'Menu sezonu':'The seasonal menu'}</h2></div><p>{pl?'Krótka karta, żywe składniki. Zmieniamy ją, kiedy zmienia się to, co najlepsze na targu.':'A short menu, living ingredients. It changes whenever the best of the market does.'}</p></div>
    <div className="em-tabs" role="group" aria-label={pl?'Filtruj menu':'Filter menu'}>{categories.map(item=><button key={item.id} type="button" aria-pressed={category===item.id} onClick={()=>setCategory(item.id)}>{item[locale]}</button>)}</div>
    <div className="em-menu-list">{dishes.filter(d=>category==='all'||d.category===category).map(dish=><button className="em-dish" key={dish.id} type="button" onClick={()=>openDish(dish)} aria-label={`${t(dish.name)}, ${dish.price} zł — ${pl?'szczegóły':'details'}`}><span><span className="em-dish-name">{t(dish.name)} ↗</span><span className="em-dish-desc">{t(dish.description)}</span></span><span className="em-dish-price">{dish.price} zł</span></button>)}</div>
    <div className="em-menu-foot"><span>{pl?'Zapytaj zespół o alergeny i dostępność dań.':'Ask our team about allergens and availability.'}</span><span>{pl?'Karta demonstracyjna • ceny ilustracyjne':'Demonstration menu • illustrative prices'}</span></div>
   </section>
   <section className="em-section em-story"><div className="em-story-image"><img src="/images/showcase/ember-hero.webp" alt={pl?'Płomienie i kuchnia opalana drewnem':'Flames and a wood-fired kitchen'} loading="lazy"/></div><div><p className="em-kicker">03 / {pl?'Ogień jest początkiem':'It begins with fire'}</p><h2>{pl?<>Żar nadaje<br/><i>charakter.</i></>:<>The embers<br/><i>have a voice.</i></>}</h2><p>{pl?'Nie chodzi o efekt. Chodzi o cierpliwość: powolne pieczenie, dym, który nie dominuje, i ciepło, które zbiera ludzi razem. Nasza kuchnia jest otwarta, bo nie mamy nic do ukrycia.':'It is not about spectacle. It is about patience: slow roasting, smoke that never overwhelms, and warmth that brings people together. Our kitchen is open because there is nothing to hide.'}</p><div className="em-rule"/><p className="em-signature">{pl?'Zawsze jest miejsce przy stole.':'There is always room at the table.'}</p></div></section>
   <section className="em-quote" aria-label={pl?'Nasze motto':'Our motto'}><p>{pl?'Przyjdź głodny. Zostań trochę dłużej.':'Come hungry. Stay a little longer.'}</p></section>
   <section className="em-section em-visit" id="visit"><div className="em-visit-copy"><p className="em-kicker">04 / {pl?'Wpadnij do nas':'Join us'}</p><h2>{pl?<>Miejsce<br/><i>przy stole.</i></>:<>A place<br/><i>at the table.</i></>}</h2><p>{pl?'Ułóż plan wieczoru. To lokalna notatka do Twojej wizyty, nie potwierdzenie rezerwacji — żeby zarezerwować stolik, skontaktuj się bezpośrednio z restauracją.':'Sketch out your evening. This is a local visit note, not a confirmed reservation — contact the restaurant directly to secure a table.'}</p><div className="em-hours" id="hours"><div><span>{pl?'Poniedziałek – wtorek':'Monday – Tuesday'}</span><strong>{pl?'Zamknięte':'Closed'}</strong></div><div><span>{pl?'Środa – czwartek':'Wednesday – Thursday'}</span><strong>17:00 – 22:00</strong></div><div><span>{pl?'Piątek – sobota':'Friday – Saturday'}</span><strong>17:00 – 23:00</strong></div><div><span>{pl?'Niedziela':'Sunday'}</span><strong>13:00 – 20:00</strong></div></div></div>
    <form className="em-form" onSubmit={makePlan} noValidate><h3>{pl?'Zaplanuj wieczór':'Plan your evening'}</h3><p>{pl?'Wybierz chwilę dla siebie i swoich bliskich.':'Choose a moment for you and your people.'}</p><div className="em-fields"><div className="em-field"><label htmlFor="em-date">{pl?'Data':'Date'}</label><input id="em-date" type="date" min={today} value={date} onChange={e=>{setDate(e.target.value);setTime('');setPlan(null)}} required/></div><div className="em-field"><label htmlFor="em-time">{pl?'Godzina':'Time'}</label><select id="em-time" value={time} onChange={e=>{setTime(e.target.value);setPlan(null)}} required><option value="">{pl?'Wybierz godzinę':'Choose a time'}</option>{availableTimes.map(hour=><option key={hour} value={hour}>{hour}</option>)}</select></div><div className="em-field"><label htmlFor="em-party">{pl?'Liczba osób':'Guests'}</label><select id="em-party" value={party} onChange={e=>{setParty(e.target.value);setPlan(null)}}>{Array.from({length:8},(_,i)=>i+1).map(n=><option value={n} key={n}>{n} {pl?(n===1?'osoba':n<5?'osoby':'osób'):(n===1?'guest':'guests')}</option>)}</select></div></div><button className="em-button" type="submit">{pl?'Utwórz plan wizyty':'Create visit plan'} ↗</button>{error&&<p className="em-error" role="alert">{error}</p>}{plan&&<div className="em-confirm" role="status"><strong>{pl?'Twój wieczór w EMBER':'Your evening at EMBER'}</strong><span>{formatCivilDate(plan.date,locale)} · {plan.time} · {plan.party} {pl?'os.':plan.party===1?'guest':'guests'}</span><br/><span>{pl?'Plan zapisany na tej stronie. To nie jest rezerwacja stolika.':'Planned here only. This is not a table reservation.'}</span><br/><button type="button" onClick={()=>{setPlan(null);setDate('');setTime('')}}>{pl?'Zaplanuj od nowa':'Start again'}</button></div>}</form>
   </section>
  </main>
  <footer className="em-footer"><div className="em-footer-brand">EMBER</div><div className="em-footer-right"><div><strong>{pl?'Odkryj':'Explore'}</strong><a href="#story">{pl?'Nasza historia':'Our story'}</a><br/><a href="#menu">Menu</a><br/><a href="#visit">{pl?'Wizyta':'Visit'}</a></div><div><strong>{pl?'Godziny':'Hours'}</strong><span>{pl?'Śr – sob':'Wed – Sat'} / 17:00<br/>{pl?'Niedz':'Sunday'} / 13:00<br/>{pl?'Pon – wt: zamknięte':'Mon – Tue: closed'}</span></div></div><div className="em-footer-bottom"><span>© EMBER / {pl?'Projekt pokazowy':'Showcase concept'}</span><a href="#top">{pl?'Wróć na górę':'Back to top'} ↑</a></div></footer>
  <dialog className="em-modal" ref={dialog} aria-label={selected?t(selected.name):undefined} onClick={e=>{if(e.target===dialog.current)dialog.current?.close()}}><button className="em-modal-close" type="button" onClick={()=>dialog.current?.close()} aria-label={pl?'Zamknij szczegóły':'Close details'}>×</button>{selected&&<><p className="em-kicker">{pl?'Z naszego menu':'From our menu'}</p><h3>{t(selected.name)}</h3><p>{t(selected.detail)}</p><p className="em-modal-price">{selected.price} zł</p></>}</dialog>
 </div>
}