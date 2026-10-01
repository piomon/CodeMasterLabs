import {
 test,
 expect,
} from '@playwright/test'

test(
 'mobile keeps premium motion for hero, devices, projects and iMessage',
 async({page})=>{
  test.setTimeout(90000)

  await page.setViewportSize({
   width:390,
   height:844,
  })

  await page.goto('/')

  const hero=
   page.locator(
    '.hero.cosmic-hero'
   )

  await expect(
   hero.locator(
    '[data-animated-copy="led-power"]'
   )
  ).toBeVisible()

  const stage=
   hero.locator(
    '.particle-stage'
   )

  await expect(
   stage
  ).toHaveAttribute(
   'data-particles',
   'ready',
   {
    timeout:15000,
   }
  )

  await expect.poll(
   async()=>
    Number(
     await stage
      .locator('canvas')
      .getAttribute(
       'data-count'
      )
     ||0
    ),
   {
    timeout:15000,
   }
  ).toBeGreaterThan(30)

  const showcase=
   page.locator(
    '.project-showcase'
   )

  await showcase
   .scrollIntoViewIfNeeded()

  await expect(
   showcase
  ).toHaveAttribute(
   'data-project-autoplay',
   'on',
  )

  const devices=
   showcase.locator(
    '.static-devices'
   )

  await expect(
   devices
  ).toHaveAttribute(
   'data-renderer',
   'static',
  )

  await expect(
   devices
  ).toHaveAttribute(
   'data-device-opened',
   'true',
   {
    timeout:5000,
   }
  )

  const firstProject=
   await showcase.getAttribute(
    'data-project'
   )

  await expect.poll(
   async()=>
    await showcase.getAttribute(
     'data-project'
    ),
   {
    timeout:15000,
   }
  ).not.toBe(
   firstProject
  )

  const phone=
   page.locator(
    '.imessage-presentation'
   )

  await phone
   .scrollIntoViewIfNeeded()

  await expect(
   phone
  ).toHaveAttribute(
   'data-autoplay',
   'on',
  )

  const stories=
   phone.locator(
    '.conversation-stories button'
   )

  await expect(
   stories
  ).toHaveCount(4)

  /*
   * Restart story 0 deliberately.
   * The old test observed a running carousel and incorrectly assumed
   * the visible count could never reset when the next story started.
   */
  await stories
   .first()
   .click()

  await expect(
   phone
  ).toHaveAttribute(
   'data-story',
   '0',
  )

  const transcript=
   phone.locator(
    '.imessage-transcript'
   )

  await expect.poll(
   async()=>
    Number(
     await transcript.getAttribute(
      'data-visible-count'
     )
     ||0
    ),
   {
    timeout:2500,
   }
  ).toBeLessThanOrEqual(1)

  await expect(
   phone.locator(
    '.imessage-typing'
   )
  ).toBeVisible({
   timeout:6000,
  })

  await expect.poll(
   async()=>
    Number(
     await transcript.getAttribute(
      'data-visible-count'
     )
     ||0
    ),
   {
    timeout:9000,
   }
  ).toBeGreaterThan(1)

  /*
   * nextStory always selects another story, so this verifies
   * the automatic conversation rotation as well.
   */
  await expect.poll(
   async()=>
    await phone.getAttribute(
     'data-story'
    ),
   {
    timeout:38000,
   }
  ).not.toBe('0')
 }
)
