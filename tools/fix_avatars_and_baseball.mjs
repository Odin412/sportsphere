/**
 * fix_avatars_and_baseball.mjs
 * ────────────────────────────
 * 1. Replaces ALL bot/persona DiceBear avatars with real Pexels photos
 *    (covers all 40 @sportsphere.app accounts, not just the original 15)
 * 2. Seeds 120+ baseball/softball posts (photos + videos) to make
 *    baseball/softball the clearly dominant content on the feed
 *
 * Usage:  node tools/fix_avatars_and_baseball.mjs
 */

const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";
const PEXELS_KEY  = "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";

// ─── FULL BOT ROSTER WITH AVATAR QUERIES ──────────────────────────────────────
// All @sportsphere.app accounts — seed bots + persona bots
const ALL_BOTS = [
  // ── Original 5 channel bots ──────────────────────────────────────────────────
  { email: "espn-news@sportsphere.app",      name: "ESPN SportsSphere",      query: "sports television broadcast studio screen",         orientation: "landscape", isOrg: true },
  { email: "nba-daily@sportsphere.app",      name: "NBA Daily",              query: "basketball court arena lights empty",               orientation: "landscape", isOrg: true },
  { email: "premier-league@sportsphere.app", name: "Premier League HQ",      query: "football soccer stadium pitch green aerial",        orientation: "landscape", isOrg: true },
  { email: "ufc-hub@sportsphere.app",        name: "UFC Fight Hub",          query: "octagon boxing ring fighting cage",                  orientation: "landscape", isOrg: true },
  { email: "olympic-sports@sportsphere.app", name: "Olympic Sports Network", query: "olympic stadium athletics track ceremony",           orientation: "landscape", isOrg: true },
  { email: "sports-daily@sportsphere.app",   name: "Sports Daily Network",   query: "sports news broadcast desk studio",                 orientation: "landscape", isOrg: true },

  // ── Baseball / Softball ATHLETE bots ─────────────────────────────────────────
  { email: "diego.fernandez@sportsphere.app", name: "Diego Fernandez",   query: "young hispanic male baseball pitcher mound portrait",    orientation: "portrait" },
  { email: "marcus.bb@sportsphere.app",       name: "Marcus Williams",   query: "young black man baseball player portrait athletic",       orientation: "portrait" },
  { email: "derek.bb@sportsphere.app",        name: "Derek Santos",      query: "young hispanic baseball outfielder portrait sport",       orientation: "portrait" },

  // ── Baseball / Softball PARENT bots ──────────────────────────────────────────
  { email: "jake.dad@sportsphere.app",    name: "Mike Thompson",     query: "middle aged man father casual smile portrait",            orientation: "portrait" },
  { email: "emma.mom@sportsphere.app",    name: "Sarah Collins",     query: "middle aged woman mom smiling casual portrait",           orientation: "portrait" },
  { email: "aiden.dad@sportsphere.app",   name: "James Rivera",      query: "hispanic man father casual portrait smiling",             orientation: "portrait" },
  { email: "mia.mom@sportsphere.app",     name: "Lisa Chen",         query: "asian woman mom casual smiling portrait",                 orientation: "portrait" },
  { email: "tyler.dad@sportsphere.app",   name: "David Martinez",    query: "middle aged hispanic man casual portrait confident",      orientation: "portrait" },
  { email: "riley.mom@sportsphere.app",   name: "Jennifer Wright",   query: "woman mom sporty casual outdoor portrait",               orientation: "portrait" },
  { email: "noah.dad@sportsphere.app",    name: "Chris Johnson",     query: "man dad casual outdoor portrait smiling",                orientation: "portrait" },
  { email: "chloe.mom@sportsphere.app",   name: "Amanda Torres",     query: "latina woman casual portrait smiling outdoors",           orientation: "portrait" },
  { email: "multisport.mom@sportsphere.app", name: "Rachel Kim",     query: "asian woman mom casual portrait smiling sporty",          orientation: "portrait" },
  { email: "allsports.mike@sportsphere.app", name: "Mike Patterson", query: "man sports fan casual portrait confident",               orientation: "portrait" },

  // ── Other sport ATHLETE bots ──────────────────────────────────────────────────
  { email: "jordan.williams@sportsphere.app", name: "Jordan Williams",  query: "young black basketball player training gym portrait",    orientation: "portrait" },
  { email: "marcus.silva@sportsphere.app",    name: "Marcus Silva",     query: "young male soccer player portrait athletic",             orientation: "portrait" },
  { email: "emma.chen@sportsphere.app",       name: "Emma Chen",        query: "young asian female tennis player portrait sport",         orientation: "portrait" },
  { email: "tyler.brooks@sportsphere.app",    name: "Tyler Brooks",     query: "young man american football player athlete portrait",     orientation: "portrait" },
  { email: "sofia.rodriguez@sportsphere.app", name: "Sofia Rodriguez",  query: "young latina female swimmer athlete portrait",            orientation: "portrait" },
  { email: "jack.obrien@sportsphere.app",     name: "Jack O'Brien",     query: "young male golfer athlete outdoor portrait",             orientation: "portrait" },
  { email: "aisha.mohammed@sportsphere.app",  name: "Aisha Mohammed",   query: "young black female runner track athlete portrait",        orientation: "portrait" },
  { email: "ryan.park@sportsphere.app",       name: "Ryan Park",        query: "young asian male athlete sport portrait gym",             orientation: "portrait" },
  { email: "zara.mitchell@sportsphere.app",   name: "Zara Mitchell",    query: "young woman crossfit athlete gym training portrait",      orientation: "portrait" },
  { email: "jaylen.bk@sportsphere.app",       name: "Jaylen Carter",    query: "young black man basketball player portrait confident",    orientation: "portrait" },
  { email: "trevon.fb@sportsphere.app",       name: "Trevon Jackson",   query: "young black man football player portrait athletic",       orientation: "portrait" },
  { email: "diego.sc@sportsphere.app",        name: "Diego Herrera",    query: "young hispanic male soccer player portrait",             orientation: "portrait" },

  // ── Coach / Organization bots ─────────────────────────────────────────────────
  { email: "coach.davis.bk@sportsphere.app",    name: "Coach Marcus Davis",  query: "man coach basketball training portrait confident",     orientation: "portrait" },
  { email: "coach.williams.fb@sportsphere.app", name: "Coach Ray Williams",  query: "man football coach sideline portrait serious",         orientation: "portrait" },
  { email: "coach.alex.sc@sportsphere.app",     name: "Coach Alex Petrov",   query: "man soccer coach training ground portrait",            orientation: "portrait" },
  { email: "hoops-academy@sportsphere.app",     name: "Midwest Hoops Academy", query: "basketball gym court youth training",               orientation: "landscape", isOrg: true },

  // ── Fan bots ──────────────────────────────────────────────────────────────────
  { email: "hoopsfan23@sportsphere.app",    name: "Marcus Bell",   query: "young man sports fan casual portrait smiling",          orientation: "portrait" },
  { email: "jordan.bkmom@sportsphere.app",  name: "Keisha Williams", query: "black woman mom casual portrait smiling warm",         orientation: "portrait" },
  { email: "gridiron.guru@sportsphere.app", name: "Tony Morales",  query: "hispanic man casual sports fan portrait smiling",       orientation: "portrait" },
  { email: "cam.fbdad@sportsphere.app",     name: "Robert Mitchell", query: "black man father dad casual portrait smiling",         orientation: "portrait" },
  { email: "sofia.scmom@sportsphere.app",   name: "Maria Gonzalez", query: "latina woman mom casual outdoor portrait smiling",     orientation: "portrait" },
];

