/**
 * Sportsphere Bot Avatar Updater
 * ─────────────────────────────
 * Replaces DiceBear cartoon avatars on all bot posts with
 * real Pexels athlete/sports photos.
 *
 * Also updates sport_profiles.avatar_url for bot entries.
 *
 * Usage:
 *   node tools/update_bot_avatars.mjs
 */

const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";
const PEXELS_API_KEY = "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";

const BOTS = [
  // ── Official channels (use sport venue/studio scenes, not faces) ──────────
  {
    email: "espn-news@sportsphere.app",
    name: "ESPN SportsSphere",
    query: "sports television broadcast studio screen",
    orientation: "landscape",
  },
  {
    email: "nba-daily@sportsphere.app",
    name: "NBA Daily",
    query: "basketball court arena lights empty",
    orientation: "landscape",
  },
  {
    email: "premier-league@sportsphere.app",
    name: "Premier League HQ",
    query: "football soccer stadium pitch green",
    orientation: "landscape",
  },
  {
    email: "ufc-hub@sportsphere.app",
    name: "UFC Fight Hub",
    query: "octagon boxing ring fighting empty",
    orientation: "landscape",
  },
  {
    email: "olympic-sports@sportsphere.app",
    name: "Olympic Sports Network",
    query: "olympic stadium athletics track aerial",
    orientation: "landscape",
  },

  // ── Athlete personas (use realistic human portrait photos) ────────────────
  {
    email: "jordan.williams@sportsphere.app",
    name: "Jordan Williams",
    query: "young black basketball player training gym portrait",
    orientation: "portrait",
  },
  {
    email: "marcus.silva@sportsphere.app",
    name: "Marcus Silva",
    query: "young male soccer player portrait athletic",
    orientation: "portrait",
  },
  {
    email: "emma.chen@sportsphere.app",
    name: "Emma Chen",
    query: "young asian female tennis player portrait sport",
    orientation: "portrait",
  },
  {
    email: "tyler.brooks@sportsphere.app",
    name: "Tyler Brooks",
    query: "young man american football player athlete portrait",
    orientation: "portrait",
  },
  {
    email: "sofia.rodriguez@sportsphere.app",
    name: "Sofia Rodriguez",
    query: "young latina female swimmer athlete portrait",
    orientation: "portrait",
  },
  {
    email: "jack.obrien@sportsphere.app",
    name: "Jack O'Brien",
    query: "young male golfer athlete outdoor portrait",
    orientation: "portrait",
  },
  {
    email: "aisha.mohammed@sportsphere.app",
    name: "Aisha Mohammed",
    query: "young black female runner track athlete portrait",
    orientation: "portrait",
  },
  {
    email: "ryan.park@sportsphere.app",
    name: "Ryan Park",
    query: "young asian male athlete sport portrait gym",
    orientation: "portrait",
  },
  {
    email: "diego.fernandez@sportsphere.app",
    name: "Diego Fernandez",
    query: "young hispanic male baseball player portrait athletic",
    orientation: "portrait",
  },
  {
    email: "zara.mitchell@sportsphere.app",
    name: "Zara Mitchell",
    query: "young woman crossfit athlete gym training portrait",
    orientation: "portrait",
  },
];

// ─── Pexels photo search ──────────────────────────────────────────────────────
async function searchPexelsPhoto(query, orientation = "portrait") {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) throw new Error(`Pexels API ${res.status}`);
    const json = await res.json();
    const photos = json.photos || [];
    if (photos.length === 0) return null;

    // Prefer photos with real people for athletes (skip pure object/landscape shots)
    // Use the first result's small square URL for a clean avatar
    const photo = photos[0];
    // Use src.medium for higher quality — will be displayed at ~80-160px
    return photo.src?.medium || photo.src?.small || null;
  } catch (e) {
    console.warn(`  Pexels search failed for "${query}": ${e.message}`);
    return null;
  }
}

// ─── Supabase REST helpers ────────────────────────────────────────────────────
const HEADERS = {
  Authorization: `Bearer ${SERVICE_ROLE}`,
  apikey: SERVICE_ROLE,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function patchTable(table, filterKey, filterVal, patch) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterVal)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${table} failed (${res.status}): ${text}`);
  }
  return true;
}

async function countRows(table, filterKey, filterVal) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterVal)}&select=id`;
  const res = await fetch(url, {
    headers: { ...HEADERS, Prefer: "count=exact", "Content-Range": "0-0/*" },
  });
  const countHeader = res.headers.get("content-range");
  // content-range format: "0-0/N" or "*/N"
  const match = countHeader?.match(/\/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🏅 Sportsphere Bot Avatar Updater\n");
  console.log("Replacing DiceBear cartoons with real Pexels athlete photos...\n");

  let successCount = 0;
  let failCount = 0;

  for (const bot of BOTS) {
    process.stdout.write(`  ${bot.name}... `);

    // 1. Search Pexels for a real photo
    const avatarUrl = await searchPexelsPhoto(bot.query, bot.orientation);
    if (!avatarUrl) {
      console.log(`✗ No photo found (query: "${bot.query}")`);
      failCount++;
      continue;
    }

    try {
      // 2. Update author_avatar on all posts by this bot
      await patchTable("posts", "author_email", bot.email, { author_avatar: avatarUrl });

      // 3. Try updating sport_profiles too (may not exist for all bots)
      try {
        await patchTable("sport_profiles", "user_email", bot.email, { avatar_url: avatarUrl });
      } catch (_) {
        // Sport profiles may not have this bot — that's fine
      }

      // 4. Update profiles.avatar_url (the main profile table used by the app)
      try {
        await patchTable("profiles", "email", bot.email, { avatar_url: avatarUrl });
      } catch (_) {
        // Profile may not exist for channel bots — that's fine
      }

      console.log(`✓ Updated → ${avatarUrl.slice(0, 80)}...`);
      successCount++;
    } catch (err) {
      console.log(`✗ DB update failed: ${err.message}`);
      failCount++;
    }

    // Small delay to be respectful to Pexels rate limits
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅ Done! ${successCount} bots updated, ${failCount} failed.`);
  console.log("\nRefresh the Sportsphere feed to see real athlete photos.");
  if (failCount > 0) {
    console.log(`\n💡 For failed bots, you can manually set avatar URLs by editing`);
    console.log(`   the BOTS array and re-running: node tools/update_bot_avatars.mjs`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
