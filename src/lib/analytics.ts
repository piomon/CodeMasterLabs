export type AnalyticsEvent =
 | 'hero_cta'
 | 'project_open'
 | 'demo_interaction'
 | 'service_select'
 | 'phone_scenario_start'
 | 'phone_scenario_complete'
 | 'assistant_open'
 | 'assistant_complete'
 | 'chat_open'
 | 'chat_complete'
 | 'contact_start'
 | 'contact_submit'
 | 'meeting_click'
 | 'case_study_scroll'

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>

/**
 * Vendor-neutral client event bus. No network requests, cookies, identifiers or
 * PII are emitted here. A consent-aware analytics adapter can subscribe to
 * `codemaster:analytics` later without coupling UI components to one vendor.
 */
export function trackEvent(name: AnalyticsEvent, data: AnalyticsPayload = {}) {
 if (typeof window !== 'undefined') {
  window.dispatchEvent(new CustomEvent('codemaster:analytics', { detail: { name, ...data } }))
 }
}