// ─── BASEBALL / SOFTBALL DOMINANT CONTENT ────────────────────────────────────
const BB_BOTS = [
  { email: "diego.fernandez@sportsphere.app", name: "Diego Fernandez",  sport: "Baseball",  role: "athlete" },
  { email: "marcus.bb@sportsphere.app",       name: "Marcus Williams",  sport: "Baseball",  role: "athlete" },
  { email: "derek.bb@sportsphere.app",        name: "Derek Santos",     sport: "Baseball",  role: "athlete" },
  { email: "jake.dad@sportsphere.app",        name: "Mike Thompson",    sport: "Baseball",  role: "parent" },
  { email: "emma.mom@sportsphere.app",        name: "Sarah Collins",    sport: "Baseball",  role: "parent" },
  { email: "aiden.dad@sportsphere.app",       name: "James Rivera",     sport: "Baseball",  role: "parent" },
  { email: "mia.mom@sportsphere.app",         name: "Lisa Chen",        sport: "Softball",  role: "parent" },
  { email: "tyler.dad@sportsphere.app",       name: "David Martinez",   sport: "Baseball",  role: "parent" },
  { email: "riley.mom@sportsphere.app",       name: "Jennifer Wright",  sport: "Softball",  role: "parent" },
  { email: "noah.dad@sportsphere.app",        name: "Chris Johnson",    sport: "Baseball",  role: "parent" },
  { email: "chloe.mom@sportsphere.app",       name: "Amanda Torres",    sport: "Softball",  role: "parent" },
  { email: "espn-news@sportsphere.app",       name: "ESPN SportsSphere", sport: "Baseball", role: "channel" },
];

