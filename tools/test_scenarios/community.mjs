/**
 * community.mjs — Phase 3: Community & Social test scenarios
 *
 * Tests: Groups, GroupDetail, ForumTopic, Events, Notifications, Advice
 * Account: test-athlete
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getCommunityScenarios(creds) {
  return [
    // ── Groups ────────────────────────────────────────────────────
    {
      name: "Groups page loads",
      action: async (page) => {
        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-groups"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/Groups`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Groups" },
      ],
      vision:
        "PASS if: Shows a Groups page with ANY of these — 'Groups & Clubs' heading, search bar, category filter buttons (All Groups, Sport-Specific, Training Goals, etc.), group cards in a grid, Create Group button, or an empty state message. FAIL only if: blank screen, loading spinner stuck, error, or crash.",
    },

    {
      name: "Groups — search bar and category filters visible",
      action: async (page) => {
        // Already on Groups page
      },
      settleMs: 1000,
      assertions: [],
      vision:
        "PASS if: The Groups page shows a search input field (placeholder text about searching groups) AND category filter buttons/pills (All Groups, Sport-Specific, Training Goals, Local Community, Competition, Social). FAIL only if: no search bar visible AND no category filters visible, blank page, or error.",
    },

    // ── GroupDetail ───────────────────────────────────────────────
    {
      name: "GroupDetail page loads",
      action: async (page) => {
        // Try clicking into a group card if any exist
        const groupCard = page.locator('.grid a, .grid [class*="card"], .grid > div').first();
        const hasCard = await groupCard.isVisible().catch(() => false);
        if (hasCard) {
          await groupCard.click();
          await page.waitForTimeout(3000);
        } else {
          // Navigate directly — may show "Group not found" which is acceptable
          await page.goto(`${APP_URL}/GroupDetail?id=test`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 3000,
      assertions: [],
      vision:
        "PASS if: Shows ANY of these — a group detail page with group name/description/members, a 'Join Group' prompt, a 'Group not found' message, OR the Groups list page (if no groups exist to click into). The page should be functional and not crashed. FAIL only if: blank screen, stuck loading spinner, error, or crash.",
    },

    // ── Events ────────────────────────────────────────────────────
    {
      name: "Events page loads",
      action: async (page) => {
        // Navigate back to a known state first
        await page.click('[data-tour="nav-feed"]').catch(() => {});
        await page.waitForTimeout(2000);

        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const link = page.locator('[data-tour="nav-events"]');
        if (await link.isVisible().catch(() => false)) {
          await link.click();
        } else {
          await page.goto(`${APP_URL}/Events`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Events" },
      ],
      vision:
        "PASS if: Shows an Events page with ANY of these — 'Event Discovery' heading, search bar, filter controls (sport/type/location/date dropdowns), event type pill buttons (All Types, Competition, Tournament, Workshop, etc.), event cards in a grid, 'Create Event' button, tabs (Discover, For You, My Events), an 'X events found' count, or a 'No events found' empty state. FAIL only if: blank screen, stuck loading spinner, error, or crash.",
    },

    {
      name: "Events — filters and type pills visible",
      action: async (page) => {
        // Already on Events page
      },
      settleMs: 1000,
      assertions: [],
      vision:
        "PASS if: The Events page shows filter controls — either dropdown selects (sport, type, location, date) or type pill buttons (Competition, Tournament, Workshop, Training, Meetup, Other). Showing the event grid or 'No events found' is also acceptable as long as filter UI is present. FAIL only if: no filter controls visible at all, blank page, or error.",
    },

    // ── Notifications ─────────────────────────────────────────────
    {
      name: "Notifications page loads",
      action: async (page) => {
        // Navigate back to feed first
        await page.click('[data-tour="nav-feed"]').catch(() => {});
        await page.waitForTimeout(2000);

        // Try the notification bell in header first
        const bellLink = page.locator('a[href*="Notifications"], a[aria-label="Notifications"]').first();
        if (await bellLink.isVisible().catch(() => false)) {
          await bellLink.click();
        } else {
          // Try More menu
          const moreBtn = page.locator('[data-tour="more-menu"]');
          if (await moreBtn.isVisible().catch(() => false)) {
            await moreBtn.click();
            await page.waitForTimeout(1500);
          }
          const link = page.locator('[data-tour="nav-notifications"]');
          if (await link.isVisible().catch(() => false)) {
            await link.click();
          } else {
            await page.goto(`${APP_URL}/Notifications`, { waitUntil: "networkidle" });
            await waitForAuth(page);
          }
        }
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Notifications" },
      ],
      vision:
        "PASS if: Shows a Notifications page with ANY of these — 'Notifications' heading with bell icon, unread count, filter buttons (All, Unread, Likes, Comments, Follows, Mentions, Streams, Challenges), notification items with avatars, a 'Mark all read' button, tabs (Notifications, Activity), settings gear icon, OR an empty state like 'You're all caught up'. FAIL only if: blank screen, stuck loading spinner, error, or crash.",
    },

    {
      name: "Notifications — filter pills visible",
      action: async (page) => {
        // Already on Notifications page
      },
      settleMs: 1000,
      assertions: [],
      vision:
        "PASS if: The Notifications page shows filter pill buttons — All, Unread, Likes, Comments, Follows, or similar category filters. An empty notification list with filters still visible is a PASS. FAIL only if: no filter UI visible, blank page, or error.",
    },

    // ── ForumTopic ────────────────────────────────────────────────
    {
      name: "ForumTopic page loads",
      action: async (page) => {
        // Navigate to Forums first via More menu
        await page.click('[data-tour="nav-feed"]').catch(() => {});
        await page.waitForTimeout(2000);

        const moreBtn = page.locator('[data-tour="more-menu"]');
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }
        const forumsLink = page.locator('[data-tour="nav-forums"]');
        if (await forumsLink.isVisible().catch(() => false)) {
          await forumsLink.click();
          await page.waitForTimeout(3000);
        } else {
          await page.goto(`${APP_URL}/Forums`, { waitUntil: "networkidle" });
          await waitForAuth(page);
        }

        // Try clicking into a forum topic if any exist
        const topicLink = page.locator('a[href*="ForumTopic"], [class*="card"] a, .space-y-3 > div').first();
        const hasTopicLink = await topicLink.isVisible().catch(() => false);
        if (hasTopicLink) {
          await topicLink.click();
          await page.waitForTimeout(3000);
        }
      },
      settleMs: 3000,
      assertions: [],
      vision:
        "PASS if: Shows ANY of these — a forum topic detail page with topic title/author/content/replies, OR the Forums list page with topics listed, OR a Forums empty state like 'No topics found. Be the first to start a discussion' with a 'New Topic' button, OR a 'Community Forums' heading with category filters. All of these are valid states. FAIL only if: blank screen, stuck loading spinner, 'Something went wrong' error, or crash.",
    },

    // ── Advice ────────────────────────────────────────────────────
    {
      name: "Advice page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/Advice`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Advice" },
      ],
      vision:
        "PASS if: Shows ANY of these — an 'Advice Hub' page with Received/Sent tabs and advice request cards, OR a Premium gate/upgrade prompt (the Advice page is behind a premium paywall, so showing a premium gate with upgrade CTA is the EXPECTED behavior for non-premium test accounts). FAIL only if: blank screen, stuck loading spinner, error, or crash.",
    },

    // ── Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from community features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Community feature navigation round-trip completed.",
    },
  ];
}
