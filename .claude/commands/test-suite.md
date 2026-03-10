# Test Suite — Sportsphere Automated Testing Agent

You are the Sportsphere automated testing orchestrator. You run the Playwright + Claude Vision test suite against the live production app and report results.

## What This Does

Runs **130 automated tests** across **13 phases** covering:
- **65 pages** (100% page coverage)
- **9 interaction tests** (L3 data mutations: post, comment, like, follow, bookmark, profile update, group, message)
- **8 cross-role workflows** (coach→athlete, org→dashboard, parent→view, admin guard)
- **4 test accounts** (athlete, coach, org, parent)
- **2 viewports** (desktop 1280x800, mobile 375x812)

Three verification layers:
- **L1**: Playwright assertions (deterministic)
- **L2**: Claude Vision screenshot analysis (AI judgment)
- **L3**: Supabase data verification (backend state)

## How to Run

### Interpret the argument:

- `/test-suite` or `/test-suite full` → Run ALL 13 phases
- `/test-suite quick` → Run core phases only (auth + navigation + feed)
- `/test-suite <phase>` → Run specific phase (auth, navigation, feed, athlete, coach, org, parent, onboarding, mobile, community, discovery, settings, creator_tools, coaching_training, athlete_dev, admin, content_creation, remaining_pages, interactions, cross_role)
- `/test-suite repair` → Run repair agent on latest report

### Execute:

```bash
# For full/quick/phase runs:
cd sportsphere-main/sportsphere-main
node tools/test_agent.mjs --phase <phase_arg>

# For repair:
cd sportsphere-main/sportsphere-main
node tools/repair_agent.mjs
```

The `--phase` mapping:
- `full` → all 13 phases (20-25 min, ~$3 API cost)
- `quick` or `v1` → auth + navigation + feed (3-5 min)
- `v2` → role-specific phases
- Any single phase name → that phase only

### After the run completes:

1. **Read the report** from the output path shown in the console
2. **Summarize results** in a clear table:
   - Total / Passed / Critical / Warning / Data Issue
   - Phase-by-phase breakdown
   - Any new failures vs previous runs
3. **If failures found**, run the repair agent:
   ```bash
   node tools/repair_agent.mjs --report "<report_path>"
   ```
4. **Report the diagnosis** with root cause, category, and fix suggestion

## Key Files

| File | Purpose |
|------|---------|
| `tools/test_agent.mjs` | Main test orchestrator (13 phases) |
| `tools/test_helpers.mjs` | Shared utilities (waitForAuth, vision, L3 checks) |
| `tools/repair_agent.mjs` | Failure diagnosis + baseline tracking |
| `tools/monitor.mjs` | Full pipeline (test + repair + summary) |
| `tools/test_scenarios/*.mjs` | One file per phase (11 page + 2 workflow) |
| `.tmp/test-reports/` | Test reports with screenshots |
| `.tmp/repair-reports/` | Diagnosis reports |
| `.tmp/baselines/` | Baseline screenshots for comparison |

## Accounts

| Account | Role | Usage |
|---------|------|-------|
| test-athlete@sportsphere.app | Athlete | Primary test account (most phases) |
| test-coach@sportsphere.app | Coach | Coach features, creator tools |
| test-org@sportsphere.app | Organization | Org dashboard, roster, sessions |
| test-parent@sportsphere.app | Parent | Parent view features |

Password for all: stored in `.env` as `TEST_PASSWORD`

## Known Issues (as of Phase 12)

1. **`posts` table missing `mentioned_users` column** — CreatePost fails with 400 error. Post creation works for posts without @mentions.
2. **`ProfileSettings` form sends unknown columns** (`contact_email`, `contact_phone`, `contact_preferences`, `comments_disabled`, `cover_url`) — profile save returns 400.
3. **`moderateContent` edge function CORS** — Non-blocking (caught), but slows post creation.
4. **Groups page error boundary** — Intermittent "Something went wrong" on Groups list (not GroupDetail).
5. **Unlike state flaky** — Vision AI sometimes flags unlike toggle as failing when it's actually working.

## Exit Codes

- `0` — All tests passed
- `1` — Critical failures (blocking)
- `2` — Warnings only (non-blocking)
