# Sportsphere Test Report

**Date**: 2026-03-10T05:26:24.588Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 215.9s
**Result**: 7/9 passed | 2 data issues

## interactions (7/9 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Create a post with text content | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Post not found in DB |
| 2 | Like a post on Feed | PASS | L1:pass L2:pass | The Feed page is fully functional and displaying real content. There's a complet |
| 3 | Comment on a post | PASS | L1:pass L2:pass L3:pass | The Feed page is displaying correctly with a post that shows engagement metrics  |
| 4 | Follow a user from their profile | PASS | L1:pass L2:pass L3:pass | User profile page is successfully loaded showing Marcus Silva's profile with com |
| 5 | Bookmark a post on Feed | PASS | L1:pass L2:pass L3:pass | Feed page is displaying properly with real content - shows multiple posts with i |
| 6 | Update profile bio in ProfileSettings | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Bio in DB is: "" — expected to contain 1773120174508 |
| 7 | Create a group via Groups page | PASS | L1:pass L2:pass L3:pass | Shows the Groups page with 'You haven't joined any groups yet' empty state, whic |
| 8 | Send a message in Messages | PASS | L1:pass L2:pass L3:pass | Messages page is functional and displays a support chat interface with SportHub  |
| 9 | Cleanup: remove all test data | PASS | L1:pass L2:pass L3:pass | Feed page is displaying correctly with real content - shows user stories at top  |
