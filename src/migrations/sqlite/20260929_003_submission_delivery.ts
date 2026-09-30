import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-sqlite'
// Existing leads are legacy: migration must not send historical mail.
const statements=[
  "ALTER TABLE \"leads\" ADD COLUMN \"notification_status\" text DEFAULT 'pending'",
  "ALTER TABLE \"leads\" ADD COLUMN \"notification_attempts\" numeric DEFAULT 0",
  "ALTER TABLE \"leads\" ADD COLUMN \"notification_next_attempt_at\" text",
  "ALTER TABLE \"leads\" ADD COLUMN \"notification_sent_at\" text",
  "ALTER TABLE \"leads\" ADD COLUMN \"notification_last_error\" text",
  "UPDATE \"leads\" SET \"notification_status\" = 'legacy'",
  "ALTER TABLE \"testimonials\" ADD COLUMN \"submission_key\" text",
  "ALTER TABLE \"testimonials\" ADD COLUMN \"consent_accepted_at\" text",
  "ALTER TABLE \"testimonials\" ADD COLUMN \"consent_version\" text",
  "ALTER TABLE \"_testimonials_v\" ADD COLUMN \"version_submission_key\" text",
  "ALTER TABLE \"_testimonials_v\" ADD COLUMN \"version_consent_accepted_at\" text",
  "ALTER TABLE \"_testimonials_v\" ADD COLUMN \"version_consent_version\" text",
  "CREATE UNIQUE INDEX \"testimonials_submission_key_idx\" ON \"testimonials\" (\"submission_key\")",
  "CREATE INDEX \"_testimonials_v_version_version_submission_key_idx\" ON \"_testimonials_v\" (\"version_submission_key\")",
  "CREATE INDEX \"leads_notification_status_idx\" ON \"leads\" (\"notification_status\")",
  "CREATE INDEX \"leads_notification_next_attempt_at_idx\" ON \"leads\" (\"notification_next_attempt_at\")"
]
export async function up({db}:MigrateUpArgs):Promise<void>{for(const statement of statements)await db.run(sql.raw(statement))}
export async function down(_args:MigrateDownArgs):Promise<void>{throw new Error('Restore a matching verified database and image; destructive down migration is disabled.')}
