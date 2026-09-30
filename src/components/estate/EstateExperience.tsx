'use client'
import {useEffect,useMemo,useRef,useState,type KeyboardEvent} from 'react'
import {useEstateWorkspace} from '@/hooks/useEstateWorkspace'
import type {ApartmentStatus} from '@/lib/estate-state'
import type {Locale} from '@/types/site'
import {FloorPlan} from './FloorPlan'
import {estateCsv} from './estate-csv'
import '../architecture-showcase.css'
import './estate-dialog.css'

type View = 'residences'|'shortlist'|'management'
const statuses:ApartmentStatus[]=['available','reserved','sold']

function formatMoney(n:number,locale:Locale){return new Intl.NumberFormat(locale==='pl'?'pl-PL':'en-US',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(n)}
function formatArea(n:number,locale:Locale){return new Intl.NumberFormat(locale==='pl'?'pl-PL':'en-US',{maximumFractionDigits:2}).format(n)}

export function EstateExperience({locale,embedded=false}:{locale:Locale;embedded?:boolean}){
 const {state,units,loaded,storageError,dispatch,reset}=useEstateWorkspace()
 const [view,setView]=useState<View>('residences')
 const [search,setSearch]=useState('')
 const [rooms,setRooms]=useState('all')
 const [floor,setFloor]=useState('all')
 const [availability,setAvailability]=useState('all')
 const [page,setPage]=useState(1)
 const [selected,setSelected]=useState<string|null>(null)
 const [confirm,setConfirm]=useState<string|null>(null)
 const [askReset,setAskReset]=useState(false)
 const [noteDraft,setNoteDraft]=useState('')
  const dialogRef=useRef<HTMLDialogElement>(null)
 const returnFocus=useRef<HTMLElement|null>(null)
 const pl=locale==='pl'
 const t=(a:string,b:string)=>pl?a:b
 const count=(status:ApartmentStatus)=>units.filter(u=>u.status===status).length
 const filtered=useMemo(()=>units.filter(u=>
  (view!=='shortlist'||u.favorite)&&
  (!search||u.id.toLowerCase().includes(search.trim().toLowerCase()))&&
  (rooms==='all'||u.rooms===Number(rooms))&&
  (floor==='all'||u.floor===Number(floor))&&
  (availability==='all'||u.status===availability)
 ),[units,view,search,rooms,floor,availability])
 const perPage=view==='management'?8:6
 const pages=Math.max(1,Math.ceil(filtered.length/perPage))
 const visible=filtered.slice((Math.min(page,pages)-1)*perPage,Math.min(page,pages)*perPage)
 const selectedUnit=units.find(u=>u.id===selected)
  const selectedNote=selectedUnit?.note
 useEffect(()=>{setPage(1)},[view,search,rooms,floor,availability])
  useEffect(()=>{if(selected!==null)setNoteDraft(selectedNote??'')},[selected,selectedNote])
 const modalOpen=!!selected||!!confirm||askReset
 useEffect(()=>{
  if(!modalOpen)return
   const dialog=dialogRef.current
   if(!dialog)return
   const previous=document.activeElement
   returnFocus.current=previous instanceof HTMLElement?previous:null
   const previousOverflow=document.body.style.overflow
   dialog.showModal()
   document.body.style.overflow='hidden'
   return()=>{
    if(dialog.open)dialog.close()
    document.body.style.overflow=previousOverflow
    if(returnFocus.current?.isConnected)returnFocus.current.focus({preventScroll:true})
   }
  },[modalOpen])
  useEffect(()=>{
   if(modalOpen&&dialogRef.current?.open)dialogRef.current.querySelector<HTMLButtonElement>('.f-dialog-close')?.focus()
  },[selected,confirm,askReset,modalOpen])
 const close=()=>{setSelected(null);setConfirm(null);setAskReset(false)}
  const trapTab=(event:KeyboardEvent<HTMLDialogElement>)=>{
   if(event.key!=='Tab')return
   const dialog=dialogRef.current
   if(!dialog)return
   const nodes=Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]'))
    .filter(node=>node.getClientRects().length>0)
   const first=nodes[0],last=nodes[nodes.length-1]
   if(!first){event.preventDefault();dialog.focus();return}
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){event.preventDefault();first.focus()}
  }
 const openDetail=(id:string)=>setSelected(id)
 const exportCsv=()=>{
   const csv=estateCsv([
   ['ID','Building','Floor','Rooms','Area m2','Price PLN','Balcony m2','Exposure','Status','Shortlisted','Note'],
   ...filtered.map(u=>[u.id,u.building,u.floor,u.rooms,u.area,u.price,u.balcony,u.exposure,u.status,u.favorite?'yes':'no',u.note])
   ])
  const blob=new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='forma-apartments.csv';document.body.appendChild(a);a.click();a.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 const goInventory=()=>{setView('residences');window.setTimeout(()=>{
  const target=document.getElementById(embedded?'forma-inventory-embedded':'forma-inventory')
  const behavior=document.documentElement.dataset.motion==='off'?'instant':'smooth'
  if(embedded){target?.closest('.cm-screen')?.scrollTo({top:target.offsetTop,behavior})}
  else target?.scrollIntoView({behavior,block:'start'})
 },0)}
 const title=t('Mieszkania z przestrzenią na więcej.','A different way to live.')
 const Root=embedded?'div':'main'
 const heroContent=<>
  <span className="f-kicker">{t('REZYDENCJE / BUDYNEK A','RESIDENCES / BUILDING A')}</span>
  {embedded?<h2>{title}</h2>:<h1>{title}</h1>}
  <p>{t('Światło, proporcje i widok, do którego chce się wracać. Poznaj kolekcję apartamentów FORMA.','Light, proportion and a view worth coming home to. Discover the FORMA apartment collection.')}</p>
  <button type="button" onClick={goInventory}>{t('Odkryj apartamenty','Explore apartments')} <span aria-hidden="true">↗</span></button>
 </>
 return <Root className={`forma-app${embedded?' forma-embedded':''}`} aria-label="FORMA" aria-busy={!loaded}>
  <fieldset className="f-ready" disabled={!loaded} aria-label={t('Interaktywna demonstracja mieszkań','Interactive residence demonstration')}>
   <header className="f-topbar">
    <span className="f-logo"><span className="f-logo-mark" aria-hidden="true"/>FORMA</span>
    <div className="f-top-right"><span className="f-project-id">A / 01 — {t('KOLEKCJA MIESZKAŃ','RESIDENCE COLLECTION')}</span>
     <nav className="f-nav" aria-label={t('Widok aplikacji','Application view')}>
      <button type="button" aria-pressed={view==='residences'} onClick={()=>setView('residences')}>{t('Apartamenty','Residences')}</button>
      <button type="button" aria-pressed={view==='shortlist'} onClick={()=>setView('shortlist')}>{t('Wybrane','Saved')} {state.favorites.length>0&&`(${state.favorites.length})`}</button>
      <button type="button" aria-pressed={view==='management'} onClick={()=>setView('management')}>{t('Sprzedaż','Sales')}</button>
     </nav>
    </div>
   </header>
   {storageError&&<div role="alert" style={{padding:'12px 5%',background:'#eee0d5',color:'#623e32',fontSize:12}}>{t('Nie udało się odczytać zapisanego stanu. Możesz przywrócić dane przykładowe.','Saved data could not be loaded. You can restore sample data.')} <button type="button" className="f-text-button" onClick={()=>setAskReset(true)}>{t('Przywróć','Restore')}</button></div>}
   {view==='management'?<div className="f-manager">
    <div className="f-manager-head"><div><span className="f-kicker">{t('FORMA / ZESPÓŁ SPRZEDAŻY','FORMA / SALES OFFICE')}</span>{embedded?<h2>{t('Portfel mieszkań','Residence inventory')}</h2>:<h1>{t('Portfel mieszkań','Residence inventory')}</h1>}</div>
     <div className="f-manager-actions"><button type="button" className="f-text-button" onClick={exportCsv}>{t('Eksport CSV','Export CSV')} ↗</button><button type="button" className="f-text-button" onClick={()=>setAskReset(true)}>{t('Przywróć próbkę','Reset sample')}</button></div>
    </div>
    <div className="f-summary" aria-label={t('Podsumowanie mieszkań','Residence summary')}>
     <div><strong>{units.length}</strong><span>{t('WSZYSTKIE','TOTAL')}</span></div><div><strong>{count('available')}</strong><span>{t('DOSTĘPNE','AVAILABLE')}</span></div><div><strong>{count('reserved')}</strong><span>{t('REZERWACJE','RESERVED')}</span></div><div><strong>{count('sold')}</strong><span>{t('SPRZEDANE','SOLD')}</span></div>
    </div>
    {renderControls()}
    <div className="f-results">{t('WYNIKI','RESULTS')} / {filtered.length} · {t('Zmiany zapisują się w tej przeglądarce','Changes are saved in this browser')}</div>
    {filtered.length?<div className="f-roster-wrap"><table className="f-roster"><thead><tr><th>{t('LOKAL','UNIT')}</th><th>{t('PIĘTRO','FLOOR')}</th><th>{t('POKOJE','ROOMS')}</th><th>{t('POWIERZCHNIA','AREA')}</th><th>{t('CENA','PRICE')}</th><th>{t('STATUS','STATUS')}</th><th>{t('SZCZEGÓŁY','DETAILS')}</th></tr></thead><tbody>{visible.map(u=><tr key={u.id}><td><strong>{u.id}</strong></td><td>{u.floor}</td><td>{u.rooms}</td><td>{formatArea(u.area,locale)} m²</td><td>{formatMoney(u.price,locale)}</td><td><select className="f-select" aria-label={`${u.id}: ${t('status','status')}`} value={u.status} onChange={e=>dispatch({type:'status',id:u.id,status:e.target.value as ApartmentStatus})}>{statuses.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></td><td><button type="button" className="f-text-button" onClick={()=>openDetail(u.id)}>{t('Otwórz','Open')}</button></td></tr>)}</tbody></table></div>:renderEmpty()}
    {renderPagination()}
    <div className="f-history"><h3>{t('Ostatnie zmiany','Recent changes')}</h3>{state.history.length?state.history.slice(0,4).map(event=><p key={event.id}>{event.unitId} · {statusLabel(event.status)} · {new Intl.DateTimeFormat(pl?'pl-PL':'en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date(event.at))}</p>):<p>{t('Zmienione statusy pojawią się tutaj.','Status changes will appear here.')}</p>}</div>
   </div>:<>
    {view==='residences'&&<div className="f-hero"><div className="f-hero-image" role="img" aria-label={t('Ilustracyjne zdjęcie nowoczesnej architektury mieszkalnej o zachodzie słońca','Illustrative image of modern residential architecture at sunset')}/><div className="f-hero-content">{heroContent}</div><div className="f-hero-aside">01 / 12 &nbsp; {t('PIĘTRA','FLOORS')} &nbsp; · &nbsp; {units.length} {t('MIESZKAŃ','RESIDENCES')}</div></div>}
    <div className="f-content" id={embedded?'forma-inventory-embedded':'forma-inventory'}>
      <div className="f-section-heading"><div><span className="f-kicker">{view==='shortlist'?t('TWOJA SELEKCJA','YOUR SELECTION'):t('ZNAJDŹ SWOJĄ PRZESTRZEŃ','FIND YOUR SPACE')}</span>{view==='shortlist'&&!embedded?<h1>{t('Wybrane mieszkania','Saved residences')}</h1>:embedded?<h3>{view==='shortlist'?t('Wybrane mieszkania','Saved residences'):t('Poznaj apartamenty','Explore residences')}</h3>:<h2>{t('Poznaj apartamenty','Explore residences')}</h2>}</div><p>{view==='shortlist'?t('Twoje zapisane mieszkania w jednym miejscu. Selekcja zostaje w tej przeglądarce.','Your saved apartments in one place. This selection stays in your browser.'):t('Porównaj metraże, ekspozycję i piętro. Otwórz kartę mieszkania, by zobaczyć układ i szczegóły.','Compare layouts, light and floor level. Open an apartment to see its plan and details.')}</p></div>
     {renderControls()}
     <div className="f-results">{t('ZNALEZIONO','FOUND')} / {filtered.length} {t('MIESZKAŃ','RESIDENCES')} &nbsp; · &nbsp; {count('available')} {t('DOSTĘPNYCH','AVAILABLE')}</div>
      {filtered.length?<div className="f-grid">{visible.map(u=><article className="f-card" key={u.id}><div className="f-card-visual"><span className="f-card-floor">{t('BUDYNEK','BUILDING')} {u.building} / {t('PIĘTRO','FLOOR')} {String(u.floor).padStart(2,'0')}</span><FloorPlan unit={u} locale={locale}/></div><div className="f-card-body"><div className="f-card-top"><h3>{u.id}</h3><span className="f-status" data-status={u.status}>{statusLabel(u.status)}</span></div><div className="f-card-metrics"><span>{u.rooms} {t('pokoje','rooms')}</span><span>{formatArea(u.area,locale)} m²</span><span>{u.exposure}</span></div><div className="f-card-bottom"><strong>{formatMoney(u.price,locale)}</strong><div className="f-card-actions"><button type="button" className="f-icon-button" aria-label={u.favorite?t(`Usuń ${u.id} z wybranych`,`Remove ${u.id} from saved`):t(`Dodaj ${u.id} do wybranych`,`Save ${u.id}`)} aria-pressed={u.favorite} onClick={()=>dispatch({type:'favorite',id:u.id})}>{u.favorite?'♥':'♡'}</button><button type="button" className="f-small-button" onClick={()=>openDetail(u.id)}>{t('Zobacz','View')}</button></div></div></div></article>)}</div>:renderEmpty()}
     {renderPagination()}
    </div>
    {view==='residences'&&<div className="f-architecture"><img src="/images/forma-architecture.webp" alt={t('Ilustracyjna fotografia szklanej architektury widzianej od dołu','Illustrative photograph looking upward through glass architecture')}/><div className="f-architecture-copy"><span className="f-kicker">{t('ARCHITEKTURA / ŚWIATŁO / RYTM','ARCHITECTURE / LIGHT / RHYTHM')}</span>{embedded?<h3>{t('Miejsce ma znaczenie.','Place changes everything.')}</h3>:<h2>{t('Miejsce ma znaczenie.','Place changes everything.')}</h2>}<p>{t('Przejrzysty proces wyboru. Każdy lokal ma swoją kartę, układ, cenę i aktualny status — wszystko w jednym miejscu.','A clearer way to choose. Every residence has its own plan, price and current status — all in one place.')}</p></div></div>}
   </>}
   <footer className="f-footer"><span>FORMA · {t('DEMONSTRACJA PRODUKTU','PRODUCT DEMONSTRATION')}</span><span>{t('Fotografie ilustracyjne · dane przykładowe','Illustrative photography · sample data')}</span></footer>
    {modalOpen&&<dialog ref={dialogRef} tabIndex={-1} className={`f-dialog${selectedUnit?'':' f-dialog-confirm'}`} role="dialog" aria-modal="true" aria-labelledby={selectedUnit?'f-detail-title':confirm?'f-confirm-title':'f-reset-title'} onKeyDown={trapTab} onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}>
     {selectedUnit&&<><button type="button" className="f-dialog-close" onClick={close} aria-label={t('Zamknij','Close')}>×</button><div className="f-dialog-photo"/><div className="f-dialog-content"><span className="f-kicker">{t('BUDYNEK','BUILDING')} {selectedUnit.building} / {t('PIĘTRO','FLOOR')} {selectedUnit.floor}</span><h2 id="f-detail-title">{t('Apartament','Residence')} {selectedUnit.id}</h2><span className="f-status" data-status={selectedUnit.status}>{statusLabel(selectedUnit.status)}</span><div className="f-detail-layout"><div className="f-plan"><FloorPlan unit={selectedUnit} locale={locale}/></div><div className="f-detail-stats"><div><span>{t('POWIERZCHNIA','AREA')}</span><strong>{formatArea(selectedUnit.area,locale)} m²</strong></div><div><span>{t('POKOJE','ROOMS')}</span><strong>{selectedUnit.rooms}</strong></div><div><span>{t('BALKON','BALCONY')}</span><strong>{formatArea(selectedUnit.balcony,locale)} m²</strong></div><div><span>{t('EKSPOZYCJA','EXPOSURE')}</span><strong>{selectedUnit.exposure}</strong></div><div><span>{t('CENA','PRICE')}</span><strong>{formatMoney(selectedUnit.price,locale)}</strong></div><div><span>{t('PIĘTRO','FLOOR')}</span><strong>{selectedUnit.floor} / 12</strong></div></div></div><p className="f-dialog-sub">{t('Plan poglądowy; nie jest dokumentacją architektoniczną.','Illustrative plan; not architectural documentation.')}</p>{view==='management'&&<label className="f-note">{t('Notatka zespołu sprzedaży','Sales team note')}<textarea maxLength={1000} value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} placeholder={t('Dodaj notatkę do mieszkania…','Add a note about this residence…')}/></label>}<div className="f-dialog-actions"><button type="button" className="f-solid" onClick={()=>dispatch({type:'favorite',id:selectedUnit.id})}>{selectedUnit.favorite?t('Usuń z wybranych','Remove from saved'):t('Dodaj do wybranych','Save residence')}</button>{selectedUnit.status==='available'&&view!=='management'&&<button type="button" className="f-small-button" onClick={()=>{setConfirm(selectedUnit.id);setSelected(null)}}>{t('Zarezerwuj w demo','Reserve in demo')}</button>}{view==='management'&&<><button type="button" className="f-text-button" onClick={()=>{dispatch({type:'note',id:selectedUnit.id,text:noteDraft});setSelected(null)}}>{t('Zapisz notatkę','Save note')}</button><select className="f-select" aria-label={t('Zmień status mieszkania','Change residence status')} value={selectedUnit.status} onChange={e=>dispatch({type:'status',id:selectedUnit.id,status:e.target.value as ApartmentStatus})}>{statuses.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></>}</div></div></>}
     {confirm&&<><button type="button" className="f-dialog-close" onClick={close} aria-label={t('Zamknij','Close')}>×</button><span className="f-kicker">FORMA / {confirm}</span><h2 id="f-confirm-title">{t('Potwierdź rezerwację','Confirm reservation')}</h2><p>{t('To lokalna demonstracja. Potwierdzenie zmieni status mieszkania tylko w tej przeglądarce; nie tworzy rzeczywistej rezerwacji ani nie kontaktuje się z biurem sprzedaży.','This is a local demonstration. Confirming only changes the residence status in this browser; it does not create a real reservation or contact a sales office.')}</p><div className="f-dialog-actions"><button type="button" className="f-solid" onClick={()=>{dispatch({type:'status',id:confirm,status:'reserved'});close()}}>{t('Potwierdź w demo','Confirm in demo')}</button><button type="button" className="f-text-button" onClick={close}>{t('Anuluj','Cancel')}</button></div></>}
     {askReset&&<><button type="button" className="f-dialog-close" onClick={close} aria-label={t('Zamknij','Close')}>×</button><span className="f-kicker">FORMA / RESET</span><h2 id="f-reset-title">{t('Przywrócić dane?','Restore sample data?')}</h2><p>{t('Wszystkie zmiany statusów, notatki i zapisane mieszkania w tej przeglądarce zostaną usunięte.','All status changes, notes and saved residences in this browser will be removed.')}</p><div className="f-dialog-actions"><button type="button" className="f-solid" onClick={()=>{reset();close()}}>{t('Przywróć próbkę','Restore sample')}</button><button type="button" className="f-text-button" onClick={close}>{t('Anuluj','Cancel')}</button></div></>}
    </dialog>}
  </fieldset>
 </Root>

 function statusLabel(s:ApartmentStatus){return s==='available'?t('Dostępne','Available'):s==='reserved'?t('Zarezerwowane','Reserved'):t('Sprzedane','Sold')}
 function renderControls(){return <div className="f-controls"><input className="f-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Szukaj numeru, np. A-12','Search unit, e.g. A-12')} aria-label={t('Szukaj numeru mieszkania','Search residence number')}/><select className="f-select" value={rooms} onChange={e=>setRooms(e.target.value)} aria-label={t('Liczba pokoi','Number of rooms')}><option value="all">{t('Wszystkie pokoje','All rooms')}</option>{[2,3,4].map(n=><option key={n} value={n}>{n} {t('pokoje','rooms')}</option>)}</select><select className="f-select" value={floor} onChange={e=>setFloor(e.target.value)} aria-label={t('Piętro','Floor')}><option value="all">{t('Wszystkie piętra','All floors')}</option>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{t('Piętro','Floor')} {i+1}</option>)}</select><select className="f-select" value={availability} onChange={e=>setAvailability(e.target.value)} aria-label={t('Dostępność','Availability')}><option value="all">{t('Każdy status','All statuses')}</option>{statuses.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></div>}
 function renderEmpty(){return <div className="f-empty"><strong>{view==='shortlist'&&!state.favorites.length?t('Jeszcze nic tu nie ma.','Nothing saved yet.'):t('Brak mieszkań w tym wyborze.','No residences match this selection.')}</strong><p>{t('Zmień filtry lub wróć do pełnej kolekcji.','Adjust your filters or return to the full collection.')}</p><button type="button" className="f-text-button" onClick={()=>{setView('residences');setSearch('');setFloor('all');setRooms('all');setAvailability('all')}}>{t('Pokaż wszystkie','Show all residences')}</button></div>}
 function renderPagination(){return pages>1?<nav className="f-pagination" aria-label={t('Strony wyników','Result pages')}>{Array.from({length:pages},(_,i)=><button type="button" key={i} aria-label={`${t('Strona','Page')} ${i+1}`} aria-current={Math.min(page,pages)===i+1?'page':undefined} onClick={()=>setPage(i+1)}>{i+1}</button>)}</nav>:null}
}