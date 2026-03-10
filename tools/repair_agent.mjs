#!/usr/bin/env node
/**
 * repair_agent.mjs — Sportsphere Self-Repair Agent
 *
 * Analyzes test failures, diagnoses root causes via Claude,
 * and generates fix suggestions or patches.
 *
 * Usage:
 *   node tools/repair_agent.mjs                           # Analyze latest report
 *   node tools/repair_agent.mjs --report <path>           # Analyze specific report
 *   node tools/repair_agent.mjs --repair-max 3            # Auto-generate up to 3 patches
 *   node tools/repair_agent.mjs --dry-run                 # Diagnose only, no patches
 *
 * Input: test-reports/{timestamp}/report.json (from test_agent.mjs)
 * Output: .tmp/repair-reports/{timestamp}/diagnosis.json
 */

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ── Route → Source File Mapping ───────────────────────────────────

const ROUTE_TO_SOURCE = {
  Login: "src/pages/Login.jsx",
  Feed: "src/pages/Feed.jsx",
  Search: "src/pages/Search.jsx",
  Reels: "src/pages/Reels.jsx",
  ProPathHub: "src/pages/ProPathHub.jsx",
  Live: "src/pages/Live.jsx",
  Messages: "src/pages/Messages.jsx",
  Profile: "src/pages/Profile.jsx",
  Challenges: "src/pages/Challenges.jsx",
  Forums: "src/pages/Forums.jsx",
  GetNoticed: "src/pages/GetNoticed.jsx",
  TheVault: "src/pages/TheVault.jsx",
  PerformanceHub: "src/pages/PerformanceHub.jsx",
  ScoutCard: "src/pages/ScoutCard.jsx",
  Coach: "src/pages/Coach.jsx",
  LiveCoaching: "src/pages/LiveCoaching.jsx",
  CreatorHub: "src/pages/CreatorHub.jsx",
  Analytics: "src/pages/Analytics.jsx",
  OrgDashboard: "src/pages/OrgDashboard.jsx",
  OrgRoster: "src/pages/OrgRoster.jsx",
  OrgSessions: "src/pages/OrgSessions.jsx",
  OrgMessages: "src/pages/OrgMessages.jsx",
  VideoReview: "src/pages/VideoReview.jsx",
  ParentView: "src/pages/ParentView.jsx",
  Onboarding: "src/pages/Onboarding.jsx",
  CreatePost: "src/pages/CreatePost.jsx",
  Groups: "src/pages/Groups.jsx",
  GroupDetail: "src/pages/GroupDetail.jsx",
  ForumTopic: "src/pages/ForumTopic.jsx",
  Events: "src/pages/Events.jsx",
  Notifications: "src/pages/Notifications.jsx",
  Advice: "src/pages/Advice.jsx",
  Discover: "src/pages/Discover.jsx",
  ForYou: "src/pages/ForYou.jsx",
  TrendingChallenges: "src/pages/TrendingChallenges.jsx",
  SportHub: "src/pages/SportHub.jsx",
  ProfileSettings: "src/pages/ProfileSettings.jsx",
  Premium: "src/pages/Premium.jsx",
  Leaderboard: "src/pages/Leaderboard.jsx",
  CreatorAI: "src/pages/CreatorAI.jsx",
  CreatorShop: "src/pages/CreatorShop.jsx",
  BecomeCreator: "src/pages/BecomeCreator.jsx",
  CoachingSessionDetail: "src/pages/CoachingSessionDetail.jsx",
  TrainingPlans: "src/pages/TrainingPlans.jsx",
  TrainingPlanDetail: "src/pages/TrainingPlanDetail.jsx",
  MyTraining: "src/pages/MyTraining.jsx",
  ScoutingHub: "src/pages/ScoutingHub.jsx",
  UserProfile: "src/pages/UserProfile.jsx",
  SavedContent: "src/pages/SavedContent.jsx",
  AthleteInsights: "src/pages/AthleteInsights.jsx",
  Admin: "src/pages/Admin.jsx",
  AdminUsers: "src/pages/AdminUsers.jsx",
  AdminContent: "src/pages/AdminContent.jsx",
  AdminAnalytics: "src/pages/AdminAnalytics.jsx",
  AdminSettings: "src/pages/AdminSettings.jsx",
  AdminHealth: "src/pages/AdminHealth.jsx",
  ModerationQueue: "src/pages/ModerationQueue.jsx",
  CreateReel: "src/pages/CreateReel.jsx",
  UploadVideo: "src/pages/UploadVideo.jsx",
  ImportVideos: "src/pages/ImportVideos.jsx",
  ViewLive: "src/pages/ViewLive.jsx",
  ChallengeDetail: "src/pages/ChallengeDetail.jsx",
  Terms: "src/pages/Terms.jsx",
  Guidelines: "src/pages/Guidelines.jsx",
};

