import {test,expect} from '@playwright/test'
test.use({launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}})

test('homepage is compact, monochrome and does not repeat old galleries',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/')
 await page.evaluate(()=>document.fonts.ready)
 expect(await page.locator('.home-main>section').evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(['top','product','services','process','reviews'])
 await expect(page.locator('.home-main #product')).toHaveCount(1)
 await expect(page.locator('.home-main #contact')).toHaveCount(1)
 await expect(page.locator('.delivery-steps,.technology-belts,.journal-section,.approach-section')).toHaveCount(0)
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())).toBe('#d9dce3')
 await expect(page.locator('.home-service')).toHaveCount(7)
 await page.locator('.home-service summary').last().click()
 await expect(page.locator('.home-service').last()).toHaveAttribute('open','')
 await expect(page.locator('.home-service').first()).not.toHaveAttribute('open','')
})

test('the starry first fold has no laptop and the project viewer follows the hero',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/')
 const hero=page.locator('.home-main #top'),viewer=page.locator('.home-main #product')
 await expect(hero.locator('.device-experience,.cm-screen,.forma-app')).toHaveCount(0)
 await expect(viewer.getByRole('heading',{name:/Różne marki/})).toBeVisible()
 const heroBox=await hero.boundingBox(),viewerBox=await viewer.boundingBox()
 expect(heroBox).not.toBeNull()
 expect(viewerBox).not.toBeNull()
 expect(viewerBox!.y).toBeGreaterThanOrEqual(heroBox!.y+heroBox!.height)
 await expect.poll(async()=>Number(await page.locator('canvas.cosmic-background').getAttribute('data-star-count'))).toBeGreaterThan(30)
 expect(Number(await page.locator('canvas.cosmic-background').getAttribute('data-star-count'))).toBeLessThanOrEqual(210)
})

test('project viewer first paint keeps the selected brand and selector safely disabled until hydration',async({page})=>{
 let releaseScripts!:()=>void
 const scriptGate=new Promise<void>(resolve=>{releaseScripts=resolve})
 let heldScripts=0
 await page.route(/\/_next\/static\/.*\.js(?:\?|$)/,async route=>{
  heldScripts++
  await scriptGate
  await route.continue()
 })
 try{
  await page.goto('/',{waitUntil:'commit'})
  await expect.poll(()=>heldScripts).toBeGreaterThan(0)
  const viewer=page.locator('.project-showcase')
  await expect(viewer.getByRole('heading',{name:/Różne marki/})).toBeVisible()
  const brands=viewer.getByRole('group',{name:'Wybór realizacji'})
  await expect(brands.getByRole('button',{name:/ATELIER/})).toHaveAttribute('aria-pressed','true')
  const maison=brands.getByRole('button',{name:/MAISON/})
  await expect(maison).toBeDisabled()
  releaseScripts()
  await expect(maison).toBeEnabled()
  await maison.click()
  await expect(maison).toHaveAttribute('aria-pressed','true')
 }finally{
  releaseScripts()
 }
})

test('reduced motion opens the project viewer directly and keeps controls usable',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/')
 await expect(page.locator('html')).toHaveAttribute('data-motion','off')
 const viewer=page.locator('.project-showcase')
 await viewer.scrollIntoViewIfNeeded()
 await expect(viewer.locator('.device-scene-host')).toHaveAttribute('data-renderer','webgl')
 await expect(viewer.locator('.device-experience')).toHaveAttribute('data-scene-open','true')
 const maison=viewer.getByRole('group',{name:'Wybór realizacji'}).getByRole('button',{name:/MAISON/})
 await maison.click()
 await expect(maison).toHaveAttribute('aria-pressed','true')
})

test('mobile project viewer and collaboration have no page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 const viewer=page.locator('.project-showcase')
 await expect(viewer.getByRole('group',{name:'Wybór realizacji'}).getByRole('button')).toHaveCount(6)
 await viewer.getByRole('group',{name:'Wybór realizacji'}).getByRole('button',{name:/VÉLO/}).click()
 await expect(viewer.locator('.showcase-project-detail h3')).toContainText('VÉLO')
 await expect(page.locator('.imessage-bubble.sent').first()).toHaveCSS('background-color','rgb(0, 102, 204)')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('contact asks only for essentials and expands optional fields',async({page})=>{
 await page.goto('/kontakt')
 const form=page.locator('.concise-form')
 await expect(form.locator('[name=name]')).toBeVisible()
 await expect(form.locator('[name=email]')).toBeVisible()
 await expect(form.locator('[name=message]')).toBeVisible()
 await expect(form.locator('[name=company]')).not.toBeVisible()
 await expect(form.locator('[name=phone]')).not.toBeVisible()
 await expect(form.locator('[name=topic]')).toHaveCount(0)
 await form.getByRole('button',{name:'Wyślij wiadomość'}).click()
 await expect(form.locator('[name=name]')).toHaveAttribute('aria-invalid','true')
 await expect(form.locator('[name=privacyAccepted]')).toHaveAttribute('aria-invalid','true')
 await form.locator('.contact-optional summary').click()
 await expect(form.locator('[name=company]')).toBeVisible()
 await expect(form.locator('[name=phone]')).toBeVisible()
 await expect(form.locator('[name=nda]')).toBeVisible()
})
