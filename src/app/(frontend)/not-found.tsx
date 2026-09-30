import Link from 'next/link'
import {headers} from 'next/headers'

export default async function NotFound(){
 const en=(await headers()).get('x-cm-locale')==='en'
 return <main id="main" className="inner-page state-page"><div className="container state-layout"><div><p className="eyebrow">CODEMASTER / NOT FOUND</p><span className="state-index" aria-hidden="true">404</span></div><div><h1>{en?'This page is unavailable.':'Ta strona nie jest dostępna.'}</h1><p>{en?'The address may have changed or the content has not been published yet. Start again or explore our services.':'Adres mógł się zmienić albo treść nie została jeszcze opublikowana. Wróć do punktu wyjścia lub sprawdź nasze usługi.'}</p><div className="state-actions"><Link href={en?'/en':'/'} className="button button-primary">{en?'Home':'Strona główna'} <span aria-hidden="true">↗</span></Link><Link href={en?'/en/services':'/uslugi'} className="button button-secondary">{en?'Explore services':'Zobacz usługi'} <span aria-hidden="true">↗</span></Link></div></div></div></main>
}