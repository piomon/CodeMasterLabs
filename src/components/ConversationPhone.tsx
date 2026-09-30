'use client'
import {useState} from 'react'
import {Button} from './common/Button'
import {pagePath,pick} from '@/lib/i18n'
import type {Locale,Settings,Message,HomepageContent} from '@/types/site'
import './conversation-phone.css'

export function ConversationPhone({locale,settings,conversation,home}:{locale:Locale;settings:Settings;conversation?:Message[];home?:HomepageContent}){
 const [story,setStory]=useState(0)
 const initial=conversation?.length?conversation.slice(0,4):[
  {side:'client',text:pick(locale,'Mam pomysł na aplikację, ale nie mam specyfikacji.','I have an idea for an app, but no specification.')},
  {side:'me',text:pick(locale,'Zacznijmy od tego, co chcesz usprawnić. Technologią zajmiemy się my.','Let’s start with what you want to improve. We’ll handle the technology.')},
  {side:'client',text:pick(locale,'Czy zobaczę projekt w trakcie pracy?','Will I see the product while you build it?')},
  {side:'me',text:pick(locale,'Tak. Pracujemy etapami — testujesz działającą wersję i omawiamy uwagi.','Yes. We work in stages. You test working versions and we discuss your feedback.')},
 ]
 const titles=locale==='pl'?['Od pomysłu do aplikacji','Nowa strona marki','Mniej ręcznej pracy']:['Idea to application','A new brand website','Less manual work']
 const stories=[initial,...(locale==='pl'?[
  ['Nasza strona nie działa dobrze na telefonie.','Zacznijmy od wygodnej wersji mobilnej i jasnej prezentacji oferty.','Czy będziemy mogli sami zmieniać treści?','Tak. Dostaniecie CMS oraz instrukcję obsługi.'],
  ['Przepisujemy zamówienia z maili do arkusza.','Sprawdźmy, które kroki można bezpiecznie zautomatyzować.','A jeśli system czegoś nie rozpozna?','Nie zgaduje. Oznaczy sprawę do sprawdzenia przez człowieka.'],
 ]:[
  ['Our website is difficult to use on phones.','Let’s start with a usable mobile experience and a clear offer.','Can we update the content ourselves?','Yes. You get a CMS and instructions.'],
  ['We copy orders from emails into spreadsheets.','Let’s identify which steps can be safely automated.','What if the system cannot recognise something?','It flags the case for a human to review instead of guessing.'],
 ]).map(texts=>texts.map((text,i)=>({side:i%2?'me':'client',text})))]
 const messages=stories[story]
 const fallbackSteps=locale==='pl'?[
  ['Rozmowa i kierunek','Opowiadasz o celu. Omawiamy zakres, a w odpowiednich projektach przygotowujemy koncepcję lub demo.'],
  ['Działające wersje, nie obietnice','Widzisz postęp, testujesz aplikację i zgłaszasz uwagi. Sprawdzamy funkcje i uprawnienia przed wdrożeniem.'],
  ['Wdrożenie i dalsza opieka','Przekazujemy kod, dokumentację i prawa zgodnie z umową. Możemy dalej utrzymywać i rozwijać system.'],
 ]:[
  ['A conversation and a direction','You tell us the goal. We discuss scope and, where appropriate, prepare a concept or demo.'],
  ['Working releases, not promises','See progress, test the app and share feedback. We check functionality and permissions before launch.'],
  ['Launch and ongoing support','Code, documentation and rights are delivered under the agreement. We can maintain and develop the system further.'],
 ]
 const steps=home?.stages?.length?home.stages.map(s=>[s.title,s.description]):fallbackSteps
 return <div className="conversation-layout">
  <div className="conversation-copy">
   <p className="eyebrow">{home?.processKicker||pick(locale,'WSPÓŁPRACA BEZ NIEDOMÓWIEŃ','CLEAR COLLABORATION')}</p>
   <h2>{home?.processTitle||pick(locale,'Zaczynamy od rozmowy.\nKończymy działającym produktem.','Start with a conversation.\nLaunch a working product.')}</h2>
   {home?.processDescription&&<p>{home.processDescription}</p>}
   <div className="conversation-steps">{steps.map(([title,description],index)=><article key={title}>
    <span>{String(index+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{description}</p></div>
   </article>)}</div>
   <Button href={`${pagePath(locale,'home')}#contact`} variant="text">{pick(locale,'Opowiedz nam o pomyśle','Tell us about your idea')}</Button>
  </div>
  <figure className="imessage-presentation">
   <div className="conversation-stories" role="group" aria-label={pick(locale,'Wybierz historię','Choose a story')}>{titles.map((title,i)=><button key={title} type="button" aria-pressed={story===i} onClick={()=>setStory(i)}>{title}</button>)}</div>
   <div className="imessage-device">
    <div className="imessage-screen">
     <div className="imessage-status" aria-hidden="true"><b>9:41</b><div className="imessage-signal"><i/><i/><i/><i/></div><span className="imessage-battery"/></div>
     <div className="imessage-island" aria-hidden="true"/>
     <div className="imessage-header">
      <span className="imessage-back" aria-hidden="true">‹</span>
      <span className="imessage-avatar">CM</span>
      <strong>{settings.brandName} <span aria-hidden="true">›</span></strong>
     </div>
     <div className="imessage-transcript" role="region" aria-label={pick(locale,'Przykładowa rozmowa z CodeMaster','Example CodeMaster conversation')} tabIndex={0}>
      <p className="imessage-date">iMessage<br/>{pick(locale,'Dzisiaj 9:41','Today 9:41')}</p>
      {messages.map((message,index)=><div className={`imessage-bubble ${message.side==='client'?'sent':'received'}`} key={index}><p>{message.text}</p></div>)}
     </div>
     <div className="imessage-composer" aria-hidden="true"><span>+</span><div>iMessage <span>↑</span></div></div>
     <div className="imessage-home" aria-hidden="true"/>
    </div>
   </div>
   <figcaption>{pick(locale,'Przykład rozmowy, nie komunikator.','An example conversation, not a messaging app.')}</figcaption>
  </figure>
 </div>
}