import {readFile} from 'node:fs/promises'
import {test,expect,type Page,type Locator} from '@playwright/test'

test.use({launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}})

async function expectTextDownload(page:Page,button:Locator,content:string){
 const pending=page.waitForEvent('download')
 await button.click()
 const download=await pending
 expect(download.suggestedFilename()).toMatch(/\.txt$/)
 const file=await download.path()
 expect(file).not.toBeNull()
 expect(await readFile(file!,'utf8')).toContain(content)
}

const projects=[
 {id:'atelier',name:'ATELIER'},
 {id:'maison',name:'MAISON'},
 {id:'velo',name:'VÉLO'},
 {id:'nora',name:'NŌRA'},
 {id:'ember',name:'EMBER'},
 {id:'aura',name:'AURA'},
] as const

test('scroll opens real WebGL devices with progressing geometry',async({page})=>{
 test.setTimeout(90000)
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/')
 const host=page.locator('.device-scene-host')
 await host.scrollIntoViewIfNeeded()
 await expect(host).toHaveAttribute('data-renderer','webgl')
 await page.evaluate(()=>{
  const host=document.querySelector('.device-scene-host')!
  window.scrollTo({top:host.getBoundingClientRect().top+window.scrollY+300,behavior:'instant'})
 })
 await expect.poll(async()=>Number(await host.getAttribute('data-open-progress'))).toBeGreaterThan(0)
 await expect(host).toHaveAttribute('data-opened','true',{timeout:30000})
 await expect(page.locator('.device-experience')).toHaveAttribute('data-scene-open','true')
})

test('click offers a genuine alternative to scrolling the devices open',async({page})=>{
 test.setTimeout(90000)
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/')
 const host=page.locator('.device-scene-host')
 await expect(host).toBeAttached({timeout:30000})
 await page.evaluate(()=>{
  const host=document.querySelector('.device-scene-host')!
  window.scrollTo({top:host.getBoundingClientRect().top+window.scrollY-window.innerHeight*.8,behavior:'instant'})
 })
 await expect(host).toHaveAttribute('data-renderer','webgl',{timeout:30000})
 await page.getByRole('button',{name:/Przewiń, aby otworzyć — lub kliknij/}).click()
 await expect(host).toHaveAttribute('data-opened','true',{timeout:30000})
})

test('all six brands switch both actual website iframe URLs and open a returnable full experience',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/')
 const viewer=page.locator('.project-showcase')
 await viewer.scrollIntoViewIfNeeded()
 await expect(viewer.locator('.device-scene-host')).toHaveAttribute('data-renderer','webgl')
 const brands=viewer.getByRole('group',{name:'Wybór realizacji'})
 await expect(brands.getByRole('button')).toHaveCount(6)
 for(const project of projects){
  const button=brands.getByRole('button',{name:new RegExp(project.name)})
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed','true')
  await expect(viewer.locator('.showcase-project-detail h3')).toContainText(project.name)
  await expect(viewer.locator('iframe[title$="widok komputerowy"]')).toHaveAttribute('src',`/showcase/pl/${project.id}?embed=1`)
  await expect(viewer.locator('iframe[title$="widok telefonu"]')).toHaveAttribute('src',`/showcase/pl/${project.id}?embed=1`)
 }
 await viewer.getByRole('link',{name:'Otwórz pełną realizację'}).click()
 await expect(page).toHaveURL(/\/showcase\/pl\/aura$/)
 await expect(page.locator('.aura-site')).toBeVisible()
 await page.locator('.project-return a').click()
 await expect(page).toHaveURL(/\/#product$/)
 await expect(page.locator('.project-showcase')).toBeVisible()
})

test('preview and code controls switch the actual laptop surface; copy works in a secure context',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.context().grantPermissions(['clipboard-read','clipboard-write'])
 await page.goto('/')
 const viewer=page.locator('.project-showcase')
 await viewer.scrollIntoViewIfNeeded()
 await expect(viewer.locator('.device-scene-host')).toHaveAttribute('data-opened','true')
 await viewer.getByRole('button',{name:'Pokaż kod'}).click()
 await expect(viewer.locator('.showcase-code')).toBeVisible()
 await expect(viewer.locator('.showcase-code')).toContainText("id: 'atelier'")
 if(await page.evaluate(()=>isSecureContext&&Boolean(navigator.clipboard?.writeText))){
  await viewer.getByRole('button',{name:'Kopiuj fragment'}).click()
  await expect(viewer.locator('.code-copy-status')).toContainText('Fragment znajduje się w schowku.')
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain("id: 'atelier'")
 }
 await viewer.getByRole('button',{name:'Pokaż stronę'}).click()
 await expect(viewer.locator('iframe[title$="widok komputerowy"]')).toHaveAttribute('src','/showcase/pl/atelier?embed=1')
})

