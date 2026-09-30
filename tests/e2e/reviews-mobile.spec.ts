import {
  test,
  expect,
} from '@playwright/test'

for(
  const width of
    [390,820,1024]
){

  test(
    `static devices at ${width} have no WebGL or boot sequence`,
    async({
      page,
    })=>{

      await page.setViewportSize({
        width,
        height:900,
      })

      await page.goto('/')

      await expect(
        page.locator(
          '.static-devices',
        ),
      ).toHaveAttribute(
        'data-renderer',
        'static',
      )

      await page
        .locator(
          '.static-devices',
        )
        .scrollIntoViewIfNeeded()

      await expect(
        page.locator(
          '.static-devices .project-frame-loading',
        ),
      ).toHaveCount(
        0,
        {
          timeout:30000,
        },
      )

      await expect(
        page.locator(
          '.device-webgl,.device-boot,.device-loading',
        ),
      ).toHaveCount(0)

      await expect(
        page.locator(
          'html',
        ),
      ).toHaveAttribute(
        'data-motion',
        'off',
      )

      await page
        .getByRole(
          'group',
          {
            name:
              'Wybór realizacji',
          },
        )
        .getByRole(
          'button',
          {
            name:/MAISON/,
          },
        )
        .click()

      for(
        const frame of
          await page
            .locator(
              '.static-devices iframe',
            )
            .all()
      ){

        await expect(
          frame,
        ).toHaveAttribute(
          'src',
          '/showcase/pl/maison?embed=1',
        )
      }

      expect(
        await page.evaluate(
          ()=>
            document
              .documentElement
              .scrollWidth,
        ),
      ).toBeLessThanOrEqual(
        width,
      )

      await page
        .getByRole(
          'group',
          {
            name:
              'Wybierz historię',
          },
        )
        .getByRole(
          'button',
          {
            name:
              'Mniej ręcznej pracy',
          },
        )
        .click()

      await expect(
        page.locator(
          '.imessage-transcript',
        ),
      ).toContainText(
        'Przepisujemy zamówienia',
      )

      await expect(
        page.locator(
          '.review-examples',
        ),
      ).toHaveCount(0)

      await expect(
        page.getByText(
          'Poniższe opinie są wymyślone',
        ),
      ).toHaveCount(0)
    },
  )
}

