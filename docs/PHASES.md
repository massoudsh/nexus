# Nexus — Phased Development

Development is organized in phases. Each phase is tracked via GitHub issues and milestones.

**Phase 1 issues:** [#17](https://github.com/massoudsh/personal-finance-app/issues/17) (epic) · [#18](https://github.com/massoudsh/personal-finance-app/issues/18) branding · [#19](https://github.com/massoudsh/personal-finance-app/issues/19) auth · [#20](https://github.com/massoudsh/personal-finance-app/issues/20) dashboard

## Renaming the repo/folder

- **GitHub:** Rename the repository to `nexus` (or `nexus-finance`) in the repo Settings → General → Repository name.
- **Local folder:** Optionally rename the clone folder:  
  `mv personal-finance-app nexus`  
  Then `cd nexus` and continue development.

## Phases overview

| Phase | Focus | Status |
|-------|--------|--------|
| **1** | Foundation — Branding, app shell, auth, landing | In progress |
| **2** | Core data — Accounts & transactions CRUD | Planned |
| **3** | Budgets & goals — Budget and goal management | Planned |
| **4** | Reports & analytics — Charts, reports, export | Planned |
| **5** | Polish & deploy — Settings, themes, performance, deployment | Planned |

## Phase 1 — Foundation

- **Goal:** Nexus branding, app shell, auth flows, and a usable landing/dashboard shell.
- **Scope:**
  - App name "Nexus" and NX logo in layout, navbar, and metadata.
  - Login and register pages working with backend.
  - Dashboard (authenticated and guest mode) with consistent layout.
  - Responsive navbar and basic routing.
- **Done when:** User can sign up, sign in, see dashboard with Nexus branding, and navigate main sections.

## Phase 2 — Core data

- **Goal:** Full accounts and transactions management.
- **Scope:**
  - Accounts list, create, edit, delete.
  - Transactions list with filters, create, edit, delete.
  - Categories and linking to backend APIs.
- **Done when:** Users can manage accounts and transactions end-to-end.

## Phase 3 — Budgets & goals

- **Goal:** Budget and goal management with progress.
- **Scope:**
  - Budgets CRUD and spending vs budget display.
  - Goals CRUD and progress tracking.
- **Done when:** Users can set budgets, track spending, and manage savings goals.

## Phase 4 — Reports & analytics

- **Goal:** Reports and visual analytics.
- **Scope:**
  - Expense by category, income vs expenses, time-range filters.
  - Export (e.g. CSV) and print-friendly views.
- **Done when:** Users can view and export key reports.

## Phase 5 — Polish & deploy

- **Goal:** Production-ready app and deployment.
- **Scope:**
  - Settings page (profile, preferences).
  - Dark/light theme, accessibility, performance.
  - CI/CD, deployment (e.g. Vercel + Railway), docs.
- **Done when:** App is deployed and documented for production use.
