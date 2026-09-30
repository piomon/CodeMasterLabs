'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){
 const en=usePathname().startsWith('/en')
 return <main id="main" className="inner-page state-page"><div className="container state-layout"><div><p className="eyebrow">CODEMASTER / ERROR</p><span className="state-index" aria-hidden="true">!</span></div><div><h1>{en?'We couldn’t open this page.':'Nie udało się otworzyć strony.'}</h1><p>{en?'Something interrupted loading. Try again — and if it persists, get in touch with us.':'Coś przerwało ładowanie. Spróbuj ponownie — jeśli problem się powtórzy, możesz napisać do nas bezpośrednio.'}</p><div className="state-actions"><button type="button" className="button button-primary" onClick={reset}>{en?'Try again':'Spróbuj ponownie'} <span aria-hidden="true">↗</span></button><Link className="button button-secondary" href={en?'/en/contact':'/kontakt'}>{en?'Contact us':'Przejdź do kontaktu'} <span aria-hidden="true">↗</span></Link></div></div></div></main>
}