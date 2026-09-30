"""Real Chromium tests of the shipped DOM module, with a fake anti-bot provider.
This does NOT launch Next.js, React, Payload, or Cloudflare. No external traffic.
Requires: Python playwright, Chromium (or playwright install chromium), Node/TypeScript.
"""
import asyncio, json, os, pathlib, shutil, subprocess, tempfile
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
RESULTS = []

async def prepare(browser, origin, size):
    page = await browser.new_page(viewport=size)
    await page.route('https://**/*', lambda route: route.abort())
    await page.set_content('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><body><h1>Isolated browser fixture - not the application</h1><button id="trigger">Send enquiry</button></body></html>')
    await page.add_script_tag(content=(pathlib.Path(origin)/'fixture.js').read_text())
    await page.wait_for_function('window.fixtureReady === true')
    await page.evaluate("""() => {
      window.calls = {remove:[],render:0};
      client.setChallengeSiteKey('isolated-test-key');
      window.turnstile = {
        render(el, options) { calls.render++; window.options=options; return 'widget-1'; },
        remove(id) { calls.remove.push(id); }
      };
      document.getElementById('trigger').focus();
      window.start = () => { window.outcome='pending'; window.promise=client.challengeToken('contact').then(token=>{outcome='success';window.proof=token},error=>{outcome=error.message}); };
    }""")
    return page

async def run_case(page, name):
    if name == 'missing-site-key':
        await page.evaluate("client.setChallengeSiteKey(''); start()")
        await page.wait_for_function("outcome==='CONTACT_UNAVAILABLE'")
    elif name == 'success-and-focus-restoration':
        await page.evaluate('start()')
        await page.wait_for_selector('dialog[open]')
        assert await page.locator('dialog').get_attribute('aria-labelledby')
        await page.evaluate("options.callback('synthetic-proof')")
        await page.wait_for_function("outcome==='success'")
        assert await page.evaluate('document.activeElement.id') == 'trigger'
        assert await page.evaluate('calls.remove') == ['widget-1']
    elif name == 'escape-cancels':
        await page.evaluate('start()')
        await page.wait_for_selector('dialog[open]')
        await page.keyboard.press('Escape')
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
    elif name == 'cancel-button-cleans-up':
        await page.evaluate('start()')
        await page.get_by_role('button', name='Cancel').click()
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
    elif name == 'provider-remove-exception-does-not-hang':
        await page.evaluate("turnstile.remove=()=>{throw Error('synthetic removal fault')};start()")
        await page.wait_for_selector('dialog[open]')
        await page.evaluate("options.callback('synthetic-proof')")
        await page.wait_for_function("outcome==='success'")
    elif name == 'provider-render-exception-cleans-up':
        await page.evaluate("turnstile.render=()=>{throw Error('synthetic render fault')};start()")
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
    elif name == 'showModal-exception-cleans-up':
        await page.evaluate("HTMLDialogElement.prototype.showModal=()=>{throw Error('synthetic modal fault')};start()")
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
    elif name == 'synchronous-provider-callback-removes-returned-widget':
        await page.evaluate("turnstile.render=(el,opts)=>{opts.callback('synthetic-proof');return 'sync-widget'};start()")
        await page.wait_for_function("outcome==='success'")
        assert await page.evaluate('calls.remove') == ['sync-widget']
    elif name == 'repeated-provider-callback-settles-once':
        await page.evaluate('start()')
        await page.wait_for_selector('dialog[open]')
        await page.evaluate("options.callback('synthetic-proof');options['error-callback']();options.callback('second-proof')")
        await page.wait_for_function("outcome==='success'")
        assert await page.evaluate('calls.remove.length') == 1
        assert await page.evaluate('proof') == 'synthetic-proof'
    elif name == 'parallel-form-does-not-share-single-use-proof':
        await page.evaluate("start();window.other=client.challengeToken('contact').then(()=>{window.second='unexpected-success'},e=>{window.second=e.message})")
        await page.wait_for_function("window.second==='CHALLENGE_BUSY'")
        assert await page.locator('dialog').count() == 1
        await page.evaluate("options.callback('synthetic-proof')")
        await page.wait_for_function("outcome==='success'")
    elif name == 'expired-proof-cleans-up':
        await page.evaluate('start()')
        await page.wait_for_selector('dialog[open]')
        await page.evaluate("options['expired-callback']()")
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
    elif name == 'malformed-proof-never-resolves-success':
        await page.evaluate('start()')
        await page.wait_for_selector('dialog[open]')
        await page.evaluate("options.callback({forged:true})")
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
    elif name == 'script-load-error-can-retry':
        await page.evaluate('delete window.turnstile;start()')
        await page.wait_for_function("outcome==='CHALLENGE_UNAVAILABLE'")
        assert await page.locator('script[src*="challenges.cloudflare.com"]').count() == 0
        await page.evaluate("window.turnstile={render(el,opts){opts.callback('retry-proof');return 'retry'},remove(){}};start()")
        await page.wait_for_function("outcome==='success'")
    elif name == 'invalid-civil-date-does-not-crash-renderer':
        assert await page.evaluate("dates.isCivilDate('2026-02-31')") is False
        assert await page.evaluate("dates.calendarDays('2026-03-28','2026-03-30')") == 2
        assert await page.evaluate("dates.formatCivilDate('not-a-date','en')") == '\u2014'
    else:
        raise AssertionError(name)
    assert await page.locator('dialog').count() == 0

async def main(origin):
    cases = ['missing-site-key','success-and-focus-restoration','escape-cancels','cancel-button-cleans-up','provider-remove-exception-does-not-hang','provider-render-exception-cleans-up','showModal-exception-cleans-up','synchronous-provider-callback-removes-returned-widget','repeated-provider-callback-settles-once','parallel-form-does-not-share-single-use-proof','expired-proof-cleans-up','malformed-proof-never-resolves-success','script-load-error-can-retry','invalid-civil-date-does-not-crash-renderer']
    async with async_playwright() as pw:
        executable = os.getenv('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('chromium-browser')
        browser = await pw.chromium.launch(headless=True, **({'executable_path':executable} if executable else {}))
        version = browser.version
        for viewport in [{'width':1440,'height':900},{'width':390,'height':844},{'width':320,'height':640}]:
            for case in cases:
                page = await prepare(browser, origin, viewport)
                result={'case':case,'viewport':viewport,'passed':False}
                try:
                    await run_case(page,case);result['passed']=True
                except Exception as error:
                    result['error']=str(error)
                finally:
                    await page.close()
                RESULTS.append(result)
                print(('PASS' if result['passed'] else 'FAIL'),viewport['width'],case, flush=True)
        await browser.close()
        return version

if __name__ == '__main__':
    with tempfile.TemporaryDirectory(prefix='codemaster-browser-') as temp:
        subprocess.run(['node','scripts/build-isolated-browser.cjs',temp],cwd=ROOT,check=True)
        version=asyncio.run(main(temp))
    report={'scope':'Isolated actual browser DOM/date modules only. Provider is a test double. NOT Next/React/Payload E2E.','browser':'Chromium '+version,'navigation':'about:blank; managed browser blocks URL navigation; DOM/crypto are native, no policy changed','passed':sum(x['passed'] for x in RESULTS),'failed':sum(not x['passed'] for x in RESULTS),'results':RESULTS}
    dest=ROOT/'reports/functional/browser-isolated.json';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))
    raise SystemExit(0 if report['failed']==0 else 1)
