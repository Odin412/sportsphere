# Sportsphere Test Report

**Date**: 2026-03-10T03:20:54.297Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 916.5s
**Result**: 59/70 passed | 1 critical | 10 warnings

## auth (7/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | Login page displays correctly with split-screen design - dark left panel shows S |
| 2 | Invalid credentials rejected | PASS | L1:pass L2:pass | Error handling is working correctly - there are two visible error messages displ |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is working correctly - left sidebar shows navigation items |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | The authenticated feed page is properly displayed after refresh with all expecte |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The create account form is properly displayed and functional - shows the 'Create |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with proper logged-out state - shows Sportsphere |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |

## navigation (10/11 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Sidebar renders all primary nav | WARNING | L1:pass L2:fail | L2 FAIL: The main feed area appears to be completely empty with no posts, conten |
| 2 | Navigate to Explore | PASS | L1:pass L2:pass | The Explore page is functioning properly with a complete dark-themed UI. It show |
| 3 | Navigate to Reels | PASS | L1:pass L2:pass | The Reels page is functioning properly with a grid layout showing sports content |
| 4 | Navigate to ProPath | PASS | L1:pass L2:pass | The ProPath page loaded successfully showing the setup prompt 'Set Up Your ProPa |
| 5 | Navigate to Live | PASS | L1:pass L2:pass | The Live streaming page loaded successfully with all expected UI elements: 'Live |
| 6 | Navigate to Messages | PASS | L1:pass L2:pass | Messages page loaded successfully with proper UI elements: 'Messages' heading, s |
| 7 | Navigate to Profile | PASS | L1:pass L2:pass | Profile page is properly structured and functional. Shows complete user profile  |
| 8 | More menu expands | PASS | L1:pass L2:pass | The More section is properly expanded showing additional navigation options like |
| 9 | Navigate to Challenges (secondary) | PASS | L1:pass L2:pass | The Challenges page has loaded successfully with all expected UI elements: orang |
| 10 | Navigate to Forums (secondary) | PASS | L1:pass L2:pass | The Forums page loaded successfully with the 'Community Forums' heading, topic c |
| 11 | Return to Feed (round-trip) | PASS | L1:pass L2:pass | Feed page is functioning properly with real content displayed - showing user sto |

## feed (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | PASS | L1:pass L2:pass | Feed is working properly with real content. Shows Marcus Silva post with actual  |
| 2 | Sport filter pills exist | PASS | L1:pass L2:pass | The horizontal row of sport filter pill buttons is visible and functioning corre |
| 3 | Sport filter actually filters | PASS | L1:pass L2:pass | The Basketball filter is properly selected with a highlighted red background, an |
| 4 | Clear filter restores all posts | PASS | L1:pass L2:pass | The feed successfully shows posts from multiple sports after filter removal. The |
| 5 | Like button works | PASS | L1:pass L2:pass | The feed is displaying properly with real content including Marcus Silva's post  |
| 6 | Unlike restores state | PASS | L1:pass L2:pass | The feed is displaying properly with user stories at top, functional category fi |
| 7 | Post author links to profile | PASS | L1:pass L2:pass | The profile page shows Marcus Silva's complete profile with real data: profile p |
| 8 | News widget has content | PASS | L1:pass L2:pass | Feed page is functioning properly with real content visible - shows posts from u |

## athlete (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProPathHub page loads | PASS | L1:pass L2:pass | The ProPath page is displaying the correct setup state with a clear call-to-acti |
| 2 | GetNoticed page loads with Browse tab | PASS | L1:pass L2:pass | The Get Noticed page is functioning correctly with all required elements present |
| 3 | GetNoticed sport filter works | PASS | L1:pass L2:pass | Basketball filter is correctly highlighted/selected with orange background, show |
| 4 | GetNoticed My Showcase tab | PASS | L1:pass L2:pass | The page shows the correct 'My Showcase' content with the empty state displaying |
| 5 | TheVault page loads | PASS | L1:pass L2:pass | The Vault page is displaying correctly with all expected elements: 'The Vault' t |
| 6 | PerformanceHub page loads | PASS | L1:pass L2:pass | The Performance Hub page is displaying the expected empty state with a clear pro |
| 7 | ScoutCard page loads for athlete | PASS | L1:pass L2:pass | The page correctly displays option (b) - a proper message indicating 'No Sport P |
| 8 | Return to Feed from athlete features | PASS | L1:pass L2:pass | Feed page is functioning properly with real content - showing user stories at to |

