# Sportsphere Test Report

**Date**: 2026-03-09T19:52:48.314Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 109.4s
**Result**: 3/7 passed | 3 critical | 1 warnings

## auth (3/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | PASS | L1:pass L2:pass | Error handling is working correctly - there's a red error toast at the top showi |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is properly displayed with all expected components: left s |
| 4 | Session persists on refresh | CRITICAL | L1:fail L2:fail | L1 FAIL: locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting fo |
| 5 | Sign-up form has role selection | CRITICAL | L1:fail L2:pass | L1 FAIL: locator.waitFor: Timeout 5000ms exceeded.
Call log:
[2m  - waiting for |
| 6 | Logout actually logs out | CRITICAL | L1:fail L2:fail | L1 FAIL: not_visible [data-tour="nav-feed"] | L2 FAIL: This appears to be an ima |
| 7 | Auth guard blocks Feed when logged out | WARNING | L1:pass L2:fail | L2 FAIL: This appears to be a light-themed onboarding page, not a dark-themed sp |
