# Sportsphere Test Report

**Date**: 2026-03-10T04:14:33.059Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 76.6s
**Result**: 4/5 passed | 1 warnings

## coaching_training (4/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | CoachingSessionDetail page loads | PASS | L1:pass L2:pass | Page shows proper app shell with navigation sidebar and a loading spinner in the |
| 2 | TrainingPlans page loads | PASS | L1:pass L2:pass | Shows proper Training Plans page with dumbbell icon, '0 plans' count, and clear  |
| 3 | TrainingPlanDetail page loads | WARNING | L1:pass L2:fail | L2 FAIL: Page shows 'Plan not found' error message with 'Back to Plans' button,  |
| 4 | MyTraining page loads | PASS | L1:pass L2:pass | The page correctly displays the 'My Training' section with dumbbell icon, subtit |
| 5 | Return to Feed from coaching features | PASS | L1:pass L2:pass | Feed page is properly functioning with real content - shows user stories at top, |