## coach (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | AI Coach page loads | PASS | L1:pass L2:pass | The AI Coach page is displaying a proper premium gate with clear structure - cro |
| 2 | LiveCoaching page loads | PASS | L1:pass L2:pass | The Live Coaching page displays correctly with proper header, navigation tabs (U |
| 3 | Creator Hub page loads for coach | PASS | L1:pass L2:pass | Creator Hub page is functioning correctly with a comprehensive dashboard showing |
| 4 | Analytics page loads for coach | PASS | L1:pass L2:pass | Analytics page is properly loaded and functional. The layout shows a complete Cr |
| 5 | Return to Feed from coach features | PASS | L1:pass L2:pass | Successfully returned to Feed page after navigation round-trip. All core feature |

## org (6/6 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | OrgDashboard page loads | PASS | L1:pass L2:pass | Page shows the correct 'Welcome to SportHub Teams' onboarding state with shield  |
| 2 | OrgRoster page loads | PASS | L1:pass L2:pass | The page correctly displays the 'No Organization Yet' empty state with appropria |
| 3 | OrgSessions page loads | PASS | L1:pass L2:pass | The page correctly displays the 'No Organization Yet' empty state with a calenda |
| 4 | OrgMessages page loads | PASS | L1:pass L2:pass | The page correctly displays the 'No Organization Yet' empty state with a chat bu |
| 5 | VideoReview page loads | PASS | L1:pass L2:pass | The Video Review page is displaying the correct 'No Organization Yet' empty stat |
| 6 | Return to Feed from org features | PASS | L1:pass L2:pass | Feed page is fully functional with real content - shows user stories, active pos |

## parent (3/3 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ParentView page loads | PASS | L1:pass L2:pass | Page successfully loaded with proper Parent View UI showing state (b) - the mess |
| 2 | Parent can view Profile page | PASS | L1:pass L2:pass | Profile page is working correctly with proper layout, user info displayed (Test  |
| 3 | Return to Feed from parent features | PASS | L1:pass L2:pass | Feed page is displaying correctly with real user data - stories carousel shows m |

## onboarding (3/4 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Athlete onboarding — Step 1 (sport + level) | PASS | L1:pass L2:pass | This is a proper athlete onboarding page showing 'Step 1 of 3' with sport select |
| 2 | Athlete onboarding — Walk through steps | PASS | L1:pass L2:pass | The athlete onboarding page is displaying Step 1 of 3 correctly with a functiona |
| 3 | Athlete onboarding — Reaches app after completion | WARNING | L1:pass L2:fail | L2 FAIL: The feed appears to be in an empty state with no posts visible in the m |
| 4 | Cleanup ephemeral accounts | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, logo, tagline, descripti |

## mobile (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Mobile Feed loads with bottom nav | PASS | L1:pass L2:pass | Mobile layout is correctly structured with header, stories section showing user  |
| 2 | Mobile bottom nav — Explore | PASS | L1:pass L2:pass | The mobile Explore page is functioning properly with responsive vertical layout  |
| 3 | Mobile bottom nav — Reels | PASS | L1:pass L2:pass | The mobile Reels page displays correctly with a 2x2 grid layout showing 4 reel c |
| 4 | Mobile bottom nav — Profile | PASS | L1:pass L2:pass | Profile page displays correctly with avatar, name 'Test Athlete', stats showing  |
| 5 | Mobile Create Post button | PASS | L1:pass L2:pass | Create Post page displays correctly with all required elements: text input area  |
| 6 | Mobile Feed — posts are readable | PASS | L1:pass L2:pass | The mobile feed displays correctly at 375px width with full-width post cards, vi |
| 7 | Mobile — no horizontal scroll | PASS | L1:pass L2:pass | The mobile app displays correctly within the viewport with no horizontal scrollb |
| 8 | Mobile — return to Feed from mobile nav | PASS | L1:pass L2:pass | The mobile feed is displaying properly with real content - Marcus Silva's soccer |

## community (1/10 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Groups page loads | WARNING | L1:pass L2:fail | L2 FAIL: This appears to be a landing/welcome page for Sportsphere with 'Get Sta |
| 2 | Groups — search bar and category filters visible | WARNING | L1:pass L2:fail | L2 FAIL: This is a landing/homepage with 'Sportsphere' branding and 'Get Started |
| 3 | GroupDetail page loads | PASS | L1:pass L2:pass | This appears to be the landing/homepage of Sportsphere with proper branding, tag |
| 4 | Events page loads | WARNING | L1:pass L2:fail | L2 FAIL: This is a landing/welcome page for Sportsphere showing the app logo, ta |
| 5 | Events — filters and type pills visible | WARNING | L1:pass L2:fail | L2 FAIL: This appears to be a landing/homepage with app branding and CTA buttons |
| 6 | Notifications page loads | WARNING | L1:pass L2:fail | L2 FAIL: This is a landing/welcome page for Sportsphere, not a notifications pag |
| 7 | Notifications — filter pills visible | WARNING | L1:pass L2:fail | L2 FAIL: This is a landing/homepage with Sportsphere branding and Get Started/Si |
| 8 | ForumTopic page loads | WARNING | L1:pass L2:fail | L2 FAIL: This appears to be a landing/marketing page for Sportsphere with 'Get S |
| 9 | Advice page loads | WARNING | L1:pass L2:fail | L2 FAIL: This appears to be a landing/homepage with 'Sportsphere' branding and ' |
| 10 | Return to Feed from community features | CRITICAL | L1:fail L2:pass | L1 FAIL: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for loc |
