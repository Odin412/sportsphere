# Sportsphere Test Report

**Date**: 2026-03-10T04:26:51.620Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 200.3s
**Result**: 8/8 passed

## admin (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Admin page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows a dark/black screen which is valid according to the criteria - this indica |
| 2 | AdminUsers page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows a dark/black screen which is valid according to the criteria - this appear |
| 3 | AdminContent page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Access denied.' message which is one of the acceptable states for content |
| 4 | AdminAnalytics page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows clear 'Access denied.' message indicating proper authorization handling -  |
| 5 | AdminSettings page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Access denied.' message on dark background, which is one of the acceptabl |
| 6 | AdminHealth page loads or blocks non-admin | PASS | L1:pass L2:pass | The page displays 'Access denied.' message in the center, which is one of the ac |
| 7 | ModerationQueue page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows proper access control with 'Admin access required' message and shield icon |
| 8 | Return to Feed from admin pages | PASS | L1:pass L2:pass | Feed page is working properly with real content - shows user stories at top, fun |
