# Sportsphere Test Report

**Date**: 2026-03-09T22:05:52.332Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 510.7s
**Result**: 32/56 passed | 24 warnings

## auth (7/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | PASS | L1:pass L2:pass | Error state is working correctly - red error toast displays 'Incorrect email or  |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is properly loaded with all expected elements: left sideba |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | The authenticated feed page is displaying correctly after refresh with all expec |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The sign-up form is properly displayed with the 'Create Account' tab active. All |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, brand logo, tagline, cal |

## navigation (6/11 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Sidebar renders all primary nav | PASS | L1:pass L2:pass | Left sidebar displays all 7 navigation items with proper icons and labels (Feed, |
| 2 | Navigate to Explore | PASS | L1:pass L2:pass | The Explore page is working properly with all expected features: functional sear |
| 3 | Navigate to Reels | WARNING | L1:pass L2:fail | L2 FAIL: The Reels section shows mostly empty content with only sport category l |
| 4 | Navigate to ProPath | PASS | L1:pass L2:pass | The ProPath page loads correctly with proper onboarding state for new users. Sho |
| 5 | Navigate to Live | PASS | L1:pass L2:pass | The Live Streams & VODs page is working correctly. It shows proper navigation ta |
| 6 | Navigate to Messages | WARNING | L1:pass L2:fail | L2 FAIL: Messages feature shows an empty state with no conversations. The main c |
| 7 | Navigate to Profile | WARNING | L1:pass L2:fail | L2 FAIL: Profile page shows only empty states - 'No featured post yet' and 'No s |
| 8 | More menu expands | PASS | L1:pass L2:pass | The expanded More menu is functioning properly, displaying all secondary navigat |
| 9 | Navigate to Challenges (secondary) | WARNING | L1:pass L2:fail | L2 FAIL: Empty state showing 'No challenges found' - the feature is not working  |
| 10 | Navigate to Forums (secondary) | WARNING | L1:pass L2:fail | L2 FAIL: The forum shows an empty state with 'No topics found. Be the first to s |
| 11 | Return to Feed (round-trip) | PASS | L1:pass L2:pass | Feed page is working properly with real content - shows user stories at top, act |

## feed (5/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | PASS | L1:pass L2:pass | The feed displays a real post from Marcus Silva about soccer posted 15 hours ago |
| 2 | Sport filter pills exist | PASS | L1:pass L2:pass | The horizontal row of sport filter pill buttons is visible and functional with c |
| 3 | Sport filter actually filters | PASS | L1:pass L2:pass | The Basketball filter is properly highlighted with a red background and white te |
| 4 | Clear filter restores all posts | PASS | L1:pass L2:pass | The feed shows posts from multiple sports with the 'All' filter selected (highli |
| 5 | Like button works | WARNING | L1:pass L2:fail | L2 FAIL: Cannot verify like functionality working - no visible like button in ac |
| 6 | Unlike restores state | WARNING | L1:pass L2:fail | L2 FAIL: Cannot verify the unlike functionality - the post image appears to be l |
| 7 | Post author links to profile | PASS | L1:pass L2:pass | The profile page shows a different user (Marcus Silva) with complete profile inf |
| 8 | News widget has content | WARNING | L1:pass L2:fail | L2 FAIL: The screen shows only a loading spinner on a black background with no v |

## athlete (6/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProPathHub page loads | PASS | L1:pass L2:pass | The ProPath page is working correctly and showing the expected setup state. It d |
| 2 | GetNoticed page loads with Browse tab | PASS | L1:pass L2:pass | The Get Noticed page is functioning correctly with all required elements: hero s |
| 3 | GetNoticed sport filter works | PASS | L1:pass L2:pass | Basketball filter is properly selected (highlighted in red) and shows real data  |
| 4 | GetNoticed My Showcase tab | PASS | L1:pass L2:pass | The My Showcase tab is correctly displaying the empty state with 'Put Yourself o |
| 5 | TheVault page loads | PASS | L1:pass L2:pass | The Vault page is functioning correctly - displays proper title with lock icon,  |
| 6 | PerformanceHub page loads | WARNING | L1:pass L2:fail | L2 FAIL: The Performance Hub page is showing an empty state prompting user to se |
| 7 | ScoutCard page loads for athlete | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 8 | Return to Feed from athlete features | PASS | L1:pass L2:pass | Feed page displays correctly with real content: story circles at top with actual |

## coach (2/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | AI Coach page loads | WARNING | L1:pass L2:fail | L2 FAIL: The AI Coach page is showing a premium gate/paywall instead of the expe |
| 2 | LiveCoaching page loads | WARNING | L1:pass L2:fail | L2 FAIL: The Live Coaching page shows an empty state with 'No sessions found' me |
| 3 | Creator Hub page loads for coach | PASS | L1:pass L2:pass | Creator Hub page is functioning properly with complete monetization dashboard sh |
| 4 | Analytics page loads for coach | WARNING | L1:pass L2:fail | L2 FAIL: Analytics page shows empty state with all metrics at 0 (Views, Likes, F |
| 5 | Return to Feed from coach features | PASS | L1:pass L2:pass | Feed page is fully functional with real data - showing user stories at top, work |

## org (1/6 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | OrgDashboard page loads | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 2 | OrgRoster page loads | WARNING | L1:pass L2:fail | L2 FAIL: Page shows only a loading spinner on black background with no content,  |
| 3 | OrgSessions page loads | WARNING | L1:pass L2:fail | L2 FAIL: Page shows only a loading spinner on black background with no content,  |
| 4 | OrgMessages page loads | WARNING | L1:pass L2:fail | L2 FAIL: Page shows only a loading spinner on a black background with no content |
| 5 | VideoReview page loads | WARNING | L1:pass L2:fail | L2 FAIL: The screen shows only a loading spinner on a black background with no v |
| 6 | Return to Feed from org features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real data - shows populated stories caro |

## parent (1/3 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ParentView page loads | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 2 | Parent can view Profile page | WARNING | L1:pass L2:fail | L2 FAIL: Profile page shows empty states for both Featured Highlights and My Spo |
| 3 | Return to Feed from parent features | PASS | L1:pass L2:pass | Successfully returned to Feed page showing full functionality - stories bar with |

## mobile (4/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Mobile Feed loads with bottom nav | WARNING | L1:pass L2:fail | L2 FAIL: The main feed area appears to be completely empty or showing only place |
| 2 | Mobile bottom nav — Explore | WARNING | L1:pass L2:fail | L2 FAIL: The content cards show placeholder '...' icons instead of actual video  |
| 3 | Mobile bottom nav — Reels | WARNING | L1:pass L2:fail | L2 FAIL: Two of the four reel tiles (Soccer and CrossFit) appear to be completel |
| 4 | Mobile bottom nav — Profile | PASS | L1:pass L2:pass | Profile page displays correctly for mobile at 375px width with proper single-col |
| 5 | Mobile Create Post button | PASS | L1:pass L2:pass | Create Post page displays correctly with functional text input area showing plac |
| 6 | Mobile Feed — posts are readable | WARNING | L1:pass L2:fail | L2 FAIL: The post shows truncated text with an ellipsis ('Every touch matters. E |
| 7 | Mobile — no horizontal scroll | PASS | L1:pass L2:pass | The mobile view displays properly within the 375px viewport width with no horizo |
| 8 | Mobile — return to Feed from mobile nav | PASS | L1:pass L2:pass | The mobile feed is displaying correctly with real content - Marcus Silva's post  |
