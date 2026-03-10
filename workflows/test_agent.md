# Workflow: Sportsphere Automated Testing Agent

## Objective
Automated visual regression and smoke testing of the live Sportsphere app using Playwright (browser automation) + Claude Vision (screenshot verification).

## Prerequisites
- Node.js 18+
- Playwright + Chromium installed (`npx playwright install chromium`)
- `.env` with: `ANTHROPIC_API_KEY`, `TEST_ATHLETE_EMAIL`, `TEST_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Test accounts created in Supabase (see below)

## Test Accounts
| Email | Role | Password |
|-------|------|----------|
| test-athlete@sportsphere.app | Athlete | TestAgent2026!Secure |
| test-coach@sportsphere.app | Coach | TestAgent2026!Secure |
| test-org@sportsphere.app | Organization | TestAgent2026!Secure |
| test-parent@sportsphere.app | Parent | TestAgent2026!Secure |

Create via Supabase Dashboard → Authentication → Add User (auto-confirm).

## How to Run

```bash
# All phases (auth + navigation + feed)
node tools/test_agent.mjs

# Single phase
node tools/test_agent.mjs --phase auth
node tools/test_agent.mjs --phase navigation
node tools/test_agent.mjs --phase feed

# With visible browser (for debugging)
node tools/test_agent.mjs --headed
node tools/test_agent.mjs --phase auth --headed
```

## What It Tests

### V1 Phases
1. **Auth** (7 tests): Login page render, invalid creds rejection, valid login redirect, session persistence, sign-up form, logout, auth guard
2. **Navigation** (11 tests): Sidebar rendering, 7 primary nav links, More menu, 2 secondary nav links, round-trip back to Feed
3. **Feed** (8 tests): Post loading, sport filter pills, filter application + clearing, like/unlike, author profile links, news widget

### Three-Layer Verification
- **L1 (Playwright)**: Deterministic checks — URL changes, element visibility, state transitions
- **L2 (Vision)**: AI judgment — visual correctness, content quality, layout integrity
- **L3 (Data)**: Backend verification — Supabase REST API queries to confirm data persistence

## Output
Reports saved to `.tmp/test-reports/{timestamp}/`:
- `report.json` — Machine-readable with severity levels
- `report.md` — Human-readable summary table
- `*.png` — Screenshots from each test step
- `console_errors.json` — Captured browser console errors

### Severity Levels
| Level | Meaning |
|-------|---------|
| CRITICAL | L1 failed — feature fundamentally broken |
| WARNING | L2 failed — feature works but looks wrong |
| DATA_ISSUE | L3 failed — UI looks right but data didn't persist |
| PASS | All layers passed |

## Cost
- ~26 Claude Vision API calls per full run
- Uses Sonnet (not Opus) for cost efficiency
- ~$0.50 per full run

## When to Run
- Before deployments
- After major UI changes
- After database schema changes
- On-demand for debugging

## Known Constraints
- Headless mode may render slightly differently than real Chrome
- Vision checks are probabilistic — occasional false positives/negatives possible
- Real-time features (WebSocket) may behave differently under automation
- Test account must exist in Supabase before running

## Troubleshooting
- **"Missing required env vars"**: Check `.env` has all required keys
- **Login timeout**: Verify test account exists and credentials are correct
- **Vision API errors**: Check ANTHROPIC_API_KEY is valid and has credits
- **Element not found**: App may have changed selectors — check `data-tour` attributes in Layout.jsx

## V2 Roadmap
- Role-specific test suites (Coach, Org, Parent)
- Onboarding flow testing with ephemeral accounts
- Mobile viewport (375x812) tests
- Self-repair capability
- Scheduled runs (cron)
- Baseline screenshot diffing