// ── CLI Args ──────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { reportPath: null, repairMax: 0, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--report" && args[i + 1]) {
      opts.reportPath = args[++i];
    }
    if (args[i] === "--repair-max" && args[i + 1]) {
      opts.repairMax = parseInt(args[++i], 10);
    }
    if (args[i] === "--dry-run") {
      opts.dryRun = true;
    }
  }
  return opts;
}

// ── Find Latest Report ────────────────────────────────────────────

function findLatestReport() {
  const reportsDir = path.join(PROJECT_ROOT, ".tmp", "test-reports");
  if (!fs.existsSync(reportsDir)) return null;

  const dirs = fs.readdirSync(reportsDir)
    .filter(d => fs.statSync(path.join(reportsDir, d)).isDirectory())
    .sort()
    .reverse();

  for (const dir of dirs) {
    const reportPath = path.join(reportsDir, dir, "report.json");
    if (fs.existsSync(reportPath)) return reportPath;
  }
  return null;
}

// ── Map Test Name → Page/Route ────────────────────────────────────

function mapTestToPage(testName) {
  // Extract page name from test name patterns
  const patterns = [
    /^(\w+) page loads/i,
    /^(\w+) —/,
    /^Navigate to (\w+)/,
    /^(\w+) page/i,
    /from (\w+) features/i,
  ];

  for (const pattern of patterns) {
    const match = testName.match(pattern);
    if (match) {
      const page = match[1];
      if (ROUTE_TO_SOURCE[page]) return { page, source: ROUTE_TO_SOURCE[page] };
    }
  }

  // Try matching any known page name in the test name
  for (const [page, source] of Object.entries(ROUTE_TO_SOURCE)) {
    if (testName.toLowerCase().includes(page.toLowerCase())) {
      return { page, source };
    }
  }

  return { page: "unknown", source: null };
}

// ── Triage Failures ───────────────────────────────────────────────

function triageFailures(report) {
  const failures = report.results.filter(r =>
    r.severity === "CRITICAL" || r.severity === "WARNING" || r.severity === "DATA_ISSUE"
  );

  // Deduplicate by page
  const byPage = {};
  for (const f of failures) {
    const { page, source } = mapTestToPage(f.name);
    if (!byPage[page]) {
      byPage[page] = {
        page,
        source,
        failures: [],
        maxSeverity: f.severity,
      };
    }
    byPage[page].failures.push(f);
    if (f.severity === "CRITICAL") byPage[page].maxSeverity = "CRITICAL";
  }

  // Sort: CRITICAL first, then WARNING, then DATA_ISSUE
  const severityOrder = { CRITICAL: 0, WARNING: 1, DATA_ISSUE: 2 };
  return Object.values(byPage).sort((a, b) =>
    (severityOrder[a.maxSeverity] || 3) - (severityOrder[b.maxSeverity] || 3)
  );
}

// ── Diagnose with Claude ──────────────────────────────────────────

