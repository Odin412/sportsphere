# Sportsphere Test Report

**Date**: 2026-03-10T04:21:59.778Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 195.3s
**Result**: 6/8 passed | 2 warnings

## admin (6/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Admin page loads or blocks non-admin | WARNING | L1:pass L2:fail | L2 FAIL: The screen is completely black with no visible content, UI elements, or |
| 2 | AdminUsers page loads or blocks non-admin | WARNING | L1:pass L2:fail | L2 FAIL: Screen is completely black with no visible content, UI elements, loadin |
| 3 | AdminContent page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Access denied.' message which is an expected authorized response for cont |
| 4 | AdminAnalytics page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows clear 'Access denied.' message, which is one of the acceptable states acco |
| 5 | AdminSettings page loads or blocks non-admin | PASS | L1:pass L2:pass | The page displays a clear 'Access denied.' message, which is one of the acceptab |
| 6 | AdminHealth page loads or blocks non-admin | PASS | L1:pass L2:pass | The page displays a clear 'Access denied.' message in the main content area, whi |
| 7 | ModerationQueue page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Admin access required.' message with shield icon, which is a proper unaut |
| 8 | Return to Feed from admin pages | PASS | L1:pass L2:pass | Feed page is functioning correctly with real content - shows story carousel with |
