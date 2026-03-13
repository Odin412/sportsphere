/**
 * seed_media_boost.mjs — Inject photos, videos, and multi-image carousels
 * into existing bot posts and seed fresh media-rich posts.
 *
 * WHAT IT DOES:
 *   1. Fetches sport-specific photos + videos from Pexels
 *   2. Updates ~60% of existing text-only bot posts to add a photo
 *   3. Updates ~15% to add a short video (mp4)
 *   4. Seeds 30 new carousel posts (2–3 images each)
 *   5. Seeds 20 new standalone video posts with captions
 *
 * Usage:  node tools/seed_media_boost.mjs
 */

const SUPABASE_URL  = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";
const PEXELS_KEY    = "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";

// ─── BOT ROSTER ───────────────────────────────────────────────────────────────
const BOTS = [
  { email: "espn-news@sportsphere.app",      name: "ESPN SportsSphere",      sport: null         },
  { email: "nba-daily@sportsphere.app",       name: "NBA Daily",              sport: "Basketball" },
  { email: "premier-league@sportsphere.app",  name: "Premier League HQ",      sport: "Soccer"     },
  { email: "ufc-hub@sportsphere.app",         name: "UFC Fight Hub",          sport: "MMA"        },
  { email: "olympic-sports@sportsphere.app",  name: "Olympic Sports Network", sport: null         },
  { email: "jordan.williams@sportsphere.app", name: "Jordan Williams",        sport: "Basketball" },
  { email: "marcus.silva@sportsphere.app",    name: "Marcus Silva",           sport: "Soccer"     },
  { email: "emma.chen@sportsphere.app",       name: "Emma Chen",              sport: "Tennis"     },
  { email: "tyler.brooks@sportsphere.app",    name: "Tyler Brooks",           sport: "Football"   },
  { email: "sofia.rodriguez@sportsphere.app", name: "Sofia Rodriguez",        sport: "Swimming"   },
  { email: "jack.obrien@sportsphere.app",     name: "Jack O'Brien",           sport: "Golf"       },
  { email: "aisha.mohammed@sportsphere.app",  name: "Aisha Mohammed",         sport: "Track"      },
  { email: "ryan.park@sportsphere.app",       name: "Ryan Park",              sport: "Hockey"     },
  { email: "diego.fernandez@sportsphere.app", name: "Diego Fernandez",        sport: "Baseball"   },
  { email: "zara.mitchell@sportsphere.app",   name: "Zara Mitchell",          sport: "CrossFit"   },
];

const BOT_EMAILS = BOTS.map(b => b.email);

// ─── PEXELS QUERIES PER SPORT ─────────────────────────────────────────────────
const PHOTO_QUERIES = {
  Basketball: ["basketball game action dunk", "basketball player training court", "nba basketball crowd"],
  Soccer:     ["soccer football game goal", "football player stadium crowd", "soccer training pitch"],
  Tennis:     ["tennis player match court", "tennis serve action", "wimbledon tennis court"],
  Football:   ["american football game touchdown", "nfl football player action", "football stadium crowd"],
  Swimming:   ["swimming pool athlete race", "swimmer backstroke action", "swimming training lane"],
  Golf:       ["golf player swing course", "golf fairway athlete", "golf putting green"],
  Track:      ["runner sprint track athlete", "running race finish line", "track field athlete action"],
  Hockey:     ["ice hockey player game", "hockey puck rink athlete", "hockey goal celebration"],
  Baseball:   ["baseball pitcher mound", "baseball batter swing", "baseball stadium crowd"],
  CrossFit:   ["crossfit barbell lift athlete", "crossfit gym workout", "weightlifting athlete"],
  MMA:        ["martial arts fighter training", "boxing athlete gym", "mma fighter action"],
  General:    ["sports athlete stadium crowd", "sports action highlight", "sports celebration win"],
};

