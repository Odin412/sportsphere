# Sportsphere Test Report

**Date**: 2026-03-09T21:34:53.976Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 42.9s
**Result**: 2/5 passed | 3 warnings

## coach (2/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | AI Coach page loads | WARNING | L1:pass L2:fail | L2 FAIL: The AI Coach page is showing a premium paywall instead of the expected  |
| 2 | LiveCoaching page loads | WARNING | L1:pass L2:fail | L2 FAIL: The Live Coaching page shows an empty state with 'No sessions found' me |
| 3 | Creator Hub page loads for coach | PASS | L1:pass L2:pass | Creator Hub page loads successfully with proper functionality. Shows monetizatio |
| 4 | Analytics page loads for coach | WARNING | L1:pass L2:fail | L2 FAIL: The analytics page shows all metrics as 0 or 0% with no actual data vis |
| 5 | Return to Feed from coach features | PASS | L1:pass L2:pass | Feed page is fully functional with real content - shows user stories at top, act |
