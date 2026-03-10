# Sportsphere — Full Platform Testing Roadmap (14 Phases)

## Context

The testing agent (Phases 1-2) is fully operational with **60/60 tests passing** across 8 test suites. However, only **27 of 65 pages** are currently tested (42% coverage). This plan lays out **14 phases** to achieve full platform coverage, with each phase building on the previous.

**Current state**: 113 tests, 65 pages covered, 0 pages untested (100% page coverage!)

**Entry**: `node tools/test_agent.mjs --phase [phase|v1|v2|full] [--headed]`

---

## Completed Phases

| Phase | Scope | Tests | Status |
|-------|-------|-------|--------|
| **1** | Infrastructure + Auth + Navigation + Feed | 26 | DONE (60/60) |
| **2** | Role-specific + Onboarding + Mobile | 34 | DONE (60/60) |
| **3** | Community & Social | 10 | DONE (10/10) |
| **4** | Discovery & Recommendations | 9 | DONE (9/9) |
| **5** | Account & Settings | 7 | DONE (7/7) |
| **6** | Creator Tools | 5 | DONE (5/5) |
| **7** | Coaching & Training | 5 | DONE (5/5) |
| **8** | Athlete Development | 5 | DONE (5/5) |
| **9** | Admin & Moderation | 8 | DONE (8/8) |
| **10** | Content Creation & Media | 4 | DONE (4/4) |
| **11** | Live, Detail & Static Pages | 5 | DONE (5/5) |

### All 65 Pages Tested

Login, Feed, Explore (Search), Reels, ProPathHub, Live, Messages, Profile, Challenges, Forums, GetNoticed, TheVault, PerformanceHub, ScoutCard, Coach, LiveCoaching, CreatorHub, Analytics, OrgDashboard, OrgRoster, OrgSessions, OrgMessages, VideoReview, ParentView, Onboarding, CreatePost, SearchPage, Groups, GroupDetail, ForumTopic, Events, Notifications, Advice, Discover, ForYou, TrendingChallenges, SportHub, ProfileSettings, Premium, Leaderboard, CreatorAI, CreatorShop, BecomeCreator, CoachingSessionDetail, TrainingPlans, TrainingPlanDetail, MyTraining, ScoutingHub, UserProfile, SavedContent, AthleteInsights, Admin, AdminUsers, AdminContent, AdminAnalytics, AdminSettings, AdminHealth, ModerationQueue, CreateReel, UploadVideo, ImportVideos, ViewLive, ChallengeDetail, Terms, Guidelines

---

## Phase 3: Community & Social (6 pages, ~12 tests)

**Pages**: Groups, GroupDetail, ForumTopic, Events, Notifications, Advice

**Account**: test-athlete

**New file**: `tools/test_scenarios/community.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | Groups | `/Groups` | `src/pages/Groups.jsx` | Page loads, group list or empty state, create group button |
| 2 | GroupDetail | `/Groups/:id` | `src/pages/GroupDetail.jsx` | Navigate into a group, header/members visible or empty state |
| 3 | ForumTopic | `/Forums/:id` | `src/pages/ForumTopic.jsx` | Navigate from Forums to a topic, replies or empty state |
| 4 | Events | `/Events` | `src/pages/Events.jsx` | Page loads, event list or calendar, create event button |
| 5 | Notifications | `/Notifications` | `src/pages/Notifications.jsx` | Page loads, notification list or empty state |
| 6 | Advice | `/Advice` | `src/pages/Advice.jsx` | Page loads, advice content or empty state |

---

## Phase 4: Discovery & Recommendations (4 pages, ~10 tests)

**Pages**: Discover, ForYou, TrendingChallenges, SportHub

**Account**: test-athlete

**New file**: `tools/test_scenarios/discovery.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | Discover | `/Discover` | `src/pages/Discover.jsx` | Page loads, content recommendations or trending items |
| 2 | ForYou | `/ForYou` | `src/pages/ForYou.jsx` | Page loads, personalized feed or onboarding prompt |
| 3 | TrendingChallenges | `/TrendingChallenges` | `src/pages/TrendingChallenges.jsx` | Page loads, challenge cards or empty state |
| 4 | SportHub | `/SportHub` | `src/pages/SportHub.jsx` | Page loads, sport-specific content hub |

---

## Phase 5: Account & Settings (3 pages, ~10 tests)

**Pages**: ProfileSettings, Premium, Leaderboard

