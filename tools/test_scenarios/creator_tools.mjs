/**
 * creator_tools.mjs — Phase 6: Creator Tools test scenarios
 *
 * Tests: CreatorAI, CreatorShop, BecomeCreator
 * Account: test-athlete
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getCreatorToolsScenarios(creds) {
  return [
    // ── CreatorAI ─────────────────────────────────────────────────
    {
      name: "CreatorAI page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/CreatorAI`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/CreatorAI" },
      ],
      vision:
        "PASS if: Shows ANY of these — a CreatorAI page with tabs (Post Ideas, Captions, Hashtags, Video Scripts), sport selector, topic input, generate button, OR a Premium gate/upgrade prompt (CreatorAI is behind a premium paywall, so a premium gate with upgrade CTA is the EXPECTED behavior for non-premium accounts). FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── CreatorShop ───────────────────────────────────────────────
    {
      name: "CreatorShop page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/CreatorShop`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/CreatorShop" },
      ],
      vision:
        "PASS if: Shows ANY of these — a Creator Shop page with shopping cart icon, product grid with cards showing title/price/category, a 'Create Product' or 'Add Product' button, OR an empty shop state with no products listed. The page has a dark gradient background. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── BecomeCreator ─────────────────────────────────────────────
    {
      name: "BecomeCreator page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/BecomeCreator`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/BecomeCreator" },
      ],
      vision:
        "PASS if: Shows ANY of these — a 'Become a Creator' hero section with gradient banner, benefit cards (Go Live & Stream, Monetize Your Content, Grow Your Community, Creator Analytics, Sell Products & Courses, Host Premium Challenges), step-by-step guide (1-4), a 'Become a Creator' CTA button, OR an 'already a creator' success state with links to Creator Hub/Analytics/Go Live. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    {
      name: "BecomeCreator — benefits and steps visible",
      action: async (page) => {
        // Already on BecomeCreator page
      },
      settleMs: 1000,
      assertions: [],
      vision:
        "PASS if: The BecomeCreator page shows benefit cards with icons and descriptions (Go Live, Monetize, Community, Analytics, Products, Challenges) AND/OR a step-by-step guide. Also acceptable if user is already a creator and sees a success state. FAIL only if: blank page, error, or crash.",
    },

    // ── Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from creator tools",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Creator tools navigation round-trip completed.",
    },
  ];
}