test('embedded routes omit portfolio chrome but still serve a functioning site',async({page})=>{
 await page.goto('/showcase/pl/atelier?embed=1')
 await expect(page.locator('.atelier-site')).toBeVisible()
 await expect(page.locator('.project-return,.project-disclosure')).toHaveCount(0)
 await expect(page.getByRole('heading',{level:1})).toContainText('Form')
})

test('ATELIER filters architectural studies and opens a navigable gallery',async({page})=>{
 await page.goto('/showcase/pl/atelier')
 const site=page.locator('.atelier-site')
 await site.getByRole('button',{name:'Domy'}).click()
 await expect(site.locator('.at-project-card h3')).toHaveText(['Dom między drzewami','Światło i próg'])
 await site.getByRole('button',{name:'Otwórz projekt: Dom między drzewami'}).click()
 const gallery=site.getByRole('dialog',{name:'Dom między drzewami'})
 await expect(gallery).toBeVisible()
 await expect(gallery.locator('.at-gallery-count')).toHaveText('01 / 03')
 await gallery.getByRole('button',{name:'Następne zdjęcie'}).click()
 await expect(gallery.locator('.at-gallery-count')).toHaveText('02 / 03')
 await gallery.getByRole('button',{name:'Zamknij galerię'}).click()
 await expect(gallery).not.toBeVisible()
})

test('MAISON calculates and restores an illustrative local stay, never a reservation',async({page})=>{
 await page.goto('/showcase/pl/maison')
 const site=page.locator('.maison-site'),year=new Date().getFullYear()+1
 await site.getByLabel('Przyjazd').fill(`${year}-06-10`)
 await site.getByLabel('Wyjazd').fill(`${year}-06-12`)
 await site.getByLabel('Liczba gości').selectOption('3')
 await site.locator('.ms-suite-options').getByRole('button',{name:/Tarasowy/}).click()
 await site.getByRole('button',{name:'Zobacz przykładowy plan'}).click()
 await expect(site.locator('.ms-plan-summary')).toContainText('Apartament Tarasowy')
 await expect(site.locator('.ms-plan-summary')).toContainText('490')
 await expect(site.locator('.ms-plan-summary')).toContainText('Nie jest rezerwacją')
 await expectTextDownload(page,site.getByRole('button',{name:'Pobierz plan .txt'}),'Tarasowy')
 await site.getByRole('button',{name:'Zapisz w przeglądarce'}).click()
 await page.reload()
 await expect(site.locator('.ms-plan-summary')).toContainText('Twój zapisany plan')
})

test('VÉLO configures a bike and restores the saved local selection',async({page})=>{
 await page.goto('/showcase/pl/velo')
 const site=page.locator('.velo-site'),config=site.locator('.v-config-panel')
 await config.getByRole('button',{name:'ALLROAD 02'}).click()
 await config.getByRole('button',{name:'56 cm'}).click()
 await config.getByRole('button',{name:'Surowe srebro'}).click()
 await expect(config.locator('.v-summary-total')).toContainText('16 850')
 await expectTextDownload(page,config.getByRole('button',{name:/Pobierz/}),'Surowe srebro')
 await config.getByRole('button',{name:/Zapisz w przeglądarce/}).click()
 await expect(config.getByRole('status')).toContainText('Zestaw zapisany')
 await page.reload()
 await expect(site.locator('.v-config-panel').getByRole('button',{name:'Surowe srebro'})).toHaveAttribute('aria-pressed','true')
 await expect(site.locator('.v-config-panel').getByRole('button',{name:'ALLROAD 02'})).toHaveAttribute('aria-pressed','true')
})

test('NŌRA completes the three-question personal cosmetic ritual',async({page})=>{
 await page.goto('/showcase/pl/nora')
 const site=page.locator('.nora-site'),quiz=site.locator('.n-routine')
 for(const answer of ['Lekką i wodną','Świeżości i prostoty','2 minuty']){
  await quiz.getByRole('button',{name:answer,exact:true}).click()
  await quiz.getByRole('button',{name:'Dalej →'}).click()
 }
 await expect(quiz.locator('.n-result')).toContainText('Poranek po Twojemu.')
 await expect(quiz.locator('.n-result-step strong')).toHaveText(['Dew Cleanser','Light Lotion','Morning Mist'])
 await quiz.getByRole('button',{name:/Zacznij od nowa/}).click()
 await expect(quiz.getByRole('button',{name:'Lekką i wodną'})).toBeVisible()
})

