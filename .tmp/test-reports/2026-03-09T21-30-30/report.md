# Sportsphere Test Report

**Date**: 2026-03-09T21:31:39.413Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 67.7s
**Result**: 6/8 passed | 2 warnings

## athlete (6/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProPathHub page loads | PASS | L1:pass L2:pass | The ProPath page is correctly displaying the setup prompt state for users who ha |
| 2 | GetNoticed page loads with Browse tab | PASS | L1:pass L2:pass | All required features are working correctly: 'Get Noticed' hero section with des |
| 3 | GetNoticed sport filter works | PASS | L1:pass L2:pass | Basketball filter is properly selected/highlighted with red background, search s |
| 4 | GetNoticed My Showcase tab | PASS | L1:pass L2:pass | The My Showcase tab is correctly displayed with the expected empty state content |
| 5 | TheVault page loads | PASS | L1:pass L2:pass | The Vault page is working correctly - displays proper title with lock icon, 'Pri |
| 6 | PerformanceHub page loads | WARNING | L1:pass L2:fail | L2 FAIL: The Performance Hub page is showing an empty state with a setup prompt  |
| 7 | ScoutCard page loads for athlete | WARNING | L1:pass L2:fail | L2 FAIL: The page shows only a loading spinner on a black background with no con |
| 8 | Return to Feed from athlete features | PASS | L1:pass L2:pass | Feed page is functioning properly with real content - shows user stories at top, |
