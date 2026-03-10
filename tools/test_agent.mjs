#!/usr/bin/env node
/**
 * test_agent.mjs — Sportsphere Automated Testing Agent (V2)
 *
 * Orchestrates Playwright browser automation + Claude Vision verification
 * to test the live Sportsphere app like a real user.
 *
 * V1 phases: auth, navigation, feed
 * V2 phases: athlete, coach, org, parent, onboarding, mobile
 *
 * Usage:
 *   node tools/test_agent.mjs                         # Run V1 phases (auth + nav + feed)
 *   node tools/test_agent.mjs --phase auth             # Run auth only
 *   node tools/test_agent.mjs --phase athlete          # Run athlete features only
 *   node tools/test_agent.mjs --phase mobile           # Run mobile viewport tests
 *   node tools/test_agent.mjs --phase onboarding       # Run onboarding flow (needs SERVICE_ROLE_KEY)
 *   node tools/test_agent.mjs --phase v2               # Run all V2 phases
 *   node tools/test_agent.mjs --phase full             # Run everything (V1 + V2)
 *   node tools/test_agent.mjs --headed                 # Run with visible browser
 *   node tools/test_agent.mjs --phase auth --headed
 */

import "dotenv/config";
import { chromium } from "playwright";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { runScenario, generateReport, bypassOnboarding } from "./test_helpers.mjs";
import { getAuthScenarios } from "./test_scenarios/auth.mjs";
import { getNavigationScenarios } from "./test_scenarios/navigation.mjs";
import { getFeedScenarios } from "./test_scenarios/feed.mjs";
import { getAthleteFeatureScenarios } from "./test_scenarios/athlete_features.mjs";
import { getCoachFeatureScenarios } from "./test_scenarios/coach_features.mjs";
import { getOrgFeatureScenarios } from "./test_scenarios/org_features.mjs";
import { getParentFeatureScenarios } from "./test_scenarios/parent_features.mjs";
import { getOnboardingScenarios } from "./test_scenarios/onboarding.mjs";
import { getMobileScenarios } from "./test_scenarios/mobile.mjs";
import { getCommunityScenarios } from "./test_scenarios/community.mjs";
import { getDiscoveryScenarios } from "./test_scenarios/discovery.mjs";
import { getSettingsScenarios } from "./test_scenarios/settings.mjs";
import { getCreatorToolsScenarios } from "./test_scenarios/creator_tools.mjs";
import { getCoachingTrainingScenarios } from "./test_scenarios/coaching_training.mjs";
import { getAthleteDevScenarios } from "./test_scenarios/athlete_dev.mjs";
import { getAdminScenarios } from "./test_scenarios/admin.mjs";
import { getContentCreationScenarios } from "./test_scenarios/content_creation.mjs";
import { getRemainingPagesScenarios } from "./test_scenarios/remaining_pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const APP_URL = "https://sportsphere-titan-one.vercel.app";

// Phase groups
const V1_PHASES = ["auth", "navigation", "feed"];
const V2_PHASES = ["athlete", "coach", "org", "parent", "onboarding", "mobile"];
const V3_PHASES = ["community"];
const V4_PHASES = ["discovery"];
const V5_PHASES = ["settings"];
const V6_PHASES = ["creator_tools"];
const V7_PHASES = ["coaching_training"];
const V8_PHASES = ["athlete_dev"];
const V9_PHASES = ["admin"];
const V10_PHASES = ["content_creation"];
const V11_PHASES = ["remaining_pages"];
const ALL_PHASES = [...V1_PHASES, ...V2_PHASES, ...V3_PHASES, ...V4_PHASES, ...V5_PHASES, ...V6_PHASES, ...V7_PHASES, ...V8_PHASES, ...V9_PHASES, ...V10_PHASES, ...V11_PHASES];

// ── Parse CLI Args ─────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { phase: "all", headed: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--phase" && args[i + 1]) {
      opts.phase = args[i + 1].toLowerCase();
      i++;
    }
    if (args[i] === "--headed") {
      opts.headed = true;
    }
  }
  return opts;
}

// ── Resolve Phase List ─────────────────────────────────────────────

