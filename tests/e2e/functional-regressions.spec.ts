import { test, expect, type Page } from '@playwright/test'

async function openBuilder(page: Page) {
  await page.goto('/')
  await page.locator('.robot-launcher').click()
  await page.locator('.robot-options button').first().click()
}
async function answer(page: Page, value: string) {
  await page.locator('#robot-answer').fill(value)
  await page.locator('.robot-compose button[type="submit"]').click()
}

test('language switch preserves the journal route', async ({ page }) => {
  await page.goto('/blog')
  await page.locator('.language-switch a[hreflang="en"]').click()
  await expect(page).toHaveURL(/\/en\/blog$/)
  await page.locator('.language-switch a[hreflang="pl"]').click()
  await expect(page).toHaveURL(/\/blog$/)
})

test('brief builder rejects an invalid email at the email step', async ({ page }) => {
  await openBuilder(page)
  await answer(page, 'Synthetic Customer')
  await answer(page, 'first..last@example.test')
  await expect(page.locator('#robot-answer')).toHaveAttribute('type', 'email')
  await expect(page.locator('#robot-field-error')).toBeVisible()
  await expect(page.locator('#robot-answer')).toHaveAttribute('aria-invalid', 'true')
})

test('editing the brief preserves existing answers without sending it', async ({ page }) => {
  await openBuilder(page)
  for (const value of ['Synthetic Customer', 'qa@example.test', 'Synthetic Company', 'We need a private portal for sharing project documents.', 'Next quarter', 'To be agreed']) await answer(page, value)
  await expect(page.locator('.brief-review')).toBeVisible()
  await page.locator('.brief-reset').click()
  await expect(page.locator('#robot-answer')).toHaveValue('Synthetic Customer')
  await page.locator('.robot-compose button[type="submit"]').click()
  await expect(page.locator('#robot-answer')).toHaveValue('qa@example.test')
})

test('corrupted local demo data are preserved rather than silently overwritten', async ({ page }) => {
  const key = 'codemaster:demo:commerce:pl:v1', broken = '{invalid-saved-data'
  await page.addInitScript(({ key, broken }) => localStorage.setItem(key, broken), { key, broken })
  await page.goto('/demos/commerce')
  await expect(page.locator('.workspace-local')).toContainText('Uszkodzony zapis')
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(broken)
  await page.getByRole('button', { name: 'Dodaj do koszyka: Notebook / Graphite' }).click()
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(broken)
})

test('the CMS featured flag controls real homepage content', async ({ page }) => {
  expect(process.env.E2E_DATABASE_IS_DISPOSABLE, 'Only run destructive CMS tests against a disposable local database').toBe('true')
  expect(Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD)).toBe(true)
  const origin = process.env.E2E_BASE_URL || 'http://localhost:3000', headers = { Origin: origin }
  expect((await page.request.post('/api/users/login', { headers, data: { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD } })).status()).toBe(200)
  const title = 'Functional QA featured ' + Date.now(), slug = 'functional-qa-' + Date.now()
  let id: string | undefined
  try {
    const created = await page.request.post('/api/projects?locale=pl', { headers, data: { title, slug, category: 'QA', summary: 'Synthetic functional acceptance case study.', order: -1000, featured: true, concept: true, _status: 'published' } })
    expect(created.status()).toBe(201)
    id = String((await created.json()).doc.id)
    await page.goto('/')
    await expect(page.locator('.showcase-cms').getByRole('link', { name: title })).toBeVisible()
    expect((await page.request.patch(`/api/projects/${id}?locale=pl`, { headers, data: { featured: false } })).status()).toBe(200)
    await page.reload()
    await expect(page.locator('.showcase-cms').getByRole('link', { name: title })).toHaveCount(0)
  } finally {
    if (id) expect((await page.request.delete(`/api/projects/${id}`, { headers })).status()).toBe(200)
  }
})
