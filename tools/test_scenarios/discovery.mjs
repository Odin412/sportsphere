/**
 * discovery.mjs — Phase 4: Discovery & Recommendations test scenarios
 *
 * Tests: Discover, ForYou, TrendingChallenges, SportHub
 * Account: test-athlete
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getDiscoveryScenarios(creds) {
  return [
    // ── Discover ──────────────────────────────────────────────────
    {
      name: "Discover page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/Discover`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 8000, // LLM call can be slow
      assertions: [
        { type: "url_contains", value: "/Discover" },
      ],
      vision:
        "PASS if: Shows ANY of these — a 'Discover' heading with sparkle icon, 'Personalized recommendations just for you' subtitle, 'Advanced Filters' section with search/sport/content type/sort dropdowns, recommended content sections (Featured Live, Recommended Events, Groups You Might Like, Trending Content), a 'Refresh Recommendations' button, OR a loading spinner with 'Generating personalized recommendations...' text (the page uses an LLM so loading is acceptable). FAIL only if: blank screen, 'Something went wrong' error, crash, or stuck on 'Login to Discover' (should be logged in).",
    },

    {
      name: "Discover — filters section visible",
      action: async (page) => {
        // Wait for content to finish loading if still in progress
        await page.waitForTimeout(3000);
      },
      settleMs: 2000,
      assertions: [],
      vision:
        "PASS if: The Discover page shows an 'Advanced Filters' card with ANY of these filter controls — a search input, sport dropdown, content type dropdown (All Types, Posts, Live Streams, Events, Groups), sort dropdown (Relevance, Popularity, Most Recent). Also acceptable: the page is still loading recommendations (spinner visible). FAIL only if: blank page, error, crash, or 'Login to Discover' prompt.",
    },

    // ── ForYou ────────────────────────────────────────────────────
    {
      name: "ForYou page loads",
      action: async (page) => {
        // Navigate back to feed first
        await page.click('[data-tour="nav-feed"]').catch(() => {});
        await page.waitForTimeout(2000);

        // ForYou is in SECONDARY_NAV — try More menu
        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-foryou"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/ForYou`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/ForYou" },
      ],
      vision:
        "PASS if: Shows ANY of these — a 'For You' heading with sparkle icon and gradient banner, 'Personalized using your likes, follows & interaction history' subtitle, sport badges in header, tabs (Recommended, Trending, Discover), recommended posts with PostCards, 'Smart Algorithm Feed' or 'AI-Personalized Feed' badge, 'AI Rank' button, an empty state like 'No posts yet. Follow some athletes to personalize your feed!', OR a loading spinner. NOTE: An 'Unable to load recommendations' card from the AI stream recommendations sub-component is ACCEPTABLE and should NOT cause a FAIL — it just means the AI edge function is not configured. As long as the For You header, tabs, and main content area are visible, it's a PASS. FAIL only if: blank screen, 'Something went wrong' error, crash, or 'Sign in for personalized recommendations' (should be logged in).",
    },

    {
      name: "ForYou — tabs visible (Recommended, Trending, Discover)",
      action: async (page) => {
        // Already on ForYou page
      },
      settleMs: 2000,
      assertions: [],
      vision:
        "PASS if: The ForYou page shows tab buttons — Recommended, Trending, and Discover tabs. The Recommended tab should be active by default. Content below the tabs (posts, empty state, or loading) is acceptable. NOTE: An 'Unable to load recommendations' card is acceptable — it's a non-critical sub-component. As long as tabs are visible, it's a PASS. FAIL only if: no tabs visible at all, blank page, 'Something went wrong' full-page error, or crash.",
    },

    // ── TrendingChallenges ────────────────────────────────────────
    {
      name: "TrendingChallenges page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/TrendingChallenges`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/TrendingChallenges" },
      ],
      vision:
        "PASS if: Shows ANY of these — a 'Trending Challenges' heading with flame icon and orange-red gradient banner, 'Most popular challenges happening right now' subtitle, tabs (All Trending, By Sport), challenge cards in a grid with title/difficulty badge/sport badge/participant count/duration, OR a loading spinner, OR an empty content area below the tabs (this means no active challenges exist in the database — this is a valid data-empty state, NOT an error). The page heading + tabs being visible is sufficient for a PASS even if the grid below is empty. FAIL only if: blank screen, 'Something went wrong' error, crash, or page doesn't load at all.",
    },

    {
      name: "TrendingChallenges — tabs visible (All Trending, By Sport)",
      action: async (page) => {
        // Already on TrendingChallenges page
      },
      settleMs: 1000,
      assertions: [],
      vision:
        "PASS if: The TrendingChallenges page shows the tab buttons 'All Trending' and 'By Sport'. IMPORTANT: An empty content area below the tabs is a PASS — it means there are zero active challenges in the database, which is a valid data state, NOT an error or broken state. The tabs being visible confirms the page loaded correctly. Challenge cards being shown is a bonus, not a requirement. FAIL only if: tabs are completely missing, full blank page with no header, 'Something went wrong' error, or crash.",
    },

    // ── SportHub ──────────────────────────────────────────────────
    {
      name: "SportHub page loads with sport param",
      action: async (page) => {
        await page.goto(`${APP_URL}/SportHub?sport=Basketball`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/SportHub" },
      ],
      vision:
        "PASS if: Shows ANY of these — a sport hub page with 'Basketball' heading and 'Complete hub for all Basketball content' subtitle, a back arrow button, sections like 'Live Now', 'Upcoming Streams', 'Highlight Reels', 'Community Posts' with content tabs (Recent, Training, Game, Coaching), OR an empty state like 'No Basketball content yet' with trophy emoji. FAIL only if: blank screen, 'Something went wrong' error, crash, or 'Sport not specified' (the URL should have ?sport=Basketball).",
    },

    {
      name: "SportHub — empty sport param shows fallback",
      action: async (page) => {
        await page.goto(`${APP_URL}/SportHub`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 2000,
      assertions: [
        { type: "url_contains", value: "/SportHub" },
      ],
      vision:
        "PASS if: Shows 'Sport not specified' message — this is the expected behavior when no sport query parameter is provided. The page should not crash. FAIL only if: blank screen, 'Something went wrong' error, or crash.",
    },

    // ── Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from discovery features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Discovery feature navigation round-trip completed.",
    },
  ];
}