const VIDEO_QUERIES = {
  Basketball: ["basketball game action",   "basketball player training"],
  Soccer:     ["soccer football game",     "football training pitch"],
  Tennis:     ["tennis match court",       "tennis player serve"],
  Football:   ["american football game",   "football training"],
  Swimming:   ["swimming pool race",       "swimmer training"],
  Golf:       ["golf swing course",        "golf player action"],
  Track:      ["running sprint race",      "runner track field"],
  Hockey:     ["ice hockey game",          "hockey player rink"],
  Baseball:   ["baseball game pitcher",    "baseball batter"],
  CrossFit:   ["crossfit workout gym",     "weightlifting athlete"],
  MMA:        ["martial arts training",    "boxing gym workout"],
  General:    ["sports action highlight",  "sports athlete training"],
};

// ─── CAROUSEL / VIDEO CAPTIONS ────────────────────────────────────────────────
const CAROUSEL_CAPTIONS = {
  Basketball: [
    "Morning shootaround → afternoon game → ice bath. This is the routine 🏀📸",
    "Behind the scenes of game day. Every moment matters.",
    "Practice doesn't end until the reps are automatic. Swipe to see the work.",
    "Week in the life. Court, weights, recovery, repeat. 👀",
    "Game prep looks different for everyone. This is mine 🏀",
  ],
  Soccer:     [
    "Match day, training day, rest day — all documented. The beautiful game never stops ⚽",
    "Behind the scenes at the training ground. Swipe through 👟",
    "From pitch to gym to treatment table. Full week in photos.",
    "Pre-match ritual, warmup, and the celebrations after. 🙌",
    "The work no one sees until Sunday. Here's your inside look ⚽",
  ],
  Tennis:     [
    "Practice court → match court → ice. Every day the same. Every day worth it 🎾",
    "Serve mechanics, footwork drills, match footage. All in a week.",
    "Behind the baseline: a week in photos. The grind is real 📸",
  ],
  Football:   [
    "Film, lift, practice, repeat. Swipe through the week 🏈",
    "Behind the helmet — the prep that goes into game day 🏈",
    "From walkthrough to final whistle. Full game day documented.",
  ],
  Swimming:   [
    "6am pool session → weights → nutrition → repeat 🏊‍♀️ Swipe for the full day.",
    "Three sessions today. The taper is almost here. Worth it.",
    "Lane 4, every morning. The view never gets old. 📸",
  ],
  Golf:       [
    "Practice round to tournament round. Swipe through the process ⛳",
    "Range, short game, putting. Three hours before the round even starts.",
    "Course management in photos: what I'm thinking on every shot 🏌️",
  ],
  Track:      [
    "Block start drills → speed work → cool down. Swipe the full session 🏃",
    "Meet day documented: warmup, call room, race, celebrations.",
    "Sprint mechanics look effortless on the track. Here's what it actually takes 📸",
  ],
  Hockey:     [
    "Ice time, weight room, recovery. The full day behind the game 🏒",
    "Swipe through the best moments from this road trip 🎭",
    "Pre-skate routine → game → locker room celebration. A day in the life.",
  ],
  Baseball:   [
    "BP, bullpen session, game, film. Full game day documented ⚾",
    "Pregame rituals and post-win celebration. Swipe through 📸",
    "From mound to dugout — a start day in photos ⚾",
  ],
  CrossFit:   [
    "WOD breakdown: before, during, and after the pain 🏋️‍♀️ Swipe through.",
    "Open prep week in photos. The work is ugly before it's beautiful.",
    "PR attempt day — warm up, the lift, the reaction 💪",
  ],
  MMA:        [
    "Camp week 3. Wrestling, striking, conditioning. Swipe the full day 🥋",
    "Behind the training camp — what it really takes to prepare 🥊",
    "Final week before fight night. The mind and body are ready 🔥",
  ],
  General:    [
    "A week in sports — swipe through the best moments 📸",
    "Behind the scenes: what nobody sees until fight night, game day, race day.",
    "Highlights from the week. The grind, the gains, the glory 🏆",
  ],
};

