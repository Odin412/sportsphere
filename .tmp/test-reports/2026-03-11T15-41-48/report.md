# Sportsphere Test Report

**Date**: 2026-03-11T16:18:02.933Z
**URL**: https://sportsphere-titan-one.vercel.app
**Duration**: 2173.6s
**Result**: 156/159 passed | 3 warnings

## auth (7/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Login page renders | PASS | L1:pass L2:pass | The login page displays correctly with the expected split-screen design. Left pa |
| 2 | Invalid credentials rejected | PASS | L1:pass L2:pass | The login attempt with fake credentials correctly failed - there's a red error m |
| 3 | Valid login redirects to Feed | PASS | L1:pass L2:pass | The authenticated app is displaying correctly with all expected components: left |
| 4 | Session persists on refresh | PASS | L1:pass L2:pass | The authenticated feed page is displaying correctly after refresh with all expec |
| 5 | Sign-up form has role selection | PASS | L1:pass L2:pass | The sign-up form is working correctly with the 'Create Account' tab active and a |
| 6 | Logout actually logs out | PASS | L1:pass L2:pass | Landing page displays correctly with proper logout state - shows Sportsphere bra |
| 7 | Auth guard blocks Feed when logged out | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |

## navigation (11/11 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Sidebar renders all primary nav | PASS | L1:pass L2:pass | Left sidebar displays all 7 required navigation items (Feed, Explore, Reels, Pro |
| 2 | Navigate to Explore | PASS | L1:pass L2:pass | The Explore page is functioning correctly with real content. It shows sport cate |
| 3 | Navigate to Reels | PASS | L1:pass L2:pass | The Reels page is properly loaded and functional. It shows a grid layout with vi |
| 4 | Navigate to ProPath | PASS | L1:pass L2:pass | The ProPath page loaded successfully with a proper setup prompt. It displays 'Se |
| 5 | Navigate to Live | PASS | L1:pass L2:pass | The Live streaming page has loaded correctly with all expected UI elements: 'Liv |
| 6 | Navigate to Messages | PASS | L1:pass L2:pass | Messages page loaded successfully with proper UI elements including 'Messages' h |
| 7 | Navigate to Profile | PASS | L1:pass L2:pass | Profile page displays correctly with user avatar, name 'Test Athlete', stats sec |
| 8 | More menu expands | PASS | L1:pass L2:pass | The More menu is properly expanded showing all secondary navigation items (For Y |
| 9 | Navigate to Challenges (secondary) | PASS | L1:pass L2:pass | The Challenges page has loaded successfully with proper UI elements including th |
| 10 | Navigate to Forums (secondary) | PASS | L1:pass L2:pass | Community Forums page loaded successfully with proper UI elements including head |
| 11 | Return to Feed (round-trip) | PASS | L1:pass L2:pass | Feed page is working properly with real user posts displayed. Shows actual conte |

## feed (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Feed loads with real posts | PASS | L1:pass L2:pass | Feed is displaying properly with real sports content from multiple users (Jaylen |
| 2 | Sport filter pills exist | PASS | L1:pass L2:pass | The sport filter pills are clearly visible and functional - showing 'For You', ' |
| 3 | Sport filter actually filters | PASS | L1:pass L2:pass | The Basketball filter is properly highlighted in red/orange color showing it's s |
| 4 | Clear filter restores all posts | PASS | L1:pass L2:pass | The feed successfully shows posts from multiple sports with the filter cleared.  |
| 5 | Like button works | PASS | L1:pass L2:pass | The feed is displaying properly with real posts from users (Jaylen Williams, Jor |
| 6 | Unlike restores state | PASS | L1:pass L2:pass | The sports feed is working correctly with real user posts displayed from Jaylen  |
| 7 | Post author links to profile | PASS | L1:pass L2:pass | The page shows a different user's profile (Jaylen Williams) with real data: prof |
| 8 | News widget has content | PASS | L1:pass L2:pass | The feed page is functional with real posts visible from users Mike Williams and |

## athlete (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProPathHub page loads | PASS | L1:pass L2:pass | The ProPath page is functioning correctly, showing the setup state with a trophy |
| 2 | GetNoticed page loads with Browse tab | PASS | L1:pass L2:pass | The Get Noticed page is working correctly with all required elements present: he |
| 3 | GetNoticed sport filter works | PASS | L1:pass L2:pass | The basketball filter is properly highlighted/selected (red background) and show |
| 4 | GetNoticed My Showcase tab | PASS | L1:pass L2:pass | The My Showcase tab is displaying the correct empty state with 'Put Yourself on  |
| 5 | TheVault page loads | PASS | L1:pass L2:pass | The Vault page is displaying correctly with all required elements: 'The Vault' t |
| 6 | PerformanceHub page loads | PASS | L1:pass L2:pass | The Performance Hub page is displaying correctly with an appropriate empty state |
| 7 | ScoutCard page loads for athlete | PASS | L1:pass L2:pass | The Scout Card page is displaying the correct empty state with 'No Sport Profile |
| 8 | Return to Feed from athlete features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real sports content displayed. Shows act |

## coach (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | AI Coach page loads | PASS | L1:pass L2:pass | The AI Coach page displays properly with a premium gate/upgrade prompt as expect |
| 2 | LiveCoaching page loads | PASS | L1:pass L2:pass | Live Coaching page is working properly - displays correct header with video icon |
| 3 | Creator Hub page loads for coach | PASS | L1:pass L2:pass | Creator Hub page is functioning properly with all monetization metrics displayin |
| 4 | Analytics page loads for coach | PASS | L1:pass L2:pass | Analytics page loads properly with complete layout including metric cards showin |
| 5 | Return to Feed from coach features | PASS | L1:pass L2:pass | Feed page is working correctly with real sports content. Shows active user stori |

## org (6/6 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | OrgDashboard page loads | PASS | L1:pass L2:pass | The page shows the expected 'Welcome to SportHub Teams' state with the red shiel |
| 2 | OrgRoster page loads | PASS | L1:pass L2:pass | The page correctly displays the 'No Organization Yet' empty state with appropria |
| 3 | OrgSessions page loads | PASS | L1:pass L2:pass | The page correctly displays the 'No Organization Yet' empty state with a calenda |
| 4 | OrgMessages page loads | PASS | L1:pass L2:pass | The page shows a functional channel-based messaging interface with channels list |
| 5 | VideoReview page loads | PASS | L1:pass L2:pass | The page displays a proper 'No Organization Yet' empty state with a video camera |
| 6 | Return to Feed from org features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real content - showing sports stories fr |

## parent (3/3 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ParentView page loads | PASS | L1:pass L2:pass | The Parent View page loaded correctly showing option (b) - a proper 'Parent View |
| 2 | Parent can view Profile page | PASS | L1:pass L2:pass | Profile page is working correctly - displays user info (Test Parent with avatar) |
| 3 | Return to Feed from parent features | PASS | L1:pass L2:pass | Feed page is fully functional with real user data - shows story carousel with us |

## onboarding (4/4 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Athlete onboarding — Step 1 (sport + level) | PASS | L1:pass L2:pass | This is clearly an athlete onboarding page showing sport selection with multiple |
| 2 | Athlete onboarding — Walk through steps | PASS | L1:pass L2:pass | Athlete onboarding page is functioning properly - shows Step 1 of 3, has clear s |
| 3 | Athlete onboarding — Reaches app after completion | PASS | L1:pass L2:pass | The app is successfully showing the authenticated feed with real user data - mul |
| 4 | Cleanup ephemeral accounts | PASS | L1:pass L2:pass | Landing page displays correctly with proper dark theme, Sportsphere branding, cl |

## mobile (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Mobile Feed loads with bottom nav | PASS | L1:pass L2:pass | Mobile layout is properly structured with header containing SPORTSPHERE logo and |
| 2 | Mobile bottom nav — Explore | PASS | L1:pass L2:pass | Mobile Explore page is properly functional with responsive vertical layout at 37 |
| 3 | Mobile bottom nav — Reels | PASS | L1:pass L2:pass | The mobile Reels page displays correctly with a proper grid layout showing 4 ree |
| 4 | Mobile bottom nav — Profile | PASS | L1:pass L2:pass | Mobile profile page displays correctly with proper dark theme layout - shows use |
| 5 | Mobile Create Post button | PASS | L1:pass L2:pass | Create post interface is properly functional with all required elements: text in |
| 6 | Mobile Feed — posts are readable | PASS | L1:pass L2:pass | Mobile feed displays properly with full-width post cards, visible author names ( |
| 7 | Mobile — no horizontal scroll | PASS | L1:pass L2:pass | All content fits properly within the 375px mobile viewport. The header, story ci |
| 8 | Mobile — return to Feed from mobile nav | PASS | L1:pass L2:pass | The mobile feed is displaying properly with real user content from Jaylen Willia |

## community (10/10 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Groups page loads | PASS | L1:pass L2:pass | The Groups page is fully functional with all required elements: 'Groups & Clubs' |
| 2 | Groups — search bar and category filters visible | PASS | L1:pass L2:pass | The Groups page displays both required elements: a search input field with place |
| 3 | GroupDetail page loads | PASS | L1:pass L2:pass | The page displays a clear 'Group not found' error message in the center, which i |
| 4 | Events page loads | PASS | L1:pass L2:pass | The Events page is functioning correctly with all required elements: 'Event Disc |
| 5 | Events — filters and type pills visible | PASS | L1:pass L2:pass | The Events page shows functional filter controls including type pill buttons (Al |
| 6 | Notifications page loads | PASS | L1:pass L2:pass | The notifications page is working correctly - it displays the 'Notifications' he |
| 7 | Notifications — filter pills visible | PASS | L1:pass L2:pass | The Notifications page displays proper filter pill buttons (All, Unread, Likes,  |
| 8 | ForumTopic page loads | PASS | L1:pass L2:pass | The Community Forums page is displaying correctly with a proper empty state. It  |
| 9 | Advice page loads | PASS | L1:pass L2:pass | Shows Pro Scout Feature premium gate with upgrade prompt for Expert Advice featu |
| 10 | Return to Feed from community features | PASS | L1:pass L2:pass | Feed page is functioning properly with real sports-related posts from users (Jay |

## discovery (9/9 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Discover page loads | PASS | L1:pass L2:pass | The Discover page is properly loaded with all required elements: 'Discover' head |
| 2 | Discover — filters section visible | PASS | L1:pass L2:pass | The Discover page shows a properly functioning Advanced Filters section with a s |
| 3 | ForYou page loads | PASS | L1:pass L2:pass | The For You page is working properly. It displays the correct 'For You' header w |
| 4 | ForYou — tabs visible (Recommended, Trending, Discover) | PASS | L1:pass L2:pass | The For You page shows all three required tab buttons (Recommended, Trending, Di |
| 5 | TrendingChallenges page loads | PASS | L1:pass L2:pass | The page shows the required 'Trending Challenges' heading with flame icon and or |
| 6 | TrendingChallenges — tabs visible (All Trending, By Sport) | PASS | L1:pass L2:pass | The Trending Challenges page is working correctly - it shows the proper header w |
| 7 | SportHub page loads with sport param | PASS | L1:pass L2:pass | The Basketball sport hub page is working correctly - shows 'Basketball' heading  |
| 8 | SportHub — empty sport param shows fallback | PASS | L1:pass L2:pass | The page correctly displays 'Sport not specified' message as expected behavior w |
| 9 | Return to Feed from discovery features | PASS | L1:pass L2:pass | Feed page is working correctly with real content - shows user stories at top (Ja |

## settings (7/7 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ProfileSettings page loads | PASS | L1:pass L2:pass | The ProfileSettings page is working correctly - shows back arrow, settings tabs  |
| 2 | ProfileSettings — identity tab with form fields | PASS | L1:pass L2:pass | The ProfileSettings Identity tab is displaying proper form fields including: dis |
| 3 | ProfileSettings — alerts tab loads | PASS | L1:pass L2:pass | The Activity/Alerts settings page is properly displayed with organized notificat |
| 4 | Premium page loads | PASS | L1:pass L2:pass | The page displays a comprehensive subscription/premium page with 'Choose Your Pl |
| 5 | Leaderboard page loads | PASS | L1:pass L2:pass | Leaderboard page displays correctly with all required elements: 'Leaderboard' he |
| 6 | Leaderboard — period tabs and sport filters visible | PASS | L1:pass L2:pass | The Leaderboard page displays correctly with period selector tabs (All Time, Thi |
| 7 | Return to Feed from settings features | PASS | L1:pass L2:pass | Feed page is functioning properly with real sports content - shows user stories, |

## creator_tools (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | CreatorAI page loads | PASS | L1:pass L2:pass | Shows the expected premium gate for CreatorAI feature. The Pro Scout upgrade mod |
| 2 | CreatorShop page loads | PASS | L1:pass L2:pass | Creator Shop page loaded successfully with proper empty state - shows shopping c |
| 3 | BecomeCreator page loads | PASS | L1:pass L2:pass | The page displays the complete 'Become a Creator' feature with a gradient hero b |
| 4 | BecomeCreator — benefits and steps visible | PASS | L1:pass L2:pass | Page successfully displays the 'Become a Creator' section with proper promotiona |
| 5 | Return to Feed from creator tools | PASS | L1:pass L2:pass | Feed page is displaying properly with real user posts, story bubbles, and functi |

## coaching_training (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | CoachingSessionDetail page loads | PASS | L1:pass L2:pass | App loaded with proper navigation shell and shows a loading spinner in the cente |
| 2 | TrainingPlans page loads | PASS | L1:pass L2:pass | Page shows proper empty state with 'No training plans yet' message and dumbbell  |
| 3 | TrainingPlanDetail page loads | PASS | L1:pass L2:pass | Shows proper error handling with 'Plan not found' message and 'Back to Plans' bu |
| 4 | MyTraining page loads | PASS | L1:pass L2:pass | The page shows the 'My Training' section with a dumbbell icon, the subtitle 'You |
| 5 | Return to Feed from coaching features | PASS | L1:pass L2:pass | Feed page is working properly with real sports content - shows story carousel wi |

## athlete_dev (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ScoutingHub page loads | PASS | L1:pass L2:pass | The Scouting Hub page is working correctly. It shows the crosshair icon, proper  |
| 2 | UserProfile page loads | PASS | L1:pass L2:pass | Profile page is working correctly, displaying Marcus Silva's complete profile wi |
| 3 | SavedContent page loads | PASS | L1:pass L2:pass | The Saved Content page is properly functioning with a dark theme. It shows a boo |
| 4 | AthleteInsights page loads | PASS | L1:pass L2:pass | Shows proper empty state for Athlete Insights feature with sparkle icon, 'Select |
| 5 | Return to Feed from athlete dev features | PASS | L1:pass L2:pass | Feed page is functioning correctly with real user-generated content. Shows activ |

## admin (8/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Admin page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows a dark/black screen which is valid according to the criteria - this indica |
| 2 | AdminUsers page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows a dark/black screen which is valid according to the criteria - this repres |
| 3 | AdminContent page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Access denied.' message which is an expected and properly handled unautho |
| 4 | AdminAnalytics page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Access denied.' message, which is an acceptable state for an analytics pa |
| 5 | AdminSettings page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows clear 'Access denied.' error message, which is an expected and valid state |
| 6 | AdminHealth page loads or blocks non-admin | PASS | L1:pass L2:pass | The page displays an 'Access denied.' message in the center of the screen, which |
| 7 | ModerationQueue page loads or blocks non-admin | PASS | L1:pass L2:pass | Shows 'Admin access required.' message with a shield icon, which is a proper una |
| 8 | Return to Feed from admin pages | PASS | L1:pass L2:pass | Feed page is functioning correctly with real content - shows story carousel with |

## content_creation (4/4 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | CreateReel page loads | PASS | L1:pass L2:pass | The Create Reel page is working correctly with all expected elements present: vi |
| 2 | UploadVideo page loads | PASS | L1:pass L2:pass | The Upload Video page is functioning correctly with all required elements presen |
| 3 | ImportVideos page loads | PASS | L1:pass L2:pass | The Import Video Highlights page is displaying correctly with the expected funct |
| 4 | Return to Feed from content creation | PASS | L1:pass L2:pass | Feed page is working properly with real content displayed - showing user stories |

## remaining_pages (5/5 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | ViewLive page loads | PASS | L1:pass L2:pass | Shows 'Stream not found' message with 'Back to Live' navigation link, which is g |
| 2 | ChallengeDetail page loads | PASS | L1:pass L2:pass | The page shows a loading spinner in the center with the app shell (sidebar navig |
| 3 | Terms page loads | PASS | L1:pass L2:pass | Terms of Service page displays correctly with all required elements: shield icon |
| 4 | Guidelines page loads | PASS | L1:pass L2:pass | The Community Guidelines page displays correctly with all required elements: boo |
| 5 | Return to Feed from remaining pages | PASS | L1:pass L2:pass | Feed page is displaying properly with real user posts from Jaylen Williams and J |

## interactions (8/9 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Create a post with text content | PASS | L1:pass L2:pass L3:pass | The page shows the Feed successfully with real posts and user data. There's a te |
| 2 | Like a post on Feed | PASS | L1:pass L2:pass | The Feed page is properly displayed with a dark theme showing multiple posts fro |
| 3 | Comment on a post | PASS | L1:pass L2:pass L3:pass | The Feed page is properly loaded with a comments section expanded on a post by T |
| 4 | Follow a user from their profile | WARNING | L1:pass L2:fail L3:pass | L2 FAIL: The followers modal is open showing 'No followers yet.' which indicates |
| 5 | Bookmark a post on Feed | PASS | L1:pass L2:pass L3:pass | Feed page is functioning correctly with real posts displayed. Shows user stories |
| 6 | Update profile bio in ProfileSettings | PASS | L1:pass L2:pass L3:pass | Profile settings page is properly displayed with social media input fields (Inst |
| 7 | Create a group via Groups page | PASS | L1:pass L2:pass L3:pass | The Groups page is displaying correctly with the 'You haven't joined any groups  |
| 8 | Send a message in Messages | PASS | L1:pass L2:pass L3:pass | Messages page is loaded and functional with a working support chat interface. Sh |
| 9 | Cleanup: remove all test data | PASS | L1:pass L2:pass L3:pass | Feed page is working correctly with real user data - shows story avatars, post c |

## cross_role (7/8 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Coach views athlete ScoutCard | WARNING | L1:pass L2:fail | L2 FAIL: This shows an empty state message 'No Sport Profile Found' which indica |
| 2 | Coach accesses CreatorHub | PASS | L1:pass L2:pass | Creator Hub page loads successfully with complete dashboard showing monetization |
| 3 | Org views OrgDashboard | PASS | L1:pass L2:pass | The page shows a working SportHub Teams welcome screen with clear content - a we |
| 4 | Org views OrgRoster | PASS | L1:pass L2:pass | The page shows a proper empty state for organizations with 'No Organization Yet' |
| 5 | Parent views ParentView dashboard | PASS | L1:pass L2:pass | The Parent View page is displaying correctly with appropriate messaging explaini |
| 6 | Non-admin blocked from Admin pages | PASS | L1:pass L2:pass | Shows a completely dark/black screen which indicates the admin guard is properly |
| 7 | Athlete views coach UserProfile | PASS | L1:pass L2:pass | Shows a functioning coach profile page with complete profile information includi |
| 8 | Return to Feed from cross-role tests | PASS | L1:pass L2:pass | Feed page is functioning properly with real content - showing user stories at to |

## live_feature (23/24 passed)

| # | Test | Status | Layers | Notes |
|---|------|--------|--------|-------|
| 1 | Live page loads with hero and tabs | PASS | L1:pass L2:pass | The Live page displays correctly with the red/orange gradient hero banner contai |
| 2 | Go Live button is visible | PASS | L1:pass L2:pass | The 'Go Live' button is clearly visible in the hero area as a prominent white bu |
| 3 | Past Streams tab switches content | PASS | L1:pass L2:pass | The Past Streams tab shows functional content with a VOD card displaying 'Admin' |
| 4 | Stream sport filter dropdown works | WARNING | L1:pass L2:fail | L2 FAIL: The Live page shows an empty state with 'No streams match your filters' |
| 5 | Upload VOD form toggles open and close | PASS | L1:pass L2:pass | The Upload Video form panel is properly displayed with all required elements: vi |
| 6 | Go Live creates stream and redirects to ViewLive | PASS | L1:pass L2:pass L3:pass | The ViewLive page has loaded correctly showing a dark-themed video player area w |
| 7 | Active broadcast dashboard on Live page | PASS | L1:pass L2:pass | The broadcast dashboard is properly displayed showing 'You're Broadcasting' stat |
| 8 | End Stream ends the broadcast | PASS | L1:pass L2:pass L3:pass | The Live page is showing the correct empty state with 'No one's live right now'  |
| 9 | Ended stream shows Stream Ended state | PASS | L1:pass L2:pass | The page correctly displays 'Stream Ended' state with duration (0m), shows the A |
| 10 | ViewLive with invalid stream ID shows error | PASS | L1:pass L2:pass | The page correctly displays 'Stream not found' error message with a functional ' |
| 11 | Ended stream has Summary and Highlights tabs | PASS | L1:pass L2:pass | The page correctly shows a 'Stream Ended' state with duration (0m), has Summary  |
| 12 | Create test live stream for panel tests | PASS | L1:pass L2:pass | The ViewLive page is functioning correctly with all expected elements: dark vide |
| 13 | Chat tab shows message input and send button | PASS | L1:pass L2:pass | Chat panel is visible on the right side with a message input field at the bottom |
| 14 | Send a chat message | PASS | L1:pass L2:pass L3:pass | Chat panel is visible on the right side with 'No messages yet. Start the chat!'  |
| 15 | Polls tab shows polls or empty state | PASS | L1:pass L2:pass | The right-side panel is properly displaying polls content with 'No polls yet' me |
| 16 | Q&A tab renders without crash | PASS | L1:pass L2:pass | Page shows proper ViewLive layout with video area displaying expected 'Camera ac |
| 17 | GameDay page loads with 3 sections | PASS | L1:pass L2:pass | The GameDay page displays correctly with the hero banner containing 'GameDay' he |
| 18 | GameDay sport filter buttons work | PASS | L1:pass L2:pass | The Basketball filter button is clearly highlighted with a red/orange active bac |
| 19 | GameDay All filter resets | PASS | L1:pass L2:pass | GameDay page is properly displayed with all required elements: sport filter butt |
| 20 | GameRecap with invalid ID shows error | PASS | L1:pass L2:pass | The page correctly displays 'Game not found' error message with a functional 'Ba |
| 21 | GameRecap renders with test game data | PASS | L1:pass L2:pass | The GameRecap page displays correctly with a dark header showing 'FINAL' badge,  |
| 22 | Box score section renders for Basketball game | PASS | L1:pass L2:pass | Box Score section is clearly visible with heading and a properly formatted table |
| 23 | Game Stream wizard opens for coach account | PASS | L1:pass L2:pass | The Live page is displaying correctly with the expected functionality - showing  |
| 24 | Cleanup all test data | PASS | L1:pass L2:pass L3:pass | The Feed page is displayed normally with a dark theme. It shows user stories at  |