function resolvePhases(phaseArg) {
  if (phaseArg === "all") return V1_PHASES;
  if (phaseArg === "v1") return V1_PHASES;
  if (phaseArg === "v2") return V2_PHASES;
  if (phaseArg === "v3") return V3_PHASES;
  if (phaseArg === "v4") return V4_PHASES;
  if (phaseArg === "v5") return V5_PHASES;
  if (phaseArg === "v6") return V6_PHASES;
  if (phaseArg === "v7") return V7_PHASES;
  if (phaseArg === "v8") return V8_PHASES;
  if (phaseArg === "v9") return V9_PHASES;
  if (phaseArg === "v10") return V10_PHASES;
  if (phaseArg === "v11") return V11_PHASES;
  if (phaseArg === "full") return ALL_PHASES;
  // Single phase
  const phases = [phaseArg];
  const invalid = phases.find((p) => !ALL_PHASES.includes(p));
  if (invalid) {
    console.error(`Unknown phase: ${invalid}`);
    console.error(`Valid: ${ALL_PHASES.join(", ")}, all, v1, v2, v3, v4, full`);
    process.exit(1);
  }
  return phases;
}

// ── Validate Environment ───────────────────────────────────────────

function validateEnv(phases) {
  const required = ["ANTHROPIC_API_KEY", "TEST_ATHLETE_EMAIL", "TEST_PASSWORD"];

  // Coach/org/parent phases need their respective env vars
  if (phases.includes("coach") && !process.env.TEST_COACH_EMAIL) {
    console.warn("  ⚠ TEST_COACH_EMAIL not set — coach tests will use athlete account");
  }
  if (phases.includes("org") && !process.env.TEST_ORG_EMAIL) {
    console.warn("  ⚠ TEST_ORG_EMAIL not set — org tests will use athlete account");
  }
  if (phases.includes("parent") && !process.env.TEST_PARENT_EMAIL) {
    console.warn("  ⚠ TEST_PARENT_EMAIL not set — parent tests will use athlete account");
  }
  if (phases.includes("onboarding") && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("  ⚠ SUPABASE_SERVICE_ROLE_KEY not set — skipping onboarding phase");
    phases.splice(phases.indexOf("onboarding"), 1);
  }

  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    console.error("Add them to .env in the project root.");
    process.exit(1);
  }
}

// ── Login Helper ───────────────────────────────────────────────────

async function loginAs(page, email, password) {
  // Clear existing session before logging in as a different user
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // If redirected away from login (shouldn't happen after clearing), go back
  if (!page.url().includes("/login")) {
    await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
  }

  // Fill credentials
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');

  // Wait for either sidebar (success) or onboarding (redirect)
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();

    // Desktop: check for sidebar nav
    const hasSidebar = await page.locator('[data-tour="nav-feed"]').isVisible().catch(() => false);
    // Mobile: check for bottom nav
    const hasMobileNav = await page.locator('[data-tour="mobile-feed"]').isVisible().catch(() => false);

    if (hasSidebar || hasMobileNav) {
      console.log(`  ✓ Logged in as ${email}`);
      // Pre-set onboarding bypass flag
      await page.evaluate(() => {
        const key = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (key) {
          try {
            const uid = JSON.parse(localStorage.getItem(key))?.user?.id;
            if (uid) localStorage.setItem(`ob_${uid}`, "1");
          } catch {}
        }
      });
      await page.waitForTimeout(1000);
      return true;
    }

    if (url.includes("Onboarding")) {
      console.log("  → Onboarding detected, bypassing...");
      await bypassOnboarding(page, APP_URL);
      const ok = await page.locator('[data-tour="nav-feed"]').isVisible().catch(() => false);
      const okMobile = await page.locator('[data-tour="mobile-feed"]').isVisible().catch(() => false);
      if (ok || okMobile) {
        console.log(`  ✓ Logged in as ${email} (after onboarding bypass)`);
        return true;
      }
      await page.waitForTimeout(3000);
      const final = await page.locator('[data-tour="nav-feed"]').isVisible().catch(() => false);
      const finalMobile = await page.locator('[data-tour="mobile-feed"]').isVisible().catch(() => false);
      return final || finalMobile;
    }
  }

  console.error(`  ✗ Login failed for ${email}`);
  return false;
}

// ── Run a phase with auto-login ────────────────────────────────────

