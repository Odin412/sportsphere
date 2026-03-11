/**
 * setup_bot_squad.mjs — One-time setup for Bot Squad accounts
 *
 * Creates 10 new bot accounts and ensures all 25 personas have
 * auth accounts + profiles in Supabase.
 *
 * Usage: node tools/setup_bot_squad.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  createBotAccount, upsertProfile, signInBot, supabaseSelect,
  log, sleep, BOT_PASSWORD, SUPABASE_URL, SERVICE_ROLE_KEY,
} from './bot_helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const personas = JSON.parse(readFileSync(join(__dirname, 'bot_personas.json'), 'utf-8')).personas;

async function getUserIdByEmail(email) {
  // Look up user in auth via admin API
  const url = `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Admin users list: ${res.status}`);
  const data = await res.json();
  const users = data.users || data;
  const user = users.find(u => u.email === email);
  return user?.id || null;
}

async function setupPersona(persona) {
  const { email, profile } = persona;
  log('info', `Setting up: ${email} (${profile.full_name})`);

  // 1. Create auth account (idempotent — skips if exists)
  const created = await createBotAccount(email, BOT_PASSWORD, profile.full_name);

  // 2. Get user ID
  let userId;
  if (created?.id) {
    userId = created.id;
  } else {
    // Try signing in to get the user ID
    try {
      const session = await signInBot(email);
      userId = session.user.id;
    } catch {
      // Last resort: admin API lookup
      userId = await getUserIdByEmail(email);
    }
  }

  if (!userId) {
    log('error', `Could not get user ID for ${email}`);
    return false;
  }

  // 3. Upsert profile
  try {
    await upsertProfile({
      id: userId,
      email: email,
      full_name: profile.full_name,
      role: profile.role,
      sport: profile.sport || 'Baseball',
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
    });
    log('info', `  ✓ Profile upserted for ${profile.full_name}`);
  } catch (e) {
    log('warn', `  ⚠ Profile upsert failed: ${e.message}`);
  }

  return true;
}

async function main() {
  log('info', `=== Bot Squad Setup: ${personas.length} personas ===`);
  log('info', `Supabase: ${SUPABASE_URL}`);
  log('info', `Password: ${BOT_PASSWORD.slice(0, 4)}...`);

  let success = 0;
  let failed = 0;

  for (const persona of personas) {
    try {
      const ok = await setupPersona(persona);
      if (ok) success++;
      else failed++;
    } catch (e) {
      log('error', `Failed: ${persona.email} — ${e.message}`);
      failed++;
    }
    // Small delay to avoid rate limiting
    await sleep(500);
  }

  log('info', `\n=== Setup Complete ===`);
  log('info', `Success: ${success} | Failed: ${failed} | Total: ${personas.length}`);

  // Verify by counting profiles
  try {
    const botEmails = personas.map(p => `"${p.email}"`).join(',');
    const profiles = await supabaseSelect(
      'profiles',
      `email=in.(${botEmails})&select=email,full_name,role,sport`,
      SERVICE_ROLE_KEY
    );
    log('info', `Profiles found in DB: ${profiles.length}/${personas.length}`);
    if (profiles.length < personas.length) {
      const found = profiles.map(p => p.email);
      const missing = personas.filter(p => !found.includes(p.email)).map(p => p.email);
      log('warn', `Missing profiles: ${missing.join(', ')}`);
    }
  } catch (e) {
    log('warn', `Profile verification skipped: ${e.message}`);
  }
}

main().catch(e => {
  log('error', `Setup failed: ${e.message}`);
  process.exit(1);
});