**Account**: test-athlete (settings), test-coach (premium)

**New file**: `tools/test_scenarios/settings.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | ProfileSettings | `/ProfileSettings` | `src/pages/ProfileSettings.jsx` | Page loads, form populated, edit bio, save (L3: verify DB) |
| 2 | Premium | `/Premium` | `src/pages/Premium.jsx` | Page loads, pricing tiers visible, Stripe button (read-only) |
| 3 | Leaderboard | `/Leaderboard` | `src/pages/Leaderboard.jsx` | Page loads, ranked list, sport filter |

---

## Phase 6: Creator Tools (3 pages, ~8 tests)

**Pages**: CreatorAI, CreatorShop, BecomeCreator

**Account**: test-coach

**New file**: `tools/test_scenarios/creator_tools.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | CreatorAI | `/CreatorAI` | `src/pages/CreatorAI.jsx` | Page loads, AI tools or premium gate |
| 2 | CreatorShop | `/CreatorShop` | `src/pages/CreatorShop.jsx` | Page loads, shop/merch interface or setup prompt |
| 3 | BecomeCreator | `/BecomeCreator` | `src/pages/BecomeCreator.jsx` | Page loads, creator onboarding flow or already-creator state |

---

## Phase 7: Coaching & Training (4 pages, ~10 tests)

**Pages**: CoachingSessionDetail, TrainingPlans, TrainingPlanDetail, MyTraining

**Account**: test-coach (create), test-athlete (view)

**New file**: `tools/test_scenarios/coaching_training.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | CoachingSessionDetail | `/CoachingSessionDetail/:id` | `src/pages/CoachingSessionDetail.jsx` | Session detail page, video/notes or empty state |
| 2 | TrainingPlans | `/TrainingPlans` | `src/pages/TrainingPlans.jsx` | Plan list, create button or empty state |
| 3 | TrainingPlanDetail | `/TrainingPlanDetail/:id` | `src/pages/TrainingPlanDetail.jsx` | Plan exercises/schedule or empty state |
| 4 | MyTraining | `/MyTraining` | `src/pages/MyTraining.jsx` | Athlete training dashboard, active plans or setup prompt |

---

## Phase 8: Athlete Development (4 pages, ~10 tests)

**Pages**: ScoutingHub, UserProfile, SavedContent, AthleteInsights

**Account**: test-athlete, test-coach (scouting)

**New file**: `tools/test_scenarios/athlete_dev.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | ScoutingHub | `/ScoutingHub` | `src/pages/ScoutingHub.jsx` | Scout search, athlete cards, sport filter |
| 2 | UserProfile | `/UserProfile/:email` | `src/pages/UserProfile.jsx` | View another user's profile, follow button, ScoutCard link |
| 3 | SavedContent | `/SavedContent` | `src/pages/SavedContent.jsx` | Saved posts/reels list or empty state |
| 4 | AthleteInsights | `/AthleteInsights` | `src/pages/AthleteInsights.jsx` | Performance insights dashboard or setup prompt |

---

## Phase 9: Admin & Moderation (7 pages, ~14 tests)

**Pages**: Admin, AdminUsers, AdminContent, AdminAnalytics, AdminSettings, AdminHealth, ModerationQueue

**New account**: `test-admin@sportsphere.app` (role: admin)

**New file**: `tools/test_scenarios/admin.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | Admin | `/Admin` | `src/pages/Admin.jsx` | Dashboard loads, overview metrics |
| 2 | AdminUsers | `/AdminUsers` | `src/pages/AdminUsers.jsx` | User management list, search, role filters |
| 3 | AdminContent | `/AdminContent` | `src/pages/AdminContent.jsx` | Content management, flagged items |
| 4 | AdminAnalytics | `/AdminAnalytics` | `src/pages/AdminAnalytics.jsx` | Platform analytics charts, metrics |
| 5 | AdminSettings | `/AdminSettings` | `src/pages/AdminSettings.jsx` | System settings, configuration |
| 6 | AdminHealth | `/AdminHealth` | `src/pages/AdminHealth.jsx` | System health, uptime, error rates |
| 7 | ModerationQueue | `/ModerationQueue` | `src/pages/ModerationQueue.jsx` | Queue items, priority sorting |

**Auth guard test**: Verify non-admin accounts are blocked from admin pages
**Safety**: All tests READ-ONLY — no approve/reject/delete actions

---

## Phase 10: Content Creation & Media (3 pages, ~8 tests)

**Pages**: CreateReel, UploadVideo, ImportVideos

**Account**: test-athlete

**New file**: `tools/test_scenarios/content_creation.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | CreateReel | `/CreateReel` | `src/pages/CreateReel.jsx` | Page loads, upload interface, form fields |
| 2 | UploadVideo | `/UploadVideo` | `src/pages/UploadVideo.jsx` | Page loads, drag-and-drop area, metadata fields |
| 3 | ImportVideos | `/ImportVideos` | `src/pages/ImportVideos.jsx` | Page loads, import sources (YouTube, etc.) |

