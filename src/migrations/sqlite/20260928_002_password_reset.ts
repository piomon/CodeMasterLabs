import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-sqlite'
// Schema-only migration. No records from the uploaded development database.
const statements=[
  "ALTER TABLE \"users\" ADD COLUMN \"reset_password_requested_at\" text"
]
export async function up({db}:MigrateUpArgs):Promise<void>{for(const statement of statements)await db.run(sql.raw(statement))}
export async function down(_args:MigrateDownArgs):Promise<void>{throw new Error('Destructive schema rollback is disabled. Restore the matching verified backup and image instead.')}
