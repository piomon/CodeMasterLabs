import {test,expect} from '@playwright/test'
const credentials=()=>({email:process.env.E2E_ADMIN_EMAIL,password:process.env.E2E_ADMIN_PASSWORD})
test.beforeEach(()=>{
 if(process.env.E2E_REQUIRE_PERSISTENCE==='true')expect(Boolean(credentials().email&&credentials().password)).toBe(true)
 expect(Boolean(process.env.E2E_ADMIN_EMAIL&&process.env.E2E_ADMIN_PASSWORD),'Disposable acceptance administrator is required; tests must not skip').toBe(true)
})
test('authenticated CMS dashboard actually renders',async({page})=>{
 const origin=process.env.E2E_BASE_URL||'http://localhost:3000',errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 expect((await page.request.post('/api/users/login',{headers:{Origin:origin},data:credentials()})).status()).toBe(200)
 const response=await page.goto('/admin');expect(response?.status()).toBe(200)
 await expect(page.locator('a[href="/admin/collections/leads"]').first()).toBeVisible();expect(errors).toEqual([])
})
test('CMS edit is visible on the public homepage and can be restored',async({page})=>{
 const origin=process.env.E2E_BASE_URL||'http://localhost:3000',client=page.request
 expect((await client.post('/api/users/login',{headers:{Origin:origin},data:credentials()})).status()).toBe(200)
 const existing=await (await client.get('/api/globals/site-settings?locale=pl')).json(),value='Synthetic acceptance: one process, one system.'
 try{
  expect((await client.post('/api/globals/site-settings?locale=pl',{headers:{Origin:origin},data:{heroLead:value}})).status()).toBe(200)
  await page.goto('/');await expect(page.locator('.hero-lead')).toHaveText(value)
 }finally{await client.post('/api/globals/site-settings?locale=pl',{headers:{Origin:origin},data:{heroLead:existing.heroLead}})}
})
