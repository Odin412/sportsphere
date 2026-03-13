# Sportsphere Test Report

**Date**: 2026-03-09T20:43:37.008Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 296.1s
**Result**: 16/26 passed | 1 critical | 9 warnings

## auth (6/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | WARNING | L1:pass L2:fail | L2 FAIL: No error message or red toast notification is visible after attempting  |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is working correctly. The left sidebar shows all navigatio |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | The authenticated feed page is properly displayed after refresh. Shows logged-in |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The sign-up form is working correctly with the 'Create Account' tab active (high |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with dark theme, shows Sportsphere branding, tag |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |

## navigation (5/11 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Sidebar renders all primary nav | PASS | L1:pass L2:pass | Left sidebar displays all 7 navigation items (Feed, Explore, Reels, ProPath, Liv |
| 2 | Navigate to Explore | PASS | L1:pass L2:pass | The Explore page is functioning properly with real content loaded. Shows sport c |
| 3 | Navigate to Reels | WARNING | L1:pass L2:fail | L2 FAIL: The Reels page shows mostly empty/blank video containers with only spor |
| 4 | Navigate to ProPath | WARNING | L1:pass L2:fail | L2 FAIL: This is showing an empty state setup prompt rather than a functional Pr |
| 5 | Navigate to Live | PASS | L1:pass L2:pass | The Live Streams page loads correctly with proper functionality - shows the Live |
| 6 | Navigate to Messages | WARNING | L1:pass L2:fail | L2 FAIL: The Messages page shows an empty state with 'Select a conversation' pla |
| 7 | Navigate to Profile | WARNING | L1:pass L2:fail | L2 FAIL: Profile page shows only empty states - 'No featured post yet' and 'No s |
| 8 | More menu expands | PASS | L1:pass L2:pass | The expanded More menu is functioning properly, displaying all secondary navigat |
| 9 | Navigate to Challenges (secondary) | WARNING | L1:pass L2:fail | L2 FAIL: The page shows an empty state with 'No challenges found' message, which |
| 10 | Navigate to Forums (secondary) | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 11 | Return to Feed (round-trip) | PASS | L1:pass L2:pass | Feed page is fully functional with real content - shows user stories, active pos |

## feed (5/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | PASS | L1:pass L2:pass | Feed is properly displaying real content with user Marcus Silva's post about soc |
| 2 | Sport filter pills exist | PASS | L1:pass L2:pass | The sport filter pills are visible and functional - showing 'For You', 'Followin |
| 3 | Sport filter actually filters | PASS | L1:pass L2:pass | Basketball filter is working correctly - the Basketball pill is highlighted in r |
| 4 | Clear filter restores all posts | PASS | L1:pass L2:pass | The feed shows mixed sports content with posts tagged as Soccer, and the sports  |
| 5 | Like button works | WARNING | L1:pass L2:fail | L2 FAIL: Cannot verify like functionality is working - no visible like button in |
| 6 | Unlike restores state | WARNING | L1:pass L2:fail | L2 FAIL: Cannot verify the unlike functionality worked - the image shows a modal |
| 7 | Post author links to profile | PASS | L1:pass L2:pass | The profile page shows Marcus Silva's complete profile with real data: profile p |
| 8 | News widget has content | WARNING | L1:pass L2:fail | L2 FAIL: The screen shows only a loading spinner on a black background with no v |