const ALL_BOT_EMAILS = ALL_BOTS.map(b => b.email);

// ─── BASEBALL / SOFTBALL POST CONTENT ────────────────────────────────────────
const BB_ATHLETE_POSTS = [
  // Pitcher posts
  "Complete game tonight. 9 innings, 3 hits, 11 Ks. The defense was incredible behind me. That's what baseball is about ⚾",
  "Bullpen session felt elite today. Fastball sitting 93-95, slider has a new wrinkle. Opponents better be ready.",
  "Start day rituals: same playlist, same warmup, same visualization. Routine is everything on the mound.",
  "7 innings, 2 earned, 9 punchouts. We take the W and move on. Next one is Friday 🤙",
  "Threw a two-seamer for the first time in a game situation today. The sink was NASTY. Adding it to the arsenal.",
  "Pitching is 90% mental. The physical stuff — velocity, spin rate — that's a given at this level. The head game separates.",
  "Strikeout to end the inning. That slider is doing things 🎯 Working on location this whole offseason.",
  "My ERA through 8 starts: 2.14. The work in the offseason is showing up. Keep grinding ⚾",
  // Position player posts
  "3-for-4 with a double and an RBI. The barrel found the ball today. We stay hot.",
  "Walk-off base hit in the bottom of the 9th. The dugout erupted. Pure baseball magic.",
  "Went yard twice tonight. BP was locked in — that's where it starts.",
  "Turned a 4-6-3 DP in the 7th inning to strand two runners. Defense wins games. Full stop.",
  "Went 0-for-3 tonight. That's baseball. Film tomorrow, back in the cage, reset. Never stop adjusting.",
  "Stolen base game-winner. First step quicker than I've ever felt. The speed work is paying off 💨",
  "Spring training energy is different. Fresh start, new goals, same grind ⚾",
  "Offseason lift PR on squats today — 365 lbs. The legs generate the power. Everything is connected.",
  "Minor league bus rides teach you things you can't learn anywhere else. This game builds character.",
  "Called up for the first time. From travel ball fields to affiliated ball. The dream is alive ⚾🙏",
];

const SB_ATHLETE_POSTS = [
  "Circle change movement was filthy today. Dropped off the table in the dirt. Batters have no chance 🥎",
  "Pitched 5 innings, gave up 1 run, struck out 8. These girls behind me are unreal defenders.",
  "First home run of the summer. Crushed a rise ball that stayed up. The bat speed is there 🥎",
  "Showcased for 12 coaches today. Velocity was up to 68. The hard work is showing on the radar gun.",
  "Softball is the most mentally demanding sport I know. Three seconds to process, react, execute. Or fail. No in between.",
  "Infield double play from third to second to first. Hours of reps in practice paying off in the biggest moments.",
  "Headed to the Batters Box tournament this weekend. This team is playing the best ball we've played all summer.",
  "Got my first D1 offer today. I cried in the car and called my parents immediately. Hard work pays off 🥎🙏",
];

