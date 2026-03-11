/**
 * bot_squad.mjs — Main Bot Squad Orchestrator
 *
 * Continuously runs 25 bots that interact with the platform.
 * Hybrid: API-based for CRUD + optional Playwright for UI flows.
 *
 * Usage:
 *   node tools/bot_squad.mjs                          # organic, speed 3
 *   node tools/bot_squad.mjs --mode stress-test       # high volume
 *   node tools/bot_squad.mjs --speed 7 --bots 10      # fast, fewer bots
 *   node tools/bot_squad.mjs --headed                  # show browser
 *   node tools/bot_squad.mjs --mode qa-testing         # edge cases
 *
 * Signals:
 *   Ctrl+C → graceful shutdown
 *   Write "stop" to .tmp/bot_squad.signal → graceful shutdown
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { log, sleep, setLogLevel, supabaseInsert } from './bot_helpers.mjs';
import { loadConfig, getConfig, isPaused, startConfigPolling, stopConfigPolling } from './bot_config.mjs';
import { BotScheduler } from './bot_scheduler.mjs';
import { ApiActionEngine, PlaywrightActionEngine } from './bot_actions.mjs';
import { getSportsContext } from './sports_brain.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_DIR = join(__dirname, '..', '.tmp');
const SIGNAL_FILE = join(TMP_DIR, 'bot_squad.signal');
const PID_FILE = join(TMP_DIR, 'bot_squad.pid');

// ── Load Personas ────────────────────────────────────────────────

const allPersonas = JSON.parse(readFileSync(join(__dirname, 'bot_personas.json'), 'utf-8')).personas;

// ── State ────────────────────────────────────────────────────────

let running = true;
let stats = {
  startedAt: new Date().toISOString(),
  totalActions: 0,
  successActions: 0,
  failedActions: 0,
  actionsByType: {},
  actionsByBot: {},
};

// ── Graceful Shutdown ────────────────────────────────────────────

function setupShutdown() {
  process.on('SIGINT', () => {
    log('info', '\nShutting down gracefully...');
    running = false;
  });
  process.on('SIGTERM', () => {
    running = false;
  });
}

function checkSignalFile() {
  if (existsSync(SIGNAL_FILE)) {
    try {
      const signal = readFileSync(SIGNAL_FILE, 'utf-8').trim();
      if (signal === 'stop') {
        log('info', 'Stop signal received via signal file');
        running = false;
        unlinkSync(SIGNAL_FILE);
      }
    } catch {}
  }
}

// ── Main Loop ────────────────────────────────────────────────────

async function main() {
  // Initialize
  const config = loadConfig();
  setLogLevel(config.logLevel);

  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
  writeFileSync(PID_FILE, process.pid.toString());

  log('info', '═══════════════════════════════════════════════════');
  log('info', '  Bot Squad — Sportsphere Testing & Activity Agent');
  log('info', '═══════════════════════════════════════════════════');
  log('info', `Mode: ${config.mode} | Speed: ${config.speed} | Bots: ${config.activeBots}`);
  log('info', `Playwright: ${config.modeConfig.enablePlaywright ? 'enabled' : 'disabled'}`);

  // Sports context
  const ctx = getSportsContext();
  log('info', `\nSports Brain:`);
  log('info', ctx.summary);
  log('info', `Weights: ${Object.entries(ctx.weights).map(([k, v]) => `${k}=${Math.round(v * 100)}%`).join(' | ')}`);

  // Start config polling
  startConfigPolling();
  setupShutdown();

  // Initialize engines
  const apiEngine = new ApiActionEngine();
  const playwrightEngine = new PlaywrightActionEngine(null); // Playwright pool added later if needed

  // Activate bots
  const activeBots = allPersonas.slice(0, config.activeBots);
  const schedulers = activeBots.map(p => ({
    persona: p,
    scheduler: new BotScheduler(p),
    nextActionAt: Date.now() + Math.random() * 30000, // Stagger start
  }));

  log('info', `\n${activeBots.length} bots activated. Starting continuous loop...\n`);

  // Log maintenance entry
  try {
    await supabaseInsert('bot_maintenance_log', {
      actor: 'system',
      action: 'squad_started',
      details: { mode: config.mode, speed: config.speed, bots: config.activeBots },
    });
  } catch {}

  // ── Continuous Loop ──────────────────────────────────────────

  let cycleCount = 0;
  while (running) {
    checkSignalFile();
    if (!running) break;

    const config = getConfig();
    if (isPaused()) {
      log('info', 'Paused. Waiting...');
      await sleep(10000);
      continue;
    }

    // Find the bot with the earliest next action
    const now = Date.now();
    const readyBots = schedulers.filter(s => s.nextActionAt <= now);

    if (readyBots.length === 0) {
      // Wait for the nearest bot
      const earliest = Math.min(...schedulers.map(s => s.nextActionAt));
      const waitMs = Math.max(100, earliest - now);
      await sleep(Math.min(waitMs, 5000)); // Cap at 5s to stay responsive
      continue;
    }

    // Execute action for a ready bot
    const botState = readyBots[0]; // Take the first ready bot
    const { action, delayMs, engine, reason } = botState.scheduler.getNextAction();

    if (!action) {
      botState.nextActionAt = now + delayMs;
      if (reason) log('debug', `[${botState.persona.id}] Skipped: ${reason}`);
      continue;
    }

    // Execute
    let result;
    if (engine === 'playwright') {
      result = await playwrightEngine.execute(action, botState.persona);
    } else {
      result = await apiEngine.execute(action, botState.persona, activeBots);
    }

    // Update stats
    stats.totalActions++;
    if (result.success) stats.successActions++;
    else stats.failedActions++;
    stats.actionsByType[action] = (stats.actionsByType[action] || 0) + 1;
    stats.actionsByBot[botState.persona.id] = (stats.actionsByBot[botState.persona.id] || 0) + 1;

    // Schedule next action for this bot
    botState.nextActionAt = now + delayMs;

    // Periodic status report
    cycleCount++;
    if (cycleCount % 25 === 0) {
      const elapsed = ((Date.now() - new Date(stats.startedAt).getTime()) / 60000).toFixed(1);
      const rate = (stats.totalActions / (elapsed || 1)).toFixed(1);
      log('info', `[STATUS] ${elapsed}min | ${stats.totalActions} actions (${rate}/min) | ${stats.successActions} ok / ${stats.failedActions} err`);
      log('info', `  Top actions: ${Object.entries(stats.actionsByType).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}:${v}`).join(', ')}`);
    }
  }

  // ── Shutdown ──────────────────────────────────────────────────

  log('info', '\n═══════════════════════════════════════════════════');
  log('info', '  Bot Squad Shutdown');
  log('info', '═══════════════════════════════════════════════════');
  log('info', `Total actions: ${stats.totalActions}`);
  log('info', `Success: ${stats.successActions} | Failed: ${stats.failedActions}`);
  log('info', `Rate: ${(stats.totalActions / ((Date.now() - new Date(stats.startedAt).getTime()) / 60000)).toFixed(1)}/min`);

  stopConfigPolling();

  // Save final stats
  try {
    const reportPath = join(TMP_DIR, 'bot_squad_report.json');
    writeFileSync(reportPath, JSON.stringify({
      ...stats,
      endedAt: new Date().toISOString(),
      config: getConfig(),
    }, null, 2));
    log('info', `Report saved: ${reportPath}`);
  } catch {}

  // Log maintenance entry
  try {
    await supabaseInsert('bot_maintenance_log', {
      actor: 'system',
      action: 'squad_stopped',
      details: stats,
    });
  } catch {}

  // Cleanup PID file
  try { unlinkSync(PID_FILE); } catch {}

  log('info', 'Goodbye.');
}

// ── CLI Status ───────────────────────────────────────────────────

if (process.argv.includes('--status')) {
  // Quick status check
  if (existsSync(PID_FILE)) {
    const pid = readFileSync(PID_FILE, 'utf-8').trim();
    log('info', `Bot Squad running (PID: ${pid})`);
  } else {
    log('info', 'Bot Squad is not running');
  }
  if (existsSync(join(TMP_DIR, 'bot_squad_report.json'))) {
    const report = JSON.parse(readFileSync(join(TMP_DIR, 'bot_squad_report.json'), 'utf-8'));
    log('info', `Last run: ${report.startedAt} → ${report.endedAt}`);
    log('info', `Actions: ${report.totalActions} (${report.successActions} ok, ${report.failedActions} err)`);
  }
  process.exit(0);
}

if (process.argv.includes('--stop')) {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
  writeFileSync(SIGNAL_FILE, 'stop');
  log('info', 'Stop signal sent');
  process.exit(0);
}

// ── Start ────────────────────────────────────────────────────────

main().catch(e => {
  log('error', `Fatal: ${e.message}`);
  log('error', e.stack);
  process.exit(1);
});
