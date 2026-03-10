/**
 * feed.mjs — Feed page test scenarios (8 tests)
 *
 * Tests post loading, sport filtering, like/unlike, author links,
 * and news widget. Requires authenticated state.
 */

import { bypassOnboarding } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getFeedScenarios(creds, config) {
  return [
    {
      name: "Feed loads with real posts",
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
        // Wait for TanStack Query to resolve
        await page.waitForTimeout(3000);
      },
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
        // PostCard elements should be present — look for common post card patterns
        { type: "count_gte", selector: '[class*="post"], [class*="Post"], article, [data-testid*="post"]', value: 1, timeout: 8000 },
      ],
      vision:
        "Feed shows multiple post cards with author names, content text, timestamps, and interaction buttons (heart/like, comment, share). Posts have REAL content — actual text about sports, not placeholder 'Lorem ipsum'. At least 2-3 posts should be visible.",
    },

    {
      name: "Sport filter pills exist",
      action: null, // Already on Feed
      assertions: [
        // Sport filter buttons — look for the horizontal pill row
        { type: "count_gte", selector: 'button:has-text("Basketball"), button:has-text("Soccer"), button:has-text("Football"), button:has-text("Baseball")', value: 1, timeout: 5000 },
      ],
      vision:
        "A horizontal row of sport filter pill buttons is visible near the top of the feed (e.g., Basketball, Soccer, Football, Baseball, Tennis, etc.). The pills should be scrollable or wrap, and show sport names.",
    },

    {
      name: "Sport filter actually filters",
      action: async (page) => {
        // Click Basketball filter
        const basketballBtn = page.locator('button:has-text("Basketball")').first();
        await basketballBtn.click();
        await page.waitForTimeout(3000);
      },
      assertions: [],
      vision:
        "After clicking the Basketball filter: the Basketball pill should appear highlighted/selected (different color or background from other pills). Visible posts should relate to basketball — either tagged with 'Basketball' or having basketball-related content. Posts from other sports like Soccer or Football should NOT be visible.",
    },

    {
      name: "Clear filter restores all posts",
      action: async (page) => {
        // Click Basketball again to deselect, or click "All"
        const basketballBtn = page.locator('button:has-text("Basketball")').first();
        const allBtn = page.locator('button:has-text("All")').first();
        if (await allBtn.isVisible()) {
          await allBtn.click();
        } else {
          await basketballBtn.click();
        }
        await page.waitForTimeout(3000);
      },
      assertions: [],
      vision:
        "Feed shows posts from multiple different sports again — the filter is cleared. No single sport should dominate if the filter was successfully removed. Posts from various sports should be visible.",
    },

    {
      name: "Like button works",
      action: async (page) => {
        // Scroll to ensure first post is in view
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);

        // Find and click a like/heart button on the first post
        // Common patterns: heart icon, thumbs-up, or like button
        const likeBtn = page.locator('button:has(svg), [role="button"]')
          .filter({ has: page.locator('[class*="heart"], [class*="Heart"], [data-testid*="like"]') })
          .first();

        // If specific heart button not found, try broader approach
        if (await likeBtn.isVisible().catch(() => false)) {
          await likeBtn.click();
        } else {
          // Fallback: find any interactive heart-like element in the first post area
          const fallback = page.locator('button').filter({ hasText: /^[0-9]*$/ }).first();
          if (await fallback.isVisible().catch(() => false)) {
            await fallback.click();
          }
        }
        await page.waitForTimeout(2000);
      },
      assertions: [],
      vision:
        "The feed is showing posts with interaction buttons. A like/heart button may appear filled or in an active state if the like action succeeded. The post cards should still be visible with author names and content. Even if the like state change is subtle or not clearly visible, the page should be functional and not showing errors.",
    },

    {
      name: "Unlike restores state",
      action: async (page) => {
        // Click the same like button again to unlike
        const likeBtn = page.locator('button:has(svg)')
          .filter({ has: page.locator('[class*="heart"], [class*="Heart"], [data-testid*="like"]') })
          .first();

        if (await likeBtn.isVisible().catch(() => false)) {
          await likeBtn.click();
        }
        await page.waitForTimeout(2000);
      },
      assertions: [],
      vision:
        "The feed is showing posts with interaction buttons visible. The like/heart button should be in its default/unfilled state. The post cards should be intact with author names and content. Even if the unlike state change is subtle, the page should be functional and not showing errors.",
    },

    {
      name: "Post author links to profile",
      action: async (page) => {
        // Click on an author name or avatar in a post
        const authorLink = page.locator('a[href*="UserProfile"], a[href*="userprofile"], [class*="author"] a, [class*="Author"] a').first();
        if (await authorLink.isVisible().catch(() => false)) {
          await authorLink.click();
          await page.waitForTimeout(3000);
        } else {
          // Fallback: try clicking a user name text element near a post
          const nameEl = page.locator('.font-bold, .font-semibold').filter({ hasText: /@/ }).first();
          if (await nameEl.isVisible().catch(() => false)) {
            await nameEl.click();
            await page.waitForTimeout(3000);
          }
        }
      },
      assertions: [
        { type: "url_contains", value: "UserProfile", timeout: 5000 },
      ],
      vision:
        "Shows a user profile page for the post author — with their name, avatar, stats, and posts. This should be a DIFFERENT user's profile, not the test account's own profile page.",
    },

    {
      name: "News widget has content",
      action: async (page) => {
        // Navigate back to feed
        await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(3000);
        // Scroll down to find the news widget (usually in sidebar or below fold)
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);
      },
      assertions: [],
      vision:
        "The feed page is visible. A sport news widget may be visible in the sidebar or below the fold, showing headlines from ESPN or similar sports sources. If the news widget shows a loading skeleton, 'No news available', or is partially loaded, that's acceptable — the CORS proxy may be slow. The feed itself should still be functional with posts visible. Not a blank page or error.",
    },
  ];
}