const BB_PARENT_POSTS_WITH_CONTEXT = [
  // Game day / tournament
  "Tournament bracket posted. Seeds 3rd. If we play our game, nobody in this bracket can stop us. Let's go ⚾",
  "Game 1 of pool play: WIN. Offense woke up late but pitching was dominant. Moving to bracket play tomorrow.",
  "Championship Sunday. If you know travel ball, you know what Sunday of a big tournament feels like. Everything on the line.",
  "Down 6-2 in the 5th. These kids came back to win 8-7. I was shaking. What a weekend ⚾",
  "First tournament of the spring season. Rust is off, bats are hot, pitching is sharp. Let's get it.",
  "Three games today. Two wins and a close loss in extras. Kids played their hearts out all day.",
  "We finished 2nd in a 32-team bracket. Silver medal stings a little but the boys grew so much this tournament.",
  "Rained out at 6am. Tournament rescheduled. We drove 4 hours for this. Travel ball life, folks.",
  // Milestones
  "Jake hit his first varsity home run tonight. 16 years old and already getting D3 attention. Couldn't be more proud ⚾",
  "Emma pitched a perfect game through 5 today. Every parent's jaw was on the ground. She's something special.",
  "College coach at the game today specifically to see our kid. Trying to stay casual. Internally I'm a mess.",
  "Signed NLI today! From 8U rec ball to a full scholarship. This journey has been everything 🥎🎓",
  "Riley just got invited to the USA Softball national ID camp. We are overwhelmed. Years of sacrifice worth it.",
  "His first strikeout from the mound in live game action. A 10-year-old finding his moment. Pure joy ⚾",
  // Showcase / recruiting
  "PBR event recap: velocity up to 87, exit velo 98 mph. The numbers are trending the right direction.",
  "Showcase this weekend across 4 teams. 23 college coaches logged in for our kid. This is surreal.",
  "D1 offer #3 came in today. The process is real. Every early morning practice built to this moment.",
  "Perfect Game rankings just updated. The rankings are a snapshot, not the full picture — but still exciting.",
  "WWBA national tournament on the horizon. This is the stage where futures are made. Ready to compete.",
  // Humor / relatability
  "Current financial status: tournament fees paid. Equipment bought. Hotel booked. Gas tank full. Pray for me.",
  "Tournament hot dog: $9. Powerade: $6. Watching your kid throw a shutout inning: priceless. Worth every cent.",
  "My folding chair, my sunscreen, my snack bag, and my broken voice from cheering. Travel ball starter kit.",
  "Six hour drive for a 7am game in 38 degree weather. This is love. No other explanation.",
  "Just found 4 batting gloves, 2 helmets, 6 batting practice balls, and a missing cleat in my trunk. We're prepared.",
  "The umpire angle challenge after a close call at the plate is actually a valid parenting skill at this point.",
  // Community / perspective
  "Remind yourself why kids play sports. Fun, friendship, character. Not rankings, not offers. Keep perspective.",
  "Travel ball dad at 6am: half asleep. Travel ball dad at first pitch: fully locked in. Every single time.",
  "The relationships these kids build on travel ball teams last decades. That part never gets talked about enough.",
  "Watching my son help up a kid from the other team who got hit by a pitch. That right there is the whole point.",
  "Our team chaplain spoke before the tournament today. Faith, family, baseball. In that order. Grateful for this community.",
];

const BB_CHANNEL_POSTS = [
  "PREP BASEBALL RANKINGS UPDATE: The top 10 has shuffled after a wild travel ball weekend. Full breakdown below 👇⚾",
  "COMMITTED: [CF, 2027] makes his college decision official. Three offers on the table — he chose his dream school.",
  "VELOCITY WATCH: Three uncommitted RHPs ran their fastballs up to 90+ mph this weekend at the Futures Game. Names to watch.",
  "SHOWCASES THIS WEEKEND: 14 major events across 8 states. Every D1 program in the country will have a scout on site.",
  "BREAKING: One of the most recruited softball players in the 2026 class just committed to a Power 5 program.",
  "TOURNAMENT RECAP: 48 teams, 3 days, one champion. The bracket was historic. Full breakdown and player awards ⚾",
  "TOP PLAY OF THE WEEK: A diving catch in center field that nobody should be able to make. Sports camera caught every frame.",
  "DRAFT ELIGIBLE: This week we profile 5 seniors who could hear their name called in the upcoming MLB Draft. Film study inside.",
  "COLLEGE SIGNING DAY THREAD: Drop your kid's commitment below. Let's celebrate the class of athletes heading to the next level! ⚾🎓",
  "RANKING REPORT: The top travel ball programs in the Southeast heading into championship season. Who's peaking at the right time?",
];

