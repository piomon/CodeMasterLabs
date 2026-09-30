import type { EmailAdapter } from 'payload'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

/** Payload expects a synchronous factory. SMTP is initialized only when sending,
 * never during config evaluation/build. Password-reset links are not logged. */
export const emailAdapter: EmailAdapter = ({ payload }) => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  let adapterPromise: Promise<EmailAdapter> | undefined
  return {
    name: SMTP_HOST ? 'codemaster-smtp' : 'smtp-not-configured',
    defaultFromName: 'CodeMaster',
    defaultFromAddress: SMTP_FROM || 'noreply@localhost.invalid',
    async sendEmail(message) {
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        throw new Error('Configure SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM to send email.')
      }

      const port = Number(process.env.SMTP_PORT || 587)

      if (port !== 465 && port !== 587) {
        throw new Error('Encrypted SMTP requires port 465 or 587.')
      }

      adapterPromise ??= nodemailerAdapter({
        defaultFromName: 'CodeMaster',
        defaultFromAddress: SMTP_FROM,
        skipVerify: true,
        transport: nodemailer.createTransport({
          host: SMTP_HOST,
          port,
          secure: port === 465,
          requireTLS: port === 587,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 20000,
          tls: {
            rejectUnauthorized: true,
          },
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        }),
      }).catch((error: unknown) => {
        adapterPromise = undefined
        throw error
      })

      const adapter = await adapterPromise
      return adapter({ payload }).sendEmail(message)
    },
  }
}
