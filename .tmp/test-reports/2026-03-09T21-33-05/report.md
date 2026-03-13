# Sportsphere Test Report

**Date**: 2026-03-09T21:34:09.911Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 64.2s
**Result**: 6/8 passed | 2 warnings

## athlete (6/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProPathHub page loads | PASS | L1:pass L2:pass | The ProPath page is functioning correctly, displaying the setup prompt for users |
| 2 | GetNoticed page loads with Browse tab | PASS | L1:pass L2:pass | Page displays correctly with 'Get Noticed' hero section, Browse Athletes button  |
| 3 | GetNoticed sport filter works | PASS | L1:pass L2:pass | Basketball filter is properly highlighted/selected (showing active state), searc |
| 4 | GetNoticed My Showcase tab | PASS | L1:pass L2:pass | The My Showcase tab is correctly displaying the empty state with 'Put Yourself o |
| 5 | TheVault page loads | PASS | L1:pass L2:pass | The Vault page is working correctly - shows proper title with lock icon, 'Privat |
| 6 | PerformanceHub page loads | WARNING | L1:pass L2:fail | L2 FAIL: The Performance Hub page is showing an empty state with a setup prompt  |
| 7 | ScoutCard page loads for athlete | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 8 | Return to Feed from athlete features | PASS | L1:pass L2:pass | Feed page displays correctly with real content - story carousel with user avatar |