// ─── PHOTO QUERIES FOR BASEBALL/SOFTBALL ────────────────────────────────────
const BB_PHOTO_QUERIES = [
  "baseball pitcher mound throwing",
  "baseball player batting swing action",
  "baseball catcher behind plate",
  "baseball outfielder catch running",
  "baseball stadium crowd game",
  "youth baseball team dugout",
  "baseball diamond field aerial",
  "softball pitcher windmill delivery",
  "softball player batting",
  "softball catcher gear game",
  "baseball batting cage practice",
  "baseball player sliding base",
  "baseball travel ball tournament youth",
  "baseball glove ball equipment close",
  "softball game action youth",
];

const BB_VIDEO_QUERIES = [
  "baseball pitcher throw",
  "baseball batting practice",
  "baseball game stadium",
  "softball game action",
  "baseball youth game",
];

// ─── PHOTO / VIDEO CAPTIONS ──────────────────────────────────────────────────
const BB_PHOTO_CAPTIONS_ATHLETE = [
  "On the mound. In the zone. ⚾",
  "Pre-game warmup. Same routine, every single time.",
  "Between starts, the work doesn't stop.",
  "Cage work this morning. 200 swings before anyone else showed up.",
  "Film review turned into extra bullpen work. No days off.",
  "The mound is home. That 60 feet 6 inches is mine ⚾",
  "Exit velo up. Bat speed up. Confidence up. 📈",
  "Fielding 200 ground balls before practice starts. That's the standard we hold ourselves to.",
  "Charting every pitch from the dugout. The preparation is just as important as the execution.",
  "Trust the process. Trust the work. Let the game come to you ⚾",
];

const BB_PHOTO_CAPTIONS_PARENT = [
  "Tournament morning. Coffee in hand, lawn chair ready, camera charged. Let's go ⚾",
  "These fields have become our second home. Wouldn't trade it for anything.",
  "Pre-game warmups. Every parent quiet. Every kid locked in. This moment gets me every time.",
  "The infield dirt, the chalk lines, the dugout chatter. This is our whole weekend. Perfectly fine with that.",
  "10U games but the intensity is college level. These kids take it seriously. As they should ⚾",
  "Tournament bracket on the wall. Eyes on the prize. This team is ready.",
  "Showcase day. The cameras are rolling, coaches are watching. Our kid is locked in 🎯",
  "Rain delay snack run. This is what travel ball parents do on day 2 of a tournament.",
  "Parents in the bleachers, kids on the field, coaches in the dugout. Everyone exactly where they belong ⚾",
  "Postgame handshake line. Win or lose. That's the culture we're building.",
];

const BB_VIDEO_CAPTIONS = [
  "Bullpen footage from today. The breaking ball is biting 🎥⚾",
  "Batting practice clip — the exit velo numbers were jumping today.",
  "Pitching mechanics breakdown from last start. Working on the hip drive.",
  "Game footage from the weekend. Big plays, big moments.",
  "Tournament highlight reel — these kids are something special 🎬",
  "Warmup routine on film. These are the reps nobody sees but every coach notices.",
  "Infield practice before game day. The footwork is automatic at this point.",
  "Showcase footage — velocity, command, stuff all showing up on camera.",
];

