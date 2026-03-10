#!/usr/bin/env node
/**
 * monitor.mjs — Sportsphere Regression Monitor
 *
 * Runs the full test suite and repair agent, then outputs a summary.
 * Designed for nightly cron runs or CI integration.
 *
 * Usage:
 *   node tools/monitor.mjs                    # Full suite + repair analysis
 *   node tools/monitor.mjs --quick            # Only phases with prior failures
 *   node tools/monitor.mjs --json             # Output JSON summary to stdout
 *
 * Exit codes:
 *   0 — All tests passed
 *   1 — Critical failures found
 *   2 — Warnings only (non-blocking)
 */

import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    quick: args.includes("--quick"),
    json: args.includes("--json"),
  };
}

function findLatestReport() {
  const reportsDir = path.join(PROJECT_ROOT, ".tmp", "test-reports");
  if (!fs.existsSync(reportsDir)) return null;
  const dirs = fs.readdirSync(reportsDir)
    .filter(d => fs.statSync(path.join(reportsDir, d)).isDirectory())
    .sort().reverse();
  for (const dir of dirs) {
    const rp = path.join(reportsDir, dir, "report.json");
    if (fs.existsSync(rp)) return rp;
  }
  return null;
}

async function main() {
  const opts = parseArgs();
  const start = Date.now();

  if (!opts.json) {
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║     SPORTSPHERE REGRESSION MONITOR                  ║");
    console.log("╚══════════════════════════════════════════════════════╝");
    console.log(`  Time:  ${new Date().toISOString()}`);
    console.log();
  }

  // Step 1: Run full test suite
  if (!opts.json) console.log("┌─ Running Full Test Suite ─────────────────────────────");
  try {
    execSync("node tools/test_agent.mjs --phase full", {
      cwd: PROJECT_ROOT,
      stdio: opts.json ? "pipe" : "inherit",
      timeout: 600000,
    });
  } catch (err) {
    if (!opts.json) console.error("  ✗ Test suite exited with error");
  }

  // Step 2: Find and parse report
  const reportPath = findLatestReport();
  if (!reportPath) {
    console.error("No report generated.");
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  // Step 3: Run repair agent (diagnosis only)
  if (!opts.json) console.log("\n┌─ Running Repair Agent ────────────────────────────────");
  try {
    execSync(`node tools/repair_agent.mjs --report "${reportPath}" --dry-run`, {
      cwd: PROJECT_ROOT,
      stdio: opts.json ? "pipe" : "inherit",
      timeout: 120000,
    });
  } catch (err) {
    if (!opts.json) console.error("  ✗ Repair agent exited with error");
  }

  // Step 4: Summary
  const duration = Date.now() - start;
  const summary = {
    timestamp: new Date().toISOString(),
    duration_ms: duration,
    total: report.summary.total,
    passed: report.summary.passed,
    critical: report.summary.critical,
    warning: report.summary.warning,
    data_issue: report.summary.data_issue,
    pass_rate: ((report.summary.passed / report.summary.total) * 100).toFixed(1),
    status: report.summary.critical > 0 ? "FAIL" : report.summary.warning > 0 ? "WARN" : "PASS",
    reportPath,
  };

  if (opts.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("\n══════════════════════════════════════════════════════");
    console.log("  MONITOR SUMMARY");
    console.log("══════════════════════════════════════════════════════");
    console.log(`  Status:     ${summary.status}`);
    console.log(`  Pass Rate:  ${summary.pass_rate}%`);
    console.log(`  Total:      ${summary.total}`);
    console.log(`  Passed:     ${summary.passed}`);
    console.log(`  Critical:   ${summary.critical}`);
    console.log(`  Warning:    ${summary.warning}`);
    console.log(`  Duration:   ${(duration / 1000).toFixed(1)}s`);
    console.log("══════════════════════════════════════════════════════");
  }

  // Exit code based on severity
  if (summary.critical > 0) process.exit(1);
  if (summary.warning > 0) process.exit(2);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
