# Sportsphere Test Report

**Date**: 2026-03-10T05:04:04.251Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 188.9s
**Result**: 5/9 passed | 2 warnings | 2 data issues

## interactions (5/9 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Create a post with text content | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Post not found in DB |
| 2 | Like a post on Feed | PASS | L1:pass L2:pass | Feed page is properly loaded with real content - shows user stories at top, acti |
| 3 | Comment on a post | PASS | L1:pass L2:pass L3:pass | Feed page is displaying correctly with a comments section expanded on a post. Th |
| 4 | Follow a user from their profile | PASS | L1:pass L2:pass L3:pass | Profile page for Marcus Silva loads successfully with complete user information  |
| 5 | Bookmark a post on Feed | PASS | L1:pass L2:pass L3:pass | Feed page is displaying properly with multiple posts containing real content - a |
| 6 | Update profile bio in ProfileSettings | DATA | L1:pass L2:pass L3:fail | L3 FAIL: Bio not updated in DB |
| 7 | Create a group via Groups page | WARNING | L1:pass L2:fail L3:pass | L2 FAIL: The page shows an empty state with 'You haven't joined any groups yet'  |
| 8 | Send a message in Messages | WARNING | L1:pass L2:fail L3:pass | L2 FAIL: Messages page shows empty state with no conversations or message histor |
| 9 | Cleanup: remove all test data | PASS | L1:pass L2:pass L3:pass | Feed page is displaying correctly with real content - stories section shows user |