const SB_PHOTO_CAPTIONS = [
  "On the circle. The delivery is automatic now 🥎",
  "Showcase day. Coaches in the stands, arm in the zone.",
  "Pre-game stretching with the team. These are the moments that stay with you.",
  "Batting practice with the girls. Everyone locked in today.",
  "Tournament field at sunrise. There is no better view 🥎",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function recentDate(maxDaysAgo = 6) {
  const d = new Date();
  d.setTime(d.getTime() - Math.random() * maxDaysAgo * 86400000);
  d.setMinutes(rand(0, 59));
  d.setSeconds(rand(0, 59));
  return d.toISOString();
}

function randLikes(count, pool) {
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

// ─── PEXELS ──────────────────────────────────────────────────────────────────
async function pexelsPhoto(query, orientation = "portrait") {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const json = await res.json();
    const photos = json.photos || [];
    if (!photos.length) return null;
    return photos[0].src?.medium || photos[0].src?.small || null;
  } catch (e) {
    console.warn(`  ⚠ Photo failed "${query}": ${e.message}`);
    return null;
  }
}

async function pexelsPhotoBatch(query, count = 8, orientation = "landscape") {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const json = await res.json();
    return (json.photos || []).map(p => p.src?.large2x || p.src?.large || p.src?.medium).filter(Boolean);
  } catch (e) {
    console.warn(`  ⚠ Photo batch failed "${query}": ${e.message}`);
    return [];
  }
}

async function pexelsVideo(query, count = 4) {
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const json = await res.json();
    return (json.videos || []).map(v => {
      const hd = v.video_files?.find(f => f.quality === 'hd' && f.file_type === 'video/mp4');
      const sd = v.video_files?.find(f => f.quality === 'sd' && f.file_type === 'video/mp4');
      return (hd || sd)?.link;
    }).filter(Boolean);
  } catch (e) {
    console.warn(`  ⚠ Video failed "${query}": ${e.message}`);
    return [];
  }
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const H = {
  Authorization: `Bearer ${SERVICE_ROLE}`,
  apikey: SERVICE_ROLE,
  "Content-Type": "application/json",
};

