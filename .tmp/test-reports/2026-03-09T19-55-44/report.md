# Sportsphere Test Report

**Date**: 2026-03-09T20:04:04.482Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 499.2s
**Result**: 6/26 passed | 12 critical | 1 warnings | 7 skipped

## auth (6/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | WARNING | L1:pass L2:fail | L2 FAIL: No error message or red toast notification is visible after attempting  |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is displaying correctly with a dark theme. The left sideba |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | Page shows authenticated feed state after refresh with proper navigation sidebar |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The signup form is working correctly with Create Account tab active, showing all |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, de |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with dark theme, shows Sportsphere logo, main he |

## navigation (0/11 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Sidebar renders all primary nav | CRITICAL | L1:fail L2:fail | L1 FAIL: locator.waitFor: Timeout 8000ms exceeded.
Call log:
[2m  - waiting for |
| 2 | Navigate to Explore | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 3 | Navigate to Reels | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 4 | Navigate to ProPath | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 5 | Navigate to Live | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 6 | Navigate to Messages | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 7 | Navigate to Profile | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 8 | More menu expands | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 9 | Navigate to Challenges (secondary) | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 10 | Navigate to Forums (secondary) | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
| 11 | Return to Feed (round-trip) | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |

## feed (0/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | CRITICAL | L1:fail L2:fail | L1 FAIL: locator.waitFor: Timeout 8000ms exceeded.
Call log:
[2m  - waiting for |
| 2 | Sport filter pills exist | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 3 | Sport filter actually filters | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 4 | Clear filter restores all posts | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 5 | Like button works | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 6 | Unlike restores state | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 7 | Post author links to profile | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 8 | News widget has content | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
