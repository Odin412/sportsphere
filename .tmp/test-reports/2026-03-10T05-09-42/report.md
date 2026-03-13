# Sportsphere Test Report

**Date**: 2026-03-10T05:13:03.177Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 200.2s
**Result**: 7/9 passed | 2 data issues

## interactions (7/9 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Create a post with text content | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Post not found in DB |
| 2 | Like a post on Feed | PASS | L1:pass L2:pass | Feed page is properly loaded and functional with real content - shows user stori |
| 3 | Comment on a post | PASS | L1:pass L2:pass L3:pass | Feed page is loaded with a post showing an expanded comments section. There's a  |
| 4 | Follow a user from their profile | PASS | L1:pass L2:pass L3:pass | User profile page for Marcus Silva is properly loaded and functional. Shows prof |
| 5 | Bookmark a post on Feed | PASS | L1:pass L2:pass L3:pass | Feed page is displaying properly with real posts. Shows two posts with actual co |
| 6 | Update profile bio in ProfileSettings | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Bio in DB is: "" — expected to contain 1773119388712 |
| 7 | Create a group via Groups page | PASS | L1:pass L2:pass L3:pass | Shows the Groups page with 'You haven't joined any groups yet' empty state, whic |
| 8 | Send a message in Messages | PASS | L1:pass L2:pass L3:pass | Messages page is properly loaded and functional. Shows the Messages interface wi |
| 9 | Cleanup: remove all test data | PASS | L1:pass L2:pass L3:pass | Feed page is fully functional with real content - shows user stories at top, wor |