const VIDEO_CAPTIONS = {
  Basketball: [
    "Clip from last night's practice. The work doesn't lie 🏀🎥",
    "Shootaround vibes before tip-off. Locked in.",
    "Drills that built the handles. Repetition is everything.",
    "Game clip from last week. See you on the court 🏀",
  ],
  Soccer:     [
    "Training ground footage. Touch, pass, move. Repeat ⚽🎥",
    "Set piece practice. We're drilling this until it's automatic.",
    "Match day warm-up. The pitch is where everything makes sense.",
    "Goal from last weekend. Still smiling ⚽",
  ],
  Tennis:     [
    "Serve practice on camera. Breaking down the mechanics 🎾🎥",
    "Footwork drills that most people skip. Don't skip them.",
    "Match footage from last week's tournament 🎾",
  ],
  Football:   [
    "Route running drill from today's practice. Details matter 🏈🎥",
    "Film room told me this. The field proved it.",
    "Conditioning day footage. This is where games are won 🏈",
  ],
  Swimming:   [
    "Underwater camera from today's session. The flip turn is everything 🏊🎥",
    "Split times from this morning. The taper is working.",
    "Race footage from last weekend. Nearly there 🏊",
  ],
  Golf:       [
    "Swing analysis from today's range session. Working on the transition ⛳🎥",
    "Short game practice — the shots that save strokes.",
    "Round highlights — three birdies and a tap-in eagle ⛳",
  ],
  Track:      [
    "Block starts from this morning's session on film 🏃🎥",
    "Time trial footage. Chasing that PR every single day.",
    "Race from last weekend — new season best 🏃",
  ],
  Hockey:     [
    "Edge work drills on film. Foundation of everything on the ice 🏒🎥",
    "Power play practice footage. The setup is dialed in.",
    "Game highlights from last night's W 🏒",
  ],
  Baseball:   [
    "Bullpen session on camera. Fastball is moving well today ⚾🎥",
    "Swing analysis from cage work this morning.",
    "Strikeout from last night's start. The movement was filthy ⚾",
  ],
  CrossFit:   [
    "WOD from today — posted the score on the board 🏋️🎥",
    "Clean and jerk PR attempt filmed. New weight, new level.",
    "Open workout footage from last weekend. Left it all on the floor 💪",
  ],
  MMA:        [
    "Sparring session from camp. Sharp and ready 🥋🎥",
    "Bag work combo. Hands, kicks, level change. Repeat.",
    "Live rolling from last night. Submission defense is improving 🥊",
  ],
  General:    [
    "Game clip from last week. Sports never get old 🎥",
    "Practice footage — the grind behind the highlight reel.",
    "Behind the scenes of a training session 🎬",
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function recentDate(maxDaysAgo = 5) {
  const d = new Date();
  d.setTime(d.getTime() - Math.random() * maxDaysAgo * 86400000);
  d.setMinutes(rand(0, 59));
  d.setSeconds(rand(0, 59));
  return d.toISOString();
}

function randLikes(count, pool) {
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

// ─── PEXELS API ───────────────────────────────────────────────────────────────
async function fetchPhotos(query, count = 8) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const json = await res.json();
    return (json.photos || []).map(p => p.src?.large2x || p.src?.large || p.src?.medium).filter(Boolean);
  } catch (e) {
    console.warn(`  ⚠ Photo fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

async function fetchVideos(query, count = 5) {
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const json = await res.json();
    const videos = (json.videos || []).map(v => {
      // Prefer HD, fall back to SD
      const hd = v.video_files?.find(f => f.quality === 'hd' && f.file_type === 'video/mp4');
      const sd = v.video_files?.find(f => f.quality === 'sd' && f.file_type === 'video/mp4');
      return (hd || sd)?.link;
    }).filter(Boolean);
    return videos;
  } catch (e) {
    console.warn(`  ⚠ Video fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const HEADERS = {
  Authorization: `Bearer ${SERVICE_ROLE}`,
  apikey: SERVICE_ROLE,
  "Content-Type": "application/json",
};

async function fetchBotPosts() {
  const emailFilter = BOT_EMAILS.map(e => `author_email.eq.${e}`).join(",");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?or=(${emailFilter})&select=id,author_email,media_urls&limit=2000`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`Fetch posts failed: ${await res.text()}`);
  return await res.json();
}

async function updatePostMedia(id, media_urls) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify({ media_urls }),
  });
  if (!res.ok) throw new Error(`Update post ${id} failed: ${await res.text()}`);
}

async function insertPosts(posts) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify(posts),
  });
  if (!res.ok) throw new Error(`Insert failed (${res.status}): ${await res.text()}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🎬 Sportsphere Media Boost Script\n");

  // ── Step 1: Load all sport media ──────────────────────────────────────────
  console.log("📡 Fetching photos and videos from Pexels...");

  const photoPool = {};
  const videoPool = {};

  const sports = [...new Set(BOTS.map(b => b.sport).filter(Boolean))];
  sports.push("General");

  for (const sport of sports) {
    const queries = PHOTO_QUERIES[sport] || PHOTO_QUERIES.General;
    const vQueries = VIDEO_QUERIES[sport] || VIDEO_QUERIES.General;

    const photos = [];
    for (const q of queries) {
      const batch = await fetchPhotos(q, 6);
      photos.push(...batch);
      await new Promise(r => setTimeout(r, 300)); // rate limit
    }
    photoPool[sport] = [...new Set(photos)]; // deduplicate

    const videos = [];
    for (const q of vQueries) {
      const batch = await fetchVideos(q, 4);
      videos.push(...batch);
      await new Promise(r => setTimeout(r, 300));
    }
    videoPool[sport] = [...new Set(videos)];

    console.log(`  ✓ ${sport}: ${photoPool[sport].length} photos, ${videoPool[sport].length} videos`);
  }

  // ── Step 2: Patch existing text-only posts ────────────────────────────────
  console.log("\n🔧 Patching existing text-only bot posts with media...");
  const allBotPosts = await fetchBotPosts();
  const textOnly = allBotPosts.filter(p => !p.media_urls || p.media_urls.length === 0);
  console.log(`   Found ${textOnly.length} text-only posts to enrich`);

  // Track photo/video usage per sport to rotate through pool
  const photoIdx = {};
  const videoIdx = {};
  sports.forEach(s => { photoIdx[s] = 0; videoIdx[s] = 0; });

  let patched = 0;
  let skipped = 0;

  for (const post of shuffle(textOnly)) {
    const bot = BOTS.find(b => b.email === post.author_email);
    const sport = bot?.sport || "General";
    const photos = photoPool[sport] || photoPool.General || [];
    const videos = videoPool[sport] || videoPool.General || [];

    const roll = Math.random();

    // ~50% get a photo, ~15% get a video, ~35% stay text
    if (roll < 0.50 && photos.length > 0) {
      const idx = photoIdx[sport] % photos.length;
      photoIdx[sport]++;
      try {
        await updatePostMedia(post.id, [photos[idx]]);
        patched++;
        await new Promise(r => setTimeout(r, 80)); // gentle rate limit
      } catch (e) {
        console.warn(`  ⚠ Failed to patch ${post.id}: ${e.message}`);
      }
    } else if (roll < 0.65 && videos.length > 0) {
      const idx = videoIdx[sport] % videos.length;
      videoIdx[sport]++;
      try {
        await updatePostMedia(post.id, [videos[idx]]);
        patched++;
        await new Promise(r => setTimeout(r, 80));
      } catch (e) {
        console.warn(`  ⚠ Failed to patch ${post.id}: ${e.message}`);
      }
    } else {
      skipped++;
    }

    if ((patched + skipped) % 20 === 0) {
      process.stdout.write(`\r   Processed ${patched + skipped}/${textOnly.length} (${patched} patched)`);
    }
  }
  console.log(`\n   ✅ Patched ${patched} posts, kept ${skipped} as text-only`);

  // ── Step 3: Seed new carousel posts (2–3 images) ──────────────────────────
  console.log("\n🖼  Seeding carousel posts (2–3 images)...");
  const newPosts = [];

  for (const bot of BOTS.filter(b => b.sport)) {
    const sport = bot.sport;
    const photos = shuffle(photoPool[sport] || photoPool.General || []);
    const captions = CAROUSEL_CAPTIONS[sport] || CAROUSEL_CAPTIONS.General;

    // 2–3 carousel posts per athlete bot
    for (let i = 0; i < 3 && photos.length >= 2; i++) {
      const imgCount = rand(2, Math.min(3, photos.length));
      const imgs = photos.splice(0, imgCount); // consume unique photos

      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: BOTS.find(b2 => b2.email === bot.email)?.avatar || "",
        content: pick(captions),
        sport,
        category: "training",
        media_urls: imgs,
        likes: randLikes(rand(12, 85), BOT_EMAILS),
        views: rand(400, 6000),
        comments_count: rand(2, 30),
        shares: rand(0, 15),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(5),
      });
    }
  }

  // ── Step 4: Seed new standalone video posts ────────────────────────────────
  console.log("🎥 Seeding standalone video posts...");

  for (const bot of BOTS.filter(b => b.sport)) {
    const sport = bot.sport;
    const videos = shuffle(videoPool[sport] || videoPool.General || []);
    const captions = VIDEO_CAPTIONS[sport] || VIDEO_CAPTIONS.General;

    // 2 video posts per athlete bot
    for (let i = 0; i < 2 && videos.length > 0; i++) {
      const vid = videos.splice(0, 1)[0];

      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: BOTS.find(b2 => b2.email === bot.email)?.avatar || "",
        content: pick(captions),
        sport,
        category: "reel",
        media_urls: [vid],
        likes: randLikes(rand(18, 120), BOT_EMAILS),
        views: rand(600, 10000),
        comments_count: rand(3, 45),
        shares: rand(1, 25),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(4),
      });
    }
  }

  // Channel bots also get video posts
  for (const bot of BOTS.filter(b => b.type === "channel" || !b.sport)) {
    const videos = shuffle(videoPool.General || []);
    for (let i = 0; i < 3 && videos.length > 0; i++) {
      const vid = videos.splice(0, 1)[0];
      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: BOTS.find(b2 => b2.email === bot.email)?.avatar || "",
        content: pick(VIDEO_CAPTIONS.General),
        sport: null,
        category: "reel",
        media_urls: [vid],
        likes: randLikes(rand(30, 200), BOT_EMAILS),
        views: rand(1000, 15000),
        comments_count: rand(5, 60),
        shares: rand(2, 40),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(3),
      });
    }
  }

  // ── Step 5: Insert new posts ───────────────────────────────────────────────
  console.log(`\n⬆️  Inserting ${newPosts.length} new media posts...`);
  const BATCH = 20;
  let inserted = 0;
  for (let i = 0; i < newPosts.length; i += BATCH) {
    const batch = newPosts.slice(i, i + BATCH);
    try {
      await insertPosts(batch);
      inserted += batch.length;
      process.stdout.write(`\r   ${inserted}/${newPosts.length} inserted`);
    } catch (e) {
      console.error(`\n  ✗ Batch failed: ${e.message}`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const carouselCount = newPosts.filter(p => p.media_urls.length > 1).length;
  const videoCount = newPosts.filter(p => {
    const u = p.media_urls[0] || "";
    return u.includes(".mp4") || u.includes("pexels.com/video");
  }).length;
  const photoCount = newPosts.length - videoCount;

  console.log(`\n\n✅ Media boost complete!`);
  console.log(`   🔧 Existing posts patched with media: ${patched}`);
  console.log(`   🖼  New carousel posts (2-3 images):   ${carouselCount}`);
  console.log(`   🎥 New video posts:                    ${videoCount}`);
  console.log(`   📸 New photo posts:                    ${photoCount - carouselCount}`);
  console.log(`\n   Refresh the Sportsphere feed — your timeline should now be full of visual content 🎬`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
