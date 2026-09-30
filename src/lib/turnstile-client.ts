'use client'
type WidgetAPI = { render: (el: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void }
declare global { interface Window { turnstile?: WidgetAPI } }
let siteKey = '', loading: Promise<void> | undefined, active: Promise<string> | undefined
export function setChallengeSiteKey(value: unknown) { siteKey = typeof value === 'string' ? value : '' }
async function loadWidget() {
  if (window.turnstile) return
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      const nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce
      if (nonce) script.nonce = nonce
      let done = false
      const finish = (ok: boolean) => {
        if (done) return
        done = true; clearTimeout(timer); script.onload = null; script.onerror = null
        if (ok) resolve()
        else { script.remove(); reject(new Error('CHALLENGE_UNAVAILABLE')) }
      }
      const timer = setTimeout(() => finish(false), 15000)
      script.onload = () => finish(!!window.turnstile)
      script.onerror = () => finish(false)
      document.head.appendChild(script)
    }).catch(error => { loading = undefined; throw error })
  }
  return loading
}
async function showChallenge(action: 'contact' | 'review'): Promise<string> {
  const key = siteKey
  if (!key) throw new Error('CONTACT_UNAVAILABLE')
  await loadWidget()
  return new Promise((resolve, reject) => {
    const api = window.turnstile
    if (!api) { reject(new Error('CHALLENGE_UNAVAILABLE')); return }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = document.createElement('dialog'), title = document.createElement('h2'), widget = document.createElement('div'), close = document.createElement('button')
    const pl = document.documentElement.lang !== 'en'
    title.textContent = pl ? 'Potwierd\u017a, \u017ce jeste\u015b cz\u0142owiekiem' : 'Confirm you are human'
    const uniqueID = crypto.randomUUID?.() || Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16)).join('-')
    title.id = `challenge-${uniqueID}`
    dialog.setAttribute('aria-labelledby', title.id); dialog.className = 'bot-challenge'
    close.type = 'button'; close.textContent = pl ? 'Anuluj' : 'Cancel'
    dialog.append(title, widget, close); document.body.append(dialog)
    let widgetID: string | undefined, finished = false
    const removeWidget = () => {
      if (widgetID === undefined) return
      const id = widgetID; widgetID = undefined
      try { api.remove(id) } catch { /* Cleanup must not prevent the promise settling. */ }
    }
    const timer = setTimeout(() => finish(), 120000)
    function finish(token?: unknown) {
      if (finished) return
      finished = true; clearTimeout(timer); removeWidget()
      try { if (dialog.open) dialog.close() } catch { /* remove() is the final cleanup. */ }
      dialog.remove()
      if (previous?.isConnected) { try { previous.focus() } catch { /* Detached/disabled trigger. */ } }
      if (typeof token === 'string' && token.length > 0 && token.length <= 2048) resolve(token)
      else reject(new Error('CHALLENGE_UNAVAILABLE'))
    }
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish() })
    close.onclick = () => finish()
    try {
      dialog.showModal()
      widgetID = api.render(widget, { sitekey: key, action, theme: 'auto', callback: (token: string) => finish(token), 'error-callback': () => finish(), 'expired-callback': () => finish() })
      // Providers/test doubles can invoke a callback synchronously inside render().
      if (finished) removeWidget()
    } catch { finish() }
  })
}
/** Never stack challenges or share a single-use proof between independent forms. */
export function challengeToken(action: 'contact' | 'review'): Promise<string> {
  if (active) return Promise.reject(new Error('CHALLENGE_BUSY'))
  active = showChallenge(action).finally(() => { active = undefined })
  return active
}
