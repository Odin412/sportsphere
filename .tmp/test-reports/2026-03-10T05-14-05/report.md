# Sportsphere Test Report

**Date**: 2026-03-10T05:17:33.738Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 207.7s
**Result**: 7/9 passed | 2 data issues

## interactions (7/9 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Create a post with text content | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Post not found in DB |
| 2 | Like a post on Feed | PASS | L1:pass L2:pass | Feed page is properly loaded with real content - showing Marcus Silva's soccer p |
| 3 | Comment on a post | PASS | L1:pass L2:pass L3:pass | Feed page is properly displayed with an expanded comments section. Shows a comme |
| 4 | Follow a user from their profile | PASS | L1:pass L2:pass L3:pass | User profile page is successfully loaded showing Marcus Silva's profile with vis |
| 5 | Bookmark a post on Feed | PASS | L1:pass L2:pass L3:pass | Feed page is working properly with real content - showing multiple posts with im |
| 6 | Update profile bio in ProfileSettings | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Bio in DB is: "" — expected to contain 1773119651682 |
| 7 | Create a group via Groups page | PASS | L1:pass L2:pass L3:pass | Shows the Groups page with 'You haven't joined any groups yet' empty state messa |
| 8 | Send a message in Messages | PASS | L1:pass L2:pass L3:pass | Messages page is properly loaded and functional. Shows the Messages section with |
| 9 | Cleanup: remove all test data | PASS | L1:pass L2:pass L3:pass | Feed page shows proper functionality with real content - user stories are visibl |
