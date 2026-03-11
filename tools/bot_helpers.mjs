/**
 * bot_helpers.mjs — Shared utilities for the Bot Squad
 *
 * Supabase REST wrappers, auth-as-bot, random selectors, logging.
 * Reuses patterns from test_helpers.mjs and seed_bots.mjs.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// ── Config ───────────────────────────────────────────────────────

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
export const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const BOT_PASSWORD = process.env.BOT_SQUAD_PASSWORD || 'BotSquad2026!Secure';

// ── Supabase REST Helpers ────────────────────────────────────────

const headers = (key, extra = {}) => ({
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
  ...extra,
});

export async function supabaseSelect(table, query = '', key = ANON_KEY) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, { headers: headers(key) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SELECT ${table}: ${res.status} ${text}`);
  }
  return res.json();
}

export async function supabaseInsert(table, data, key = SERVICE_ROLE_KEY) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify(Array.isArray(data) ? data : [data]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`INSERT ${table}: ${res.status} ${text}`);
  }
  return res.json();
}

export async function supabaseUpdate(table, id, data, key = SERVICE_ROLE_KEY) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: headers(key),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UPDATE ${table}(${id}): ${res.status} ${text}`);
  }
  return res.json();
}

export async function supabaseDelete(table, query, key = SERVICE_ROLE_KEY) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: headers(key),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${table}: ${res.status} ${text}`);
  }
  return res;
}

export async function supabaseRpc(fn, params = {}, key = SERVICE_ROLE_KEY) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fn}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RPC ${fn}: ${res.status} ${text}`);
  }
  return res.json();
}

// ── Auth as Bot ──────────────────────────────────────────────────

export async function signInBot(email, password = BOT_PASSWORD) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SIGN_IN ${email}: ${res.status} ${text}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    user: data.user,
  };
}

export async function createBotAccount(email, password = BOT_PASSWORD, fullName = 'Bot User') {
  // Create via Admin API (service role)
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(SERVICE_ROLE_KEY),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    // If user already exists, that's OK
    if (text.includes('already been registered') || text.includes('already exists')) {
      log('info', `Account already exists: ${email}`);
      return null;
    }
    throw new Error(`CREATE_ACCOUNT ${email}: ${res.status} ${text}`);
  }
  return res.json();
}

export async function upsertProfile(profileData) {
  const url = `${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers(SERVICE_ROLE_KEY), 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(Array.isArray(profileData) ? profileData : [profileData]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UPSERT profile: ${res.status} ${text}`);
  }
  return res.json();
}

// ── Random Selectors ─────────────────────────────────────────────

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

export function weightedPick(items, weightFn) {
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ── Logging ──────────────────────────────────────────────────────

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
let logLevel = LOG_LEVELS[process.env.BOT_SQUAD_LOG_LEVEL || 'info'];

export function setLogLevel(level) {
  logLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
}

export function log(level, message, data = null) {
  if (LOG_LEVELS[level] < logLevel) return;
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const prefix = `[${ts}] [${level.toUpperCase().padEnd(5)}]`;
  if (data) {
    console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data).slice(0, 200) : data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ── Activity Logging ─────────────────────────────────────────────

export async function logActivity(botEmail, actionType, { targetTable, targetId, metadata, success, errorMessage, durationMs } = {}) {
  try {
    await supabaseInsert('bot_activity_log', {
      bot_email: botEmail,
      action_type: actionType,
      target_table: targetTable || null,
      target_id: targetId || null,
      metadata: metadata || {},
      success: success !== false,
      error_message: errorMessage || null,
      duration_ms: durationMs || null,
    });
  } catch (e) {
    // Don't crash if activity logging fails
    log('warn', `Failed to log activity: ${e.message}`);
  }
}

// ── Timing Helpers ───────────────────────────────────────────────

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function jitter(baseMs, variance = 0.2) {
  const factor = 1 - variance + Math.random() * variance * 2;
  return Math.round(baseMs * factor);
}

// ── Date Helpers ─────────────────────────────────────────────────

export function recentDate(maxDaysAgo = 7) {
  const now = Date.now();
  const offset = Math.random() * maxDaysAgo * 86400000;
  return new Date(now - offset).toISOString();
}

export function isWithinHours(start, end) {
  const hour = new Date().getHours();
  if (start <= end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}
