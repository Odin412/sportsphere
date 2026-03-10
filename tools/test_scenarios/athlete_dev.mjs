/**
 * athlete_dev.mjs — Phase 8: Athlete Development test scenarios
 *
 * Tests: ScoutingHub, UserProfile, SavedContent, AthleteInsights
 * Account: test-athlete
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getAthleteDevScenarios(creds) {
  return [
    // ── ScoutingHub ───────────────────────────────────────────────
    {
      name: "ScoutingHub page loads",
      action: async (page) => {
        // ScoutingHub is in SECONDARY_NAV
        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-scoutinghub"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/ScoutingHub`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/ScoutingHub" },
      ],
      vision:
        "PASS if: Shows ANY of these — a Scouting Hub page with crosshair icon, search bar, sport filter chips (All, Basketball, Soccer, etc.), level filter pills (All, beginner, intermediate, etc.), athlete profile cards with avatar/name/sport/stats, OR an empty state with 'No athletes found' or loading spinner. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── UserProfile ───────────────────────────────────────────────
    {
      name: "UserProfile page loads",
      action: async (page) => {
        // Navigate to a bot user profile
        await page.goto(`${APP_URL}/UserProfile?email=marcus.silva@sportsphere.app`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/UserProfile" },
      ],
      vision:
        "PASS if: Shows ANY of these — a user profile page with avatar, display name, bio, sport badges, follow/unfollow button, follower/following counts, post grid or post list, tabs (Posts, Reels, etc.), Scout Card link, training streak, OR a 'User not found' message. The page should display profile information for the viewed user. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── SavedContent ──────────────────────────────────────────────
    {
      name: "SavedContent page loads",
      action: async (page) => {
        // SavedContent is in SECONDARY_NAV
        await page.click('[data-tour="nav-feed"]').catch(() => {});
        await page.waitForTimeout(2000);

        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-savedcontent"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/SavedContent`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/SavedContent" },
      ],
      vision:
        "PASS if: Shows ANY of these — a Saved Content page with bookmark icon, saved post cards with delete/remove buttons, OR an empty state like 'No saved content yet' or 'You haven\\'t saved anything yet'. The page has a dark gradient background. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── AthleteInsights ───────────────────────────────────────────
    {
      name: "AthleteInsights page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/AthleteInsights`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/AthleteInsights" },
      ],
      vision:
        "PASS if: Shows ANY of these — an Athlete Insights page with sparkle icon, athlete selector dropdown, 'Generate Summary' button, AI-generated performance summary, training recommendations, OR an empty state like 'No organization found' or 'Select an athlete' or 'No data available'. This page requires org membership so an empty/setup state is expected for test accounts. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from athlete dev features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Athlete development navigation round-trip completed.",
    },
  ];
}
