# Sportsphere Test Report

**Date**: 2026-03-09T19:55:37.165Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 94.0s
**Result**: 6/7 passed | 1 warnings

## auth (6/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | WARNING | L1:pass L2:fail | L2 FAIL: No error message or red toast notification is visible after attempting  |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is working correctly - showing left sidebar navigation wit |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | The page shows a fully functional authenticated feed with real user content - Ma |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The sign-up form is properly displayed with the 'Create Account' tab active. All |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, shows Sportsphere brandi |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |
