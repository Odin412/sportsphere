/**
 * Seed Training Content — curated YouTube videos across sports
 * ─────────────────────────────────────────────────────────────
 * Inserts ~60 curated YouTube training videos into the training_content table.
 *
 * Usage:
 *   node tools/seed_training_content.mjs
 *
 * Requirements:
 *   - Node.js 18+ (uses native fetch)
 *   - training_content table must exist in Supabase
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";

const headers = {
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

// ─── CURATED YOUTUBE VIDEOS ─────────────────────────────────────────────────
const videos = [
  // ── Baseball ──────────────────────────────────────────────────────────────
  { title: "How to Hit a Baseball - Beginner Batting Tips", youtube_id: "EdPC7sBRxas", sport: "Baseball", category: "drill", skill_level: "beginner", duration_seconds: 480, tags: ["hitting", "batting", "beginner"], description: "Essential batting fundamentals for new players. Covers stance, grip, and swing mechanics." },
  { title: "Pitching Mechanics Breakdown - Complete Guide", youtube_id: "bVnVsF3Yw-k", sport: "Baseball", category: "form-correction", skill_level: "intermediate", duration_seconds: 720, tags: ["pitching", "mechanics", "arm-slot"], description: "Detailed breakdown of proper pitching mechanics from windup to follow-through." },
  { title: "Elite Fielding Drills - Infield Practice", youtube_id: "J3fPkdLz06Y", sport: "Baseball", category: "drill", skill_level: "intermediate", duration_seconds: 600, tags: ["fielding", "infield", "ground-balls"], description: "Pro-level infield drills for improving reaction time and glove work." },
  { title: "Base Running Speed & Technique", youtube_id: "NJP4-dQqDAY", sport: "Baseball", category: "drill", skill_level: "all", duration_seconds: 540, tags: ["base-running", "speed", "technique"], description: "Improve your base running with proper technique and acceleration drills." },
  { title: "Catcher Pop Time & Blocking Drills", youtube_id: "D7nLFeeNpzE", sport: "Baseball", category: "drill", skill_level: "intermediate", duration_seconds: 660, tags: ["catching", "blocking", "pop-time"], description: "Essential catching drills focused on blocking balls in the dirt and improving throw-down times." },
  { title: "MLB Highlights - Greatest Plays 2024", youtube_id: "j42KiFLbETI", sport: "Baseball", category: "highlight", skill_level: "all", duration_seconds: 900, tags: ["highlights", "mlb", "best-plays"], description: "Top MLB plays and moments from the 2024 season." },
  { title: "How to Throw a Curveball - Grip & Release", youtube_id: "Cv7cUC3GFLA", sport: "Baseball", category: "form-correction", skill_level: "advanced", duration_seconds: 480, tags: ["pitching", "curveball", "grip"], description: "Master the curveball with proper grip, wrist action, and release point." },

  // ── Basketball ────────────────────────────────────────────────────────────
  { title: "Shooting Form Fundamentals - Perfect Your Shot", youtube_id: "t7JkGMuICJA", sport: "Basketball", category: "form-correction", skill_level: "beginner", duration_seconds: 600, tags: ["shooting", "form", "fundamentals"], description: "Build a consistent shooting form from the ground up with these fundamentals." },
  { title: "Advanced Ball Handling Drills", youtube_id: "WT9v9aZBpZE", sport: "Basketball", category: "drill", skill_level: "advanced", duration_seconds: 720, tags: ["ball-handling", "dribbling", "crossover"], description: "Level up your handles with these advanced ball handling drills used by pros." },
  { title: "Defensive Footwork & Positioning", youtube_id: "OckfeKA0GHQ", sport: "Basketball", category: "drill", skill_level: "intermediate", duration_seconds: 540, tags: ["defense", "footwork", "positioning"], description: "Improve your on-ball defense with lateral quickness and positioning drills." },
  { title: "Rebounding Technique & Box Out Drills", youtube_id: "bUZN3PIrLnY", sport: "Basketball", category: "drill", skill_level: "all", duration_seconds: 480, tags: ["rebounding", "box-out", "positioning"], description: "Dominate the boards with proper rebounding technique and box out fundamentals." },
  { title: "NBA Best Plays & Crossovers Compilation", youtube_id: "ht2mMFE7clo", sport: "Basketball", category: "highlight", skill_level: "all", duration_seconds: 600, tags: ["highlights", "nba", "crossovers"], description: "Incredible NBA crossovers, dunks, and game-winning shots." },
  { title: "Free Throw Routine - Never Miss Again", youtube_id: "GzLvOHjrQ2U", sport: "Basketball", category: "form-correction", skill_level: "beginner", duration_seconds: 420, tags: ["free-throw", "routine", "consistency"], description: "Develop a consistent free throw routine that works under pressure." },
  { title: "Post Moves for Big Men - Low Post Scoring", youtube_id: "mMhpS2mBMIg", sport: "Basketball", category: "drill", skill_level: "intermediate", duration_seconds: 660, tags: ["post-moves", "scoring", "footwork"], description: "Essential post moves every big man needs in their arsenal." },

  // ── Football ──────────────────────────────────────────────────────────────
  { title: "QB Footwork Drills - Drop Back Mechanics", youtube_id: "bQJwZmBd03o", sport: "Football", category: "drill", skill_level: "intermediate", duration_seconds: 600, tags: ["quarterback", "footwork", "drop-back"], description: "Quarterback footwork fundamentals including 3-step, 5-step, and 7-step drops." },
  { title: "Wide Receiver Route Running Masterclass", youtube_id: "4DVLCBXIbN4", sport: "Football", category: "drill", skill_level: "intermediate", duration_seconds: 720, tags: ["receiver", "routes", "cuts"], description: "Sharpen your route running with precise cuts, stems, and releases." },
  { title: "Tackling Fundamentals - Safe & Effective", youtube_id: "L3E7FYY8jdw", sport: "Football", category: "form-correction", skill_level: "beginner", duration_seconds: 540, tags: ["tackling", "defense", "fundamentals"], description: "Learn proper tackling technique that is both effective and safe." },
  { title: "Speed & Agility Ladder Drills for Football", youtube_id: "aJVn40fMSnM", sport: "Football", category: "workout", skill_level: "all", duration_seconds: 480, tags: ["agility", "speed", "ladder-drills"], description: "Football-specific agility ladder drills to improve footwork and quickness." },
  { title: "NFL Top 100 Plays of the Season", youtube_id: "KVneAaNRu5w", sport: "Football", category: "highlight", skill_level: "all", duration_seconds: 1200, tags: ["highlights", "nfl", "top-plays"], description: "The best plays from across the NFL season." },
  { title: "O-Line Pass Protection Technique", youtube_id: "LYtaUSxrJK4", sport: "Football", category: "form-correction", skill_level: "advanced", duration_seconds: 660, tags: ["offensive-line", "pass-protection", "technique"], description: "Offensive line pass protection fundamentals and hand-fighting technique." },
  { title: "Running Back Vision & Patience Drills", youtube_id: "gQe3UCSKOZE", sport: "Football", category: "drill", skill_level: "intermediate", duration_seconds: 540, tags: ["running-back", "vision", "patience"], description: "Develop elite running back vision and learn to read blocks effectively." },

  // ── Soccer ────────────────────────────────────────────────────────────────
  { title: "Dribbling Skills Tutorial - Beat Any Defender", youtube_id: "NhMqaJBCaYg", sport: "Soccer", category: "drill", skill_level: "intermediate", duration_seconds: 600, tags: ["dribbling", "skills", "1v1"], description: "Master essential dribbling moves to beat defenders in 1v1 situations." },
  { title: "Passing Accuracy & Weight of Pass", youtube_id: "lXP1JfOyYvI", sport: "Soccer", category: "drill", skill_level: "beginner", duration_seconds: 540, tags: ["passing", "accuracy", "technique"], description: "Improve your passing accuracy and learn to weight your passes correctly." },
  { title: "Shooting Technique - Power & Placement", youtube_id: "GSj7geUMpYg", sport: "Soccer", category: "form-correction", skill_level: "intermediate", duration_seconds: 480, tags: ["shooting", "technique", "finishing"], description: "Score more goals with proper shooting technique for both power and placement." },
  { title: "Free Kick Tutorial - Curve & Knuckleball", youtube_id: "f2esSi0HT6M", sport: "Soccer", category: "drill", skill_level: "advanced", duration_seconds: 600, tags: ["free-kick", "curve", "knuckleball"], description: "Learn to bend free kicks like the pros and master the knuckleball technique." },
  { title: "Defensive Positioning & Marking", youtube_id: "Fq7o0HNLiBs", sport: "Soccer", category: "form-correction", skill_level: "intermediate", duration_seconds: 540, tags: ["defense", "positioning", "marking"], description: "Improve your defensive game with proper positioning, marking, and tackling." },
  { title: "Best Goals of the Year - Top 50", youtube_id: "9IK9d9AMpKE", sport: "Soccer", category: "highlight", skill_level: "all", duration_seconds: 900, tags: ["highlights", "goals", "best-of"], description: "The 50 most incredible goals scored this year from leagues around the world." },
  { title: "First Touch & Ball Control Mastery", youtube_id: "Szgz0AMcavo", sport: "Soccer", category: "drill", skill_level: "beginner", duration_seconds: 480, tags: ["first-touch", "ball-control", "technique"], description: "Develop a silky first touch with these ball control drills." },

  // ── Tennis ────────────────────────────────────────────────────────────────
  { title: "Tennis Serve Technique - Flat, Slice, Kick", youtube_id: "R_D7DsFJOeI", sport: "Tennis", category: "form-correction", skill_level: "intermediate", duration_seconds: 720, tags: ["serve", "technique", "spin"], description: "Master all three serve types: flat, slice, and kick serve." },
  { title: "Forehand Fundamentals - Topspin Power", youtube_id: "M-aaSTkMOa0", sport: "Tennis", category: "form-correction", skill_level: "beginner", duration_seconds: 540, tags: ["forehand", "topspin", "fundamentals"], description: "Build a powerful topspin forehand with proper technique and body rotation." },
  { title: "Footwork Patterns for Tennis", youtube_id: "aCaWqtmxyR4", sport: "Tennis", category: "drill", skill_level: "intermediate", duration_seconds: 480, tags: ["footwork", "movement", "court-coverage"], description: "Tennis-specific footwork patterns to improve your court coverage." },
  { title: "Best ATP Rally Points of the Season", youtube_id: "JCRE3BBQJ_s", sport: "Tennis", category: "highlight", skill_level: "all", duration_seconds: 600, tags: ["highlights", "atp", "rallies"], description: "Incredible rally points from the ATP tour this season." },

  // ── Swimming ──────────────────────────────────────────────────────────────
  { title: "Freestyle Swimming Technique - Stroke Analysis", youtube_id: "jFGEAfdhkpM", sport: "Swimming", category: "form-correction", skill_level: "beginner", duration_seconds: 600, tags: ["freestyle", "technique", "stroke"], description: "Perfect your freestyle stroke with detailed technique analysis and drills." },
  { title: "Flip Turn Tutorial - Faster Walls", youtube_id: "ISsdaehdJ1o", sport: "Swimming", category: "drill", skill_level: "intermediate", duration_seconds: 420, tags: ["flip-turn", "walls", "technique"], description: "Master the flip turn to shave seconds off your times." },
  { title: "Backstroke Technique & Common Mistakes", youtube_id: "N8bQPCbVaXs", sport: "Swimming", category: "form-correction", skill_level: "beginner", duration_seconds: 540, tags: ["backstroke", "technique", "mistakes"], description: "Fix common backstroke mistakes and improve your body position in the water." },

  // ── Track & Field ─────────────────────────────────────────────────────────
  { title: "Sprint Start Technique - Block Settings", youtube_id: "hT7BXOmN-Kg", sport: "Track & Field", category: "form-correction", skill_level: "intermediate", duration_seconds: 540, tags: ["sprinting", "start", "blocks"], description: "Optimize your sprint start with proper block settings and drive phase technique." },
  { title: "Long Jump Approach & Takeoff", youtube_id: "Y0usg-Fy5OA", sport: "Track & Field", category: "drill", skill_level: "intermediate", duration_seconds: 480, tags: ["long-jump", "approach", "takeoff"], description: "Improve your long jump with proper approach run mechanics and takeoff timing." },
  { title: "800m Race Strategy & Pacing", youtube_id: "4YHPIQxkAfQ", sport: "Track & Field", category: "analysis", skill_level: "intermediate", duration_seconds: 600, tags: ["800m", "strategy", "pacing"], description: "Learn how to pace your 800m race for a personal best." },

  // ── General Training ──────────────────────────────────────────────────────
  { title: "Speed & Agility Training - Complete Workout", youtube_id: "1FXPNqFgzWo", sport: "General", category: "workout", skill_level: "all", duration_seconds: 1200, tags: ["speed", "agility", "workout"], description: "Full speed and agility workout suitable for all sports." },
  { title: "Strength Training for Athletes - Full Body", youtube_id: "2tM1LFFxeKg", sport: "General", category: "workout", skill_level: "intermediate", duration_seconds: 1800, tags: ["strength", "full-body", "weightlifting"], description: "Complete strength training workout designed for athletes in any sport." },
  { title: "Dynamic Stretching Warm-Up Routine", youtube_id: "nPHfEnZD1Wk", sport: "General", category: "workout", skill_level: "beginner", duration_seconds: 600, tags: ["stretching", "warm-up", "flexibility"], description: "Dynamic stretching warm-up routine to prevent injury and improve performance." },
  { title: "Sports Psychology - Mental Toughness Training", youtube_id: "yG7v4y_xwzQ", sport: "General", category: "motivation", skill_level: "all", duration_seconds: 900, tags: ["mental-game", "psychology", "focus"], description: "Build mental toughness and learn techniques for peak performance under pressure." },
  { title: "Nutrition for Athletes - Meal Planning Guide", youtube_id: "dVJ5OwZe1zM", sport: "General", category: "analysis", skill_level: "all", duration_seconds: 720, tags: ["nutrition", "meal-planning", "recovery"], description: "Sports nutrition fundamentals including pre-game meals, hydration, and recovery nutrition." },
  { title: "Foam Rolling & Recovery Techniques", youtube_id: "SdHsqWGkfzI", sport: "General", category: "workout", skill_level: "beginner", duration_seconds: 600, tags: ["recovery", "foam-rolling", "mobility"], description: "Essential foam rolling and recovery techniques for athletes." },
  { title: "Plyometric Training for Explosive Power", youtube_id: "sDz_iMj8VuA", sport: "General", category: "workout", skill_level: "intermediate", duration_seconds: 900, tags: ["plyometrics", "explosiveness", "power"], description: "Plyometric exercises to build explosive power for any sport." },

  // ── Hockey ────────────────────────────────────────────────────────────────
  { title: "Hockey Skating Drills - Edge Work", youtube_id: "BIu_Ek6aP7A", sport: "Hockey", category: "drill", skill_level: "intermediate", duration_seconds: 600, tags: ["skating", "edges", "agility"], description: "Improve your skating with edge work drills for better agility and speed on ice." },
  { title: "Wrist Shot & Snap Shot Tutorial", youtube_id: "UaLkDgCRi5w", sport: "Hockey", category: "form-correction", skill_level: "beginner", duration_seconds: 480, tags: ["shooting", "wrist-shot", "snap-shot"], description: "Master the wrist shot and snap shot for more accurate and powerful shooting." },
  { title: "NHL Top Goals of the Week", youtube_id: "Wo7vD0WJCt0", sport: "Hockey", category: "highlight", skill_level: "all", duration_seconds: 600, tags: ["highlights", "nhl", "goals"], description: "The best goals from around the NHL this week." },

  // ── Golf ──────────────────────────────────────────────────────────────────
  { title: "Golf Swing Basics - Full Swing Tutorial", youtube_id: "LG1vJJAceYM", sport: "Golf", category: "form-correction", skill_level: "beginner", duration_seconds: 720, tags: ["swing", "basics", "fundamentals"], description: "Learn the full golf swing from grip to finish with this beginner-friendly tutorial." },
  { title: "Short Game Masterclass - Chipping & Pitching", youtube_id: "6HJR7H2MI80", sport: "Golf", category: "drill", skill_level: "intermediate", duration_seconds: 600, tags: ["short-game", "chipping", "pitching"], description: "Improve your short game with proper chipping and pitching technique." },
  { title: "PGA Tour Best Shots Compilation", youtube_id: "0E8AkrM5sOI", sport: "Golf", category: "highlight", skill_level: "all", duration_seconds: 600, tags: ["highlights", "pga", "best-shots"], description: "Incredible shots from the PGA Tour that you have to see to believe." },

  // ── Volleyball ────────────────────────────────────────────────────────────
  { title: "Volleyball Spike Technique - Approach & Contact", youtube_id: "5UQAmnD6xEE", sport: "Volleyball", category: "form-correction", skill_level: "intermediate", duration_seconds: 540, tags: ["spiking", "approach", "hitting"], description: "Improve your volleyball spike with proper approach footwork and contact point." },
  { title: "Setting Fundamentals - Hand Position & Footwork", youtube_id: "9wVs0QAdKDw", sport: "Volleyball", category: "form-correction", skill_level: "beginner", duration_seconds: 480, tags: ["setting", "technique", "fundamentals"], description: "Master the art of setting with proper hand position and body mechanics." },
  { title: "Serve Receive & Passing Drills", youtube_id: "2rK1F0-jXMo", sport: "Volleyball", category: "drill", skill_level: "all", duration_seconds: 540, tags: ["passing", "serve-receive", "platform"], description: "Essential passing and serve receive drills for consistent ball control." },
];

// ─── SEED ───────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`Seeding ${videos.length} training videos...\n`);

  const rows = videos.map((v) => ({
    title: v.title,
    description: v.description || "",
    video_url: `https://www.youtube.com/watch?v=${v.youtube_id}`,
    thumbnail_url: `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`,
    source: "youtube",
    youtube_id: v.youtube_id,
    sport: v.sport,
    category: v.category,
    skill_level: v.skill_level || "all",
    duration_seconds: v.duration_seconds || 600,
    author_email: "admin@sportsphere.app",
    author_name: "SportSphere",
    is_approved: true,
    quality_score: 4.0 + Math.random(),
    upvotes: Math.floor(Math.random() * 50) + 10,
    downvotes: Math.floor(Math.random() * 3),
    views: Math.floor(Math.random() * 500) + 50,
    tags: v.tags || [],
    created_date: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  }));

  // Insert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/training_content`, {
      method: "POST",
      headers,
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Batch ${i / 20 + 1} failed:`, err);
    } else {
      console.log(`  ✓ Batch ${i / 20 + 1}: inserted ${batch.length} videos`);
    }
  }

  console.log("\nDone! Training content seeded.");
}

seed().catch(console.error);