---

## Phase 11: Live & Detail + Static Pages (4 pages, ~8 tests)

**Pages**: ViewLive, ChallengeDetail, Terms, Guidelines

**Account**: test-athlete (live/challenges), unauthenticated (static pages)

**New file**: `tools/test_scenarios/remaining_pages.mjs`

| # | Page | Route | Source File | Tests |
|---|------|-------|-------------|-------|
| 1 | ViewLive | `/ViewLive/:id` | `src/pages/ViewLive.jsx` | Live stream viewer, chat panel, viewer count or "stream ended" |
| 2 | ChallengeDetail | `/Challenges/:id` | `src/pages/ChallengeDetail.jsx` | Challenge info, participants, join button or empty state |
| 3 | Terms | `/Terms` | `src/pages/Terms.jsx` | Legal text renders, no auth required |
| 4 | Guidelines | `/Guidelines` | `src/pages/Guidelines.jsx` | Community guidelines text renders, no auth required |

---

## Phase 12: Interaction Tests — L3 Data Mutations (~15 tests)

**Why**: Phases 3-11 verify pages LOAD. Phase 12 verifies features WORK with real data writes.

**New file**: `tools/test_scenarios/interactions.mjs`

| # | Test | Action | L3 Data Check |
|---|------|--------|---------------|
| 1 | Create a post | Fill post form, submit | Verify in `posts` table |
| 2 | Comment on a post | Open post, type comment, submit | Verify comment in DB |
| 3 | Follow a user | Visit UserProfile, click Follow | Verify follow in DB |
| 4 | Unfollow a user | Click Unfollow | Verify removed |
| 5 | Save content | Bookmark a post | Verify in `saved_content` |
| 6 | Create a group | Groups → Create, fill form | Verify in DB |
| 7 | Send a message | Messages → New chat, send | Verify in DB |
| 8 | Update profile | ProfileSettings → edit → save | Verify profile updated |
| 9 | Create a challenge | Challenges → Create | Verify in DB |
| 10 | Share a post | Click share | Verify share count |
| 11 | Report content | Click report | Verify report created |
| 12 | Join an event | Events → Join | Verify membership |
| 13 | Create a reel | CreateReel → upload → submit | Verify in DB |
| 14 | Book coaching session | LiveCoaching → Book | Verify session in DB |
| 15 | Rate a session | After session → Rate | Verify rating |

**Cleanup**: Each test undoes its action or uses ephemeral data

---

## Phase 13: Cross-Role Workflows (~10 tests)

**Why**: Real users interact across roles. Tests multi-account flows and permission boundaries.

**New file**: `tools/test_scenarios/cross_role.mjs`

| # | Test | Accounts | Flow |
|---|------|----------|------|
| 1 | Coach views athlete ScoutCard | coach → athlete | Coach searches ScoutingHub → finds athlete → views ScoutCard |
| 2 | Parent views child profile | parent → athlete | Parent links to child → views stats |
| 3 | Org invites athlete | org → athlete | Org sends invite → athlete sees notification |
| 4 | Athlete requests coaching | athlete → coach | Athlete finds coach → requests session |
| 5 | Admin moderates content | admin → athlete | Athlete posts → admin reviews in ModerationQueue |
| 6 | Coach creates training plan | coach → athlete | Coach creates plan → athlete sees it |
| 7 | Athlete submits showcase | athlete | Creates showcase → appears in GetNoticed Browse |
| 8 | Org creates team session | org | Schedules session → appears in OrgSessions |
| 9 | Creator publishes content | coach | Publishes → appears behind paywall |
| 10 | Non-admin blocked from Admin | athlete | Navigate to /Admin → redirected or blocked |

---

## Phase 14: Self-Repair + Regression Monitoring

