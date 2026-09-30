import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('unused GraphQL and public registration are closed',async({request})=>{
 const query=await request.post('/api/graphql',{data:{query:'{__schema{queryType{name}}}'}})
 expect([403,404,405]).toContain(query.status())
 expect((await request.post('/api/users/first-register',{data:{email:'nobody@example.test',password:'NotARealPassword'}})).status()).toBe(403)
 for(const collection of ['users','leads','private-files','form-attempts'])expect([401,403]).toContain((await request.get(`/api/${collection}`)).status())
})
test('a direct non-browser contact request without a challenge is rejected',async({request,baseURL})=>{
 const token=await (await request.get('/api/contact-token')).json()
 await new Promise(resolve=>setTimeout(resolve,600))
 const reply=await request.post('/api/contact',{headers:{Origin:baseURL!,'X-Form-Token':token.token},multipart:{name:'Synthetic Test',email:'test@example.test',message:'A synthetic request that must be refused without a challenge.',topic:'system',privacyAccepted:'true'}})
 expect(reply.status()).toBe(403)
})
for(const route of ['/','/uslugi','/realizacje','/blog','/kontakt'])test(`accessibility has no serious/critical violations: ${route}`,async({page})=>{
 await page.goto(route)
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
 expect(result.violations.filter(v=>v.impact==='critical'||v.impact==='serious')).toEqual([])
})
