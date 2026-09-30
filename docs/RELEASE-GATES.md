# Release gates - generated from actual local execution

Generated UTC: 2026-09-29T09:30:05.104940+00:00

**COMMERCIAL_RELEASE_READY = FALSE**

No PASS below represents an unexecuted provider, Docker or full-framework test. Command output is retained in the indicated file. Local component test scope is intentionally narrower than mandatory production acceptance.

| CHECK | STATUS | COMMAND / EVIDENCE | REPORT FILE |
|---|---|---|---|
| unit-tests | PASS | `node --test tests/audit-20260929.test.cjs tests/estate-csv.test.cjs tests/estate-state.test.cjs tests/hardening.test.cjs tests/security.test.cjs` - All existing and new dependency-independent Node tests, using TypeScript transpilation; mocks are not live providers. | reports/verification/unit-tests.log |
| python-tests | PASS | `/opt/pyvenv/bin/python3 -m unittest discover -s tests/vps -v` - Host-operation component tests and actual synthetic SQLite schema/backup extraction; no Docker/VPS operations. | reports/verification/python-tests.log |
| source-syntax | PASS | `node scripts/check-source.cjs` - TypeScript syntax transpilation/local imports, not dependency-aware typechecking. | reports/verification/source-syntax.log |
| domain-typecheck | PASS | `tsc --project tsconfig.domain.json --typeRoots /opt/nvm/versions/node/v22.16.0/lib/node_modules/ts-node/node_modules/@types` - Strict domain-only tsconfig; this is NOT the complete Next/Payload app typecheck. | reports/verification/domain-typecheck.log |
| shell-syntax | PASS | `bash -c for file in INSTALL-VPS.sh UPDATE-SECURITY.sh; do bash -n "$file" \|\| exit; done` - Installer POSIX shell syntax only. | reports/verification/shell-syntax.log |
| python-syntax | PASS | `/opt/pyvenv/bin/python3 -m py_compile vps/manage.py vps/update_security.py scripts/secret-scan.py scripts/verify-local.py` - Python source compilation only. | reports/verification/python-syntax.log |
| node-syntax-audit-policy | PASS | `node --check docker/audit-policy.mjs` - JavaScript parse only. | reports/verification/node-syntax-audit-policy.log |
| node-syntax-env-validation | PASS | `node --check docker/env-validation.mjs` - JavaScript parse only. | reports/verification/node-syntax-env-validation.log |
| node-syntax-production-preflight | PASS | `node --check docker/production-preflight.mjs` - JavaScript parse only. | reports/verification/node-syntax-production-preflight.log |
| node-syntax-audit-dependencies | PASS | `node --check scripts/audit-dependencies.mjs` - JavaScript parse only. | reports/verification/node-syntax-audit-dependencies.log |
| node-syntax-check-source | PASS | `node --check scripts/check-source.cjs` - JavaScript parse only. | reports/verification/node-syntax-check-source.log |
| node-syntax-operator | PASS | `node --check scripts/operator.mjs` - JavaScript parse only. | reports/verification/node-syntax-operator.log |
| node-syntax-prepare-migrations | PASS | `node --check scripts/prepare-migrations.mjs` - JavaScript parse only. | reports/verification/node-syntax-prepare-migrations.log |
| node-syntax-release-manifest | PASS | `node --check scripts/release-manifest.mjs` - JavaScript parse only. | reports/verification/node-syntax-release-manifest.log |
| node-syntax-resolve-lock | PASS | `node --check scripts/resolve-lock.mjs` - JavaScript parse only. | reports/verification/node-syntax-resolve-lock.log |
| node-syntax-setup | PASS | `node --check scripts/setup.mjs` - JavaScript parse only. | reports/verification/node-syntax-setup.log |
| node-syntax-verify-release | PASS | `node --check scripts/verify-release.mjs` - JavaScript parse only. | reports/verification/node-syntax-verify-release.log |
| secret-pattern-scan | PASS | `/opt/pyvenv/bin/python3 scripts/secret-scan.py` - Current-source strong token/private-key patterns, no comprehensive history or entropy audit. | reports/verification/secret-pattern-scan.log |
| npm-ci-offline-attempt | FAIL | `npm ci --offline --ignore-scripts --no-fund --audit=false` - Diagnostic only: there is no resolved updated root lock or cached dependencies. Failure blocks commercial release. | reports/verification/npm-ci-offline-attempt.log |
| npm-registry-connectivity | FAIL | `curl --head --max-time 5 https://registry.npmjs.org/` - Actual environment network reachability; not an npm install test. | reports/verification/npm-registry-connectivity.log |
| docker-engine | NOT_RUN | `docker version` - Docker executable/daemon unavailable in preparation environment. | local-verification.json |
| repository-provenance | NOT_RUN | Uploaded archive hash recorded. No authorized repository fetch or commit created; repository alignment is an owner handoff task. | reports/verification/local-verification.json / docs/AUDIT.md |
| independent-full-manual-audit | NOT_RUN | Multi-pass focused review and automated full-source checks performed. Not an independently certified line-by-line security audit. | reports/verification/local-verification.json / docs/AUDIT.md |
| updated-root-lockfile | FAIL | No honest Payload 3.90.2 resolved lock could be generated without npm access; explicit bootstrap supplied. | reports/verification/local-verification.json / docs/AUDIT.md |
| clean-linux-npm-ci | NOT_RUN | Offline diagnostic failed; no successful clean installation. | reports/verification/local-verification.json / docs/AUDIT.md |
| installed-dependency-security-audit | NOT_RUN | Both production and complete dependency graphs must be audited after actual resolution. Critical/High/Moderate block acceptance; counts are unknown, not zero. | reports/verification/local-verification.json / docs/AUDIT.md |
| generated-payload-types-importmap | NOT_RUN | Build regenerates both; framework dependencies unavailable here. | reports/verification/local-verification.json / docs/AUDIT.md |
| actual-payload-fresh-migration | NOT_RUN | Raw SQLite component tests are not the Payload runner. | reports/verification/local-verification.json / docs/AUDIT.md |
| actual-payload-upgrade-migration | NOT_RUN | Previous real installation upgrade/schema comparison not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| failed-payload-migration-release-stop | NOT_RUN | SQLite transaction unit test only; no real runner failure injection. | reports/verification/local-verification.json / docs/AUDIT.md |
| eslint | NOT_RUN | npm run lint is required during Docker build. | reports/verification/local-verification.json / docs/AUDIT.md |
| full-app-typecheck | NOT_RUN | Domain-only result does not establish Next/Payload type correctness. | reports/verification/local-verification.json / docs/AUDIT.md |
| production-build | NOT_RUN | Next/Payload npm dependencies unavailable. | reports/verification/local-verification.json / docs/AUDIT.md |
| full-source-release-verify | NOT_RUN | Requires dependencies, ClamAV, qpdf, browser and remote challenge test service. | reports/verification/local-verification.json / docs/AUDIT.md |
| docker-build | NOT_RUN | No Docker engine. | reports/verification/local-verification.json / docs/AUDIT.md |
| final-image-vulnerability-scan | NOT_RUN | App, ops and ClamAV scanning implemented, not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| sbom-final-image | NOT_RUN | Installer generates dependency SBOM and per-image CycloneDX SBOM for app, ops and ClamAV only after actual builds/scans. | reports/verification/local-verification.json / docs/AUDIT.md |
| exact-container-health | NOT_RUN | No Docker engine. | reports/verification/local-verification.json / docs/AUDIT.md |
| exact-container-full-e2e | NOT_RUN | No Docker engine; no skipped/flaky tests are accepted by installer. | reports/verification/local-verification.json / docs/AUDIT.md |
| admin-auth-and-registration | NOT_RUN | Source controls and test definitions present; runtime auth not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| private-data-draft-access | NOT_RUN | Requires real CMS API and authenticated/anonymous sessions. | reports/verification/local-verification.json / docs/AUDIT.md |
| real-contact-ui-and-idempotency | NOT_RUN | Browser integration not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| real-turnstile | NOT_RUN | Contract tests do not prove Cloudflare/browser/domain integration. | reports/verification/local-verification.json / docs/AUDIT.md |
| real-attachment-validation | NOT_RUN | Requires full live upload endpoint, qpdf, Sharp and malware engine. | reports/verification/local-verification.json / docs/AUDIT.md |
| real-clamav-malware-scan | NOT_RUN | Protocol peers tested; real ClamAV/EICAR not run. | reports/verification/local-verification.json / docs/AUDIT.md |
| smtp-reset-delivery | NOT_RUN | Real account, inbox receipt and reset link are missing. | reports/verification/local-verification.json / docs/AUDIT.md |
| lead-email-delivery | NOT_RUN | Implementation exists; real mail flow not verified. | reports/verification/local-verification.json / docs/AUDIT.md |
| spf-dkim-dmarc | NOT_RUN | Real domain mail authentication not inspected. | reports/verification/local-verification.json / docs/AUDIT.md |
| nginx-tls-public-network | NOT_RUN | No actual domain/VPS configuration here. | reports/verification/local-verification.json / docs/AUDIT.md |
| browser-csp-security-headers | NOT_RUN | Source configuration only, no browser enforcement test. | reports/verification/local-verification.json / docs/AUDIT.md |
| sitemap-robots-canonical-pl-en | NOT_RUN | Real production-like HTTP acceptance required. | reports/verification/local-verification.json / docs/AUDIT.md |
| mobile-webgl-regression | NOT_RUN | Existing full suite retained; prior WebGL flake not reproduced or proven fixed. | reports/verification/local-verification.json / docs/AUDIT.md |
| axe-critical-serious | NOT_RUN | Axe tests added but not executed in browser. | reports/verification/local-verification.json / docs/AUDIT.md |
| manual-keyboard-zoom-320px | NOT_RUN | Manual browser accessibility checks not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| performance-lcp-cls-inp | NOT_RUN | No real production-like performance measurements. | reports/verification/local-verification.json / docs/AUDIT.md |
| editorial-cache-preview-freshness | NOT_RUN | No newly proven cache invalidation or preview freshness optimization. | reports/verification/local-verification.json / docs/AUDIT.md |
| full-app-backup | NOT_RUN | Synthetic SQLite archive tests pass; actual host backup not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| full-app-restore | NOT_RUN | Matching image/database/media/private authenticated restore not executed. | reports/verification/local-verification.json / docs/AUDIT.md |
| staging-rollback | NOT_RUN | Automatic recovery code not tested on staging. | reports/verification/local-verification.json / docs/AUDIT.md |
| encrypted-offsite-backup | NOT_RUN | Actual remote storage account/repository not configured. | reports/verification/local-verification.json / docs/AUDIT.md |
| separate-secret-recovery | NOT_RUN | No owner secrets manager/recovery bundle exists in this environment. | reports/verification/local-verification.json / docs/AUDIT.md |
| external-uptime-alert | NOT_RUN | Requires independent provider and confirmed notification. | reports/verification/local-verification.json / docs/AUDIT.md |
| error-monitoring-pii-redaction | NOT_RUN | Generic host alerts do not implement verified application error monitoring/redaction. | reports/verification/local-verification.json / docs/AUDIT.md |
| cleanup-retention-live | NOT_RUN | Timers and opt-in closed-lead retention implemented, not executed on host. | reports/verification/local-verification.json / docs/AUDIT.md |
| ci-execution | NOT_RUN | YAML supplied but no GitHub workflow run. | reports/verification/local-verification.json / docs/AUDIT.md |
| branch-protection | NOT_RUN | No authorized repository administration was performed. | reports/verification/local-verification.json / docs/AUDIT.md |
| signed-image-promotion | NOT_RUN | No registry signing/promotion integration configured. | reports/verification/local-verification.json / docs/AUDIT.md |
| original-git-history-secret-scan | NOT_RUN | Current uploaded VPS ZIP has no Git history. Token reported in the earlier large archive requires owner revocation and a separate historical audit. | reports/verification/local-verification.json / docs/AUDIT.md |
| privacy-owner-legal-review | NOT_RUN | No fabricated company data or privacyReviewed approval. | reports/verification/local-verification.json / docs/AUDIT.md |
| asset-rights-clearance | NOT_RUN | Complete path/hash inventory provided; source/license proofs incomplete. | reports/verification/local-verification.json / docs/AUDIT.md |

Archive/input SHA256 and file hashes are recorded in RELEASE.json and SHA256SUMS.txt. No Git packaging commit or remote-main verification is claimed. Docker image digest: NOT_RUN. Last complete application restore date: NOT_RUN. Synthetic SQLite extraction tests are not substituted for it.

Accepted residual risks: none accepted on the owner's behalf. Unresolved requirements remain blockers or unverified gates.
