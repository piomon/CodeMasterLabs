'use client'
import {useEffect,useRef,useState,type FormEvent} from 'react'
import Link from 'next/link'
import {Icon} from './common/Icon'
import {pagePath,pick} from '@/lib/i18n'
import {validateLead} from '@/lib/lead-validation'
import {createContactSubmission} from '@/lib/contact-client'
import {trackEvent} from '@/lib/analytics'
import type {Locale} from '@/types/site'
import './forms/concise-contact.css'
export function ContactForm({locale='pl',email}:{locale?:Locale;email:string}) {
 const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle'),[errors,setErrors]=useState<Record<string,string>>({}),[notice,setNotice]=useState(''),[filename,setFilename]=useState(''),[pending,setPending]=useState(false)
 const session=useRef(createContactSubmission()),started=useRef(false),tracked=useRef(false),success=useRef<HTMLDivElement>(null),formRef=useRef<HTMLFormElement>(null)
 const extraFields=useRef<HTMLDetailsElement>(null)
 useEffect(()=>{if(status==='success')success.current?.focus()},[status])
 useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(started.current&&status!=='success'){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard)},[status])
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(status==='sending')return
   const form=e.currentTarget,data=new FormData(form);data.set('topic','unknown');data.set('locale',locale);data.set('source','contact')
  if(!session.current.pending){const result=validateLead(Object.fromEntries(data.entries()))
   if(!result.ok){setErrors(result.errors);if(extraFields.current&&Object.keys(result.errors).some(key=>['company','phone','attachment'].includes(key)))extraFields.current.open=true;form.querySelector<HTMLElement>(`[name="${Object.keys(result.errors)[0]}"]`)?.focus();return}
   const file=data.get('attachment');if(file instanceof File&&file.size>5*1024*1024){setErrors({attachment:pick(locale,'Załącznik może mieć maksymalnie 5 MB.','The attachment can be at most 5 MB.')});if(extraFields.current)extraFields.current.open=true;return}
  }setErrors({});setStatus('sending');setNotice('')
  try{
   const response=await session.current.submit(data)
   if(!response.ok){setErrors(response.fields||{});if(extraFields.current&&Object.keys(response.fields||{}).some(key=>['company','phone','attachment'].includes(key)))extraFields.current.open=true;throw new Error(response.error||pick(locale,'Nie udało się zapisać wiadomości. Spróbuj ponownie lub napisz e-mail.','Could not save your message. Try again or send an email.'))}
   setStatus('success');started.current=false;form.reset();trackEvent('contact_submit',{location:'contact'})
  }catch(error){setStatus('error');setNotice(error instanceof Error&&!['CONTACT_UNAVAILABLE','RECEIPT_UNAVAILABLE','CHALLENGE_UNAVAILABLE','Failed to fetch','The operation was aborted due to timeout','The operation was aborted.'].includes(error.message)&&error.name!=='TimeoutError'&&error.name!=='AbortError'?error.message:pick(locale,'Błąd połączenia. Spróbuj ponownie.','Connection error. Please try again.'))}finally{setPending(session.current.pending)}
 }
 function err(name:string){return errors[name]?<span id={`error-${name}`} className="field-error">{errors[name]}</span>:null}
 const props=(name:string)=>({'aria-invalid':Boolean(errors[name]),'aria-describedby':errors[name]?`error-${name}`:undefined})
 if(status==='success')return <div className="contact-success concise-success" role="status" tabIndex={-1} ref={success}><span className="success-mark"><Icon name="check" size={34}/></span><p className="eyebrow">{pick(locale,'WIADOMOŚĆ ZAPISANA','MESSAGE SAVED')}</p><h3>{pick(locale,'Dziękujemy za wiadomość.','Thank you for your message.')}</h3><p>{pick(locale,'Twoje zapytanie zostało zapisane. Kolejny krok to rozmowa o tym, co chcesz zbudować.','Your enquiry has been saved. Next, let’s discuss what you would like to build.')}</p><a href={`mailto:${email}`} className="inline-link">{email}<Icon name="external" size={15}/></a></div>
 return <form ref={formRef} className="contact-form concise-form" onSubmit={submit} noValidate onChange={()=>{started.current=true}} onFocus={()=>{if(!tracked.current){tracked.current=true;trackEvent('contact_start',{location:'contact'})}}}>
 <fieldset className="submission-fields" disabled={status==='sending'||pending}><div className="form-row"><label><span>{pick(locale,'Imię','Name')} <i>*</i></span><input name="name" autoComplete="given-name" required minLength={2} maxLength={100} placeholder={pick(locale,'Jak masz na imię?','What is your name?')} {...props('name')}/>{err('name')}</label><label><span>E-mail <i>*</i></span><input name="email" type="email" autoComplete="email" spellCheck={false} required maxLength={254} placeholder="jan@firma.pl" {...props('email')}/>{err('email')}</label></div>
 <label><span>{pick(locale,'Co chcesz stworzyć?','What would you like to build?')} <i>*</i></span><textarea name="message" rows={4} minLength={20} maxLength={5000} required placeholder={pick(locale,'Opisz swój pomysł lub problem w kilku zdaniach. Nie potrzebujesz specyfikacji technicznej.','A few sentences about your idea or the problem to solve. No technical specification needed.')} {...props('message')}/>{err('message')}</label>
 <details className="contact-optional" ref={extraFields}><summary>{pick(locale,'Dodaj szczegóły lub załącznik','Add details or a file')} <small>{pick(locale,'opcjonalnie','optional')}</small><Icon name="plus" size={14}/></summary>
 <div className="form-row"><label><span>{pick(locale,'Firma','Company')}</span><input name="company" autoComplete="organization" maxLength={160} placeholder={pick(locale,'Nazwa firmy','Company name')} {...props('company')}/>{err('company')}</label><label><span>{pick(locale,'Telefon','Phone')}</span><input name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="+48" {...props('phone')}/>{err('phone')}</label></div>
 <div className="form-extras"><label className="file-input"><Icon name="upload" size={15}/><span>{filename||pick(locale,'Dodaj załącznik','Add attachment')}</span><input name="attachment" type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={e=>setFilename(e.currentTarget.files?.[0]?.name||'')} {...props('attachment')} aria-label={pick(locale,'Załącznik PDF, TXT, PNG lub JPG, maksymalnie 5 MB','PDF, TXT, PNG or JPG attachment, at most 5 MB')}/></label><label className="checkbox-label"><input name="nda" type="checkbox"/><span>{pick(locale,'Potrzebuję NDA','I need an NDA')}</span></label></div><small className="file-hint">PDF / TXT / PNG / JPG · max. 5 MB</small>{err('attachment')}
 </details>
 <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
 <label className="checkbox-label privacy-checkbox"><input name="privacyAccepted" type="checkbox" required {...props('privacyAccepted')}/><span>{pick(locale,'Zapoznałem/am się z','I have read the')} <Link href={pagePath(locale,'privacy')} target="_blank" rel="noopener">{pick(locale,'informacją o prywatności','privacy information')}</Link>.</span></label>{err('privacyAccepted')}
 </fieldset>{pending&&<p role="status">{pick(locale,'Sprawdzimy poprzedni zapis. Ponowienie wyśle tę samą wiadomość, bez tworzenia kolejnej. Nie odświeżaj strony.','We will check the previous submission. Retrying uses the same message without creating another. Do not reload this page.')}</p>}
 <div className="form-submit-row"><button type="submit" className="button button-primary" disabled={status==='sending'}><span>{status==='sending'?pick(locale,'Wysyłam…','Sending…'):pick(locale,'Wyślij wiadomość','Send message')}</span><Icon name="arrow" size={18}/></button><span className="form-reassurance">{pick(locale,'Bez zobowiązań.','No commitment.')}</span></div>
 <div className="form-notice" role="status" aria-live="polite">{notice&&<p>{notice} <a href={`mailto:${email}`}>{email}</a></p>}</div>
 </form>
}
