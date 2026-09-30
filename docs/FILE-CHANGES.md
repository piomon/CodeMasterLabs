# Zmiany plik po pliku — 2.2.0

Porównanie względem dokładnego wejściowego ZIP-a. Poniżej kod, konfiguracja, testy, materiały i narzędzia; odtworzone raporty/dokumentacja oraz manifesty mają osobny charakter i nie są liczone jako zmiana aplikacji.

Nowe: **13**, zmienione: **44**, usunięte: **0**, identyczne: **202**.

Sumy i liczby bajtów: `../reports/change-inventory.json`. Sumy wszystkich plików dystrybucji: `../SHA256SUMS.txt`. Inwentaryzacja nie oznacza ręcznego certyfikowania każdej linii.

| Plik | Stan | Linie UTF-8 po zmianie |
|---|---|---|
| `.dockerignore` | UNCHANGED | 22 |
| `.env.example` | UNCHANGED | 12 |
| `.env.production.example` | MODIFIED | 24 |
| `.github/workflows/verify.yml` | MODIFIED | 61 |
| `.gitignore` | UNCHANGED | 23 |
| `.npmrc` | UNCHANGED | 3 |
| `ASSET-PROVENANCE.md` | UNCHANGED | 42 |
| `CMS-CONTENT-GUIDE.md` | UNCHANGED | 13 |
| `Dockerfile.production` | MODIFIED | 57 |
| `INSTALL-VPS.sh` | UNCHANGED | 7 |
| `LICENSE-PAYLOAD-WEBSITE.txt` | UNCHANGED | 25 |
| `UPDATE-SECURITY.sh` | ADDED | 4 |
| `compose.production.yml` | UNCHANGED | 101 |
| `docker/audit-policy.mjs` | ADDED | 10 |
| `docker/env-validation.mjs` | MODIFIED | 24 |
| `docker/production-preflight.mjs` | UNCHANGED | 2 |
| `eslint.config.mjs` | UNCHANGED | 4 |
| `next-env.d.ts` | UNCHANGED | 7 |
| `next.config.mjs` | MODIFIED | 4 |
| `package.json` | MODIFIED | 76 |
| `playwright.config.ts` | UNCHANGED | 6 |
| `public/icon.svg` | UNCHANGED | 1 |
| `public/images/forma-architecture.webp` | UNCHANGED | binarny / brak |
| `public/images/forma-residence.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/atelier-courtyard.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/atelier-detail.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/atelier-hero.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/atelier-interior.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/atelier-pavilion.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/aura-hero.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/aura-hero.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/aura-iceland.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/aura-japan.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/aura-patagonia.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/device-mark.svg` | UNCHANGED | 1 |
| `public/images/showcase/ember-food.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/ember-hero.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/ember-hero.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/maison-bath.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/maison-hero.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/maison-hero.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/maison-suite.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/maison-table.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/nora-hero.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/nora-hero.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/nora-ritual.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/velo-allroad.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/velo-bike.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/velo-city.jpg` | UNCHANGED | binarny / brak |
| `public/images/showcase/velo-detail.webp` | UNCHANGED | binarny / brak |
| `public/images/showcase/velo-hero.webp` | UNCHANGED | binarny / brak |
| `public/og-codemaster.png` | UNCHANGED | binarny / brak |
| `public/og-codemaster.svg` | UNCHANGED | 1 |
| `release/deployment-defaults.json` | ADDED | 11 |
| `release/package-lock.bootstrap.json` | UNCHANGED | 8527 |
| `scripts/audit-dependencies.mjs` | MODIFIED | 16 |
| `scripts/check-deployment.ts` | MODIFIED | 18 |
| `scripts/check-source.cjs` | UNCHANGED | 10 |
| `scripts/cleanup.ts` | MODIFIED | 37 |
| `scripts/create-admin.ts` | UNCHANGED | 20 |
| `scripts/docker-bootstrap.ts` | MODIFIED | 29 |
| `scripts/init-database.ts` | MODIFIED | 27 |
| `scripts/notifications.ts` | ADDED | 10 |
| `scripts/operator.mjs` | MODIFIED | 11 |
| `scripts/prepare-migrations.mjs` | MODIFIED | 12 |
| `scripts/provision-admin.ts` | UNCHANGED | 17 |
| `scripts/release-manifest.mjs` | UNCHANGED | 8 |
| `scripts/resolve-lock.mjs` | MODIFIED | 37 |
| `scripts/retry-notification.ts` | ADDED | 12 |
| `scripts/secret-scan.py` | UNCHANGED | 20 |
| `scripts/seed.ts` | UNCHANGED | 4 |
| `scripts/setup.mjs` | UNCHANGED | 12 |
| `scripts/smtp-test.ts` | UNCHANGED | 8 |
| `scripts/verify-local.py` | MODIFIED | 100 |
| `scripts/verify-release.mjs` | UNCHANGED | 65 |
| `src/app/(frontend)/blog/[slug]/page.tsx` | UNCHANGED | 8 |
| `src/app/(frontend)/blog/page.tsx` | UNCHANGED | 5 |
| `src/app/(frontend)/cookies/page.tsx` | UNCHANGED | 5 |
| `src/app/(frontend)/demos/approval/page.tsx` | UNCHANGED | 4 |
| `src/app/(frontend)/demos/client-portal/page.tsx` | UNCHANGED | 4 |
| `src/app/(frontend)/demos/commerce/page.tsx` | UNCHANGED | 4 |
| `src/app/(frontend)/demos/operations/page.tsx` | UNCHANGED | 4 |
| `src/app/(frontend)/demos/real-estate/page.tsx` | UNCHANGED | 11 |
| `src/app/(frontend)/en/[[...path]]/page.tsx` | UNCHANGED | 32 |
| `src/app/(frontend)/error.tsx` | UNCHANGED | 8 |
| `src/app/(frontend)/globals.css` | UNCHANGED | 188 |
| `src/app/(frontend)/kontakt/page.tsx` | UNCHANGED | 5 |
| `src/app/(frontend)/layout.tsx` | UNCHANGED | 22 |
| `src/app/(frontend)/not-found.tsx` | UNCHANGED | 7 |
| `src/app/(frontend)/page.tsx` | UNCHANGED | 5 |
| `src/app/(frontend)/polityka-prywatnosci/page.tsx` | UNCHANGED | 5 |
| `src/app/(frontend)/preview/page.tsx` | UNCHANGED | 14 |
| `src/app/(frontend)/realizacje/[slug]/page.tsx` | UNCHANGED | 8 |
| `src/app/(frontend)/realizacje/page.tsx` | UNCHANGED | 5 |
| `src/app/(frontend)/redesign.css` | UNCHANGED | 206 |
| `src/app/(frontend)/studio.css` | UNCHANGED | 37 |
| `src/app/(frontend)/uslugi/page.tsx` | UNCHANGED | 5 |
| `src/app/(payload)/admin/[[...segments]]/page.tsx` | UNCHANGED | 17 |
| `src/app/(payload)/admin/importMap.js` | UNCHANGED | 6 |
| `src/app/(payload)/api/[...slug]/route.ts` | UNCHANGED | 17 |
| `src/app/(payload)/custom.css` | UNCHANGED | 6 |
| `src/app/(payload)/layout.tsx` | UNCHANGED | 28 |
| `src/app/(showcase)/showcase/[locale]/[slug]/page.tsx` | UNCHANGED | 30 |
| `src/app/(showcase)/showcase/[locale]/layout.tsx` | UNCHANGED | 13 |
| `src/app/(showcase)/showcase/[locale]/showcase-root.css` | UNCHANGED | 1 |
| `src/app/api/contact-token/route.ts` | UNCHANGED | 11 |
| `src/app/api/contact/route.ts` | MODIFIED | 77 |
| `src/app/api/health/route.ts` | UNCHANGED | 16 |
| `src/app/api/reviews/route.ts` | MODIFIED | 44 |
| `src/app/global-error.tsx` | UNCHANGED | 2 |
| `src/app/robots.ts` | UNCHANGED | 3 |
| `src/app/sitemap.ts` | MODIFIED | 22 |
| `src/collections/Content.ts` | UNCHANGED | 6 |
| `src/collections/FormAttempts.ts` | UNCHANGED | 4 |
| `src/collections/Leads.ts` | MODIFIED | 16 |
| `src/collections/Media.ts` | UNCHANGED | 4 |
| `src/collections/PrivateFiles.ts` | UNCHANGED | 4 |
| `src/collections/Projects.ts` | UNCHANGED | 3 |
| `src/collections/Services.ts` | UNCHANGED | 3 |
| `src/collections/Testimonials.ts` | MODIFIED | 7 |
| `src/collections/Users.ts` | MODIFIED | 6 |
| `src/components/ApproachSection.tsx` | UNCHANGED | 18 |
| `src/components/CapabilitiesSection.tsx` | UNCHANGED | 20 |
| `src/components/ContactForm.tsx` | MODIFIED | 47 |
| `src/components/ConversationPhone.tsx` | UNCHANGED | 65 |
| `src/components/DeliveryWorkflow.tsx` | UNCHANGED | 29 |
| `src/components/DemoWorkbench.tsx` | UNCHANGED | 66 |
| `src/components/HomeExperience.tsx` | UNCHANGED | 27 |
| `src/components/JournalPreview.tsx` | UNCHANGED | 17 |
| `src/components/ParticleHero.tsx` | UNCHANGED | 48 |
| `src/components/ProductWall.tsx` | UNCHANGED | 47 |
| `src/components/ProjectVisual.tsx` | UNCHANGED | 37 |
| `src/components/Reviews.tsx` | MODIFIED | 56 |
| `src/components/RobotChat.tsx` | MODIFIED | 48 |
| `src/components/SiteHeader.tsx` | UNCHANGED | 19 |
| `src/components/TechnologyBelts.tsx` | UNCHANGED | 6 |
| `src/components/animation/CosmicBackground.tsx` | UNCHANGED | 109 |
| `src/components/animation/MotionProvider.tsx` | UNCHANGED | 16 |
| `src/components/animation/ProjectCursor.tsx` | UNCHANGED | 16 |
| `src/components/animation/Reveal.tsx` | UNCHANGED | 15 |
| `src/components/animation/particle-engine.ts` | UNCHANGED | 170 |
| `src/components/architecture-showcase.css` | UNCHANGED | 191 |
| `src/components/cms/LivePreviewRefresh.tsx` | UNCHANGED | 8 |
| `src/components/common/Button.tsx` | UNCHANGED | 17 |
| `src/components/common/Dialog.tsx` | UNCHANGED | 24 |
| `src/components/common/Icon.tsx` | UNCHANGED | 21 |
| `src/components/common/RobotMark.tsx` | UNCHANGED | 14 |
| `src/components/common/SiteFooter.tsx` | UNCHANGED | 7 |
| `src/components/common/SiteShell.tsx` | UNCHANGED | 14 |
| `src/components/common/StructuredData.tsx` | UNCHANGED | 7 |
| `src/components/conversation-phone.css` | UNCHANGED | 44 |
| `src/components/cosmic-hero.css` | UNCHANGED | 238 |
| `src/components/demos/WorkspacePanels.tsx` | UNCHANGED | 59 |
| `src/components/demos/workspace-product.css` | UNCHANGED | 168 |
| `src/components/estate/EstateExperience.tsx` | UNCHANGED | 153 |
| `src/components/estate/FloorPlan.tsx` | UNCHANGED | 37 |
| `src/components/estate/estate-csv.ts` | UNCHANGED | 11 |
| `src/components/estate/estate-dialog.css` | UNCHANGED | 28 |
| `src/components/forms/ContactSection.tsx` | UNCHANGED | 24 |
| `src/components/forms/concise-contact.css` | UNCHANGED | 52 |
| `src/components/home/InteractiveLaptop.tsx` | UNCHANGED | 51 |
| `src/components/homepage.css` | UNCHANGED | 175 |
| `src/components/pages/ContentPages.tsx` | UNCHANGED | 46 |
| `src/components/pages/ServicesPage.tsx` | UNCHANGED | 11 |
| `src/components/portfolio/DeviceViewport.tsx` | UNCHANGED | 65 |
| `src/components/portfolio/PhoneScreen.tsx` | UNCHANGED | 17 |
| `src/components/portfolio/ProjectShowcase.tsx` | UNCHANGED | 86 |
| `src/components/portfolio/StaticDevices.tsx` | UNCHANGED | 35 |
| `src/components/portfolio/device-finish.css` | UNCHANGED | 44 |
| `src/components/portfolio/device-model.ts` | UNCHANGED | 107 |
| `src/components/portfolio/device-scene.ts` | UNCHANGED | 127 |
| `src/components/portfolio/project-data.ts` | UNCHANGED | 48 |
| `src/components/portfolio/showcase.css` | UNCHANGED | 172 |
| `src/components/portfolio/sites/assets.md` | UNCHANGED | 16 |
| `src/components/portfolio/sites/atelier/AtelierSite.tsx` | UNCHANGED | 62 |
| `src/components/portfolio/sites/atelier/assets.md` | UNCHANGED | 10 |
| `src/components/portfolio/sites/atelier/atelier.css` | UNCHANGED | 83 |
| `src/components/portfolio/sites/aura/AuraSite.tsx` | UNCHANGED | 81 |
| `src/components/portfolio/sites/aura/aura.css` | UNCHANGED | 101 |
| `src/components/portfolio/sites/ember/EmberSite.tsx` | UNCHANGED | 88 |
| `src/components/portfolio/sites/ember/ember.css` | UNCHANGED | 84 |
| `src/components/portfolio/sites/maison/MaisonSite.tsx` | UNCHANGED | 66 |
| `src/components/portfolio/sites/maison/maison.css` | UNCHANGED | 88 |
| `src/components/portfolio/sites/nora/NoraSite.tsx` | UNCHANGED | 48 |
| `src/components/portfolio/sites/nora/assets.md` | UNCHANGED | 11 |
| `src/components/portfolio/sites/nora/nora.css` | UNCHANGED | 115 |
| `src/components/portfolio/sites/site-base.css` | UNCHANGED | 20 |
| `src/components/portfolio/sites/velo/VeloSite.tsx` | UNCHANGED | 51 |
| `src/components/portfolio/sites/velo/assets.md` | UNCHANGED | 11 |
| `src/components/portfolio/sites/velo/velo.css` | UNCHANGED | 103 |
| `src/components/projects/ProjectShowcase.tsx` | UNCHANGED | 14 |
| `src/components/reviews.css` | UNCHANGED | 1 |
| `src/components/robot-identity.css` | UNCHANGED | 45 |
| `src/components/services/ServiceExperience.tsx` | UNCHANGED | 18 |
| `src/globals/ContentGlobals.ts` | MODIFIED | 18 |
| `src/globals/SiteSettings.ts` | MODIFIED | 3 |
| `src/hooks/useDemoWorkspace.ts` | UNCHANGED | 35 |
| `src/hooks/useEstateWorkspace.ts` | UNCHANGED | 55 |
| `src/hooks/useInViewport.ts` | UNCHANGED | 12 |
| `src/hooks/usePageVisible.ts` | UNCHANGED | 4 |
| `src/hooks/useReducedMotion.ts` | UNCHANGED | 5 |
| `src/hooks/useStaticDevices.ts` | UNCHANGED | 12 |
| `src/lib/access.ts` | MODIFIED | 13 |
| `src/lib/analytics.ts` | UNCHANGED | 28 |
| `src/lib/antivirus.ts` | UNCHANGED | 24 |
| `src/lib/article-defaults.ts` | UNCHANGED | 29 |
| `src/lib/attachment-security.ts` | MODIFIED | 37 |
| `src/lib/contact-client.ts` | MODIFIED | 16 |
| `src/lib/defaults.ts` | MODIFIED | 179 |
| `src/lib/demo-state.ts` | UNCHANGED | 119 |
| `src/lib/email-adapter.ts` | UNCHANGED | 31 |
| `src/lib/estate-state.ts` | UNCHANGED | 118 |
| `src/lib/form-security.ts` | MODIFIED | 41 |
| `src/lib/http-body.ts` | ADDED | 37 |
| `src/lib/i18n.ts` | MODIFIED | 34 |
| `src/lib/lead-notification.ts` | MODIFIED | 26 |
| `src/lib/lead-validation.ts` | UNCHANGED | 25 |
| `src/lib/metadata.ts` | MODIFIED | 10 |
| `src/lib/pdf-policy.ts` | ADDED | 16 |
| `src/lib/rate-limit.ts` | UNCHANGED | 11 |
| `src/lib/seed.ts` | MODIFIED | 41 |
| `src/lib/site-data.ts` | UNCHANGED | 25 |
| `src/lib/submission-policy.ts` | ADDED | 20 |
| `src/lib/turnstile-client.ts` | UNCHANGED | 44 |
| `src/lib/turnstile.ts` | UNCHANGED | 19 |
| `src/migrations/postgres/README.md` | UNCHANGED | 5 |
| `src/migrations/sqlite/20260928_001_initial.sql` | UNCHANGED | 1358 |
| `src/migrations/sqlite/20260928_001_initial.ts` | UNCHANGED | 314 |
| `src/migrations/sqlite/20260928_002_password_reset.sql` | UNCHANGED | 1 |
| `src/migrations/sqlite/20260928_002_password_reset.ts` | UNCHANGED | 7 |
| `src/migrations/sqlite/20260929_003_submission_delivery.sql` | ADDED | 31 |
| `src/migrations/sqlite/20260929_003_submission_delivery.ts` | ADDED | 22 |
| `src/migrations/sqlite/README.md` | MODIFIED | 11 |
| `src/migrations/sqlite/index.ts` | MODIFIED | 4 |
| `src/payload-types.ts` | MODIFIED | 1191 |
| `src/payload.config.ts` | MODIFIED | 43 |
| `src/proxy.ts` | MODIFIED | 18 |
| `src/types/site.ts` | UNCHANGED | 39 |
| `tests/audit-20260929.test.cjs` | ADDED | 67 |
| `tests/e2e/cms.spec.ts` | UNCHANGED | 21 |
| `tests/e2e/compact-home.spec.ts` | UNCHANGED | 101 |
| `tests/e2e/estate.spec.ts` | UNCHANGED | 171 |
| `tests/e2e/hardening.spec.ts` | UNCHANGED | 19 |
| `tests/e2e/persistence.spec.ts` | UNCHANGED | 62 |
| `tests/e2e/redesign.spec.ts` | UNCHANGED | 66 |
| `tests/e2e/reviews-mobile.spec.ts` | UNCHANGED | 50 |
| `tests/e2e/showcase.spec.ts` | UNCHANGED | 262 |
| `tests/e2e/website.spec.ts` | UNCHANGED | 43 |
| `tests/e2e/workspaces.spec.ts` | UNCHANGED | 22 |
| `tests/estate-csv.test.cjs` | UNCHANGED | 17 |
| `tests/estate-state.test.cjs` | UNCHANGED | 72 |
| `tests/hardening.test.cjs` | MODIFIED | 21 |
| `tests/security.test.cjs` | MODIFIED | 73 |
| `tests/vps/test_audit_20260929.py` | ADDED | 81 |
| `tests/vps/test_operations.py` | UNCHANGED | 67 |
| `tsconfig.domain.json` | MODIFIED | 34 |
| `tsconfig.json` | UNCHANGED | 45 |
| `vps/manage.py` | MODIFIED | 676 |
| `vps/update_security.py` | ADDED | 34 |
