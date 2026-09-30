import {test,expect} from '@playwright/test'

test('headline is drawn from particles and pause restores accessible text',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'})
 await page.goto('/')
 const stage=page.locator('.particle-stage')
 const canvas=stage.locator('canvas')
 await expect(stage).toHaveAttribute('data-particles',/ready|light/)
 await expect.poll(()=>canvas.evaluate(element=>Number(element.dataset.count))).toBeGreaterThan(100)
 await expect.poll(()=>canvas.evaluate(element=>Number(element.dataset.frames))).toBeGreaterThan(2)
 expect(await canvas.evaluate(element=>{
  const ctx=(element as HTMLCanvasElement).getContext('2d')!
  const pixels=ctx.getImageData(0,0,(element as HTMLCanvasElement).width,(element as HTMLCanvasElement).height).data
  let painted=0
  for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)painted++
  return painted
 })).toBeGreaterThan(1000)
 await page.locator('.motion-toggle').click()
 await expect(page.locator('html')).toHaveAttribute('data-motion','off')
 await expect(stage).not.toHaveAttribute('data-particles',/ready|light/)
 for(const line of await page.locator('[data-particle-line]').all()){
  expect(await line.evaluate(element=>getComputedStyle(element).color)).not.toBe('rgba(0, 0, 0, 0)')
 }
 await page.locator('.motion-toggle').click()
 await page.locator('#hero-heading').scrollIntoViewIfNeeded()
 await expect(stage).toHaveAttribute('data-particles',/ready|light/)
})

test('one animated starfield remains fixed from hero through contact',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'})
 await page.goto('/')
 const stars=page.locator('.cosmic-background')
 await expect(stars).toHaveCount(1)
 await expect.poll(()=>stars.evaluate(element=>Number(element.dataset.frames))).toBeGreaterThan(2)
 await stars.evaluate(element=>{element.setAttribute('data-continuity-check','same-scene')})
 for(const section of ['#services','#process','#contact']){
  await page.locator(section).scrollIntoViewIfNeeded()
  await expect(stars).toHaveAttribute('data-continuity-check','same-scene')
  expect(await stars.evaluate(element=>({
   position:getComputedStyle(element).position,
   top:Math.round(element.getBoundingClientRect().top),
   width:Math.round(element.getBoundingClientRect().width)
  }))).toEqual({position:'fixed',top:0,width:page.viewportSize()!.width})
 }
})

for(const width of [320,390])test(`mobile keeps particle headline and animated sky at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844})
 await page.emulateMedia({reducedMotion:'no-preference'})
 await page.goto('/')

 // Heavy WebGL stays disabled on mobile.
 // The requested particle text and sky remain animated.
 await expect(page.locator('html')).toHaveAttribute('data-motion','off')

 const stage=page.locator('.particle-stage')
 const particles=stage.locator('canvas')
 const stars=page.locator('.cosmic-background')

 await expect(stage).toHaveAttribute('data-particles',/ready|light/)

 await expect.poll(
  ()=>particles.evaluate(
   element=>Number(element.dataset.count)
  )
 ).toBeGreaterThan(100)

 await expect.poll(
  ()=>particles.evaluate(
   element=>Number(element.dataset.frames)
  )
 ).toBeGreaterThan(2)

 await expect.poll(
  ()=>stars.evaluate(
   element=>Number(element.dataset.frames)
  )
 ).toBeGreaterThan(2)

 await expect(page.locator('#hero-heading')).toBeVisible()

 const bounds=
  await page
   .locator('#hero-heading')
   .boundingBox()

 expect(
  bounds!.x
 ).toBeGreaterThanOrEqual(0)

 expect(
  bounds!.x+
  bounds!.width
 ).toBeLessThanOrEqual(width)

 expect(
  await page.evaluate(
   ()=>
    document.documentElement.scrollWidth
  )
 ).toBeLessThanOrEqual(width)
})

test('bilingual hero calls to action target their corresponding sections',async({page})=>{
 for(const prefix of ['','/en']){
  await page.goto(prefix||'/')
  const links=page.locator('.hero-actions a')
  await expect(links.nth(0)).toHaveAttribute('href',`${prefix||'/'}#product`)
  await expect(links.nth(1)).toHaveAttribute('href',`${prefix||'/'}#contact`)
  await links.nth(1).click()
  await expect(page.locator('#contact form')).toBeVisible()
 }
})
