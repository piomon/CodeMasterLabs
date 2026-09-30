# postgres migrations

Provider-specific migration directory. This delivery contains no fabricated schema migrations.

After installing the pinned Payload dependencies, generate the initial migration with `npm run migrations:prepare` against this provider; review and commit it. Apply it to a fresh target using `npm run migrate`. Do not apply an initial migration to a database previously initialized with development schema push. Subsequent schema changes require reviewed, versioned migrations and a tested backup/restore plan.