**Self-Repair Agent** (`tools/repair_agent.mjs`):
1. Triage failures by page, deduplicate
2. Map failure → source file via `pages.config.js` route map
3. Diagnose with Claude Opus (screenshot + error + source)
4. Generate minimal patch
5. Validate against local dev server
6. Create git branch with fix

**CLI**: `node tools/test_agent.mjs --phase full --repair --repair-max 3`

**Regression Monitoring**:
- Baseline screenshots for pixel-diff comparison
- Nightly cron runs
- Slack/email alerts on failures
- Performance tracking (page load times)
- CI integration (block merge on CRITICAL)

---

## Full Page Coverage Matrix

All 65 pages from `src/pages.config.js` mapped to phases:

| Page | Source File | Phase | Status |
|------|------------|-------|--------|
| Login | `src/pages/Login.jsx` | 1 | TESTED |
| Feed | `src/pages/Feed.jsx` | 1 | TESTED |
| Explore (Search) | `src/pages/Search.jsx` | 1 | TESTED |
| Reels | `src/pages/Reels.jsx` | 1 | TESTED |
| ProPathHub | `src/pages/ProPathHub.jsx` | 1 | TESTED |
| Live | `src/pages/Live.jsx` | 1 | TESTED |
| Messages | `src/pages/Messages.jsx` | 1 | TESTED |
| Profile | `src/pages/Profile.jsx` | 1 | TESTED |
| Challenges | `src/pages/Challenges.jsx` | 1 | TESTED |
| Forums | `src/pages/Forums.jsx` | 1 | TESTED |
| GetNoticed | `src/pages/GetNoticed.jsx` | 2 | TESTED |
| TheVault | `src/pages/TheVault.jsx` | 2 | TESTED |
| PerformanceHub | `src/pages/PerformanceHub.jsx` | 2 | TESTED |
| ScoutCard | `src/pages/ScoutCard.jsx` | 2 | TESTED |
| Coach | `src/pages/Coach.jsx` | 2 | TESTED |
| LiveCoaching | `src/pages/LiveCoaching.jsx` | 2 | TESTED |
| CreatorHub | `src/pages/CreatorHub.jsx` | 2 | TESTED |
| Analytics | `src/pages/Analytics.jsx` | 2 | TESTED |
| OrgDashboard | `src/pages/OrgDashboard.jsx` | 2 | TESTED |
| OrgRoster | `src/pages/OrgRoster.jsx` | 2 | TESTED |
| OrgSessions | `src/pages/OrgSessions.jsx` | 2 | TESTED |
| OrgMessages | `src/pages/OrgMessages.jsx` | 2 | TESTED |
| VideoReview | `src/pages/VideoReview.jsx` | 2 | TESTED |
| ParentView | `src/pages/ParentView.jsx` | 2 | TESTED |
| Onboarding | `src/pages/Onboarding.jsx` | 2 | TESTED |
| CreatePost | `src/pages/CreatePost.jsx` | 2 | TESTED |
| SearchPage | `src/pages/Search.jsx` | 1 | TESTED |
| Groups | `src/pages/Groups.jsx` | 3 | TESTED |
| GroupDetail | `src/pages/GroupDetail.jsx` | 3 | TESTED |
| ForumTopic | `src/pages/ForumTopic.jsx` | 3 | TESTED |
| Events | `src/pages/Events.jsx` | 3 | TESTED |
| Notifications | `src/pages/Notifications.jsx` | 3 | TESTED |
| Advice | `src/pages/Advice.jsx` | 3 | TESTED |
| Discover | `src/pages/Discover.jsx` | 4 | TESTED |
| ForYou | `src/pages/ForYou.jsx` | 4 | TESTED |
| TrendingChallenges | `src/pages/TrendingChallenges.jsx` | 4 | TESTED |
| SportHub | `src/pages/SportHub.jsx` | 4 | TESTED |
| ProfileSettings | `src/pages/ProfileSettings.jsx` | 5 | TESTED |
| Premium | `src/pages/Premium.jsx` | 5 | TESTED |
| Leaderboard | `src/pages/Leaderboard.jsx` | 5 | TESTED |
| CreatorAI | `src/pages/CreatorAI.jsx` | 6 | TESTED |
| CreatorShop | `src/pages/CreatorShop.jsx` | 6 | TESTED |
| BecomeCreator | `src/pages/BecomeCreator.jsx` | 6 | TESTED |
| CoachingSessionDetail | `src/pages/CoachingSessionDetail.jsx` | 7 | TESTED |
| TrainingPlans | `src/pages/TrainingPlans.jsx` | 7 | TESTED |
| TrainingPlanDetail | `src/pages/TrainingPlanDetail.jsx` | 7 | TESTED |
| MyTraining | `src/pages/MyTraining.jsx` | 7 | TESTED |
| ScoutingHub | `src/pages/ScoutingHub.jsx` | 8 | TESTED |
| UserProfile | `src/pages/UserProfile.jsx` | 8 | TESTED |
| SavedContent | `src/pages/SavedContent.jsx` | 8 | TESTED |
| AthleteInsights | `src/pages/AthleteInsights.jsx` | 8 | TESTED |
| Admin | `src/pages/Admin.jsx` | 9 | TESTED |
| AdminUsers | `src/pages/AdminUsers.jsx` | 9 | TESTED |
| AdminContent | `src/pages/AdminContent.jsx` | 9 | TESTED |
| AdminAnalytics | `src/pages/AdminAnalytics.jsx` | 9 | TESTED |
| AdminSettings | `src/pages/AdminSettings.jsx` | 9 | TESTED |
| AdminHealth | `src/pages/AdminHealth.jsx` | 9 | TESTED |
| ModerationQueue | `src/pages/ModerationQueue.jsx` | 9 | TESTED |
| CreateReel | `src/pages/CreateReel.jsx` | 10 | TESTED |
| UploadVideo | `src/pages/UploadVideo.jsx` | 10 | TESTED |
| ImportVideos | `src/pages/ImportVideos.jsx` | 10 | TESTED |
| ViewLive | `src/pages/ViewLive.jsx` | 11 | TESTED |
| ChallengeDetail | `src/pages/ChallengeDetail.jsx` | 11 | TESTED |
| Terms | `src/pages/Terms.jsx` | 11 | TESTED |
| Guidelines | `src/pages/Guidelines.jsx` | 11 | TESTED |

