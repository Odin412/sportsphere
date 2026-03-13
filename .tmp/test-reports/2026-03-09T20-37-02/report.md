# Sportsphere Test Report

**Date**: 2026-03-09T20:38:34.251Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 91.8s
**Result**: 5/8 passed | 3 warnings

## feed (5/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | PASS | L1:pass L2:pass | Feed is working properly with real content. Shows Marcus Silva's soccer post fro |
| 2 | Sport filter pills exist | PASS | L1:pass L2:pass | The horizontal row of sport filter pills is clearly visible and functional, show |
| 3 | Sport filter actually filters | PASS | L1:pass L2:pass | The Basketball filter is properly highlighted with a red background and white te |
| 4 | Clear filter restores all posts | PASS | L1:pass L2:pass | The feed successfully shows mixed sports content after filter removal - visible  |
| 5 | Like button works | WARNING | L1:pass L2:fail | L2 FAIL: Cannot verify like functionality worked - no visible like button in act |
| 6 | Unlike restores state | WARNING | L1:pass L2:fail | L2 FAIL: Cannot verify the unlike functionality as claimed in the instruction. T |
| 7 | Post author links to profile | PASS | L1:pass L2:pass | Shows Marcus Silva's profile page with complete user data: profile photo, 0 foll |
| 8 | News widget has content | WARNING | L1:pass L2:fail | L2 FAIL: The screen shows only a loading spinner on a black background with no v |
