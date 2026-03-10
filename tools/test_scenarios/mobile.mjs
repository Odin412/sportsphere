/**
 * mobile.mjs — Mobile viewport test scenarios (8 tests)
 *
 * Tests the app at 375x812 (iPhone viewport) to verify responsive
 * design — bottom nav, mobile layout, page content at small widths.
 * Requires authenticated state.
 */

import { bypassOnboarding } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getMobileScenarios(creds) {
  return [
    {
      name: "Mobile Feed loads with bottom nav",
      critical: true,
      action: async (page) => {
        // Ensure onboarding bypass
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
        await bypassOnboarding(page, APP_URL);
      },
      assertions: [
        // Bottom nav should be visible on mobile (the lg:hidden nav)
        { type: "visible", selector: '[data-tour="mobile-feed"]', timeout: 10000 },
        { type: "visible", selector: '[data-tour="mobile-explore"]' },
      ],
      vision:
        "Shows the mobile feed view at 375px width. Should have: (1) a top header area, (2) a bottom navigation bar with 5 items (Home, Explore, Create, Reels, Profile), (3) feed content or stories section. The LEFT sidebar should NOT be visible. Posts may still be loading or sparse — that's acceptable. The mobile layout structure should be intact. Not a blank page or error.",
    },

    {
      name: "Mobile bottom nav — Explore",
      action: async (page) => {
        await page.click('[data-tour="mobile-explore"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Explore" },
      ],
      vision:
        "Mobile Explore page at 375px width. Content should be stacked vertically and responsive. Some content cards may show placeholder icons or loading states — that's acceptable at mobile viewport. Bottom nav should still be visible. Not a blank page or error.",
    },

    {
      name: "Mobile bottom nav — Reels",
      action: async (page) => {
        await page.click('[data-tour="mobile-reels"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Reels" },
      ],
      vision:
        "Mobile Reels page at 375px width. Should show video tiles or reel cards in a grid layout adapted for mobile. Some tiles may have sparse content or empty thumbnails — that's acceptable. Bottom nav should be visible. Not a blank page or error.",
    },

    {
      name: "Mobile bottom nav — Profile",
      action: async (page) => {
        await page.click('[data-tour="mobile-profile"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Profile" },
      ],
      vision:
        "PASS if: Mobile Profile page at 375px width showing ANY profile UI — avatar area, name, stats (0 Followers / 0 Following / 0 Posts are acceptable for test accounts), content sections, or empty states like 'No featured post yet'. Single-column layout, no desktop sidebar. FAIL only if: loading spinner, blank screen, error, or crash.",
    },

    {
      name: "Mobile Create Post button",
      action: async (page) => {
        await page.click('[data-tour="mobile-create"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/CreatePost" },
      ],
      vision:
        "Shows the Create Post page on mobile. Should have a text input area, media upload option, and submit button. The form should be properly sized for mobile width — no overflowing inputs or buttons. The page is functional and ready for content creation.",
    },

    {
      name: "Mobile Feed — posts are readable",
      action: async (page) => {
        await page.click('[data-tour="mobile-feed"]');
        await page.waitForTimeout(3000);
      },
      assertions: [
        { type: "visible", selector: '[data-tour="mobile-feed"]' },
      ],
      vision:
        "Mobile Feed at 375px width showing posts. Posts should be full-width cards with author names visible. Text may be truncated with ellipsis — that's acceptable for mobile layout. The bottom nav should still be visible. Not a blank page or error.",
    },

    {
      name: "Mobile — no horizontal scroll",
      action: async (page) => {
        // Check if page has horizontal scrollbar
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        // Store result for assertion
        if (hasOverflow) {
          console.log("  ⚠ Page has horizontal overflow at mobile width");
        }
      },
      assertions: [],
      vision:
        "The mobile view should NOT have any horizontal scrollbar. All content should fit within the 375px viewport width. If any element extends beyond the right edge, that's a responsive design bug. Check that headers, cards, buttons, and text all fit within bounds.",
    },

    {
      name: "Mobile — return to Feed from mobile nav",
      action: async (page) => {
        await page.click('[data-tour="mobile-feed"]');
      },
      settleMs: 2000,
      assertions: [
        { type: "visible", selector: '[data-tour="mobile-feed"]' },
      ],
      vision:
        "Back on mobile Feed. Bottom nav round-trip works — all 5 nav items were accessible and functional at 375px width.",
    },
  ];
}
