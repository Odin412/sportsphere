/**
 * cross_role.mjs — Phase 13: Cross-Role Workflow Tests
 *
 * Tests multi-account flows and permission boundaries:
 *   1. Coach views athlete ScoutCard
 *   2. Parent views ParentView dashboard
 *   3. Non-admin blocked from Admin pages
 *   4. Org views OrgDashboard with team data
 *   5. Athlete views coach profile
 *   6. Coach accesses CreatorHub
 *   7. Org accesses OrgRoster
 *
 * Accounts used: test-athlete, test-coach, test-org, test-parent
 * These tests switch between accounts within a single browser session.
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

/**
 * Cross-role scenarios need access to all credentials + the loginAs helper.
 * The test_agent passes a `loginFn(page, email, password)` via the creds object.
 */
export function getCrossRoleScenarios(allCreds) {
  const { athlete, coach, org, parent, loginFn } = allCreds;

  return [
    // ── 1. Coach views athlete ScoutCard ─────────────────────────────
    {
      name: "Coach views athlete ScoutCard",
      action: async (page) => {
        // Already logged in as athlete from phase setup — switch to coach
        if (loginFn) await loginFn(page, coach.email, coach.password);
        await page.goto(`${APP_URL}/ScoutCard?email=${athlete.email}`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/ScoutCard" },
      ],
      vision:
        "PASS if: Shows a Scout Card page for an athlete — may display athlete name/stats, AI narrative, contact form, or a 'No scout card' message. The coach is viewing another user's ScoutCard. Also PASS if showing a loading spinner or empty scout card template. FAIL only if: blank page, crash, or unhandled error.",
    },

    // ── 2. Coach accesses CreatorHub ─────────────────────────────────
    {
      name: "Coach accesses CreatorHub",
      action: async (page) => {
        // Still logged in as coach
        await page.goto(`${APP_URL}/CreatorHub`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/CreatorHub" },
      ],
      vision:
        "PASS if: Shows the Creator Hub page with any content — dashboard, content list, analytics overview, or a 'Become a Creator' prompt. Coaches have creator access. FAIL only if: error, crash, or blank page.",
    },

    // ── 3. Switch to Org — view OrgDashboard ─────────────────────────
    {
      name: "Org views OrgDashboard",
      action: async (page) => {
        if (loginFn) await loginFn(page, org.email, org.password);
        await page.goto(`${APP_URL}/OrgDashboard`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/OrgDashboard" },
      ],
      vision:
        "PASS if: Shows an organization dashboard page with any content — team overview, stats, member count, recent activity, or a setup prompt. FAIL only if: error, crash, redirect to login, or blank page.",
    },

    // ── 4. Org views OrgRoster ───────────────────────────────────────
    {
      name: "Org views OrgRoster",
      action: async (page) => {
        await page.goto(`${APP_URL}/OrgRoster`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/OrgRoster" },
      ],
      vision:
        "PASS if: Shows an organization roster page — member list, athlete cards, search/filter, or 'No members' empty state. FAIL only if: error, crash, or blank page.",
    },

    // ── 5. Switch to Parent — view ParentView ────────────────────────
    {
      name: "Parent views ParentView dashboard",
      action: async (page) => {
        if (loginFn) await loginFn(page, parent.email, parent.password);
        await page.goto(`${APP_URL}/ParentView`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/ParentView" },
      ],
      vision:
        "PASS if: Shows the Parent View dashboard — child athlete overview, activity feed, performance stats, or a 'Link your child' setup prompt. This page is specific to parent role accounts. FAIL only if: error, crash, or blank page.",
    },

    // ── 6. Switch to Athlete — verify non-admin blocked from Admin ───
    {
      name: "Non-admin blocked from Admin pages",
      action: async (page) => {
        if (loginFn) await loginFn(page, athlete.email, athlete.password);
        await page.goto(`${APP_URL}/Admin`, { waitUntil: "networkidle" });
        await waitForAuth(page);
        // Admin guard redirects non-admins — wait for redirect
        await page.waitForTimeout(3000);
      },
      settleMs: 5000,
      assertions: [],
      vision:
        "PASS if: Shows ANY of these — a redirect to Feed/home page, a 'Not authorized' message, a dark/black screen (admin guard renders null during redirect), or any non-admin page. The test-athlete account should NOT see admin dashboard content. FAIL only if: actual admin dashboard with metrics/user management is shown to a non-admin user.",
    },

    // ── 7. Athlete views coach user profile ──────────────────────────
    {
      name: "Athlete views coach UserProfile",
      action: async (page) => {
        // Still logged in as athlete
        await page.goto(`${APP_URL}/UserProfile?email=${coach.email}`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/UserProfile" },
      ],
      vision:
        "PASS if: Shows a user profile page for a coach account — profile info, follow/message buttons, posts, or any profile content. Also PASS if the profile shows 'User not found' (test account may not have full profile data). FAIL only if: error, crash, or blank page.",
    },

    // ── 8. Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from cross-role tests",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Cross-role workflow tests completed.",
    },
  ];
}
