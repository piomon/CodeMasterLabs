'use client'
// CODEMASTER_PREMIUM_MOTION_20261001
import {useEffect,useMemo,useRef,useState} from 'react'
import {Button} from './common/Button'
import {useMotion} from './animation/MotionProvider'
import {useReducedMotion} from '@/hooks/useReducedMotion'
import {pagePath,pick} from '@/lib/i18n'
import type {Locale,Settings,Message,HomepageContent} from '@/types/site'
import './conversation-phone.css'

type StoryMessage={
 side:'client'|'me'
 text:string
}

type Story={
 title:string
 messages:StoryMessage[]
}

function nextStory(current:number,total:number){
 if(total<2)return 0
 return (current+1+Math.floor(Math.random()*(total-1)))%total
}

function buildStories(locale:Locale,conversation?:Message[]):Story[]{
 const pl=locale==='pl'

 const curated:Story[]=pl?[
  {
   title:'Od pomysłu do aplikacji',
   messages:[
    {
     side:'client',
     text:'Mamy pomysł na aplikację dla klientów, ale nie mamy jeszcze specyfikacji ani gotowego projektu.'
    },
    {
     side:'me',
     text:'To wystarczy na start. Najpierw rozpiszemy proces, użytkowników i najważniejsze funkcje, a dopiero potem dobierzemy technologię.'
    },
    {
     side:'client',
     text:'Czy możemy zobaczyć coś działającego wcześniej, zamiast czekać do końca całego projektu?'
    },
    {
     side:'me',
     text:'Tak. Pracujemy etapami — dostajecie działające wersje, testujecie je i na bieżąco decydujemy, co dopracować w kolejnej iteracji.'
    },
    {
     side:'client',
     text:'Zależy nam też, żeby system dało się później rozwijać bez budowania wszystkiego od początku.'
    },
    {
     side:'me',
     text:'Dlatego od początku projektujemy architekturę pod dalszy rozwój, integracje i nowe moduły. Kod, dokumentacja i wdrożenie pozostają uporządkowane.'
    },
   ]
  },
  {
   title:'Nowa strona marki',
   messages:[
    {
     side:'client',
     text:'Nasza obecna strona wygląda dobrze na komputerze, ale na telefonie jest niewygodna i klienci gubią najważniejsze informacje.'
    },
    {
     side:'me',
     text:'Zaczniemy od wersji mobilnej, hierarchii treści i ścieżki kontaktu. Projekt wizualny podporządkujemy temu, żeby oferta była zrozumiała od pierwszych sekund.'
    },
    {
     side:'client',
     text:'Chcemy też samodzielnie zmieniać realizacje, teksty i zdjęcia bez proszenia programisty o każdą poprawkę.'
    },
    {
     side:'me',
     text:'Dodamy wygodny CMS. Zespół będzie mógł aktualizować treści, a elementy wymagające spójności pozostaną zabezpieczone strukturą systemu.'
    },
    {
     side:'client',
     text:'A szybkość i pozycjonowanie? Nie chcemy ciężkiej strony, która dobrze wygląda tylko na prezentacji.'
    },
    {
     side:'me',
     text:'Wydajność, SEO techniczne i dostępność traktujemy jako część wdrożenia, nie dodatek. Efekt ma działać równie dobrze, jak wygląda.'
    },
   ]
  },
  {
   title:'Mniej ręcznej pracy',
   messages:[
    {
     side:'client',
     text:'Przepisujemy zamówienia z maili do arkusza, potem ktoś ręcznie sprawdza statusy i wysyła kolejne wiadomości.'
    },
    {
     side:'me',
     text:'Rozpiszmy cały przepływ i zaznaczmy miejsca, które można bezpiecznie zautomatyzować bez utraty kontroli nad wyjątkami.'
    },
    {
     side:'client',
     text:'Najbardziej boimy się sytuacji, w której automat źle zinterpretuje dane i zrobi coś bez wiedzy pracownika.'
    },
    {
     side:'me',
     text:'System nie musi zgadywać. Niepewne przypadki może oznaczać do ręcznej weryfikacji, a powtarzalne kroki wykonywać automatycznie i zapisywać historię operacji.'
    },
    {
     side:'client',
     text:'Czy później można dołączyć magazyn, faktury albo zewnętrzne API przewoźnika?'
    },
    {
     side:'me',
     text:'Tak. Integracje planujemy modułowo, więc kolejne źródła danych można dodawać bez przebudowywania całego rozwiązania.'
    },
   ]
  },
  {
   title:'Portal dla klientów',
   messages:[
    {
     side:'client',
     text:'Klienci pytają nas ciągle o status realizacji. Chcielibyśmy dać im jedno miejsce z dokumentami, terminami i historią zmian.'
    },
    {
     side:'me',
     text:'Możemy przygotować bezpieczny portal klienta z rolami, dostępem do konkretnych projektów i powiadomieniami tylko o ważnych zmianach.'
    },
    {
     side:'client',
     text:'Część danych jest poufna. Każdy klient musi widzieć wyłącznie swoje sprawy i pliki.'
    },
    {
     side:'me',
     text:'Uprawnienia projektujemy na poziomie danych i API, nie tylko interfejsu. Przed wdrożeniem testujemy scenariusze dostępu dla każdej roli.'
    },
    {
     side:'client',
     text:'Brzmi dobrze. Czy nasz zespół dostanie też prosty panel do obsługi tych klientów?'
    },
    {
     side:'me',
     text:'Tak — panel administracyjny, wyszukiwarkę, historię operacji i dokładnie te narzędzia, których potrzebujecie w codziennej pracy.'
    },
   ]
  },
 ]:[
  {
   title:'Idea to application',
   messages:[
    {
     side:'client',
     text:'We have an idea for a customer application, but no finished specification or interface yet.'
    },
    {
     side:'me',
     text:'That is enough to start. We map the process, users and highest-value functions first, then choose the technology around the real requirements.'
    },
    {
     side:'client',
     text:'Can we see something working before the whole project is finished?'
    },
    {
     side:'me',
     text:'Yes. We deliver working iterations, collect feedback and decide together what should be refined in the next release.'
    },
    {
     side:'client',
     text:'We also need the product to grow later without rebuilding everything from scratch.'
    },
    {
     side:'me',
     text:'That is why architecture, integrations and future modules are considered from the beginning, with organised code, documentation and deployment.'
    },
   ]
  },
  {
   title:'A new brand website',
   messages:[
    {
     side:'client',
     text:'Our current website looks fine on desktop, but it is awkward on phones and customers miss the most important information.'
    },
    {
     side:'me',
     text:'We will start with the mobile journey, content hierarchy and contact path, then build the visual layer around clarity and conversion.'
    },
    {
     side:'client',
     text:'We also want to update projects, copy and images ourselves without asking a developer every time.'
    },
    {
     side:'me',
     text:'We can add a focused CMS so your team controls content while the design system keeps the presentation consistent.'
    },
    {
     side:'client',
     text:'What about speed and SEO? We do not want a heavy site that only looks good in a presentation.'
    },
    {
     side:'me',
     text:'Performance, technical SEO and accessibility are part of the implementation. The result should work as well as it looks.'
    },
   ]
  },
  {
   title:'Less manual work',
   messages:[
    {
     side:'client',
     text:'We copy orders from emails into spreadsheets, then someone manually checks statuses and sends follow-up messages.'
    },
    {
     side:'me',
     text:'Let us map the entire flow and identify steps that can be automated safely without losing control over exceptions.'
    },
    {
     side:'client',
     text:'Our biggest concern is an automation misreading data and taking action without anyone noticing.'
    },
    {
     side:'me',
     text:'The system does not need to guess. Uncertain cases can be flagged for human review while routine work is automated and logged.'
    },
    {
     side:'client',
     text:'Could we later connect inventory, invoices or a carrier API?'
    },
    {
     side:'me',
     text:'Yes. We design integrations as modules so new data sources can be added without rebuilding the entire product.'
    },
   ]
  },
  {
   title:'Client portal',
   messages:[
    {
     side:'client',
     text:'Customers keep asking about project status. We want one place for documents, milestones and the history of changes.'
    },
    {
     side:'me',
     text:'We can build a secure client portal with roles, project-level access and notifications only when something important changes.'
    },
    {
     side:'client',
     text:'Some information is confidential. Each customer must only see their own cases and files.'
    },
    {
     side:'me',
     text:'Permissions are enforced at the data and API layer, not only in the interface, and access scenarios are tested before launch.'
    },
    {
     side:'client',
     text:'Can our internal team get a simple panel for managing those customers too?'
    },
    {
     side:'me',
     text:'Yes — an admin workspace with search, activity history and exactly the tools your team needs for daily operations.'
    },
   ]
  },
 ]

 if(!conversation?.length)return curated

 const cmsMessages:StoryMessage[]=conversation
  .slice(0,6)
  .map(item=>({
   side:item.side,
   text:item.text,
  }))

 if(cmsMessages.length<6){
  cmsMessages.push(
   ...curated[0].messages.slice(cmsMessages.length)
  )
 }

 return [
  {
   ...curated[0],
   messages:cmsMessages.slice(0,6),
  },
  ...curated.slice(1),
 ]
}

