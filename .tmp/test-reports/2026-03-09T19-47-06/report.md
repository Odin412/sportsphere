# Sportsphere Test Report

**Date**: 2026-03-09T19:49:11.470Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 124.5s
**Result**: 2/7 passed | 3 critical | 2 warnings

## auth (2/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | WARNING | L1:pass L2:fail | L2 FAIL: No error message or red toast notification is visible after attempting  |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is properly loaded with all expected elements: left sideba |
| 4 | Session persists on refresh | CRITICAL | L1:fail L2:fail | L1 FAIL: locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting fo |
| 5 | Sign-up form has role selection | CRITICAL | L1:fail L2:pass | L1 FAIL: locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for  |
| 6 | Logout actually logs out | CRITICAL | L1:fail L2:pass | L1 FAIL: page.fill: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loca |
| 7 | Auth guard blocks Feed when logged out | WARNING | L1:pass L2:fail | L2 FAIL: This appears to be a light-themed onboarding form, not a dark-themed sp |
