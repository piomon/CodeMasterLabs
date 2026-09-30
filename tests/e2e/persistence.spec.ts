import {test,expect} from '@playwright/test'
test('simplified contact form saves a real lead without optional fields',async({page,playwright})=>{
 if(process.env.E2E_REQUIRE_PERSISTENCE==='true')expect(Boolean(process.env.E2E_ADMIN_EMAIL&&process.env.E2E_ADMIN_PASSWORD)).toBe(true)
 expect(Boolean(process.env.E2E_ADMIN_EMAIL&&process.env.E2E_ADMIN_PASSWORD),'Disposable acceptance administrator is required; tests must not skip').toBe(true)
 const baseURL=process.env.E2E_BASE_URL||'http://localhost:3000'
 const loginClient=await playwright.request.newContext({baseURL})
 let admin:typeof loginClient|undefined,leadID:string|undefined
 try{
  const login=await loginClient.post('/api/users/login',{headers:{Origin:baseURL},data:{email:process.env.E2E_ADMIN_EMAIL,password:process.env.E2E_ADMIN_PASSWORD}})
  expect(login.status()).toBe(200)
  const {token}=await login.json()
  admin=await playwright.request.newContext({baseURL,extraHTTPHeaders:{Authorization:`JWT ${token}`}})
  await page.goto('/kontakt')
  const form=page.locator('.concise-form')
  await form.locator('[name=name]').fill('Contact Acceptance')
  await form.locator('[name=email]').fill('simple-form@example.test')
  await form.locator('[name=message]').fill('Synthetic UI acceptance test for the simplified contact form.')
  await form.locator('[name=privacyAccepted]').check()
  // The public endpoint intentionally rejects submissions within 600 ms.
  await page.waitForTimeout(750)
  const response=page.waitForResponse(r=>r.url().endsWith('/api/contact')&&r.request().method()==='POST')
  await form.getByRole('button',{name:'Wyślij wiadomość'}).click()
  const reply=await response
  expect(reply.status()).toBe(200)
  const result=await reply.json()
  leadID=String(result.reference)
  await expect(page.locator('.contact-success')).toContainText('Dziękujemy za wiadomość.')
  const stored=await admin.get(`/api/leads/${leadID}`)
  expect(stored.status()).toBe(200)
  const doc=await stored.json()
  expect(doc.email).toBe('simple-form@example.test')
  expect(doc.topic).toBe('unknown')
 }finally{
  if(leadID)await admin?.delete(`/api/leads/${leadID}`,{headers:{Origin:baseURL}})
  await admin?.dispose();await loginClient.dispose()
 }
})
/** Run only against a disposable database, with an account created using the local CLI.
 * No credentials are stored in the test file, trace or storage state. */
test('real database: lead, private attachment and idempotent retry',async({playwright})=>{
 if(process.env.E2E_REQUIRE_PERSISTENCE==='true')expect(Boolean(process.env.E2E_ADMIN_EMAIL&&process.env.E2E_ADMIN_PASSWORD)).toBe(true)
 expect(Boolean(process.env.E2E_ADMIN_EMAIL&&process.env.E2E_ADMIN_PASSWORD),'Disposable acceptance administrator is required; tests must not skip').toBe(true)
  const baseURL=process.env.E2E_BASE_URL||'http://localhost:3000',publicClient=await playwright.request.newContext({baseURL}),loginClient=await playwright.request.newContext({baseURL})
  let admin:typeof loginClient|undefined
 let leadID:string|undefined,fileID:string|undefined
 try{
   const login=await loginClient.post('/api/users/login',{headers:{Origin:baseURL},data:{email:process.env.E2E_ADMIN_EMAIL,password:process.env.E2E_ADMIN_PASSWORD}});expect(login.status()).toBe(200)
   const {token:adminToken}=await login.json();expect(typeof adminToken).toBe('string')
   admin=await playwright.request.newContext({baseURL,extraHTTPHeaders:{Authorization:`JWT ${adminToken}`}})
  const tokenReply=await publicClient.get('/api/contact-token');expect(tokenReply.status()).toBe(200);const {token}=await tokenReply.json();await new Promise(resolve=>setTimeout(resolve,650))
  const payload={'cf-turnstile-response':'XXXX.DUMMY.TOKEN.XXXX',name:'Acceptance Test',email:'acceptance@example.test',message:'Synthetic acceptance test: project documents and approvals.',topic:'system',privacyAccepted:'true',locale:'en',source:'contact',website:'',attachment:{name:'brief.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic acceptance test. No personal data.')}}
  const headers={Origin:baseURL,'X-Form-Token':token},reply=await publicClient.post('/api/contact',{headers,multipart:payload});expect(reply.status()).toBe(200);const first=await reply.json();expect(first.ok).toBe(true);leadID=String(first.reference)
  const retry=await publicClient.post('/api/contact',{headers,multipart:payload});expect((await retry.json()).reference).toBe(first.reference)
  const stored=await admin.get(`/api/leads/${leadID}`);expect(stored.status()).toBe(200);const doc=await stored.json();expect(doc.email).toBe('acceptance@example.test');expect(doc.message).toBe(payload.message)
  fileID=String(typeof doc.attachment==='object'?doc.attachment.id:doc.attachment);const privateDoc=await admin.get(`/api/private-files/${fileID}`);expect(privateDoc.status()).toBe(200);const file=await privateDoc.json()
  expect([401,403]).toContain((await publicClient.get(file.url)).status());expect((await admin.get(file.url)).status()).toBe(200)
 }finally{
   if(leadID)await admin?.delete(`/api/leads/${leadID}`,{headers:{Origin:baseURL}})
   if(fileID)await admin?.delete(`/api/private-files/${fileID}`,{headers:{Origin:baseURL}})
   await publicClient.dispose();await admin?.dispose();await loginClient.dispose()
 }
})