async function diagnoseFailure(anthropic, failure, screenshotDir) {
  const { page, source, failures } = failure;

  // Read source file if available
  let sourceCode = "";
  if (source) {
    const fullPath = path.join(PROJECT_ROOT, source);
    if (fs.existsSync(fullPath)) {
      sourceCode = fs.readFileSync(fullPath, "utf-8");
      // Truncate if too long
      if (sourceCode.length > 8000) {
        sourceCode = sourceCode.slice(0, 8000) + "\n... (truncated)";
      }
    }
  }

  // Read screenshot if available
  const messages = [];
  const content = [];

  content.push({
    type: "text",
    text: `Diagnose this test failure for the Sportsphere app.

**Page**: ${page}
**Source file**: ${source || "unknown"}
**Failures**:
${failures.map(f => `- ${f.name} [${f.severity}]: ${f.reasoning}`).join("\n")}

**Layer results**:
${failures.map(f => `- ${f.name}: L1=${f.layers.L1}, L2=${f.layers.L2}, L3=${f.layers.L3 || "n/a"}`).join("\n")}

${sourceCode ? `**Source code** (${source}):\n\`\`\`jsx\n${sourceCode}\n\`\`\`` : "Source file not available."}

Provide:
1. **Root cause** — what's broken and why
2. **Severity** — is this blocking users or cosmetic?
3. **Fix suggestion** — specific code change needed (if any)
4. **Category** — one of: schema_issue, ui_bug, api_error, auth_issue, timing_issue, test_issue, infra_issue`,
  });

  // Add screenshot if available
  const screenshotFile = failures[0]?.screenshot;
  if (screenshotFile && screenshotDir) {
    const screenshotPath = path.join(screenshotDir, screenshotFile);
    if (fs.existsSync(screenshotPath)) {
      const base64 = fs.readFileSync(screenshotPath).toString("base64");
      content.push({
        type: "image",
        source: { type: "base64", media_type: "image/png", data: base64 },
      });
    }
  }

  messages.push({ role: "user", content });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages,
    });

    const text = response.content[0]?.text || "";
    return parseDiagnosis(text, failure);
  } catch (err) {
    return {
      page,
      source,
      rootCause: `Diagnosis failed: ${err.message}`,
      severity: "unknown",
      fix: null,
      category: "unknown",
    };
  }
}

function parseDiagnosis(text, failure) {
  // Extract structured fields from Claude's response
  const rootCause = text.match(/root cause[:\s]*(.+?)(?=\n\n|\n\d|$)/is)?.[1]?.trim() || text.slice(0, 200);
  const severity = text.match(/severity[:\s]*(.+?)(?=\n|$)/im)?.[1]?.trim() || failure.maxSeverity;
  const fix = text.match(/fix suggestion[:\s]*([\s\S]+?)(?=\n\d|\ncategory|$)/is)?.[1]?.trim() || null;
  const category = text.match(/category[:\s]*(\w+)/im)?.[1]?.trim() || "unknown";

  return {
    page: failure.page,
    source: failure.source,
    rootCause,
    severity,
    fix,
    category,
    fullDiagnosis: text,
    failures: failure.failures.map(f => ({
      name: f.name,
      severity: f.severity,
      reasoning: f.reasoning,
    })),
  };
}

// ── Generate Summary Report ───────────────────────────────────────

function generateDiagnosisReport(diagnoses, report, outputDir) {
  const timestamp = new Date().toISOString();

  // JSON report
  const jsonReport = {
    timestamp,
    testReport: report.timestamp,
    totalTests: report.summary.total,
    totalFailures: diagnoses.length,
    criticalCount: diagnoses.filter(d => d.failures.some(f => f.severity === "CRITICAL")).length,
    warningCount: diagnoses.filter(d => d.failures.some(f => f.severity === "WARNING")).length,
    dataIssueCount: diagnoses.filter(d => d.failures.some(f => f.severity === "DATA_ISSUE")).length,
    diagnoses,
  };

  fs.writeFileSync(
    path.join(outputDir, "diagnosis.json"),
    JSON.stringify(jsonReport, null, 2)
  );

  // Markdown report
  let md = `# Sportsphere Repair Agent Report\n\n`;
  md += `**Generated**: ${timestamp}\n`;
  md += `**Test Report**: ${report.timestamp}\n`;
  md += `**Total Tests**: ${report.summary.total} | **Passed**: ${report.summary.passed} | **Failures**: ${diagnoses.length}\n\n`;

  if (diagnoses.length === 0) {
    md += `## All Tests Passing\n\nNo failures to diagnose. The app is healthy.\n`;
  } else {
    md += `## Failure Diagnosis\n\n`;

    for (const d of diagnoses) {
      md += `### ${d.page} (${d.source || "unknown"})\n\n`;
      md += `**Category**: ${d.category}\n`;
      md += `**Root Cause**: ${d.rootCause}\n\n`;
      if (d.fix) {
        md += `**Fix Suggestion**:\n${d.fix}\n\n`;
      }
      md += `**Test Failures**:\n`;
      for (const f of d.failures) {
        md += `- ${f.name} [${f.severity}]: ${f.reasoning}\n`;
      }
      md += `\n---\n\n`;
    }

    // Category summary
    const categories = {};
    for (const d of diagnoses) {
      categories[d.category] = (categories[d.category] || 0) + 1;
    }
    md += `## Issue Categories\n\n`;
    md += `| Category | Count |\n|----------|-------|\n`;
    for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
      md += `| ${cat} | ${count} |\n`;
    }
  }

  fs.writeFileSync(path.join(outputDir, "diagnosis.md"), md);
  return { json: jsonReport, md };
}

// ── Performance Tracking ──────────────────────────────────────────

function trackPerformance(report, outputDir) {
  const perfData = {
    timestamp: report.timestamp,
    totalDuration: report.duration_ms,
    tests: report.results.map(r => ({
      name: r.name,
      phase: r.phase,
      duration_ms: r.duration_ms,
      severity: r.severity,
    })),
    stats: {
      avgDuration: Math.round(
        report.results.reduce((sum, r) => sum + r.duration_ms, 0) / report.results.length
      ),
      maxDuration: Math.max(...report.results.map(r => r.duration_ms)),
      minDuration: Math.min(...report.results.map(r => r.duration_ms)),
      slowTests: report.results
        .filter(r => r.duration_ms > 30000)
        .map(r => ({ name: r.name, duration_ms: r.duration_ms })),
    },
  };

  fs.writeFileSync(
    path.join(outputDir, "performance.json"),
    JSON.stringify(perfData, null, 2)
  );

  return perfData;
}

