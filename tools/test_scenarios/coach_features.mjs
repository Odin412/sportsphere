/**
 * coach_features.mjs — Coach role-specific test scenarios (5 tests)
 *
 * Tests AI Coach, LiveCoaching, VideoReview pages.
 * Requires authenticated state with a coach account.
 */

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getCoachFeatureScenarios(creds) {
  return [
    {
      name: "AI Coach page loads",
      action: async (page) => {
        // Navigate via More menu → AI Coach
        const link = page.locator('[data-tour="nav-coach"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-coach"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Coach" },
      ],
      vision:
        "Shows the AI Coach page. May display a chat interface with input field, OR a premium gate/upgrade prompt (both are acceptable — premium gating is by design). The page structure should be visible with proper styling. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "LiveCoaching page loads",
      action: async (page) => {
        const link = page.locator('[data-tour="nav-livecoaching"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-livecoaching"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/LiveCoaching" },
      ],
      vision:
        "Shows the Live Coaching sessions page. Should display page title and either a session list or an empty state like 'No sessions found' (both acceptable for test accounts with no coaching data). May show tabs and a 'Create Session' button. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Creator Hub page loads for coach",
      action: async (page) => {
        const link = page.locator('[data-tour="nav-creatorhub"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-creatorhub"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/CreatorHub" },
      ],
      vision:
        "Shows the Creator Hub page for the coach account. Should display creator tools, content management, or monetization features. May show analytics, content list, or setup prompts. Not blank or errored.",
    },

    {
      name: "Analytics page loads for coach",
      action: async (page) => {
        const link = page.locator('[data-tour="nav-analytics"]');
        const visible = await link.isVisible().catch(() => false);
        if (!visible) {
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await page.locator('[data-tour="nav-analytics"]').click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Analytics" },
      ],
      vision:
        "Shows the Analytics page with metric cards and chart areas. Metrics showing zeros (0 Views, 0 Likes, 0 Followers, etc.) are acceptable for test accounts with no activity. The page layout with stat cards and chart sections should be intact. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Return to Feed from coach features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page. Coach feature navigation round-trip completed.",
    },
  ];
}
