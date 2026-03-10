/**
 * org_features.mjs — Organization role-specific test scenarios (6 tests)
 *
 * Tests OrgDashboard, OrgRoster, OrgSessions, OrgMessages, VideoReview.
 * Requires authenticated state with an org/admin account.
 *
 * Note: These pages self-gate based on org membership. If the test account
 * doesn't own or belong to an org, pages will show create/join prompts.
 */

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getOrgFeatureScenarios(creds) {
  return [
    {
      name: "OrgDashboard page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/OrgDashboard`, { waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/OrgDashboard" },
      ],
      vision:
        "Shows the Organization Dashboard page. Should display either: (a) an active dashboard with stat cards and role badge, or (b) a 'Welcome to SportHub Teams' / 'Create Organization' prompt with a red icon and CTA button. Both states are acceptable. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "OrgRoster page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/OrgRoster`, { waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/OrgRoster" },
      ],
      vision:
        "Shows the Organization Roster page. Should display either: (a) a member list with search bar and 'Invite Member' button, or (b) a 'No Organization Yet' message with an icon explaining the user needs to create or join an organization. Both states are acceptable. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "OrgSessions page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/OrgSessions`, { waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/OrgSessions" },
      ],
      vision:
        "Shows the Organization Sessions page. Should display either: (a) session list with tabs, or (b) a 'No Organization Yet' message with an icon. Both states are acceptable. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "OrgMessages page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/OrgMessages`, { waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/OrgMessages" },
      ],
      vision:
        "Shows the Organization Messages page. Should display either: (a) a channel-based messaging interface with channels, or (b) a 'No Organization Yet' message with an icon. Both states are acceptable. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "VideoReview page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/VideoReview`, { waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/VideoReview" },
      ],
      vision:
        "Shows the Video Review page. Should display either: (a) a video review interface with Pending/Reviewed tabs, or (b) a 'No Organization Yet' message with an icon. Both states are acceptable. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Return to Feed from org features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 5000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page. Organization feature navigation round-trip completed.",
    },
  ];
}
