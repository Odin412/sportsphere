/**
 * content_creation.mjs — Phase 10: Content Creation & Media test scenarios
 *
 * Tests: CreateReel, UploadVideo, ImportVideos
 * Account: test-athlete
 */

import { waitForAuth } from "../test_helpers.mjs";

const APP_URL = "https://sportsphere-titan-one.vercel.app";

export function getContentCreationScenarios(creds) {
  return [
    // ── CreateReel ────────────────────────────────────────────────
    {
      name: "CreateReel page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/CreateReel`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/CreateReel" },
      ],
      vision:
        "PASS if: Shows ANY of these — a Create Reel page with video upload/clip area, sport selector, category selector, caption/description textarea, 'Add Clip' button, back arrow, film icon, AI Reel Assistant panel, OR a loading state. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── UploadVideo ───────────────────────────────────────────────
    {
      name: "UploadVideo page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/UploadVideo`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/UploadVideo" },
      ],
      vision:
        "PASS if: Shows ANY of these — an Upload Video page with drag-and-drop upload area, title/description form fields, visibility selector (Coaches Only, Entire Team, Only Me), tags input, video editor toggle, 'Upload' button, OR a loading state. This page is for org video uploads so it may show an org-required notice. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── ImportVideos ──────────────────────────────────────────────
    {
      name: "ImportVideos page loads",
      action: async (page) => {
        await page.goto(`${APP_URL}/ImportVideos`, { waitUntil: "networkidle" });
        await waitForAuth(page);
      },
      settleMs: 4000,
      assertions: [
        { type: "url_contains", value: "/ImportVideos" },
      ],
      vision:
        "PASS if: Shows ANY of these — an Import Videos page with YouTube search interface, sport selector dropdown, search bar, category selector, video results grid with thumbnails/titles, like/save/download buttons, OR a 'Search for videos' empty state. FAIL only if: blank screen, 'Something went wrong' error, crash, or redirect to login.",
    },

    // ── Return to Feed ────────────────────────────────────────────
    {
      name: "Return to Feed from content creation",
      action: async (page) => {
        await page.click('[data-tour="nav-feed"]');
      },
      settleMs: 3000,
      assertions: [
        { type: "visible", selector: '[data-tour="nav-feed"]' },
      ],
      vision:
        "Back on the Feed page with posts visible. Content creation navigation round-trip completed.",
    },
  ];
}
