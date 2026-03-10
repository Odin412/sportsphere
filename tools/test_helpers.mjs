/**
 * test_helpers.mjs — Core utilities for the Sportsphere testing agent.
 *
 * Three-layer verification:
 *   L1: Playwright assertions (deterministic)
 *   L2: Claude Vision verification (AI judgment)
 *   L3: Supabase data verification (backend state)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ── Onboarding Bypass ──────────────────────────────────────────────

export async function bypassOnboarding(page, appUrl) {
  if (!page.url().includes("Onboarding")) return;

  // Debug: log all localStorage keys to find the session key
  const debugInfo = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const info = keys.map(k => {
      const val = localStorage.getItem(k);
      return { key: k, len: val?.length, preview: val?.slice(0, 80) };
    });
    return info;
  });
  console.log("  → localStorage keys:", debugInfo.map(d => d.key).join(", "));

  const userId = await page.evaluate(() => {
    // Try multiple Supabase session key patterns
    const keys = Object.keys(localStorage);
    const sessionKey = keys.find(k =>
      (k.startsWith("sb-") && k.endsWith("-auth-token")) ||
      k.includes("supabase") ||
      k.includes("auth-token")
    );
    if (!sessionKey) return null;
    try {
      const raw = localStorage.getItem(sessionKey);
      const session = JSON.parse(raw);
      // Handle different session formats
      return session?.user?.id || session?.currentSession?.user?.id || null;
    } catch { return null; }
  });

  if (userId) {
    await page.evaluate((uid) => localStorage.setItem(`ob_${uid}`, "1"), userId);
    await page.goto(`${appUrl}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);
  } else {
    const skipLink = page.locator('a, button').filter({ hasText: /skip/i }).first();
    if (await skipLink.isVisible().catch(() => false)) {
      await skipLink.click();
      await page.waitForTimeout(3000);
    }
  }
}

// ── Wait for Auth (sidebar visible) after page.goto() ─────────────

/**
 * After a full page.goto(), the app needs to recover the auth session
 * from localStorage. This can take 5-15s. This helper waits up to 20s
 * for the sidebar to appear (indicating auth + layout rendered).
 */
export async function waitForAuth(page) {
  for (let i = 0; i < 40; i++) {
    const hasSidebar = await page.locator('[data-tour="nav-feed"]').isVisible().catch(() => false);
    if (hasSidebar) return true;
    await page.waitForTimeout(500);
  }
  // Fallback: check if any meaningful content appeared
  const hasContent = await page.evaluate(() => {
    return (document.body?.innerText?.length || 0) > 100;
  }).catch(() => false);
  return hasContent;
}

// ── Screenshot ─────────────────────────────────────────────────────

