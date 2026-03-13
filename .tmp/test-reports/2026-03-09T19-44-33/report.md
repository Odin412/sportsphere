# Sportsphere Test Report

**Date**: 2026-03-09T19:45:23.645Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 47.8s
**Result**: 1/7 passed | 1 critical | 1 warnings | 4 skipped

## auth (1/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | Login page displays correctly with split-screen design - dark left panel shows S |
| 2 | Invalid credentials rejected | WARNING | L1:pass L2:fail | L2 FAIL: No error message or red toast notification is visible after attempting  |
| 3 | Valid login redirects to Feed | CRITICAL | L1:fail L2:pass | L1 FAIL: page.waitForURL: Timeout 20000ms exceeded.
===========================  |
| 4 | Session persists on refresh | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 5 | Sign-up form has role selection | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 6 | Logout actually logs out | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
| 7 | Auth guard blocks Feed when logged out | SKIP | L1:skipped L2:skipped L3:skipped | Skipped due to earlier critical failure |
