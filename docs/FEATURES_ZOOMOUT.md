# Features Zoom-Out: Dependency Map & Implementation Order

All 10 feature issues (31–40) + docs (41) implemented in one pass. This doc ensures no rework: shared touchpoints are extended once.

## Dependency Map

| Feature | Backend | Frontend | Shared / Affects |
|--------|---------|----------|-------------------|
| **#38 API keys** | Auth (accept X-API-Key), new model | Settings | All API routes use same `get_current_user` |
| **#35 2FA** | Login flow, User.totp_secret | Login step, Settings Security | Auth; no conflict with API keys |
| **#34 Dashboard widgets** | User preferences store | Dashboard + Settings | Dashboard layout; backup will include prefs |
| **#31 Transaction search** | GET /transactions params | Transactions page | Same list used by duplicate check |
| **#32 Duplicate detection** | POST /transactions check | Create transaction modal | Depends on transactions list/create |
| **#40 Recurring auto-create** | Job + optional endpoint | Recurring page "Run now" | Recurring + transactions create |
| **#37 Spending insights** | Reports/insights endpoints | Dashboard or Insights page | Reports service; reuses categories/transactions |
| **#33 Backup/restore** | GET/POST backup | Settings Backup section | All models; export includes dashboard prefs |
| **#36 PWA** | — | manifest, SW, icons | Layout meta only |
| **#39 Keyboard shortcuts** | — | Global listener, help modal | Navbar, modals, transactions/dashboard |
| **#41 Docs / help** | — | Help page, navbar | Navbar; no backend |

## Implementation Order (no redo)

1. **#38 API keys** – New auth path; other features keep using same `get_current_user`.
2. **#35 2FA** – Extend auth and login; Settings gets Security + API keys sections together.
3. **#34 Dashboard widgets** – Add preferences (backend + frontend); dashboard renders from config; backup (later) exports prefs.
4. **#31 Transaction search** – Extend list API and transactions page; duplicate check uses same API.
5. **#32 Duplicate detection** – Add check on create; frontend modal on warning/409.
6. **#40 Recurring auto-create** – Backend job + "Run now"; no UI conflict.
7. **#37 Spending insights** – New/updated reports endpoints; insights UI on dashboard or dedicated page.
8. **#33 Backup/restore** – Full export/import; includes dashboard preferences from #34.
9. **#36 PWA** – Manifest, service worker, icons.
10. **#39 Keyboard shortcuts** – Global listener; help modal lists shortcuts.
11. **#41 Docs** – Help page + navbar link; optional tooltips.

## Shared Touchpoints (implement once)

- **Auth:** `get_current_user` accepts JWT **or** X-API-Key (#38). 2FA (#35) runs after password, before token.
- **User/settings:** User model gets `totp_secret` (#35). New `ApiKey` model (#38). Dashboard preferences: JSON on User or new table (#34); backup (#33) serializes them.
- **Transactions:** List supports `q`, `amount_min/max`, `category_id`, `account_id`, `date_from/to` (#31). Create returns duplicate warning/409 (#32).
- **Settings page:** Sections added: Security (2FA), API keys, Dashboard layout, Backup & restore. No duplicate sections.