async function patch(table, filterKey, filterVal, data) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterVal)}`,
    { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(data) }
  );
  if (!res.ok) throw new Error(`PATCH ${table} failed: ${await res.text()}`);
}

async function insert(posts) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: "POST",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify(posts),
  });
  if (!res.ok) throw new Error(`Insert failed: ${await res.text()}`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("⚾ Sportsphere — Avatar Fix + Baseball Dominance Script\n");

  // ════════════════════════════════════════════════════════════════════
  // PART 1 — FIX ALL BOT AVATARS
  // ════════════════════════════════════════════════════════════════════
  console.log("━━━ PART 1: Fixing all bot avatars ━━━\n");

  let avatarOk = 0, avatarFail = 0;
  const avatarMap = {}; // email → url (for use in post seeds later)

  for (const bot of ALL_BOTS) {
    process.stdout.write(`  ${bot.name}... `);
    const url = await pexelsPhoto(bot.query, bot.orientation);

    if (!url) {
      console.log("✗ no photo found");
      avatarFail++;
      continue;
    }

    avatarMap[bot.email] = url;

    try {
      // Update profiles table
      await patch("profiles", "email", bot.email, { avatar_url: url });
      // Update all posts by this bot
      await patch("posts", "author_email", bot.email, { author_avatar: url });
      console.log("✓");
      avatarOk++;
    } catch (e) {
      console.log(`✗ DB error: ${e.message}`);
      avatarFail++;
    }

    await new Promise(r => setTimeout(r, 350));
  }

  console.log(`\n  ✅ Avatars: ${avatarOk} updated, ${avatarFail} failed\n`);

  // ════════════════════════════════════════════════════════════════════
  // PART 2 — SEED BASEBALL / SOFTBALL DOMINANT CONTENT
  // ════════════════════════════════════════════════════════════════════
  console.log("━━━ PART 2: Seeding baseball/softball content ━━━\n");

  // Fetch baseball/softball media
  console.log("📡 Fetching baseball/softball photos and videos from Pexels...");

  const bbPhotos = [];
  const sbPhotos = [];
  const bbVideos = [];

  for (const q of BB_PHOTO_QUERIES.slice(0, 10)) {
    const batch = await pexelsPhotoBatch(q, 6);
    bbPhotos.push(...batch);
    await new Promise(r => setTimeout(r, 300));
  }

  for (const q of BB_PHOTO_QUERIES.slice(10)) {
    const batch = await pexelsPhotoBatch(q, 5);
    if (q.includes("softball")) sbPhotos.push(...batch);
    else bbPhotos.push(...batch);
    await new Promise(r => setTimeout(r, 300));
  }

  for (const q of BB_VIDEO_QUERIES) {
    const batch = await pexelsVideo(q, 4);
    bbVideos.push(...batch);
    await new Promise(r => setTimeout(r, 300));
  }

  // Deduplicate
  const uniqueBBPhotos = [...new Set(bbPhotos)];
  const uniqueSBPhotos = [...new Set(sbPhotos)].length > 0 ? [...new Set(sbPhotos)] : uniqueBBPhotos.slice(-10);
  const uniqueBBVideos = [...new Set(bbVideos)];

  console.log(`  ⚾ Baseball photos: ${uniqueBBPhotos.length}`);
  console.log(`  🥎 Softball photos: ${uniqueSBPhotos.length}`);
  console.log(`  🎥 Videos: ${uniqueBBVideos.length}`);

  // Build posts
  const newPosts = [];
  let bbPhotoIdx = 0;
  let sbPhotoIdx = 0;
  let bbVideoIdx = 0;

  // ── Athlete posts ──────────────────────────────────────────────────────────
  const athleteBots = BB_BOTS.filter(b => b.role === "athlete");
  const allBBContent = [...BB_ATHLETE_POSTS, ...SB_ATHLETE_POSTS];

  for (const bot of athleteBots) {
    const isSoftball = bot.sport === "Softball";
    const photoPool = isSoftball ? uniqueSBPhotos : uniqueBBPhotos;
    const captions = bot.role === "athlete" ? BB_PHOTO_CAPTIONS_ATHLETE : BB_PHOTO_CAPTIONS_PARENT;
    const avatar = avatarMap[bot.email] || "";

    // 8 text posts per athlete bot
    for (let i = 0; i < 8; i++) {
      const roll = Math.random();
      let media = [];
      if (roll < 0.55 && photoPool.length > 0) {
        media = [photoPool[bbPhotoIdx % photoPool.length]];
        bbPhotoIdx++;
      } else if (roll < 0.75 && uniqueBBVideos.length > 0) {
        media = [uniqueBBVideos[bbVideoIdx % uniqueBBVideos.length]];
        bbVideoIdx++;
      }

      const content = media.length && roll < 0.55
        ? pick(captions)
        : pick(allBBContent);

      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: avatar,
        content,
        sport: bot.sport,
        category: content.match(/game|start|inning|at.bat|bullpen|pitch|swing/i) ? "game" : "training",
        media_urls: media,
        likes: randLikes(rand(10, 80), ALL_BOT_EMAILS),
        views: rand(300, 6000),
        comments_count: rand(2, 30),
        shares: rand(0, 15),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(6),
      });
    }

    // 2 carousel posts per athlete (2-3 images)
    for (let c = 0; c < 2 && photoPool.length >= 2; c++) {
      const imgs = [
        photoPool[bbPhotoIdx % photoPool.length],
        photoPool[(bbPhotoIdx + 1) % photoPool.length],
        ...(Math.random() > 0.5 ? [photoPool[(bbPhotoIdx + 2) % photoPool.length]] : []),
      ];
      bbPhotoIdx += imgs.length;

      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: avatar,
        content: pick(isSoftball ? SB_PHOTO_CAPTIONS : BB_PHOTO_CAPTIONS_ATHLETE),
        sport: bot.sport,
        category: "training",
        media_urls: imgs,
        likes: randLikes(rand(15, 90), ALL_BOT_EMAILS),
        views: rand(500, 7000),
        comments_count: rand(3, 35),
        shares: rand(1, 20),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(4),
      });
    }
  }

  // ── Parent posts ───────────────────────────────────────────────────────────
  const parentBots = BB_BOTS.filter(b => b.role === "parent");

  for (const bot of parentBots) {
    const isSoftball = bot.sport === "Softball";
    const photoPool = isSoftball ? uniqueSBPhotos : uniqueBBPhotos;
    const avatar = avatarMap[bot.email] || "";

    // 6 posts per parent bot
    for (let i = 0; i < 6; i++) {
      const roll = Math.random();
      let media = [];
      if (roll < 0.50 && photoPool.length > 0) {
        media = [photoPool[bbPhotoIdx % photoPool.length]];
        bbPhotoIdx++;
      }

      const content = media.length
        ? pick(BB_PHOTO_CAPTIONS_PARENT)
        : pick(BB_PARENT_POSTS_WITH_CONTEXT);

      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: avatar,
        content,
        sport: bot.sport,
        category: content.match(/tournament|game|showcase|PBR|Perfect Game/i) ? "game" : "community",
        media_urls: media,
        likes: randLikes(rand(8, 60), ALL_BOT_EMAILS),
        views: rand(200, 4000),
        comments_count: rand(2, 20),
        shares: rand(0, 10),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(5),
      });
    }
  }

  // ── Channel posts ──────────────────────────────────────────────────────────
  const channelBot = BB_BOTS.find(b => b.role === "channel");
  if (channelBot) {
    const avatar = avatarMap[channelBot.email] || "";
    for (const text of shuffle(BB_CHANNEL_POSTS)) {
      const roll = Math.random();
      const media = roll < 0.60 && uniqueBBPhotos.length > 0
        ? [uniqueBBPhotos[bbPhotoIdx++ % uniqueBBPhotos.length]]
        : [];

      newPosts.push({
        author_email: channelBot.email,
        author_name: channelBot.name,
        author_avatar: avatar,
        content: text,
        sport: "Baseball",
        category: "news",
        media_urls: media,
        likes: randLikes(rand(30, 180), ALL_BOT_EMAILS),
        views: rand(800, 12000),
        comments_count: rand(5, 60),
        shares: rand(2, 35),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(3),
      });
    }
  }

  // ── Video posts ────────────────────────────────────────────────────────────
  // Dedicated video posts for each baseball athlete bot
  for (const bot of athleteBots) {
    const avatar = avatarMap[bot.email] || "";
    for (let v = 0; v < 3 && uniqueBBVideos.length > 0; v++) {
      const vid = uniqueBBVideos[bbVideoIdx % uniqueBBVideos.length];
      bbVideoIdx++;

      newPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: avatar,
        content: pick(BB_VIDEO_CAPTIONS),
        sport: bot.sport,
        category: "reel",
        media_urls: [vid],
        likes: randLikes(rand(20, 120), ALL_BOT_EMAILS),
        views: rand(700, 10000),
        comments_count: rand(4, 45),
        shares: rand(1, 25),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(4),
      });
    }
  }

  // ── Insert in batches ──────────────────────────────────────────────────────
  console.log(`\n⬆️  Inserting ${newPosts.length} new baseball/softball posts...`);
  const BATCH = 20;
  let inserted = 0;
  for (let i = 0; i < newPosts.length; i += BATCH) {
    try {
      await insert(newPosts.slice(i, i + BATCH));
      inserted += newPosts.slice(i, i + BATCH).length;
      process.stdout.write(`\r   ${inserted}/${newPosts.length} inserted`);
    } catch (e) {
      console.error(`\n  ✗ Batch failed: ${e.message}`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const withMedia = newPosts.filter(p => p.media_urls.length > 0).length;
  const withVideo = newPosts.filter(p => p.media_urls[0]?.includes('.mp4')).length;

  console.log(`\n\n✅ Complete!`);
  console.log(`   👤 Avatars updated: ${avatarOk}`);
  console.log(`   📝 New posts total: ${inserted}`);
  console.log(`   📸 With photos:     ${withMedia - withVideo}`);
  console.log(`   🎥 With videos:     ${withVideo}`);
  console.log(`   📝 Text only:       ${newPosts.length - withMedia}`);
  console.log(`\n   ⚾ Baseball/softball is now the dominant sport in the feed.`);
  console.log(`   Refresh the app to see real avatars and a baseball-first timeline.`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
