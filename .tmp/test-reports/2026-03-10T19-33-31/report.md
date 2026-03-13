# Sportsphere Test Report

**Date**: 2026-03-10T19:39:40.108Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 367.8s
**Result**: 13/24 passed | 11 warnings

## live_feature (13/24 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Live page loads with hero and tabs | PASS | L1:pass L2:pass | The Live page is properly rendered with the red/orange hero banner displaying 'L |
| 2 | Go Live button is visible | PASS | L1:pass L2:pass | The 'Go Live' button is clearly visible in the hero area as a prominent white bu |
| 3 | Past Streams tab switches content | PASS | L1:pass L2:pass | The 'Past Streams' tab is now active/selected (dark background) and displays the |
| 4 | Stream sport filter dropdown works | WARNING | L1:pass L2:fail | L2 FAIL: The Live page is showing an empty state message 'No streams match your  |
| 5 | Upload VOD form toggles open and close | PASS | L1:pass L2:pass | Upload Video form is fully functional with all required components: video upload |
| 6 | Go Live creates stream and redirects to ViewLive | PASS | L1:pass L2:pass L3:pass | The ViewLive page has loaded successfully showing a dark-themed video player are |
| 7 | Active broadcast dashboard on Live page | PASS | L1:pass L2:pass | The broadcast dashboard is functioning correctly, showing 'You're Broadcasting'  |
| 8 | End Stream ends the broadcast | PASS | L1:pass L2:pass L3:pass | The Live page is displaying correctly with no active broadcast dashboard visible |
| 9 | Ended stream shows Stream Ended state | PASS | L1:pass L2:pass | The page correctly shows 'Stream Ended' state with duration (0m), has a 'Back to |
| 10 | ViewLive with invalid stream ID shows error | PASS | L1:pass L2:pass | The page correctly displays 'Stream not found' error message with a 'Back to Liv |
| 11 | Ended stream has Summary and Highlights tabs | PASS | L1:pass L2:pass | The ViewLive page correctly shows an ended stream state with 'Stream Ended' over |
| 12 | Create test live stream for panel tests | WARNING | L1:pass L2:fail | L2 FAIL: Camera access is denied with 'Not supported' error message, and the cha |
| 13 | Chat tab shows message input and send button | PASS | L1:pass L2:pass | Chat panel is visible and functional with message input field showing 'Say somet |
| 14 | Send a chat message | WARNING | L1:pass L2:fail L3:pass | L2 FAIL: The chat panel shows 'No messages yet. Start the chat!' indicating an e |
| 15 | Polls tab shows polls or empty state | WARNING | L1:pass L2:fail | L2 FAIL: The Live tab is currently selected/active (highlighted in red), not the |
| 16 | Q&A tab renders without crash | WARNING | L1:pass L2:fail | L2 FAIL: The Live feature has a critical camera access error ('Camera access den |
| 17 | GameDay page loads with 3 sections | WARNING | L1:pass L2:fail | L2 FAIL: The page shows a 404 error with 'Page Not Found' message, indicating th |
| 18 | GameDay sport filter buttons work | WARNING | L1:pass L2:fail | L2 FAIL: This is a 404 error page showing 'Page Not Found' for 'GameDay' page, w |
| 19 | GameDay All filter resets | WARNING | L1:pass L2:fail | L2 FAIL: This is a 404 error page indicating the 'GameDay' page could not be fou |
| 20 | GameRecap with invalid ID shows error | WARNING | L1:pass L2:fail | L2 FAIL: This is a 404 error page stating 'Page Not Found' for 'GameRecap', not  |
| 21 | GameRecap renders with test game data | WARNING | L1:pass L2:fail | L2 FAIL: The page shows a 404 error with 'Page Not Found' message stating that ' |
| 22 | Box score section renders for Basketball game | WARNING | L1:pass L2:fail | L2 FAIL: This is a 404 error page showing 'Page Not Found' for 'GameRecap', not  |
| 23 | Game Stream wizard opens for coach account | PASS | L1:pass L2:pass | The Live page is displaying correctly with real data - shows a live stream from  |
| 24 | Cleanup all test data | PASS | L1:pass L2:pass L3:pass | The Feed page is displaying normally with a functional dark-themed interface. Th |