async function runPhaseWithLogin(page, anthropic, phaseName, scenariosFn, outputDir, config, email, password, needsLogin) {
  if (needsLogin) {
    console.log(`  Logging in as ${email}...`);
    const ok = await loginAs(page, email, password);
    if (!ok) {
      console.log(`  ✗ Could not login as ${email} — skipping ${phaseName}`);
      return [];
    }
  }

  console.log(`┌─ Phase: ${phaseName.toUpperCase()} ──────────────────────────────────────`);
  const scenarios = scenariosFn();
  const results = await runScenario(page, anthropic, scenarios, outputDir, phaseName, config);
  const passed = results.filter((r) => r.severity === "PASS").length;
  console.log(`└─ ${phaseName}: ${passed}/${results.length} passed\n`);
  return results;
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  const phases = resolvePhases(opts.phase);
  validateEnv(phases);

  const athleteCreds = {
    email: process.env.TEST_ATHLETE_EMAIL,
    password: process.env.TEST_PASSWORD,
  };
  const coachCreds = {
    email: process.env.TEST_COACH_EMAIL || process.env.TEST_ATHLETE_EMAIL,
    password: process.env.TEST_PASSWORD,
  };
  const orgCreds = {
    email: process.env.TEST_ORG_EMAIL || process.env.TEST_ATHLETE_EMAIL,
    password: process.env.TEST_PASSWORD,
  };
  const parentCreds = {
    email: process.env.TEST_PARENT_EMAIL || process.env.TEST_ATHLETE_EMAIL,
    password: process.env.TEST_PASSWORD,
  };

  const config = {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = path.join(PROJECT_ROOT, ".tmp", "test-reports", timestamp);
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       SPORTSPHERE TESTING AGENT v2.0                ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  URL:     ${APP_URL}`);
  console.log(`  Phases:  ${phases.join(", ")}`);
  console.log(`  Mode:    ${opts.headed ? "headed (visible)" : "headless"}`);
  console.log(`  Output:  ${outputDir}`);
  console.log("");

  // Initialize
  const anthropic = new Anthropic();
  const browser = await chromium.launch({
    headless: !opts.headed,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Desktop context (default)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "SportsphereTester/2.0",
  });
  const desktopPage = await desktopContext.newPage();

  // Capture console errors
  const consoleErrors = [];
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ text: msg.text(), url: desktopPage.url() });
    }
  });

  const globalStart = Date.now();
  let allResults = [];
  let authPassed = false;

  // ── V1: Auth ─────────────────────────────────────────────────────
  if (phases.includes("auth")) {
    console.log("┌─ Phase: AUTH ──────────────────────────────────────");
    const scenarios = getAuthScenarios(athleteCreds);
    const results = await runScenario(desktopPage, anthropic, scenarios, outputDir, "auth", config);
    allResults.push(...results);
    authPassed = !results.some((r) => r.severity === "CRITICAL");
    const passed = results.filter((r) => r.severity === "PASS").length;
    console.log(`└─ Auth: ${passed}/${results.length} passed\n`);
  } else {
    authPassed = true;
  }

  // ── V1: Navigation ───────────────────────────────────────────────
  if (phases.includes("navigation")) {
    if (!authPassed && phases.includes("auth")) {
      console.log("  ✗ SKIPPED navigation — auth had critical failures\n");
    } else {
      if (!phases.includes("auth")) {
        await loginAs(desktopPage, athleteCreds.email, athleteCreds.password);
      } else {
        await loginAs(desktopPage, athleteCreds.email, athleteCreds.password);
      }
      const results = await runPhaseWithLogin(
        desktopPage, anthropic, "navigation",
        () => getNavigationScenarios(athleteCreds),
        outputDir, config,
        athleteCreds.email, athleteCreds.password, false
      );
      allResults.push(...results);
    }
  }

  // ── V1: Feed ─────────────────────────────────────────────────────
  if (phases.includes("feed")) {
    if (!authPassed && phases.includes("auth")) {
      console.log("  ✗ SKIPPED feed — auth had critical failures\n");
    } else {
      const isOnApp = desktopPage.url().includes(APP_URL.replace("https://", ""));
      const needsLogin = !isOnApp || desktopPage.url().includes("/login");
      const results = await runPhaseWithLogin(
        desktopPage, anthropic, "feed",
        () => getFeedScenarios(athleteCreds, config),
        outputDir, config,
        athleteCreds.email, athleteCreds.password, needsLogin
      );
      allResults.push(...results);
    }
  }

  // ── V2: Athlete Features ─────────────────────────────────────────
  if (phases.includes("athlete")) {
    const isOnApp = desktopPage.url().includes(APP_URL.replace("https://", ""));
    const needsLogin = !isOnApp || desktopPage.url().includes("/login");
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "athlete",
      () => getAthleteFeatureScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, needsLogin
    );
    allResults.push(...results);
  }

  // ── V2: Coach Features ───────────────────────────────────────────
  if (phases.includes("coach")) {
    // Coach needs its own login (different account)
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "coach",
      () => getCoachFeatureScenarios(coachCreds),
      outputDir, config,
      coachCreds.email, coachCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V2: Org Features ─────────────────────────────────────────────
  if (phases.includes("org")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "org",
      () => getOrgFeatureScenarios(orgCreds),
      outputDir, config,
      orgCreds.email, orgCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V2: Parent Features ──────────────────────────────────────────
  if (phases.includes("parent")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "parent",
      () => getParentFeatureScenarios(parentCreds),
      outputDir, config,
      parentCreds.email, parentCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V2: Onboarding ──────────────────────────────────────────────
  if (phases.includes("onboarding")) {
    console.log("┌─ Phase: ONBOARDING ─────────────────────────────────");
    const scenarios = getOnboardingScenarios(athleteCreds, config);
    const results = await runScenario(desktopPage, anthropic, scenarios, outputDir, "onboarding", config);
    allResults.push(...results);
    const passed = results.filter((r) => r.severity === "PASS").length;
    console.log(`└─ Onboarding: ${passed}/${results.length} passed\n`);
  }

  // ── V2: Mobile ──────────────────────────────────────────────────
  if (phases.includes("mobile")) {
    // Create a separate mobile context with iPhone viewport
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    mobilePage.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({ text: msg.text(), url: mobilePage.url(), viewport: "mobile" });
      }
    });

    // Login on mobile
    console.log("  Setting up mobile viewport (375x812)...");
    const mobileOk = await loginAs(mobilePage, athleteCreds.email, athleteCreds.password);

    if (mobileOk) {
      console.log("┌─ Phase: MOBILE ──────────────────────────────────────");
      const scenarios = getMobileScenarios(athleteCreds);
      const results = await runScenario(mobilePage, anthropic, scenarios, outputDir, "mobile", config);
      allResults.push(...results);
      const passed = results.filter((r) => r.severity === "PASS").length;
      console.log(`└─ Mobile: ${passed}/${results.length} passed\n`);
    } else {
      console.log("  ✗ Could not login on mobile — skipping mobile tests\n");
    }

    await mobileContext.close();
  }

  // ── V3: Community & Social ────────────────────────────────────
  if (phases.includes("community")) {
    // Always re-login: onboarding phase may have logged out the desktop session
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "community",
      () => getCommunityScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V4: Discovery & Recommendations ─────────────────────────────
  if (phases.includes("discovery")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "discovery",
      () => getDiscoveryScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V5: Account & Settings ──────────────────────────────────────
  if (phases.includes("settings")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "settings",
      () => getSettingsScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V6: Creator Tools ───────────────────────────────────────────
  if (phases.includes("creator_tools")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "creator_tools",
      () => getCreatorToolsScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V7: Coaching & Training ─────────────────────────────────────
  if (phases.includes("coaching_training")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "coaching_training",
      () => getCoachingTrainingScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V8: Athlete Development ─────────────────────────────────────
  if (phases.includes("athlete_dev")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "athlete_dev",
      () => getAthleteDevScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V9: Admin & Moderation ──────────────────────────────────────
  if (phases.includes("admin")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "admin",
      () => getAdminScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V10: Content Creation & Media ───────────────────────────────
  if (phases.includes("content_creation")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "content_creation",
      () => getContentCreationScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── V11: Remaining Pages ────────────────────────────────────────
  if (phases.includes("remaining_pages")) {
    const results = await runPhaseWithLogin(
      desktopPage, anthropic, "remaining_pages",
      () => getRemainingPagesScenarios(athleteCreds),
      outputDir, config,
      athleteCreds.email, athleteCreds.password, true
    );
    allResults.push(...results);
  }

  // ── Report ─────────────────────────────────────────────────────
  const totalDuration = Date.now() - globalStart;

  // Save console errors
  if (consoleErrors.length > 0) {
    fs.writeFileSync(
      path.join(outputDir, "console_errors.json"),
      JSON.stringify(consoleErrors, null, 2)
    );
  }

  const report = generateReport(allResults, outputDir, {
    url: APP_URL,
    phases,
    duration_ms: totalDuration,
  });

  // ── Summary ────────────────────────────────────────────────────
  console.log("══════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════════");
  const s = report.summary;
  console.log(`  Total:    ${s.total} tests`);
  console.log(`  Passed:   ${s.passed}`);
  console.log(`  Critical: ${s.critical}`);
  console.log(`  Warning:  ${s.warning}`);
  console.log(`  Data:     ${s.data_issue}`);
  console.log(`  Skipped:  ${s.skipped}`);
  console.log(`  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`  Console errors captured: ${consoleErrors.length}`);
  console.log(`  Report: ${outputDir}/report.md`);
  console.log("══════════════════════════════════════════════════════");

  // Cleanup
  await browser.close();

  // Exit code
  const exitCode = s.critical > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch((err) => {
  console.error("Agent crashed:", err);
  process.exit(2);
});
