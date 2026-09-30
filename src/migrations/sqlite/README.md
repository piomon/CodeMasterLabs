# SQLite migrations — source release 2.2.0

001 and 002 are retained from the input source. The original authors described 001 as schema-only reconstruction, with no user records; 002 adds the password-reset field for the Payload upgrade. That provenance is not a newly executed framework migration.

003 (`20260929_003_submission_delivery`) adds notification delivery state/indexes, review idempotency, private consent evidence and versioned review fields. Existing leads are marked legacy to avoid sending historical notifications. Nullable unique review keys allow editorial testimonials without a public submission token.

SQL and TypeScript statement lists are checked for parity. Local Python tests actually apply SQL to synthetic SQLite databases, verify old-row upgrades, uniqueness and integrity. **The real Payload runner and generated-schema compatibility with installed Payload 3.90.2 have NOT been executed here.** Build regenerates types/import maps; full migration acceptance remains required.

First run `npm run migrate` on an empty disposable database. Do not apply the initial migration to an arbitrary development-push database. Existing migration history, release source and backup manifests must be explicitly reconciled. An unversioned or older manually deployed database is not automatically compatible.

Do not use destructive migrate:down for recovery. Restore the matching database/files and retained image through the guarded operator procedure. No Drizzle snapshot was fabricated: future migrations require the real installed CLI on a disposable clone, reviewed generated SQL and a committed genuine snapshot.
