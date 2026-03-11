/**
 * bot_config.mjs — Configuration loader for Bot Squad
 *
 * Reads from: CLI args → env vars → remote bot_config table
 * Polls remote config every 60s for live adjustments.
 */

import { supabaseSelect, log, SERVICE_ROLE_KEY } from './bot_helpers.mjs';

// ── Defaults ─────────────────────────────────────────────────────

const DEFAULTS = {
  mode: 'organic',           // organic | qa-testing | stress-test | marketing
  speed: 3,                  // 1-10 (actions per minute multiplier)
  activeBots: 25,            // how many of the 25 bots to activate
  playwrightPool: 2,         // max concurrent browser instances
  logLevel: 'info',          // debug | info | warn | error
  persistActivity: true,     // log to bot_activity_log table
  pollIntervalMs: 60000,     // remote config poll interval
};

// ── Mode Configurations ──────────────────────────────────────────

export const MODE_CONFIG = {
  organic: {
    speedMultiplier: 1.0,
    description: 'Realistic usage patterns with natural timing',
    enablePlaywright: true,
    contentStyle: 'natural',
    timingJitter: 0.2,
  },
  'qa-testing': {
    speedMultiplier: 0.5,
    description: 'Edge case testing — special chars, max length, rapid state changes',
    enablePlaywright: true,
    contentStyle: 'edge-case',
    timingJitter: 0.1,
  },
  'stress-test': {
    speedMultiplier: 5.0,
    description: 'High volume — all bots firing rapidly to test rate limits',
    enablePlaywright: false,
    contentStyle: 'natural',
    timingJitter: 0.05,
  },
  marketing: {
    speedMultiplier: 0.8,
    description: 'Brand-like behavior — polished content, optimal timing',
    enablePlaywright: false,
    contentStyle: 'polished',
    timingJitter: 0.15,
  },
};

// ── Config State ─────────────────────────────────────────────────

let currentConfig = { ...DEFAULTS };
let pollTimer = null;

// ── Load from CLI + Env ──────────────────────────────────────────

export function loadConfig(argv = process.argv) {
  // Env vars
  if (process.env.BOT_SQUAD_MODE) currentConfig.mode = process.env.BOT_SQUAD_MODE;
  if (process.env.BOT_SQUAD_SPEED) currentConfig.speed = parseInt(process.env.BOT_SQUAD_SPEED, 10);
  if (process.env.BOT_SQUAD_ACTIVE_BOTS) currentConfig.activeBots = parseInt(process.env.BOT_SQUAD_ACTIVE_BOTS, 10);
  if (process.env.BOT_SQUAD_PLAYWRIGHT_POOL) currentConfig.playwrightPool = parseInt(process.env.BOT_SQUAD_PLAYWRIGHT_POOL, 10);
  if (process.env.BOT_SQUAD_LOG_LEVEL) currentConfig.logLevel = process.env.BOT_SQUAD_LOG_LEVEL;

  // CLI args
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--mode' && argv[i + 1]) currentConfig.mode = argv[++i];
    if (arg === '--speed' && argv[i + 1]) currentConfig.speed = parseInt(argv[++i], 10);
    if (arg === '--bots' && argv[i + 1]) currentConfig.activeBots = parseInt(argv[++i], 10);
    if (arg === '--headed') currentConfig.headed = true;
    if (arg === '--no-persist') currentConfig.persistActivity = false;
    if (arg === '--log-level' && argv[i + 1]) currentConfig.logLevel = argv[++i];
  }

  // Clamp values
  currentConfig.speed = Math.max(1, Math.min(10, currentConfig.speed));
  currentConfig.activeBots = Math.max(1, Math.min(25, currentConfig.activeBots));
  currentConfig.playwrightPool = Math.max(0, Math.min(5, currentConfig.playwrightPool));

  // Validate mode
  if (!MODE_CONFIG[currentConfig.mode]) {
    log('warn', `Invalid mode "${currentConfig.mode}", falling back to "organic"`);
    currentConfig.mode = 'organic';
  }

  return currentConfig;
}

// ── Remote Config Polling ────────────────────────────────────────

async function fetchRemoteConfig() {
  try {
    const rows = await supabaseSelect('bot_config', 'select=key,value', SERVICE_ROLE_KEY);
    for (const row of rows) {
      switch (row.key) {
        case 'mode':
          if (MODE_CONFIG[row.value]) currentConfig.mode = row.value;
          break;
        case 'speed':
          currentConfig.speed = Math.max(1, Math.min(10, parseInt(row.value, 10)));
          break;
        case 'active_bots':
          currentConfig.activeBots = Math.max(1, Math.min(25, parseInt(row.value, 10)));
          break;
        case 'paused':
          currentConfig.paused = row.value === 'true' || row.value === true;
          break;
      }
    }
    log('debug', 'Remote config refreshed', currentConfig);
  } catch (e) {
    // Table might not exist yet — that's fine
    log('debug', `Remote config fetch skipped: ${e.message}`);
  }
}

export function startConfigPolling() {
  fetchRemoteConfig();
  pollTimer = setInterval(fetchRemoteConfig, currentConfig.pollIntervalMs);
  return pollTimer;
}

export function stopConfigPolling() {
  if (pollTimer) clearInterval(pollTimer);
}

// ── Getters ──────────────────────────────────────────────────────

export function getConfig() {
  return { ...currentConfig, modeConfig: MODE_CONFIG[currentConfig.mode] };
}

export function getModeConfig() {
  return MODE_CONFIG[currentConfig.mode];
}

export function isPaused() {
  return currentConfig.paused === true;
}