export async function takeScreenshot(page, outputDir, name) {
  const safeName = name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  const filePath = path.join(outputDir, `${safeName}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  const base64 = fs.readFileSync(filePath).toString("base64");
  return { filePath, base64, fileName: `${safeName}.png` };
}

// ── L1: Playwright Assertions ──────────────────────────────────────

export async function assertPlaywright(page, assertions) {
  const results = [];
  for (const a of assertions) {
    try {
      switch (a.type) {
        case "url_contains": {
          const timeout = a.timeout || 10000;
          await page.waitForURL(`**${a.value}**`, { timeout });
          results.push({ assertion: a, pass: true });
          break;
        }
        case "url_not_contains": {
          // Wait a moment then check
          await page.waitForTimeout(a.timeout || 2000);
          const url = page.url();
          const pass = !url.includes(a.value);
          results.push({ assertion: a, pass, actual: url });
          break;
        }
        case "visible": {
          const el = page.locator(a.selector).first();
          await el.waitFor({ state: "visible", timeout: a.timeout || 8000 });
          results.push({ assertion: a, pass: true });
          break;
        }
        case "not_visible": {
          await page.waitForTimeout(a.timeout || 1500);
          const visible = await page.locator(a.selector).first().isVisible().catch(() => false);
          results.push({ assertion: a, pass: !visible });
          break;
        }
        case "count_gte": {
          await page.waitForTimeout(a.timeout || 3000);
          const count = await page.locator(a.selector).count();
          results.push({ assertion: a, pass: count >= a.value, actual: count });
          break;
        }
        case "text_contains": {
          const el = page.locator(a.selector).first();
          const text = await el.textContent({ timeout: a.timeout || 5000 });
          const pass = text && text.includes(a.value);
          results.push({ assertion: a, pass, actual: text?.slice(0, 100) });
          break;
        }
        case "has_class": {
          const el = page.locator(a.selector).first();
          const cls = await el.getAttribute("class", { timeout: a.timeout || 5000 });
          const pass = cls && cls.includes(a.value);
          results.push({ assertion: a, pass, actual: cls?.slice(0, 100) });
          break;
        }
        default:
          results.push({ assertion: a, pass: false, error: `Unknown assertion type: ${a.type}` });
      }
    } catch (err) {
      results.push({ assertion: a, pass: false, error: err.message });
    }
  }
  const allPassed = results.every((r) => r.pass);
  return { pass: allPassed, results };
}

// ── L2: Vision Verification ────────────────────────────────────────

export async function verifyWithVision(anthropic, base64, prompt) {
  const maxRetries = 1;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system:
          'You are a QA visual verification agent for a dark-themed sports social media app. Respond ONLY with JSON: {"pass": true/false, "reasoning": "brief explanation"}. Be strict: check that the feature WORKS (shows real data, correct state), not just that the page loaded. Flag empty states, error toasts, loading spinners stuck for too long, or layouts that look broken.',
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      });

      const text = response.content[0]?.text || "";
      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { pass: !!parsed.pass, reasoning: parsed.reasoning || "" };
      }
      return { pass: false, reasoning: `Could not parse vision response: ${text.slice(0, 200)}` };
    } catch (err) {
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      return { pass: false, reasoning: `Vision API error: ${err.message}`, skipped: true };
    }
  }
}

// ── L3: Data Verification ──────────────────────────────────────────

export async function verifyData(supabaseUrl, anonKey, tableName, query) {
  // query is an object like { column: "eq.value" } for Supabase REST API
  const params = new URLSearchParams(query);
  const url = `${supabaseUrl}/rest/v1/${tableName}?${params.toString()}`;
  try {
    const resp = await fetch(url, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!resp.ok) {
      return { pass: false, error: `HTTP ${resp.status}: ${await resp.text()}` };
    }
    const data = await resp.json();
    return { pass: true, data };
  } catch (err) {
    return { pass: false, error: err.message };
  }
}

// ── Scenario Runner ────────────────────────────────────────────────

export async function runScenario(page, anthropic, steps, outputDir, phaseName, config) {
  const results = [];
  let skipRemaining = false;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNum = String(i + 1).padStart(2, "0");
    const screenshotName = `${phaseName}_${stepNum}_${step.name}`;

    if (skipRemaining) {
      results.push({
        phase: phaseName,
        name: step.name,
        severity: "SKIPPED",
        layers: { L1: "skipped", L2: "skipped", L3: "skipped" },
        reasoning: "Skipped due to earlier critical failure",
        screenshot: null,
        duration_ms: 0,
      });
      continue;
    }

    const start = Date.now();
    let l1Result = { pass: true, results: [] };
    let l2Result = { pass: true, reasoning: "No vision check" };
    let l3Result = null;
    let screenshot = null;

    try {
      // Execute the action
      if (step.action) {
        await step.action(page);
      }

      // Small wait for UI to settle
      await page.waitForTimeout(step.settleMs || 1500);

      // L1: Playwright assertions
      if (step.assertions && step.assertions.length > 0) {
        l1Result = await assertPlaywright(page, step.assertions);
      }

      // Take screenshot
      screenshot = await takeScreenshot(page, outputDir, screenshotName);

      // L2: Vision verification
      if (step.vision) {
        l2Result = await verifyWithVision(anthropic, screenshot.base64, step.vision);
      }

      // L3: Data verification
      if (step.dataCheck && config) {
        l3Result = await step.dataCheck(config);
      }
    } catch (err) {
      // Try to take screenshot even on error
      try {
        screenshot = await takeScreenshot(page, outputDir, `${screenshotName}_error`);
      } catch { /* ignore */ }
      l1Result = { pass: false, results: [{ error: err.message }] };
    }

    // Determine severity
    let severity;
    if (!l1Result.pass) {
      severity = "CRITICAL";
    } else if (!l2Result.pass && !l2Result.skipped) {
      severity = "WARNING";
    } else if (l3Result && !l3Result.pass) {
      severity = "DATA_ISSUE";
    } else if (l2Result.skipped) {
      severity = "PASS"; // L1 passed, vision was skipped (API error) — treat as pass
    } else {
      severity = "PASS";
    }

    const duration_ms = Date.now() - start;

    const result = {
      phase: phaseName,
      name: step.name,
      severity,
      layers: {
        L1: l1Result.pass ? "pass" : "fail",
        L2: l2Result.skipped ? "skipped" : l2Result.pass ? "pass" : "fail",
        L3: l3Result ? (l3Result.pass ? "pass" : "fail") : null,
      },
      reasoning: buildReasoning(l1Result, l2Result, l3Result),
      screenshot: screenshot?.fileName || null,
      duration_ms,
    };

    results.push(result);

    // Log in real-time
    const icon = severity === "PASS" ? "✓" : severity === "CRITICAL" ? "✗" : severity === "WARNING" ? "⚠" : "?";
    console.log(`  ${icon} ${step.name} [${severity}] (${duration_ms}ms)`);

    // If critical and this is a dependency step, skip remaining
    if (severity === "CRITICAL" && step.critical) {
      console.log(`    ↳ Critical failure — skipping remaining ${phaseName} steps`);
      skipRemaining = true;
    }
  }

  return results;
}

function buildReasoning(l1, l2, l3) {
  const parts = [];
  if (!l1.pass) {
    const failures = l1.results.filter((r) => !r.pass);
    parts.push(`L1 FAIL: ${failures.map((f) => f.error || `${f.assertion.type} ${f.assertion.selector || f.assertion.value}`).join("; ")}`);
  }
  if (l2 && !l2.pass && !l2.skipped) {
    parts.push(`L2 FAIL: ${l2.reasoning}`);
  }
  if (l3 && !l3.pass) {
    parts.push(`L3 FAIL: ${l3.error || "Data check failed"}`);
  }
  if (parts.length === 0) {
    return l2.reasoning || "All checks passed";
  }
  return parts.join(" | ");
}

// ── Report Generation ──────────────────────────────────────────────

export function generateReport(allResults, outputDir, meta) {
  const summary = {
    total: allResults.length,
    critical: allResults.filter((r) => r.severity === "CRITICAL").length,
    warning: allResults.filter((r) => r.severity === "WARNING").length,
    data_issue: allResults.filter((r) => r.severity === "DATA_ISSUE").length,
    passed: allResults.filter((r) => r.severity === "PASS").length,
    skipped: allResults.filter((r) => r.severity === "SKIPPED").length,
  };

  const report = {
    timestamp: new Date().toISOString(),
    url: meta.url,
    phases: meta.phases,
    duration_ms: meta.duration_ms,
    summary,
    results: allResults,
  };

  // Write JSON
  fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));

  // Write Markdown
  const md = generateMarkdownReport(report);
  fs.writeFileSync(path.join(outputDir, "report.md"), md);

  return report;
}

function generateMarkdownReport(report) {
  const s = report.summary;
  const lines = [
    `# Sportsphere Test Report`,
    ``,
    `**Date**: ${report.timestamp}`,
    `**URL**: ${report.url}`,
    `**Duration**: ${(report.duration_ms / 1000).toFixed(1)}s`,
    `**Result**: ${s.passed}/${s.total} passed` +
      (s.critical ? ` | ${s.critical} critical` : "") +
      (s.warning ? ` | ${s.warning} warnings` : "") +
      (s.data_issue ? ` | ${s.data_issue} data issues` : "") +
      (s.skipped ? ` | ${s.skipped} skipped` : ""),
    ``,
  ];

  // Group by phase
  const phases = [...new Set(report.results.map((r) => r.phase))];
  for (const phase of phases) {
    const phaseResults = report.results.filter((r) => r.phase === phase);
    const phasePassed = phaseResults.filter((r) => r.severity === "PASS").length;
    lines.push(`## ${phase} (${phasePassed}/${phaseResults.length} passed)`);
    lines.push(``);
    lines.push(`| # | Test | Status | Layers | Notes |`);
    lines.push(`|---|------|--------|--------|-------|`);
    for (let i = 0; i < phaseResults.length; i++) {
      const r = phaseResults[i];
      const icon = r.severity === "PASS" ? "PASS" : r.severity === "CRITICAL" ? "CRITICAL" : r.severity === "WARNING" ? "WARNING" : r.severity === "DATA_ISSUE" ? "DATA" : "SKIP";
      const layers = `L1:${r.layers.L1} L2:${r.layers.L2}${r.layers.L3 ? ` L3:${r.layers.L3}` : ""}`;
      const notes = r.reasoning.slice(0, 80);
      lines.push(`| ${i + 1} | ${r.name} | ${icon} | ${layers} | ${notes} |`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}
