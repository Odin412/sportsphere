# Sportsphere Test Report

**Date**: 2026-03-09T21:32:48.130Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 63.2s
**Result**: 6/8 passed | 2 warnings

## mobile (6/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Mobile Feed loads with bottom nav | PASS | L1:pass L2:pass | The mobile layout displays correctly at 375px width with all required elements:  |
| 2 | Mobile bottom nav — Explore | WARNING | L1:pass L2:fail | L2 FAIL: Multiple content cards show placeholder images (gray boxes with dots) i |
| 3 | Mobile bottom nav — Reels | WARNING | L1:pass L2:fail | L2 FAIL: Three of the four reels (Soccer, CrossFit, and Baseball) are showing co |
| 4 | Mobile bottom nav — Profile | PASS | L1:pass L2:pass | Mobile profile page displays correctly with proper single-column layout. Shows u |
| 5 | Mobile Create Post button | PASS | L1:pass L2:pass | The Create Post page is properly functional with a well-sized text input area co |
| 6 | Mobile Feed — posts are readable | PASS | L1:pass L2:pass | The mobile feed displays correctly at 375px width with full-width cards showing  |
| 7 | Mobile — no horizontal scroll | PASS | L1:pass L2:pass | The dark-themed sports app displays properly within mobile viewport constraints. |
| 8 | Mobile — return to Feed from mobile nav | PASS | L1:pass L2:pass | Feed shows real content with Marcus Silva's post displaying actual text, image,  |
