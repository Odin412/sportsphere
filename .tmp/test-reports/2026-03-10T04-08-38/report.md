# Sportsphere Test Report

**Date**: 2026-03-10T04:09:55.060Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 76.7s
**Result**: 4/5 passed | 1 warnings

## coaching_training (4/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | CoachingSessionDetail page loads | WARNING | L1:pass L2:fail | L2 FAIL: The main content area shows only a loading spinner in the center with n |
| 2 | TrainingPlans page loads | PASS | L1:pass L2:pass | Shows proper Training Plans page with dumbbell icon, '0 plans' counter, and empt |
| 3 | TrainingPlanDetail page loads | PASS | L1:pass L2:pass | Page shows a proper error state with 'Plan not found.' message and 'Back to Plan |
| 4 | MyTraining page loads | PASS | L1:pass L2:pass | The My Training page is working correctly, showing the dumbbell icon, 'Your pers |
| 5 | Return to Feed from coaching features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real content - shows user stories at top |
