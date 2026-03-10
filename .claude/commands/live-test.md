# Live Test — Sportsphere System Integrity Check

You are a QA engineer performing a systematic production-readiness test of Sportsphere after code changes. This skill runs after each phase of work to catch regressions and verify fixes.

## Test Environment

- **Live URL**: https://sportsphere-titan-one.vercel.app
- **Local dev**: http://localhost:5173 (if running)
- **Supabase project**: xjcygntnkjkgvyynldzf (us-east-1)
- **App root**: `sportsphere-main/sportsphere-main/`

## Pre-Test: Build Verification

Before any functional testing:
1. Run `npm run build` in the app root — must pass with **zero errors**
2. Count total modules transformed — record for baseline comparison
3. Check for new warnings (acceptable: browserslist age, dynamic import overlap)
4. If build fails, stop and report the exact error + file + line

## Test Suites

### Suite 1: Auth & Onboarding (Critical Path)
Test the complete new-user journey:

- [ ] **Build passes**: `npm run build` exits 0
- [ ] **Login page renders**: No console errors, both Sign In and Create Account tabs work
- [ ] **Input text visible**: All input fields show typed text (not invisible white-on-white)
- [ ] **Role selection**: All 4 role cards (Athlete, Coach, Organization, Parent) are clickable
- [ ] **Signup form**: Validates required fields, shows loading spinner on submit
- [ ] **Duplicate email detection**: Signing up with existing email shows clear error (not crash)
- [ ] **Onboarding starts**: New user redirected to `/Onboarding` (not blank screen)
- [ ] **Onboarding renders outside Layout**: No sidebar/bottom nav visible during onboarding
- [ ] **Step navigation**: Forward/back buttons work, progress bar updates
- [ ] **Skip link works**: "Skip for now" triggers handleFinish without crash
- [ ] **Org creation (admin role)**: Organization entity created, OrgMember linked — no crash if DB insert fails
- [ ] **Team creation (coach role)**: Optional team creation works or gracefully skips
- [ ] **Completion redirect**: CTA button navigates to correct page (Feed/CreatorHub/etc) via React Router (no full reload)
- [ ] **Existing user bypass**: Users older than 1 hour skip onboarding automatically
- [ ] **localStorage flag**: `ob_<userId>` key set to "1" after completion

### Suite 2: Core Navigation & Layout
- [ ] **Sidebar renders**: All PRIMARY_NAV + SECONDARY_NAV items visible and clickable
- [ ] **Active state**: Current page highlighted with bg-red-600 in sidebar
- [ ] **Mobile bottom nav**: 5 items render, center Create button is circular red
- [ ] **Notification badge**: Bell icon shows unread count (or no badge if 0)
- [ ] **Real-time cleanup**: Navigate away from a page → no console errors about unmounted components
- [ ] **ErrorBoundary catches crashes**: Intentionally broken component shows "Something went wrong" (not blank screen)
- [ ] **Standalone pages**: Admin, Login render without sidebar/nav

### Suite 3: Feed & Posts
- [ ] **Feed loads**: Posts appear with author name, avatar, timestamp, content
- [ ] **PostCard dates**: No "Invalid Date" or NaN — null dates show "recently"
- [ ] **Sport filter**: Clicking a sport pill filters posts correctly
- [ ] **Pagination**: Page controls work (client-side slice of 50 posts)
- [ ] **Create Post**: Link navigates to CreatePost page, form submits successfully
- [ ] **Like/comment/share**: Interactions work without console errors

### Suite 4: Data Layer & Queries
- [ ] **No unbounded queries**: Check Supabase logs — no SELECT without LIMIT returning >100 rows
- [ ] **Query keys include user**: No `['key', undefined]` entries in React Query cache
- [ ] **Admin guard**: Non-admin visiting `/Admin` is redirected immediately (before data loads)
- [ ] **Messages load**: Conversation list appears for logged-in user
- [ ] **Challenges limited**: Challenges page loads with ≤50 results per filter

### Suite 5: Environment & Config
- [ ] **Env var validation**: Remove `VITE_SUPABASE_URL` temporarily → app throws clear error on load
- [ ] **Supabase connection**: Auth state listener fires, user session restored on refresh
- [ ] **Profile columns exist**: `onboarding_complete`, `preferred_sports`, `bio`, `location`, `role` all present in profiles table

## How to Run

### Quick Mode (after small changes)
Run Suites 1 + 2 only. Takes ~5 minutes.
```
/live-test quick
```

### Full Mode (after major changes or before deploy)
Run all 5 suites. Takes ~15 minutes.
```
/live-test full
```

### Targeted Mode (specific suite)
```
/live-test auth
/live-test feed
/live-test data
```

## Execution Method

1. **Static analysis**: Read the source files and verify code patterns match expectations
2. **Build test**: Run `npm run build` and verify clean output
3. **Runtime checks**: Use the browser/Supabase dashboard where code analysis isn't sufficient
4. **Report format**:

```
## Live Test Report — [Date] — [Phase Name]

### Build
- Status: PASS/FAIL
- Modules: [count]
- Warnings: [count] (list if new)

### Results
| Suite | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| Auth  |  15   |  14  |   1  |   0  |
| Nav   |   7   |   7  |   0  |   0  |
| Feed  |   6   |   6  |   0  |   0  |
| Data  |   5   |   5  |   0  |   0  |
| Env   |   3   |   3  |   0  |   0  |

### Failures
1. **[Suite] Test name**: Description of failure
   - **File**: path:line
   - **Expected**: what should happen
   - **Actual**: what happened
   - **Fix**: recommended action

### Regressions
(Any previously passing tests that now fail)

### Sign-off
- [ ] All Critical tests pass
- [ ] No new console errors
- [ ] Build clean
- [ ] Ready for deploy: YES/NO
```

## Version Tracking

After each test run, append a summary to the version log:

**File**: `C:\Users\creat\.claude\projects\c--Users-creat-Downloads-sportsphere-main\memory\test-log.md`

Format:
```
## [Date] — [Phase/Commit] — [Result]
- Commit: [hash]
- Build: PASS (N modules)
- Suites: X/Y pass
- Issues found: [count]
- Issues fixed: [count]
- Deploy: YES/NO
```

This creates a running history of test results across sessions for tracking system stability over time.
