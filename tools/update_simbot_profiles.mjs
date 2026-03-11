/**
 * update_simbot_profiles.mjs
 * ─────────────────────────
 * Assigns diverse names + UNIQUE real Pexels photos to all simulation bot
 * accounts (simbot-hype-*, simbot-scout-*, simbot-athlete-*).
 *
 * Each bot gets a persona-specific query + deduplication so no two bots
 * share the same photo.
 *
 * Usage: node tools/update_simbot_profiles.mjs
 */

const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";
const PEXELS_API_KEY = "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";

// Each bot gets a UNIQUE, tailored Pexels query to guarantee distinct photos.
// Ordered to match simbot email sort order within each persona.
const BOTS = [
  // ── HYPE (fan personas) ───────────────────────────────────────────────────
  {
    email_prefix: "simbot-hype-1-mmldlca1",
    name: "Darius King",
    query: "young black man basketball jersey confident portrait",
  },
  {
    email_prefix: "simbot-hype-1-mmldlnwi",
    name: "Aaliyah Foster",
    query: "young black woman natural hair smiling sport fan portrait",
  },
  {
    email_prefix: "simbot-hype-1-mmldudla",
    name: "Terrence Webb",
    query: "young hispanic man athletic casual smile portrait",
  },
  {
    email_prefix: "simbot-hype-1-mmm6z91a",
    name: "Keisha Monroe",
    query: "young black woman confident stylish portrait professional",
  },
  {
    email_prefix: "simbot-hype-1-mmm8trdf",
    name: "Brandon Cruz",
    query: "young latino man sunglasses sport cap portrait",
  },
  {
    email_prefix: "simbot-hype-1-mmmai4si",
    name: "Jasmine Okafor",
    query: "young african woman braids portrait athletic",
  },
  {
    email_prefix: "simbot-hype-2-mmldudla",
    name: "Devon Reyes",
    query: "young mixed race man casual hoodie smile portrait",
  },

  // ── SCOUT (coach/analyst personas) ────────────────────────────────────────
  {
    email_prefix: "simbot-scout-1-mmldw12h",
    name: "Ray Holloway",
    query: "middle aged white man coach clipboard confident portrait",
  },
  {
    email_prefix: "simbot-scout-1-mmm8y0b3",
    name: "Lisa Nguyen",
    query: "asian woman professional business casual portrait confident",
  },

  // ── ATHLETE (player personas) ─────────────────────────────────────────────
  {
    email_prefix: "simbot-athlete-1-mmldovod",
    name: "Zion Blake",
    query: "young black man basketball athletic training gym portrait",
  },
  {
    email_prefix: "simbot-athlete-1-mmldtfs3",
    name: "Simone Ortega",
    query: "young latina woman soccer athlete outdoors portrait",
  },
  {
    email_prefix: "simbot-athlete-1-mmm9d06j",
    name: "Isaiah Grant",
    query: "young black man football player athletic portrait strong",
  },
];

// ─── Supabase helpers ─────────────────────────────────────────────────────────
const HEADERS = {
  Authorization: `Bearer ${SERVICE_ROLE}`,
  apikey: SERVICE_ROLE,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET failed (${res.status})`);
  return res.json();
}

async function patch(table, filterKey, filterVal, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterVal)}`;
  const res = await fetch(url, { method: "PATCH", headers: HEADERS, body: JSON.stringify(data) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${table} failed (${res.status}): ${text}`);
  }
}

// ─── Pexels: fetch unique photo not already used ───────────────────────────
async function fetchUniquePexels(query, usedIds) {
  // Try up to 3 pages (15 results per page) to find a unique photo
  for (let page = 1; page <= 3; page++) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=portrait`;
    try {
      const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
      if (!res.ok) continue;
      const json = await res.json();
      const photos = json.photos || [];
      for (const photo of photos) {
        if (!usedIds.has(photo.id)) {
          usedIds.add(photo.id);
          return photo.src?.medium || photo.src?.small || null;
        }
      }
    } catch (e) {
      console.warn(`    Pexels page ${page} failed: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Sportsphere SimBot Profile Updater (Unique Photos)\n");

  // Fetch all simbot profiles to get full emails
  const profiles = await fetchJSON(
    `${SUPABASE_URL}/rest/v1/profiles?email=like.simbot-*%40sportsphere.app&select=email,full_name&order=email`
  );

  // Build email lookup by prefix
  const emailMap = {};
  for (const p of profiles) {
    const prefix = p.email.split("@")[0];
    emailMap[prefix] = p.email;
  }

  const usedPhotoIds = new Set();
  let updated = 0;
  let failed = 0;

  for (const bot of BOTS) {
    const email = emailMap[bot.email_prefix];
    if (!email) {
      console.log(`  ⚠ No profile found for prefix: ${bot.email_prefix}`);
      continue;
    }

    process.stdout.write(`  ${bot.name.padEnd(18)} [${bot.query.substring(0, 45)}...] → `);

    const avatarUrl = await fetchUniquePexels(bot.query, usedPhotoIds);
    if (!avatarUrl) {
      console.log("✗ No unique photo found");
      failed++;
      continue;
    }

    try {
      await patch("profiles", "email", email, { full_name: bot.name, avatar_url: avatarUrl });
      await patch("posts", "author_email", email, { author_name: bot.name, author_avatar: avatarUrl });
      try { await patch("sport_profiles", "user_email", email, { user_name: bot.name, avatar_url: avatarUrl }); } catch (_) {}

      console.log(`✓ unique photo`);
      updated++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Done: ${updated} updated, ${failed} failed`);
  console.log(`Unique photo IDs used: ${usedPhotoIds.size}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