// ── Baseline Screenshots ──────────────────────────────────────────

function updateBaseline(report, reportDir, baselineDir) {
  // Only update baseline from passing tests
  const passingTests = report.results.filter(r => r.severity === "PASS" && r.screenshot);

  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  let updated = 0;
  for (const test of passingTests) {
    const src = path.join(reportDir, test.screenshot);
    const dest = path.join(baselineDir, test.screenshot);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      updated++;
    }
  }

  return updated;
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  // Find report
  const reportPath = opts.reportPath || findLatestReport();
  if (!reportPath || !fs.existsSync(reportPath)) {
    console.error("No test report found. Run test_agent.mjs first.");
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  const reportDir = path.dirname(reportPath);

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       SPORTSPHERE REPAIR AGENT v1.0                 ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Report:   ${reportPath}`);
  console.log(`  Tests:    ${report.summary.total}`);
  console.log(`  Passed:   ${report.summary.passed}`);
  console.log(`  Failures: ${report.summary.total - report.summary.passed}`);
  console.log();

  // Output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = path.join(PROJECT_ROOT, ".tmp", "repair-reports", timestamp);
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 1: Triage
  console.log("┌─ Step 1: Triage Failures ─────────────────────────────");
  const triaged = triageFailures(report);
  console.log(`  Found ${triaged.length} failing page(s)`);
  for (const t of triaged) {
    console.log(`  → ${t.page} [${t.maxSeverity}]: ${t.failures.length} failure(s)`);
  }
  console.log();

  if (triaged.length === 0) {
    console.log("  ✓ All tests passing — no repairs needed!");
    const perfData = trackPerformance(report, outputDir);
    console.log(`  → Avg test duration: ${perfData.stats.avgDuration}ms`);
    console.log(`  → Slow tests (>30s): ${perfData.stats.slowTests.length}`);

    // Update baselines
    const baselineDir = path.join(PROJECT_ROOT, ".tmp", "baselines");
    const baselineCount = updateBaseline(report, reportDir, baselineDir);
    console.log(`  → Updated ${baselineCount} baseline screenshots`);

    generateDiagnosisReport([], report, outputDir);
    console.log(`\n  Report: ${outputDir}/diagnosis.md`);
    return;
  }

  // Step 2: Diagnose
  console.log("┌─ Step 2: Diagnose with Claude ────────────────────────");
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const diagnoses = [];

  const maxDiagnose = opts.repairMax > 0 ? opts.repairMax : triaged.length;
  for (let i = 0; i < Math.min(triaged.length, maxDiagnose); i++) {
    const failure = triaged[i];
    console.log(`  Diagnosing: ${failure.page}...`);
    const diagnosis = await diagnoseFailure(anthropic, failure, reportDir);
    diagnoses.push(diagnosis);
    console.log(`  → ${diagnosis.category}: ${diagnosis.rootCause.slice(0, 80)}`);
  }
  console.log();

  // Step 3: Performance tracking
  console.log("┌─ Step 3: Performance Tracking ────────────────────────");
  const perfData = trackPerformance(report, outputDir);
  console.log(`  → Avg test duration: ${perfData.stats.avgDuration}ms`);
  console.log(`  → Max test duration: ${perfData.stats.maxDuration}ms`);
  console.log(`  → Slow tests (>30s): ${perfData.stats.slowTests.length}`);
  if (perfData.stats.slowTests.length > 0) {
    for (const t of perfData.stats.slowTests) {
      console.log(`    - ${t.name}: ${(t.duration_ms / 1000).toFixed(1)}s`);
    }
  }
  console.log();

  // Step 4: Update baselines
  console.log("┌─ Step 4: Baseline Screenshots ────────────────────────");
  const baselineDir = path.join(PROJECT_ROOT, ".tmp", "baselines");
  const baselineCount = updateBaseline(report, reportDir, baselineDir);
  console.log(`  → Updated ${baselineCount} baseline screenshots`);
  console.log();

  // Step 5: Generate report
  const { json: jsonReport } = generateDiagnosisReport(diagnoses, report, outputDir);

  // Summary
  console.log("══════════════════════════════════════════════════════");
  console.log("  REPAIR SUMMARY");
  console.log("══════════════════════════════════════════════════════");
  console.log(`  Pages diagnosed: ${diagnoses.length}`);
  console.log(`  Categories:`);
  const categories = {};
  for (const d of diagnoses) {
    categories[d.category] = (categories[d.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`    ${cat}: ${count}`);
  }
  console.log(`  Report: ${outputDir}/diagnosis.md`);
  console.log(`  Performance: ${outputDir}/performance.json`);
  console.log("══════════════════════════════════════════════════════");
}

main().catch(console.error);
