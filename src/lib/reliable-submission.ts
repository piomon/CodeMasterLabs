/** One user operation, one token, one immutable payload until the outcome is known. */
export type SubmissionReply = { ok: boolean; reference?: string; code?: string; error?: string; fields?: Record<string, string>; status?: number }
export type SubmissionReceipt = { state: 'saved'; reference?: string } | { state: 'missing' }
/** Proof failed before POST: safe to let the user edit and try again. */
export class RequestNotSentError extends Error { constructor() { super('CHALLENGE_UNAVAILABLE'); this.name = 'RequestNotSentError' } }
export class ReliableSubmission<T> {
  private token = ''
  private snapshot: T | undefined
  private uncertain = false
  private flight: Promise<SubmissionReply> | undefined
  constructor(private readonly io: {
    token: () => Promise<string>
    send: (value: T, token: string) => Promise<SubmissionReply>
    recover: (token: string) => Promise<SubmissionReceipt>
    clone: (value: T) => T
    wait?: () => Promise<void>
  }) {}
  get pending(): boolean { return this.uncertain }
  submit(value: T): Promise<SubmissionReply> {
    if (this.flight) return this.flight
    this.flight = this.perform(value).finally(() => { this.flight = undefined })
    return this.flight
  }
  private clear() { this.snapshot = undefined; this.uncertain = false; this.token = '' }
  private async perform(value: T): Promise<SubmissionReply> {
    if (this.uncertain) {
      // No CAPTCHA is needed to recover a DB receipt; no personal content is returned.
      const receipt = await this.io.recover(this.token)
      if (receipt.state === 'saved') { this.clear(); return { ok: true, reference: receipt.reference } }
    }
    if (!this.uncertain || this.snapshot === undefined) this.snapshot = this.io.clone(value)
    if (!this.token) {
      this.token = await this.io.token()
      await (this.io.wait ? this.io.wait() : new Promise<void>(resolve => setTimeout(resolve, 650)))
    }
    const wasUncertain = this.uncertain
    try {
      const reply = await this.io.send(this.snapshot, this.token)
      if (reply.ok) { this.clear(); return reply }
      // A negative answer to a retry cannot prove the original timed-out request never committed.
      if (wasUncertain || (reply.status ?? 503) >= 500 || reply.code === 'IDEMPOTENCY_CONFLICT') this.uncertain = true
      else { this.snapshot = undefined; this.uncertain = false; if (reply.code?.startsWith('TOKEN_')) this.token = '' }
      return reply
    } catch (error) {
      if (error instanceof RequestNotSentError && !wasUncertain) { this.snapshot = undefined; this.uncertain = false }
      else this.uncertain = true
      throw error
    }
  }
}
