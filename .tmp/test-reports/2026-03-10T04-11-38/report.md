# Sportsphere Test Report

**Date**: 2026-03-10T04:12:58.829Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 79.5s
**Result**: 4/5 passed | 1 warnings

## coaching_training (4/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | CoachingSessionDetail page loads | PASS | L1:pass L2:pass | Page shows the expected dark-themed app shell with navigation sidebar and a load |
| 2 | TrainingPlans page loads | PASS | L1:pass L2:pass | Shows Training Plans page with dumbbell icon, '0 plans' counter, and proper empt |
| 3 | TrainingPlanDetail page loads | WARNING | L1:pass L2:fail | L2 FAIL: The page shows a 'Plan not found' error state, which indicates the feat |
| 4 | MyTraining page loads | PASS | L1:pass L2:pass | The My Training page is displaying correctly with the dumbbell icon, 'Your perso |
| 5 | Return to Feed from coaching features | PASS | L1:pass L2:pass | Feed page is working correctly with real data - shows user stories at top, funct |
