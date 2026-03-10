/**
 * auth.mjs — Auth flow test scenarios (7 tests)
 *
 * Tests login, invalid credentials, session persistence, sign-up form,
 * logout, and auth guard.
 */

import { bypassOnboarding } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getAuthScenarios(creds) {
  return [
    {
      name: "Login page renders",
      critical: true,
      action: async (page) => {
        await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
      },
      assertions: [
        { type: "url_contains", value: "/login" },
        { type: "visible", selector: "#email" },
        { type: "visible", selector: "#password" },
      ],
      vision:
        "This should show a login page with a split-screen design: a dark left panel with branding text, and a right panel with email and password input fields and a 'Sign In' button. It should NOT be a blank page, error page, or loading spinner.",
    },

    {
      name: "Invalid credentials rejected",
      action: async (page) => {
        await page.fill("#email", "fake-nonexistent-user@example.com");
        await page.fill("#password", "wrongpassword123");
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      },
      assertions: [
        { type: "url_contains", value: "/login" },
        { type: "visible", selector: "#email" },
      ],
      vision:
        "An error message or red toast notification should be visible indicating invalid credentials or login failure. The user should still be on the login page — NOT redirected to the app.",
    },

    {
      name: "Valid login redirects to Feed",
      critical: true,
      action: async (page) => {
        // Clear and re-fill (in case previous test left data)
        await page.fill("#email", "");
        await page.fill("#password", "");
        await page.fill("#email", creds.email);
        await page.fill("#password", creds.password);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        await bypassOnboarding(page, APP_URL);
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]', timeout: 20000 },
        { type: "not_visible", selector: "#email" },
      ],
      vision:
        "This should show the authenticated app: a left sidebar with navigation items (Feed, Explore, Reels, etc.), a main content area with a feed of posts or loading state, and a top header. It should NOT show a login form, error message, or blank white page.",
    },

    {
      name: "Session persists on refresh",
      action: async (page) => {
        // Ensure onboarding bypass is set
        await page.evaluate(() => {
          const key = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
          if (key) {
            try {
              const uid = JSON.parse(localStorage.getItem(key))?.user?.id;
              if (uid) localStorage.setItem(`ob_${uid}`, "1");
            } catch {}
          }
        });
        await page.reload({ waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]', timeout: 20000 },
        { type: "not_visible", selector: "#email" },
      ],
      vision:
        "After page refresh: should still show the authenticated feed page with sidebar navigation. Should NOT be redirected to the login page or onboarding.",
    },

    {
      name: "Sign-up form has role selection",
      action: async (page) => {
        // First log out by clearing cookies/storage
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);
        // Click the "Create Account" tab
        const createTab = page.locator('button:has-text("Create Account"), button:has-text("Sign Up")').first();
        if (await createTab.isVisible().catch(() => false)) {
          await createTab.click();
          await page.waitForTimeout(1500);
        }
      },
      assertions: [
        // Role selection cards should be visible (fullName appears after selecting a role)
        { type: "visible", selector: 'text=I am joining as a', timeout: 8000 },
      ],
      vision:
        "Shows a sign-up form with role selection cards visible (Athlete, Coach, Organization, Parent). The 'Create Account' tab should be active. Should show 4 role cards, not just the sign-in form.",
    },

    {
      name: "Logout actually logs out",
      action: async (page) => {
        // First login again
        await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);

        // May already be logged in from previous tests
        if (!page.url().includes("/login")) {
          // Already authenticated
        } else {
          await page.fill("#email", creds.email);
          await page.fill("#password", creds.password);
          await page.click('button[type="submit"]');
          await page.waitForTimeout(5000);
        }

        // Handle onboarding if it appears
        await bypassOnboarding(page, APP_URL);

        // Wait for sidebar
        try {
          await page.waitForSelector('[data-tour="more-menu"]', { timeout: 15000 });
        } catch {
          // If sidebar isn't visible, we might be on mobile or something else
        }
        await page.waitForTimeout(1000);

        // Now logout: open More menu, click Sign Out
        const moreBtn = page.locator('[data-tour="more-menu"]').first();
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click();
          await page.waitForTimeout(1500);
        }

        // Find and click Sign Out
        const signOut = page.locator('button:has-text("Sign Out")').first();
        if (await signOut.isVisible().catch(() => false)) {
          await signOut.click();
          await page.waitForTimeout(4000);
        }
      },
      assertions: [
        { type: "not_visible", selector: '[data-tour="nav-feed"]', timeout: 5000 },
      ],
      vision:
        "Shows the login page or landing page. The sidebar and feed are completely gone — the user is fully logged out. Should NOT show any authenticated content.",
    },

    {
      name: "Auth guard blocks Feed when logged out",
      action: async (page) => {
        // Try to access Feed directly while logged out
        await page.goto(`${APP_URL}/Feed`, { waitUntil: "networkidle" });
        await page.waitForTimeout(3000);
      },
      assertions: [
        { type: "not_visible", selector: '[data-tour="nav-feed"]', timeout: 5000 },
      ],
      vision:
        "Shows the login page or landing page — NOT the feed. The auth guard should redirect unauthenticated users away from protected pages.",
    },
  ];
}
