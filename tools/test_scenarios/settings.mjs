/**
 * settings.mjs — Phase 5: Account & Settings test scenarios
 *
 * Tests: ProfileSettings, Premium, Leaderboard
 * Account: test-athlete
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getSettingsScenarios(creds) {
  return [
    // ── ProfileSettings ───────────────────────────────────────────
    {
      name: "ProfileSettings page loads",
      action: async (page) => {
        // ProfileSettings is in SECONDARY_NAV — try More menu
        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-profilesettings"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/ProfileSettings`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/ProfileSettings" },
      ],
      vision:
        "PASS if: Shows a ProfileSettings page with ANY of these — a back arrow, settings tabs (Profile, Language, Activity, Alerts), form fields for name/bio/avatar/cover photo, notification toggle switches, language selector, OR a loading state. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    {
      name: "ProfileSettings — identity tab with form fields",
      action: async (page) => {
        // Already on ProfileSettings page — make sure Identity tab is active
        const identityTab = page.locator('button:has-text("Identity"), [value="identity"]').first();
        if (await identityTab.isVisible().catch(() => false)) {
          await identityTab.click();
          await page.waitForTimeout(1000);
        }
      },
      settleMs: 2000,
      assertions: [],
      vision:
        "PASS if: The ProfileSettings Identity tab shows form fields — display name input, bio textarea, avatar upload area, cover photo upload area, OR social links section. Any combination of these form elements is acceptable. FAIL only if: no form fields visible, blank page, error, or crash.",
    },

    {
      name: "ProfileSettings — alerts tab loads",
      action: async (page) => {
        // Tab text is "Alerts" not "Notifications", value is "notifications"
        const notifsTab = page.locator('button:has-text("Alerts"), [value="notifications"]').first();
        if (await notifsTab.isVisible().catch(() => false)) {
          await notifsTab.click();
          await page.waitForTimeout(1500);
        }
      },
      settleMs: 2000,
      assertions: [],
      vision:
        "PASS if: Shows notification/alert settings with toggle switches — organized by groups like Social (Likes, Comments, Mentions), Followers, Messages & Advice, Streams & Events, Monetization. Each setting should have in-app and/or email toggle options. Also acceptable if the Alerts tab content shows any notification preference controls. FAIL only if: still showing Profile/Identity form instead of alerts, blank content area, error, or crash.",
    },

    // ── Premium ───────────────────────────────────────────────────
    {
      name: "Premium page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/Premium`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/Premium" },
      ],
      vision:
        "PASS if: Shows a Premium page with ANY of these — 'SportHub Premium' heading with crown icon, 'Unlock AI-powered features' subtitle, feature list/pricing, a 'Subscribe' or 'Upgrade' button, OR an 'Active Premium' status card (if already subscribed). The page has a dark gradient background. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── Leaderboard ───────────────────────────────────────────────
    {
      name: "Leaderboard page loads",
      action: async (page) => {
        // Leaderboard is in SECONDARY_NAV — try More menu
        await page.click('[data-tour="nav-feed"]').catch(() => {});
        await page.waitForTimeout(2000);

        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-leaderboard"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/Leaderboard`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/Leaderboard" },
      ],
      vision:
        "PASS if: Shows a Leaderboard page with ANY of these — 'Leaderboard' heading with trophy icon and red gradient banner, 'Top athletes in the Sportsphere community' subtitle, period tabs (All Time, This Week, This Month), sport filter chips (All Sports, Basketball, Soccer, etc.), ranked user cards with avatar/name/score/stats, a podium display for top 3, OR an empty state message like 'Rankings update weekly. Stay active to climb' or similar. The header + tabs + sport filters being visible is sufficient for PASS even if the rankings list is empty. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    {
      name: "Leaderboard — period tabs and sport filters visible",
      action: async (page) => {
        // Already on Leaderboard page
      },
      settleMs: 1000,
      assertions: [],
      vision:
        "PASS if: The Leaderboard page shows period selector tabs (All Time, This Week, This Month) AND sport filter chips (All Sports, Basketball, Soccer, Football, etc.). An empty user list below is acceptable since the data may be sparse. FAIL only if: no period tabs or sport filters visible, blank page, error, or crash.",
    },

    // ── Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from settings features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Settings feature navigation round-trip completed.",
    },
  ];
}
