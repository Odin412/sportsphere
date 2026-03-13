# Sportsphere Test Report

**Date**: 2026-03-10T01:15:18.307Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 562.8s
**Result**: 46/60 passed | 1 critical | 10 warnings | 3 skipped

## auth (7/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | PASS | L1:pass L2:pass | Error handling is working correctly - there are two visible error messages: 'Inc |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is working correctly - shows left sidebar with navigation  |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | Page shows authenticated feed with working features: user stories at top, post c |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The sign-up form is correctly displayed with the 'Create Account' tab active, sh |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |

## navigation (9/11 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Sidebar renders all primary nav | PASS | L1:pass L2:pass | Left sidebar shows all 7 navigation items (Feed, Explore, Reels, ProPath, Live,  |
| 2 | Navigate to Explore | PASS | L1:pass L2:pass | Explore page is functioning properly with search bar, sport category filters (Al |
| 3 | Navigate to Reels | PASS | L1:pass L2:pass | The Reels page is functioning properly with a grid layout showing video tiles ac |
| 4 | Navigate to ProPath | PASS | L1:pass L2:pass | The ProPath feature is working correctly - showing the onboarding state for user |
| 5 | Navigate to Live | PASS | L1:pass L2:pass | The Live Streams page is functioning correctly with proper empty state messaging |
| 6 | Navigate to Messages | WARNING | L1:pass L2:fail | L2 FAIL: The messages interface shows an empty state with no conversations in th |
| 7 | Navigate to Profile | PASS | L1:pass L2:pass | Profile page is fully functional with proper layout - shows Test Athlete profile |
| 8 | More menu expands | PASS | L1:pass L2:pass | The More menu is properly expanded showing secondary navigation items (For You,  |
| 9 | Navigate to Challenges (secondary) | WARNING | L1:pass L2:fail | L2 FAIL: The Challenges page shows an empty state with 'No challenges found' mes |
| 10 | Navigate to Forums (secondary) | PASS | L1:pass L2:pass | The Forums page is properly loaded with clear structure - shows 'Community Forum |
| 11 | Return to Feed (round-trip) | PASS | L1:pass L2:pass | Feed page is fully functional with user stories displayed, profile images loaded |

## feed (7/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | PASS | L1:pass L2:pass | Feed shows real sports content with Marcus Silva's soccer post containing authen |
| 2 | Sport filter pills exist | PASS | L1:pass L2:pass | The sport filter pills are clearly visible and functional - showing 'For You', ' |
| 3 | Sport filter actually filters | PASS | L1:pass L2:pass | The Basketball filter is properly highlighted in red/orange color showing it's s |
| 4 | Clear filter restores all posts | PASS | L1:pass L2:pass | The feed is displaying posts from multiple sports categories. The main post is f |
| 5 | Like button works | PASS | L1:pass L2:pass | The feed is displaying properly with real content including Marcus Silva's socce |
| 6 | Unlike restores state | PASS | L1:pass L2:pass | The feed is displaying properly with real content - there's a Marcus Silva post  |
| 7 | Post author links to profile | PASS | L1:pass L2:pass | Profile page is displaying correctly for Marcus Silva (not the test account user |
| 8 | News widget has content | WARNING | L1:pass L2:fail | L2 FAIL: The screen shows only a loading spinner on a black background with no v |

## athlete (7/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProPathHub page loads | PASS | L1:pass L2:pass | ProPath page is displaying correctly with a proper setup prompt state. Shows tro |
| 2 | GetNoticed page loads with Browse tab | PASS | L1:pass L2:pass | Page displays correctly with all required elements: 'Get Noticed' hero section w |
| 3 | GetNoticed sport filter works | PASS | L1:pass L2:pass | The basketball filter is properly highlighted/selected (red background vs gray f |
| 4 | GetNoticed My Showcase tab | PASS | L1:pass L2:pass | The My Showcase tab is correctly displaying the empty state with 'Put Yourself o |
| 5 | TheVault page loads | PASS | L1:pass L2:pass | The Vault page is functioning correctly with all required elements: 'The Vault'  |
| 6 | PerformanceHub page loads | PASS | L1:pass L2:pass | Performance Hub page shows the expected empty state for users without sport prof |
| 7 | ScoutCard page loads for athlete | WARNING | L1:pass L2:fail | L2 FAIL: Page shows only a loading spinner on a black background with no content |
| 8 | Return to Feed from athlete features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real content - shows user stories at top |

## coach (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | AI Coach page loads | PASS | L1:pass L2:pass | The AI Coach page is displaying correctly with a premium gate/upgrade prompt as  |
| 2 | LiveCoaching page loads | PASS | L1:pass L2:pass | Live Coaching page is working correctly - shows proper header with title and des |
| 3 | Creator Hub page loads for coach | PASS | L1:pass L2:pass | Creator Hub page is functioning properly with real monetization data displayed.  |
| 4 | Analytics page loads for coach | PASS | L1:pass L2:pass | Analytics page is properly loaded and functional. The interface shows a complete |
| 5 | Return to Feed from coach features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real content - shows active stories from |

## org (1/6 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | OrgDashboard page loads | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 2 | OrgRoster page loads | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 3 | OrgSessions page loads | WARNING | L1:pass L2:fail | L2 FAIL: Page shows only a loading spinner on black background with no content,  |
| 4 | OrgMessages page loads | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 5 | VideoReview page loads | WARNING | L1:pass L2:fail | L2 FAIL: The screen shows only a loading spinner on a black background with no c |
| 6 | Return to Feed from org features | PASS | L1:pass L2:pass | Feed page is functioning properly with real content - shows user stories at top, |

## parent (2/3 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ParentView page loads | WARNING | L1:pass L2:fail | L2 FAIL: Page shows only a loading spinner on black background with no content,  |
| 2 | Parent can view Profile page | PASS | L1:pass L2:pass | Profile page is functioning correctly with proper layout showing user info (Test |
| 3 | Return to Feed from parent features | PASS | L1:pass L2:pass | Successfully returned to the Feed page with all features working properly - stor |

## onboarding (0/4 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Athlete onboarding — Step 1 (sport + level) | CRITICAL | L1:fail L2:pass | L1 FAIL: page.fill: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loca |
| 2 | Athlete onboarding — Walk through steps | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 3 | Athlete onboarding — Reaches app after completion | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 4 | Cleanup ephemeral accounts | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |

## mobile (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Mobile Feed loads with bottom nav | PASS | L1:pass L2:pass | Mobile layout structure is intact with all required elements: top header with Sp |
| 2 | Mobile bottom nav — Explore | PASS | L1:pass L2:pass | The mobile Explore page displays properly with vertical stacked content cards sh |
| 3 | Mobile bottom nav — Reels | PASS | L1:pass L2:pass | The Reels page shows a functional grid layout with 4 reel cards displaying real  |
| 4 | Mobile bottom nav — Profile | PASS | L1:pass L2:pass | The mobile profile page displays correctly with proper single-column layout at 3 |
| 5 | Mobile Create Post button | PASS | L1:pass L2:pass | The Create Post page displays correctly with all expected functional elements: a |
| 6 | Mobile Feed — posts are readable | PASS | L1:pass L2:pass | The mobile feed displays properly at 375px width with full-width post cards, vis |
| 7 | Mobile — no horizontal scroll | PASS | L1:pass L2:pass | The mobile interface displays correctly within the viewport with no horizontal s |
| 8 | Mobile — return to Feed from mobile nav | PASS | L1:pass L2:pass | The mobile feed is displaying properly with real content - user stories at top,  |
