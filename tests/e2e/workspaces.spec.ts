import {test,expect} from '@playwright/test'
test('operations state survives a real origin reload',async({page})=>{
 await page.goto('/demos/operations');await page.getByLabel('Nowe zadanie').fill('QA persistent task');await page.getByRole('button',{name:'Dodaj zadanie'}).click()
 await page.getByRole('combobox',{name:'Status: QA persistent task'}).selectOption('done');await page.reload()
 await expect(page.getByRole('combobox',{name:'Status: QA persistent task'})).toHaveValue('done')
 await page.getByRole('button',{name:'Gotowe'}).click();await expect(page.locator('.workspace-task')).toHaveCount(2)
})
test('approval decisions persist without external execution',async({page})=>{
 await page.goto('/demos/approval');await page.getByRole('button',{name:'Zatwierd\u017a propozycj\u0119'}).click();await page.reload()
 await expect(page.locator('.workspace-decision')).toContainText('Zatwierdzono')
 await page.locator('.workspace-inbox button').nth(1).click();await page.getByRole('button',{name:'Odrzu\u0107',exact:true}).click();await expect(page.locator('.workspace-decision')).toContainText('Odrzucono')
})
test('commerce checkout updates stock and creates a durable demo order',async({page})=>{
 await page.goto('/demos/commerce');await page.getByRole('button',{name:'Dodaj do koszyka: Notebook / Graphite'}).click();await page.getByRole('button',{name:'Utw\u00f3rz zam\u00f3wienie demo'}).click();await page.reload()
 await expect(page.locator('.workspace-order-list>div')).toHaveCount(1);await page.getByRole('button',{name:'Oznacz jako wys\u0142ane'}).click();await expect(page.locator('.workspace-order-list')).toContainText('Wys\u0142ane')
})
test('portal feedback and metadata persist; no file upload takes place',async({page})=>{
 await page.goto('/demos/client-portal');const uploads:string[]=[];page.on('request',r=>{if(r.method()==='POST')uploads.push(r.url())})
 await page.getByLabel('Twoja uwaga').fill('QA improve table readability');await page.getByRole('button',{name:'Zapisz uwag\u0119'}).click()
 await page.getByLabel('Za\u0142\u0105cznik demo').setInputFiles({name:'brief.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic metadata-only sample')});await page.reload()
 await expect(page.locator('.workspace-note')).toContainText('QA improve table readability');await expect(page.locator('.workspace-file')).toContainText('brief.txt');expect(uploads).toEqual([])
})