test(
  'real reviews stay protected in storage while carousel and analytics use published ratings',
  async({
    page,
    playwright,
    baseURL,
  })=>{

    expect(
      Boolean(
        process.env.E2E_ADMIN_EMAIL &&
        process.env.E2E_ADMIN_PASSWORD,
      ),
      'Disposable acceptance administrator is required; tests must not skip',
    ).toBe(true)

    const client=
      await playwright
        .request
        .newContext({
          baseURL,
        })

    const login=
      await client.post(
        '/api/users/login',
        {
          headers:{
            Origin:
              baseURL!,
          },

          data:{
            email:
              process.env
                .E2E_ADMIN_EMAIL,

            password:
              process.env
                .E2E_ADMIN_PASSWORD,
          },
        },
      )

    expect(
      login.ok(),
    ).toBe(true)

    const {
      token,
    }=
      await login.json()

    const admin=
      await playwright
        .request
        .newContext({
          baseURL,

          extraHTTPHeaders:{
            Authorization:
              `JWT ${token}`,

            Origin:
              baseURL!,
          },
        })

    let id:
      number|undefined

    try{

      await page.goto('/')

      await expect(
        page.getByText(
          'Przykładowy wygląd opinii',
        ),
      ).toHaveCount(0)

      await expect(
        page.getByText(
          'Publikujemy opinie po moderacji',
        ),
      ).toHaveCount(0)

      await page
        .getByRole(
          'button',
          {
            name:
              'Dodaj opinię',
          },
        )
        .click()

      const form=
        page.locator(
          '.review-submit form',
        )

      await form
        .locator(
          '[name=name]',
        )
        .fill(
          'Synthetic customer acceptance',
        )

      await form
        .locator(
          '[name=quote]',
        )
        .fill(
          'Synthetic test review created solely for disposable database acceptance and analytics verification.',
        )

      await form
        .locator(
          '[name=rating]',
        )
        .selectOption(
          '4',
        )

      await form
        .locator(
          '[name=consent]',
        )
        .check()

      await form
        .getByRole(
          'button',
          {
            name:
              'Wyślij opinię',
          },
        )
        .click()

      await expect(
        page.locator(
          '.review-submit',
        ),
      ).toContainText(
        'Opinia została wysłana',
      )

      const stored=
        await (
          await admin.get(
            '/api/testimonials?draft=true&where[name][equals]=Synthetic%20customer%20acceptance',
          )
        ).json()

      id=
        stored.docs[0].id

      expect(
        stored.docs[0]._status,
      ).toBe(
        'draft',
      )

      expect(
        stored.docs[0].rating,
      ).toBe(4)

      let publicData=
        await (
          await client.get(
            '/api/reviews',
          )
        ).json()

      expect(
        publicData.reviews.some(
          (
            review:{
              id:number
            },
          )=>
            review.id===id,
        ),
      ).toBe(false)

      expect(
        (
          await client.patch(
            `/api/testimonials/${id}`,
            {
              data:{
                _status:
                  'published',
              },
            },
          )
        ).ok(),
      ).toBe(false)

      expect(
        (
          await admin.patch(
            `/api/testimonials/${id}`,
            {
              data:{
                _status:
                  'published',
              },
            },
          )
        ).ok(),
      ).toBe(true)

      publicData=
        await (
          await client.get(
            '/api/reviews',
          )
        ).json()

      expect(
        publicData.reviews.some(
          (
            review:{
              id:number
            },
          )=>
            review.id===id,
        ),
      ).toBe(true)

      expect(
        publicData.ratingCount,
      ).toBeGreaterThanOrEqual(
        1,
      )

      expect(
        publicData.distribution[
          '4'
        ],
      ).toBeGreaterThanOrEqual(
        1,
      )

      expect(
        publicData.averageRating,
      ).toBeGreaterThanOrEqual(
        1,
      )

      expect(
        publicData.averageRating,
      ).toBeLessThanOrEqual(
        5,
      )

      await page.reload()

      await expect(
        page.locator(
          '.reviews-carousel',
        ),
      ).toBeVisible()

      await expect(
        page.locator(
          '.reviews-carousel',
        ),
      ).toContainText(
        'Synthetic customer acceptance',
      )

      await page
        .getByRole(
          'button',
          {
            name:
              'Zobacz wszystkie opinie i statystyki',
          },
        )
        .click()

      await expect(
        page.locator(
          '.reviews-insights',
        ),
      ).toBeVisible()

      await expect(
        page.locator(
          '.reviews-rating-bars',
        ),
      ).toBeVisible()

      await expect(
        page.locator(
          '.review-all-grid',
        ),
      ).toContainText(
        'Synthetic customer acceptance',
      )

      await page
        .getByRole(
          'group',
          {
            name:
              'Filtr ocen',
          },
        )
        .getByRole(
          'button',
          {
            name:
              '4 ★',
          },
        )
        .click()

      await expect(
        page.locator(
          '.review-all-grid',
        ),
      ).toContainText(
        'Synthetic customer acceptance',
      )

      await expect(
        page.getByText(
          'DEMO · NIE JEST OPINIĄ KLIENTA',
        ),
      ).toHaveCount(0)

      await expect(
        page.getByText(
          'Nie opublikowano jeszcze opinii',
        ),
      ).toHaveCount(0)

      expect(
        (
          await admin.patch(
            `/api/testimonials/${id}?draft=false`,
            {
              data:{
                _status:
                  'draft',
              },
            },
          )
        ).ok(),
      ).toBe(true)

      publicData=
        await (
          await client.get(
            '/api/reviews',
          )
        ).json()

      expect(
        publicData.reviews.some(
          (
            review:{
              id:number
            },
          )=>
            review.id===id,
        ),
      ).toBe(false)

    }finally{

      if(id){
        await admin.delete(
          `/api/testimonials/${id}`,
        )
      }

      await admin.dispose()
      await client.dispose()
    }
  },
)