test('EMBER filters the menu, shows a dish and creates a local visit plan',async({page})=>{
 await page.goto('/showcase/pl/ember')
 const site=page.locator('.ember-site')
 await site.getByRole('group',{name:'Filtruj menu'}).getByRole('button',{name:'Z ognia'}).click()
 await expect(site.locator('.em-dish')).toHaveCount(3)
 await site.getByRole('button',{name:/Kaczka \/ śliwka, 94 zł/}).click()
 const dish=site.getByRole('dialog',{name:'Kaczka / śliwka'})
 await expect(dish).toContainText('Kaczka powoli dopiekana nad żarem')
 await dish.getByRole('button',{name:'Zamknij szczegóły'}).click()
 const visit=site.locator('.em-form')
 const visitDate=await page.evaluate(()=>{
  const date=new Date();date.setDate(date.getDate()+14)
  while(date.getDay()!==3)date.setDate(date.getDate()+1)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
 })
 await visit.getByLabel('Data').fill(visitDate)
 await visit.getByLabel('Godzina').selectOption('19:00')
 await visit.getByLabel('Liczba osób').selectOption('3')
 await visit.getByRole('button',{name:'Utwórz plan wizyty'}).click()
 await expect(visit.getByRole('status')).toContainText('To nie jest rezerwacja stolika.')
})

test('AURA filters destinations, displays an itinerary and saves a private plan',async({page})=>{
 await page.goto('/showcase/pl/aura')
 const site=page.locator('.aura-site')
 await site.getByRole('group',{name:'Filtruj podróże'}).getByRole('button',{name:'Azja'}).click()
 await expect(site.locator('.au-card')).toHaveCount(1)
 await site.getByRole('button',{name:/Japońskie Alpy — zobacz szczegóły/}).click()
 const journey=site.getByRole('dialog',{name:'Japońskie Alpy'})
 await expect(journey.locator('.au-itinerary>div')).toHaveCount(4)
 await journey.getByRole('button',{name:/Zaplanuj tę wyprawę/}).click()
 const plan=site.locator('.au-plan-form'),year=new Date().getFullYear()+1
 await expect(plan.getByLabel('Kierunek')).toHaveValue('japan')
 await plan.getByLabel('Planowany wyjazd').fill(`${year}-06-10`)
 await plan.getByLabel('Podróżujący').selectOption('3')
 await plan.getByRole('button',{name:'Zobacz mój plan'}).click()
 await expect(plan.getByRole('status')).toContainText('Szkic podróży, nie oferta ani rezerwacja.')
 await expectTextDownload(page,plan.getByRole('button',{name:'Pobierz plan .txt'}),'Japońskie Alpy')
 await plan.getByRole('button',{name:'Zapisz w przeglądarce'}).click()
 await page.reload()
 await site.getByRole('button',{name:'Otwórz zapisany plan'}).click()
 await expect(site.locator('.au-plan-form').getByRole('status')).toContainText('Japońskie Alpy')
})

for(const project of projects)test(`English ${project.name} serves its own translated full experience`,async({page})=>{
 const response=await page.goto(`/showcase/en/${project.id}`)
 expect(response?.status()).toBe(200)
 await expect(page.locator(`.${project.id}-site`)).toBeVisible()
 await expect(page.getByRole('heading',{level:1})).toHaveCount(1)
 await expect(page.locator('.project-return a')).toHaveAttribute('href','/en#product')
 await expect(page.locator('.project-disclosure')).toContainText('demonstration')
})

for(const project of projects)test(`mobile ${project.name} fits the viewport and its menu opens and closes`,async({page})=>{
 await page.setViewportSize({width:390,height:844})
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto(`/showcase/pl/${project.id}`)
 await page.evaluate(()=>document.fonts.ready)
 const site=page.locator(`.${project.id}-site`)
 const toggle=site.locator('header button[aria-expanded]')
 await toggle.click()
 await expect(toggle).toHaveAttribute('aria-expanded','true')
 await toggle.click()
 await expect(toggle).toHaveAttribute('aria-expanded','false')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
 expect(errors).toEqual([])
})

test('WebGL failure is explained and still allows real project selection on desktop',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
   if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null
   return Reflect.apply(original,this,[type,...args])
  } as typeof original
 })
 await page.goto('/')
 const viewer=page.locator('.project-showcase')
 await viewer.scrollIntoViewIfNeeded()
 await expect(viewer.locator('.showcase-fallback')).toContainText('przeglądarka nie udostępniła WebGL')
 await viewer.getByRole('group',{name:'Wybór realizacji'}).getByRole('button',{name:/EMBER/}).click()
  await expect(viewer.locator('iframe')).toHaveCount(2)
  for(const frame of await viewer.locator('iframe').all())await expect(frame).toHaveAttribute('src','/showcase/pl/ember?embed=1')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440)
})

test('without JavaScript the portfolio supplies direct links to all six websites',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false})
 try{
  const page=await context.newPage()
  await page.goto('/')
  for(const project of projects)await expect(page.locator('.project-showcase noscript').getByRole('link',{name:project.name,exact:true})).toHaveAttribute('href',`/showcase/pl/${project.id}`)
 }finally{await context.close()}
})
