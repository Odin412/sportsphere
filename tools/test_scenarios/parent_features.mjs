/**
 * parent_features.mjs — Parent role-specific test scenarios (3 tests)
 *
 * Tests ParentView page and parent-accessible features.
 * Requires authenticated state with a parent account.
 *
 * Note: ParentView requires org membership with role="parent" and
 * linked athlete_emails. Without these, it shows an access denied message.
 */

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getParentFeatureScenarios(creds) {
  return [
    {
      name: "ParentView page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/ParentView`, { waitUntil: "networkidle" });
      },
      settleMs: 5000,
      assertions: [
        { type: "url_contains", value: "/ParentView" },
      ],
      vision:
        "Shows the Parent View page. Should display either: (a) 'My Child\\'s Progress' dashboard, (b) a 'Parent View' message about joining an organization as a parent, or (c) 'No athlete linked to your account yet' prompt. Any of these states are acceptable — the page loaded with proper UI elements and styling. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Parent can view Profile page",
      action: async (page) => {
        await page.click('[data-tour="nav-profile"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "url_contains", value: "/Profile" },
      ],
      vision:
        "Shows the parent account's profile page with user info (name, avatar area), stats (followers/following/posts — zeros are OK for test accounts), and content sections. Empty states like 'No featured post yet' or 'No sport profiles yet' are acceptable. The profile layout should be intact. Not a blank page, error, or stuck loading spinner.",
    },

    {
      name: "Return to Feed from parent features",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page. Parent feature navigation round-trip completed.",
    },
  ];
}
