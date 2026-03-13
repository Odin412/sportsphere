# Sportsphere Test Report

**Date**: 2026-03-10T19:58:03.729Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 373.3s
**Result**: 21/24 passed | 3 warnings

## live_feature (21/24 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Live page loads with hero and tabs | PASS | L1:pass L2:pass | The Live page displays correctly with the red/orange hero banner containing 'Liv |
| 2 | Go Live button is visible | PASS | L1:pass L2:pass | The 'Go Live' button is clearly visible in the hero area as a prominent white bu |
| 3 | Past Streams tab switches content | PASS | L1:pass L2:pass | The Past Streams tab is now active (black background vs gray Live Now tab) and s |
| 4 | Stream sport filter dropdown works | PASS | L1:pass L2:pass | The Live page is displaying correctly with the expected 'No streams match your f |
| 5 | Upload VOD form toggles open and close | PASS | L1:pass L2:pass | The Upload Video form panel is properly displayed with all required elements: vi |
| 6 | Go Live creates stream and redirects to ViewLive | PASS | L1:pass L2:pass L3:pass | The ViewLive page has loaded correctly with all expected elements: dark-themed v |
| 7 | Active broadcast dashboard on Live page | PASS | L1:pass L2:pass | The broadcast dashboard is functioning correctly - shows 'You're Broadcasting' s |
| 8 | End Stream ends the broadcast | PASS | L1:pass L2:pass L3:pass | The Live page is showing the expected empty state with 'No one's live right now' |
| 9 | Ended stream shows Stream Ended state | PASS | L1:pass L2:pass | The page correctly shows 'Stream Ended' overlay with duration information (0m),  |
| 10 | ViewLive with invalid stream ID shows error | PASS | L1:pass L2:pass | The page correctly displays 'Stream not found' error message with a '← Back to L |
| 11 | Ended stream has Summary and Highlights tabs | PASS | L1:pass L2:pass | The ViewLive page for the ended stream is working correctly. It shows the 'Strea |
| 12 | Create test live stream for panel tests | PASS | L1:pass L2:pass | The ViewLive page displays properly with a dark video player area showing 'Camer |
| 13 | Chat tab shows message input and send button | PASS | L1:pass L2:pass | Chat panel is visible on the right side with 'No messages yet. Start the chat!'  |
| 14 | Send a chat message | PASS | L1:pass L2:pass L3:pass | Chat panel is visible and functional with message input at bottom, 'No messages  |
| 15 | Polls tab shows polls or empty state | PASS | L1:pass L2:pass | The right-side panel shows polls content with 'No polls yet' text and a 'Create  |
| 16 | Q&A tab renders without crash | PASS | L1:pass L2:pass | The page shows a proper ViewLive layout with a video area displaying 'Camera acc |
| 17 | GameDay page loads with 3 sections | PASS | L1:pass L2:pass | The GameDay page displays correctly with the hero banner containing 'GameDay' he |
| 18 | GameDay sport filter buttons work | PASS | L1:pass L2:pass | The Basketball filter button is properly highlighted with a red background, indi |
| 19 | GameDay All filter resets | WARNING | L1:pass L2:fail | L2 FAIL: The page shows empty states for both 'Live Now' and 'Upcoming Games' se |
| 20 | GameRecap with invalid ID shows error | PASS | L1:pass L2:pass | The page correctly displays 'Game not found' error message with a functional '←  |
| 21 | GameRecap renders with test game data | WARNING | L1:pass L2:fail | L2 FAIL: The page is showing 'Game not found' error message instead of the expec |
| 22 | Box score section renders for Basketball game | WARNING | L1:pass L2:fail | L2 FAIL: The page shows 'Game not found' error message instead of a GameRecap pa |
| 23 | Game Stream wizard opens for coach account | PASS | L1:pass L2:pass | The Live page is properly displaying with functional elements: a live stream is  |
| 24 | Cleanup all test data | PASS | L1:pass L2:pass L3:pass | The Feed page displays properly with a functional dark-themed layout. Shows acti |