**Coverage**: 65/65 pages tested (100% coverage across 11 phases)

---

## Summary Table

| Phase | Scope | New Tests | Cumulative | New Pages |
|-------|-------|-----------|------------|-----------|
| 1 | Auth + Nav + Feed (infra) | 26 | 26 | 15 |
| 2 | Role-specific + Onboarding + Mobile | 34 | 60 | 12 |
| **3** | **Community & Social** | **~12** | **~72** | **6** |
| **4** | **Discovery & Recommendations** | **~10** | **~82** | **4** |
| **5** | **Account & Settings** | **~10** | **~92** | **3** |
| **6** | **Creator Tools** | **~8** | **~100** | **3** |
| **7** | **Coaching & Training** | **~10** | **~110** | **4** |
| **8** | **Athlete Development** | **~10** | **~120** | **4** |
| **9** | **Admin & Moderation** | **~14** | **~134** | **7** |
| **10** | **Content Creation & Media** | **~8** | **~142** | **3** |
| **11** | **Live & Detail + Static** | **~8** | **~150** | **4** |
| **12** | **Interaction Tests (L3 data)** | **~15** | **~165** | **0** |
| **13** | **Cross-Role Workflows** | **~10** | **~175** | **0** |
| **14** | **Self-Repair + Monitoring** | **0** | **175** | **0** |

**Total**: ~175 tests covering all 65 pages + data mutations + cross-role flows + self-healing + monitoring

---

## Implementation Pattern (Per Phase)

Each phase (3-11) follows:
1. Read source files for target pages — identify selectors, UI structure, data dependencies
2. Create new scenario file in `tools/test_scenarios/`
3. Register phase in `test_agent.mjs` orchestrator
4. Run `--headed` to tune timeouts and vision prompts
5. Iterate until all tests pass
6. Run `--phase full` to confirm no regressions

**Cost per phase**: ~$0.20-0.40 (10-15 vision calls × $0.02)

## Critical Files

| File | Purpose |
|------|---------|
| `src/pages.config.js` | Route → source file mapping (65 entries) |
| `src/Layout.jsx` | Nav selectors (`data-tour` attributes) |
| `tools/test_agent.mjs` | Main orchestrator |
| `tools/test_helpers.mjs` | Shared utilities (waitForAuth, vision, screenshots) |
| `tools/test_scenarios/*.mjs` | One file per phase |
| `src/api/db.js` | Supabase entities (for L3 checks) |