export function ConversationPhone({
 locale,
 settings,
 conversation,
 home,
}:{
 locale:Locale
 settings:Settings
 conversation?:Message[]
 home?:HomepageContent
}){
 const stories=useMemo(
  ()=>buildStories(locale,conversation),
  [locale,conversation],
 )

 const [story,setStory]=useState(0)
 const [cycle,setCycle]=useState(0)
 const [visibleCount,setVisibleCount]=useState(0)
 const [typing,setTyping]=useState(false)

 const transcript=useRef<HTMLDivElement>(null)

 const {paused}=useMotion()
 const prefersReduced=useReducedMotion()
 const motionOff=paused||prefersReduced

 const activeStory=stories[story]||stories[0]
 const messages=activeStory.messages

 useEffect(()=>{
  if(motionOff){
   setVisibleCount(Math.min(4,messages.length))
   setTyping(false)
   return
  }

  setVisibleCount(0)
  setTyping(false)

  const timers:number[]=[]
  let clock=320

  messages.forEach((message,index)=>{
   if(message.side==='me'){
    timers.push(
     window.setTimeout(
      ()=>setTyping(true),
      clock,
     )
    )

    clock+=720+Math.min(
     780,
     message.text.length*4,
    )
   }

   timers.push(
    window.setTimeout(
     ()=>{
      setTyping(false)
      setVisibleCount(index+1)
     },
     clock,
    )
   )

   clock+=message.side==='client'
    ?650
    :850
  })

  timers.push(
   window.setTimeout(
    ()=>{
     setStory(current=>
      nextStory(
       current,
       stories.length,
      )
     )

     setCycle(value=>value+1)
    },
    clock+2600,
   )
  )

  return()=>{
   timers.forEach(timer=>
    window.clearTimeout(timer)
   )
  }
 },[
  story,
  cycle,
  messages,
  motionOff,
  stories.length,
 ])

 useEffect(()=>{
  const node=transcript.current

  if(!node)return

  node.scrollTo({
   top:node.scrollHeight,
   behavior:prefersReduced
    ?'auto'
    :'smooth',
  })
 },[
  visibleCount,
  typing,
  story,
  prefersReduced,
 ])

 const fallbackSteps=locale==='pl'?[
  [
   'Rozmowa i kierunek',
   'Opowiadasz o celu. Omawiamy zakres, a w odpowiednich projektach przygotowujemy koncepcję lub demo.',
  ],
  [
   'Działające wersje, nie obietnice',
   'Widzisz postęp, testujesz aplikację i zgłaszasz uwagi. Sprawdzamy funkcje i uprawnienia przed wdrożeniem.',
  ],
  [
   'Wdrożenie i dalsza opieka',
   'Przekazujemy kod, dokumentację i prawa zgodnie z umową. Możemy dalej utrzymywać i rozwijać system.',
  ],
 ]:[
  [
   'A conversation and a direction',
   'You tell us the goal. We discuss scope and, where appropriate, prepare a concept or demo.',
  ],
  [
   'Working releases, not promises',
   'See progress, test the app and share feedback. We check functionality and permissions before launch.',
  ],
  [
   'Launch and ongoing support',
   'Code, documentation and rights are delivered under the agreement. We can maintain and develop the system further.',
  ],
 ]

 const steps=home?.stages?.length
  ?home.stages.map(s=>[
   s.title,
   s.description,
  ])
  :fallbackSteps

 const choose=(index:number)=>{
  setStory(index)
  setCycle(value=>value+1)
 }

 return <div className="conversation-layout">
  <div className="conversation-copy">
   <p className="eyebrow">
    {home?.processKicker||pick(
     locale,
     'WSPÓŁPRACA BEZ NIEDOMÓWIEŃ',
     'CLEAR COLLABORATION',
    )}
   </p>

   <h2>
    {home?.processTitle||pick(
     locale,
     'Zaczynamy od rozmowy.\nKończymy działającym produktem.',
     'Start with a conversation.\nLaunch a working product.',
    )}
   </h2>

   {home?.processDescription&&
    <p>{home.processDescription}</p>
   }

   <div className="conversation-steps">
    {steps.map(
     ([title,description],index)=>
      <article key={title}>
       <span>
        {String(index+1).padStart(2,'0')}
       </span>

       <div>
        <h3>{title}</h3>
        <p>{description}</p>
       </div>
      </article>
    )}
   </div>

   <Button
    href={`${pagePath(locale,'home')}#contact`}
    variant="text"
   >
    {pick(
     locale,
     'Opowiedz nam o pomyśle',
     'Tell us about your idea',
    )}
   </Button>
  </div>

  <figure
   className="imessage-presentation"
   data-autoplay={motionOff?'off':'on'}
   data-story={story}
  >
   <div
    className="conversation-auto-status"
    aria-hidden="true"
   >
    <i/>
    {pick(
     locale,
     'ROZMOWY ZMIENIAJĄ SIĘ AUTOMATYCZNIE',
     'CONVERSATIONS ROTATE AUTOMATICALLY',
    )}
   </div>

   <div
    className="conversation-stories"
    role="group"
    aria-label={pick(
     locale,
     'Wybierz historię',
     'Choose a story',
    )}
   >
    {stories.map((item,i)=>
     <button
      key={item.title}
      type="button"
      aria-pressed={story===i}
      onClick={()=>choose(i)}
     >
      <span>{item.title}</span>
     </button>
    )}
   </div>

   <div className="imessage-device">
    <div className="imessage-screen">
     <div
      className="imessage-status"
      aria-hidden="true"
     >
      <b>9:41</b>

      <div className="imessage-signal">
       <i/>
       <i/>
       <i/>
       <i/>
      </div>

      <span className="imessage-battery"/>
     </div>

     <div
      className="imessage-island"
      aria-hidden="true"
     />

     <div className="imessage-header">
      <span
       className="imessage-back"
       aria-hidden="true"
      >
       ‹
      </span>

      <span className="imessage-avatar">
       CM
      </span>

      <strong>
       {settings.brandName}
       {' '}
       <span aria-hidden="true">›</span>
      </strong>
     </div>

     <div
      ref={transcript}
      className="imessage-transcript"
      role="region"
      aria-live="polite"
      aria-label={pick(
       locale,
       'Przykładowa rozmowa z CodeMaster',
       'Example CodeMaster conversation',
      )}
      tabIndex={0}
      data-visible-count={visibleCount}
     >
      <p className="imessage-date">
       iMessage
       <br/>
       {pick(
        locale,
        'Dzisiaj 9:41',
        'Today 9:41',
       )}
      </p>

      {messages
       .slice(0,visibleCount)
       .map((message,index)=>
        <div
         className={`imessage-bubble ${
          message.side==='client'
           ?'sent'
           :'received'
         } is-entering`}
         key={`${story}-${index}`}
        >
         <p>{message.text}</p>
        </div>
       )}

      {typing&&
       <div
        className="imessage-bubble received imessage-typing"
        role="status"
        aria-label={pick(
         locale,
         'CodeMaster pisze',
         'CodeMaster is typing',
        )}
       >
        <i/>
        <i/>
        <i/>
       </div>
      }
     </div>

     <div
      className="imessage-composer"
      aria-hidden="true"
     >
      <span>+</span>

      <div>
       iMessage
       <span>↑</span>
      </div>
     </div>

     <div
      className="imessage-home"
      aria-hidden="true"
     />
    </div>
   </div>

   <figcaption>
    {pick(
     locale,
     'Przykładowy przebieg współpracy — scenariusze zmieniają się automatycznie.',
     'Example collaboration flow — scenarios rotate automatically.',
    )}
   </figcaption>
  </figure>
 </div>
}
