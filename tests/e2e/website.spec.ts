import {test,expect} from '@playwright/test'
const routes=['/','/en','/realizacje','/en/projects','/blog','/en/blog','/kontakt','/en/contact','/polityka-prywatnosci','/cookies','/en/privacy','/en/cookies','/uslugi','/en/services',...['operations','approval','commerce','client-portal','real-estate'].flatMap(kind=>[`/demos/${kind}`,`/en/demos/${kind}`]),...['atelier','maison','velo','nora','ember','aura'].flatMap(kind=>[`/showcase/pl/${kind}`,`/showcase/en/${kind}`])]
for(const route of routes)test(`public route ${route}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const response=await page.goto(route)
 expect(response?.status()).toBe(200);await expect(page.locator('main')).toBeVisible();await expect(page.locator('h1')).toHaveCount(1)
 expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");expect(errors).toEqual([])
})
for(const width of [320,390,768,820,1024,1440,1920,2560])test(`no overflow at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})
test('service keyboard interaction and portfolio detail',async({page})=>{
 await page.goto('/uslugi');await page.locator('#service-tab-0').focus();await page.keyboard.press('ArrowDown');await expect(page.locator('#service-tab-1')).toHaveAttribute('aria-selected','true')
 await page.goto('/realizacje');await page.locator('.project-index-card h2 a').first().click();await expect(page).toHaveURL(/\/realizacje\//);await expect(page.locator('.case-chapter')).toHaveCount(12)
})
test('CMS and private records reject public writes/reads',async({request})=>{
 for(const url of ['/api/leads','/api/private-files','/api/form-attempts'])expect([401,403]).toContain((await request.get(url)).status())
 const origin=process.env.E2E_BASE_URL||'http://localhost:3000'
 expect((await request.post('/api/users/first-register',{headers:{Origin:origin},data:{email:'blocked@example.test',password:'test-only-long-password'}})).status()).toBe(403)
 expect([401,403]).toContain((await request.post('/api/users',{headers:{Origin:origin},data:{email:'blocked@example.test',password:'test-only-long-password',name:'Blocked'}})).status())
})
test('mobile menu keyboard loop and Escape',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/')
 const trigger=page.getByRole('button',{name:'Otwórz menu'})
 await expect(trigger).toBeEnabled()
 await trigger.click()
 const dialog=page.getByRole('dialog',{name:'Menu nawigacji'})
 await expect(dialog).toBeVisible()
 await expect(dialog).toHaveJSProperty('open',true)
 await expect(dialog.getByRole('button',{name:'Zamknij menu'})).toBeFocused()
 for(let i=0;i<10;i++){
  await page.keyboard.press('Tab')
  await expect.poll(()=>dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)
 }
 await page.keyboard.press('Escape')
 await expect(dialog).not.toBeVisible()
 await expect(trigger).toBeFocused()
})
test('reduced motion leaves text and collaboration readable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-motion','off');await expect(page.locator('.motion-toggle')).toBeDisabled()
 expect(await page.locator('.conversation-steps article').count()).toBeGreaterThanOrEqual(3)
 await expect(page.locator('.imessage-bubble')).toHaveCount(4)
 await expect(page.locator('.imessage-bubble').last()).toBeVisible()
})
