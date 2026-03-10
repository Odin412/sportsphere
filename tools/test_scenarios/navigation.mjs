/**
 * navigation.mjs — Navigation test scenarios (11 tests)
 *
 * Tests sidebar rendering, primary nav links, secondary (More) nav,
 * and navigation round-trips. Requires authenticated state.
 */

import { bypassOnboarding } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getNavigationScenarios(creds) {
  return [
    {
      name: "Sidebar renders all primary nav",
      action: async (page) => {
        // Ensure onboarding bypass is set before navigating
        await page.evaluate(() => {
          const key = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
          if (key) {
            try {
              const uid = JSON.parse(localStorage.getItem(key))?.user?.id;
              if (uid) localStorage.setItem(`ob_${uid}`, "1");
            } catch {}
          }
        });
        await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(3000);
        // If still hit onboarding, bypass it
        await bypassOnboarding(page, APP_URL);
      },
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
        { type: "visible", selector: '[data-tour="nav-explore"]' },
        { type: "visible", selector: '[data-tour="nav-reels"]' },
        { type: "visible", selector: '[data-tour="nav-propathhub"]' },
        { type: "visible", selector: '[data-tour="nav-live"]' },
        { type: "visible", selector: '[data-tour="nav-messages"]' },
        { type: "visible", selector: '[data-tour="nav-profile"]' },
      ],
      vision:
        "Left sidebar shows 7 labeled navigation items with icons: Feed, Explore, Reels, ProPath, Live, Messages, Profile. Feed should be highlighted as the active item.",
    },

    {
      name: "Navigate to Explore",
      action: async (page) => {
        await page.click('[data-tour="nav-explore"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Explore" },
      ],
      vision:
        "Shows the Explore/discovery page with content — sport category pills, trending athletes, training videos, or a search bar. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Navigate to Reels",
      action: async (page) => {
        await page.click('[data-tour="nav-reels"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Reels" },
      ],
      vision:
        "Shows a Reels/short-video page with sport category labels, video tiles or thumbnails, and user names. Some tiles may have sparse content — that's acceptable for accounts with limited video data. The page structure should be intact with a grid layout. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Navigate to ProPath",
      action: async (page) => {
        await page.click('[data-tour="nav-propathhub"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/ProPathHub" },
      ],
      vision:
        "Shows the ProPath athlete hub page with sections like Scout Card preview, training streak, stats, or AI narrative. Not empty or errored.",
    },

    {
      name: "Navigate to Live",
      action: async (page) => {
        await page.click('[data-tour="nav-live"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Live" },
      ],
      vision:
        "Shows the Live streaming page — either active streams grid, a 'Go Live' button, sport filters, or an empty state message saying no streams. Not a crash or blank page.",
    },

    {
      name: "Navigate to Messages",
      action: async (page) => {
        await page.click('[data-tour="nav-messages"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Messages" },
      ],
      vision:
        "PASS if: The Messages page loaded with ANY visible UI — a 'Messages' heading, search bar, conversation list (empty or populated), 'Select a conversation' placeholder, chat icon, or 'No conversations' text. An empty inbox with just the search bar and 'Select a conversation' text is a VALID PASS state. FAIL only if: the page shows ONLY a loading spinner on black background, completely blank screen, error message, or crash.",
    },

    {
      name: "Navigate to Profile",
      action: async (page) => {
        await page.click('[data-tour="nav-profile"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Profile" },
      ],
      vision:
        "Shows a user profile page with the user's name or avatar, stats section (followers/following/posts counts — zeros are OK for test accounts), and content sections like Featured Highlights or Sport Profiles. Empty states like 'No featured post yet' or 'No sport profiles yet' are acceptable for new test accounts. The profile layout and structure should be intact. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "More menu expands",
      action: async (page) => {
        // Navigate back to feed first for a clean state
        await page.click('[data-tour="nav-feed"]');
        await page.waitForTimeout(2000);
        // Click More
        await page.click('[data-tour="more-menu"]');
      },
      settleMs: 1500,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-challenges"]', timeout: 5000 },
      ],
      vision:
        "The More/secondary menu is expanded showing additional navigation items like Challenges, Events, Forums, Groups, Leaderboard, AI Coach, Creator Hub, etc.",
    },

    {
      name: "Navigate to Challenges (secondary)",
      action: async (page) => {
        // More menu should still be open
        await page.click('[data-tour="nav-challenges"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Challenges" },
      ],
      vision:
        "PASS if: The Challenges page loaded with ANY visible UI — a 'Challenges' heading/banner, 'Create Challenge' button, tab filters, challenge cards, or 'No challenges found' empty state with a trophy icon. An empty state showing 'No challenges found - Create your first challenge' is a VALID PASS. FAIL only if: the page shows ONLY a loading spinner on black background, completely blank screen, error message, or crash.",
    },

    {
      name: "Navigate to Forums (secondary)",
      action: async (page) => {
        // Check if secondary nav is already visible (More menu still open from previous step)
        const forumsLink = page.locator('[data-tour="nav-forums"]');
        const alreadyVisible = await forumsLink.isVisible().catch(() => false);
        if (!alreadyVisible) {
          // More menu is closed — open it
          const moreBtn = page.locator('[data-tour="more-menu"]');
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        await forumsLink.click();
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Forums" },
      ],
      vision:
        "Shows the Forums page. Either forum topics are listed, or an empty state like 'No topics found. Be the first to start a discussion!' is shown — both are acceptable. The page title, structure, and any creation/start-discussion prompt should be visible. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Return to Feed (round-trip)",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with post cards visible showing author names and content. Navigation round-trip is complete — the app is stable after visiting multiple pages.",
    },
  ];
}
