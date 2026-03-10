/**
 * athlete_features.mjs — Athlete role-specific test scenarios (8 tests)
 *
 * Tests ProPathHub, ScoutCard, TheVault, GetNoticed, and PerformanceHub.
 * Requires authenticated state with an athlete account.
 */

import { bypassOnboarding, waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getAthleteFeatureScenarios(creds) {
  return [
    {
      name: "ProPathHub page loads",
      action: async (page) => {
        await page.click('[data-tour="nav-propathhub"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/ProPathHub" },
        { type: "visible", selector: 'text=ProPath', timeout: 8000 },
      ],
      vision:
        "Shows the ProPath athlete hub page. Should display either: (a) a setup prompt to create a sport profile, or (b) an active ProPath dashboard with Scout Card preview, training streak, quick actions (Import GC Stats, Log Performance), and WhosScouting panel. Not blank or errored.",
    },

    {
      name: "GetNoticed page loads with Browse tab",
      action: async (page) => {
        // Navigate via More menu
        const link = page.locator('[data-tour="nav-getnoticed"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-getnoticed"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/GetNoticed" },
      ],
      vision:
        "Shows the Get Noticed / athlete showcase page. Should have: a hero section with 'Get Noticed' title, Browse Athletes tab active, search bar, sport filter chips (Basketball, Soccer, etc.), level filter buttons, and a grid of athlete cards OR an empty state. Not blank or errored.",
    },

    {
      name: "GetNoticed sport filter works",
      action: async (page) => {
        const basketballBtn = page.locator('button:has-text("Basketball")').first();
        if (await basketballBtn.isVisible().catch(() => false)) {
          await basketballBtn.click();
        }
      },
      settleMs: 2000,
      assertions: [],
      vision:
        "The Basketball sport filter chip should now appear highlighted/selected with a different visual state from other chips. If athletes exist, they should be basketball athletes. The filter interaction worked — no crash or error.",
    },

    {
      name: "GetNoticed My Showcase tab",
      action: async (page) => {
        // Click My Showcase tab
        const showcaseTab = page.locator('button:has-text("My Showcase")').first();
        if (await showcaseTab.isVisible().catch(() => false)) {
          await showcaseTab.click();
          await page.waitForTimeout(2000);
        }
      },
      assertions: [],
      vision:
        "Shows the My Showcase tab content. Should display either: (a) athlete's own sport profiles with an Edit Profile button and 'You\\'re Visible to Scouts' notice, or (b) an empty state with 'Put Yourself on the Map' CTA and benefit cards. Not the Browse tab.",
    },

    {
      name: "TheVault page loads",
      action: async (page) => {
        // Navigate via More menu
        const link = page.locator('[data-tour="nav-thevault"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-thevault"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/TheVault" },
      ],
      vision:
        "Shows The Vault page — a private video storage area. Should display: 'The Vault' title with lock icon, 'Private' badge, 'Add Video' button, and either a grid of video cards or an empty state with privacy explanation. Not blank or errored.",
    },

    {
      name: "PerformanceHub page loads",
      action: async (page) => {
        const link = page.locator('[data-tour="nav-performancehub"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-performancehub"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/PerformanceHub" },
      ],
      vision:
        "Shows the Performance Hub page. Should display either: (a) a sport profile card with Personal Bests and session log, or (b) an empty state prompting to set up a sport profile — both are acceptable for test accounts. The page title and structure should be visible. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "ScoutCard page loads for athlete",
      action: async (page) => {
        // Navigate to ScoutCard with the test athlete's email
        await page.goto(`${APP_URL}/ScoutCard?email=${encodeURIComponent("test-athlete@sportsphere.app")}`, {
          waitUntil: "networkidle",
        });
        await waitForAuth(page);
      },
      settleMs: 2000,
      assertions: [
        { type: "url_contains", value: "/ScoutCard" },
      ],
      vision:
        "Shows a Scout Card page. Should display either: (a) a trading-card style display with the athlete's photo, name, stats table, and action buttons (Contact, Share, Download, Flip), or (b) a message that the athlete hasn't set up their profile yet. Has 'ProPath Scout Card' header. Not blank or errored.",
    },

    {
      name: "Return to Feed from athlete features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Navigation round-trip through athlete features completed successfully.",
    },
  ];
}
