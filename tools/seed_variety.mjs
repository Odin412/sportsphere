/**
 * Sportsphere Variety Seed Script
 * ────────────────────────────────
 * Adds 150+ diverse posts to the feed:
 *   - Hot takes / banter (text)
 *   - Sports action photos (Pexels Photos API)
 *   - Famous athlete quotes (text)
 *   - Celebration / milestone posts (text)
 *   - Game reaction / commentary (text)
 *
 * All posts are dated 0-4 days ago so they surface at the TOP of the feed,
 * breaking up the video-heavy front page.
 *
 * Usage:  node tools/seed_variety.mjs
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";
const PEXELS_API_KEY = "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";

// ─── BOT ROSTER (same as seed_bots.mjs) ─────────────────────────────────────
const BOTS = [
  { email: "espn-news@sportsphere.app",      name: "ESPN SportsSphere",      avatar: "https://api.dicebear.com/9.x/initials/svg?seed=ESPN&backgroundColor=dc2626&textColor=ffffff&fontFamily=Arial&fontSize=40",      sport: null,         type: "channel" },
  { email: "nba-daily@sportsphere.app",       name: "NBA Daily",              avatar: "https://api.dicebear.com/9.x/initials/svg?seed=NBA&backgroundColor=1d4ed8&textColor=ffffff&fontFamily=Arial&fontSize=40",       sport: "Basketball", type: "channel" },
  { email: "premier-league@sportsphere.app",  name: "Premier League HQ",      avatar: "https://api.dicebear.com/9.x/initials/svg?seed=PL&backgroundColor=3b0764&textColor=ffffff&fontFamily=Arial&fontSize=40",        sport: "Soccer",     type: "channel" },
  { email: "ufc-hub@sportsphere.app",         name: "UFC Fight Hub",          avatar: "https://api.dicebear.com/9.x/initials/svg?seed=UFC&backgroundColor=dc2626&textColor=ffffff&fontFamily=Arial&fontSize=40",         sport: "MMA",        type: "channel" },
  { email: "olympic-sports@sportsphere.app",  name: "Olympic Sports Network", avatar: "https://api.dicebear.com/9.x/initials/svg?seed=OSN&backgroundColor=ca8a04&textColor=ffffff&fontFamily=Arial&fontSize=40",        sport: null,         type: "channel" },
  { email: "jordan.williams@sportsphere.app", name: "Jordan Williams",        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanWilliams&backgroundColor=1f2937",                                         sport: "Basketball", type: "athlete" },
  { email: "marcus.silva@sportsphere.app",    name: "Marcus Silva",           avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusSilva&backgroundColor=1f2937",                                             sport: "Soccer",     type: "athlete" },
  { email: "emma.chen@sportsphere.app",       name: "Emma Chen",              avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=EmmaChen&backgroundColor=1f2937",                                                 sport: "Tennis",     type: "athlete" },
  { email: "tyler.brooks@sportsphere.app",    name: "Tyler Brooks",           avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=TylerBrooks&backgroundColor=1f2937",                                             sport: "Football",   type: "athlete" },
  { email: "sofia.rodriguez@sportsphere.app", name: "Sofia Rodriguez",        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SofiaRodriguez&backgroundColor=1f2937",                                          sport: "Swimming",   type: "athlete" },
  { email: "jack.obrien@sportsphere.app",     name: "Jack O'Brien",           avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JackOBrien&backgroundColor=1f2937",                                              sport: "Golf",       type: "athlete" },
  { email: "aisha.mohammed@sportsphere.app",  name: "Aisha Mohammed",         avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AishaMohammed&backgroundColor=1f2937",                                           sport: "Track",      type: "athlete" },
  { email: "ryan.park@sportsphere.app",       name: "Ryan Park",              avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RyanPark&backgroundColor=1f2937",                                                 sport: "Hockey",     type: "athlete" },
  { email: "diego.fernandez@sportsphere.app", name: "Diego Fernandez",        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DiegoFernandez&backgroundColor=1f2937",                                          sport: "Baseball",   type: "athlete" },
  { email: "zara.mitchell@sportsphere.app",   name: "Zara Mitchell",          avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ZaraMitchell&backgroundColor=1f2937",                                            sport: "CrossFit",   type: "athlete" },
];

// ─── HOT TAKES / BANTER ───────────────────────────────────────────────────────
const HOT_TAKES = {
  Basketball: [
    "Hot take: Zone defense is for coaches who don't trust their players. Man up and play man-to-man or go home 🔥",
    "The mid-range jumper is making a comeback and analytics bros are sweating. Welcome back to real basketball.",
    "Unpopular opinion: assist-to-turnover ratio matters more than points per game. Change my mind.",
    "If your team can't execute a late-game inbound play, that's a coaching problem. Full stop.",
    "Nobody wants to hear it but flopping is ruining the game more than any rule change. Call it both ways refs 😤",
    "The GOAT debate only exists because people refuse to watch the full film. Do your homework.",
    "You can't teach height, you CAN teach footwork. Every big man should be in a dance class. I said what I said.",
    "Three-pointers are exciting but the art of the post-up is criminally underrated. Bring it back.",
  ],
  Soccer: [
    "VAR is ruining the flow of the game and nobody can convince me otherwise. Let the ref ref 😤",
    "Hot take: a goalkeeper who sweeps well is worth more than a shot-stopper who can't play with their feet.",
    "Tiki-taka is dead. The game has evolved. Vertical, direct, clinical. That's what wins now.",
    "Penalty shootouts are not a lottery. Composure is a skill. Prep is a skill. Some teams just don't want it enough.",
    "The Premier League is the best league in the world physically but tactically it's not even top 3. There I said it.",
    "A striker who presses is worth double a striker who just waits for the ball. Movement wins games.",
    "Corner kicks are the most wasted set piece in football. 90% of teams have no plan. It's embarrassing.",
  ],
  Football: [
    "Hot take: a great offensive line is worth two star wide receivers. Protect your QB or go home.",
    "Running the ball in today's NFL is a statement, not a strategy. Prove me wrong.",
    "The most underrated position in football is the center. They control every single snap. Show some respect.",
    "Special teams can win or lose a playoff game. Teams that ignore them in the draft are fooling themselves.",
    "Two-minute drills should be practiced EVERY practice. It's the highest leverage football and most teams treat it as an afterthought.",
  ],
  Baseball: [
    "Bat flips after a big home run should be MANDATORY. The sport needs more personality and we all know it.",
    "The shift killed baseball more than any rule change. Letting athletes play in their natural positions fixed it.",
    "Relievers who throw 1/3 of an inning should not get a hold. We need to fix the statistics. Urgently.",
    "Hot take: Pitch framing is the most valuable skill that never shows up on a highlight reel.",
    "Small ball is back. The homer-or-strikeout era overstayed its welcome.",
  ],
  Tennis: [
    "Hot take: the best returner in history is more impressive than the best server. Control beats power.",
    "Clay court specialists are the most underrated athletes in all of tennis. Grinding for 5 hours in the heat? Respect.",
    "Hawkeye challenges have made the chair umpire basically pointless. We're one step from full automation.",
    "Topspin forehand or slice backhand: pick one and go all-in in juniors. Trying both makes you mediocre at both.",
    "The 'quiet please' culture in tennis makes it feel like golf. Let the crowd be loud. The sport needs energy.",
  ],
  Swimming: [
    "A swimmer who nails their turn is already 0.3 seconds ahead before they take a stroke. Turns win races. Period.",
    "Hot take: open water swimmers are tougher than pool swimmers and it's not close. Try navigating waves at race pace.",
    "The 200 IM is the hardest event in swimming. Fight me in the comments.",
    "Drag suits in training are underrated. If you're not making your practice harder than the race, you're leaving time on the board.",
  ],
  Golf: [
    "Hot take: The par system is outdated and professional golf should track strokes gained only. Change my mind.",
    "Slow play is killing golf's viewership more than any other factor. There should be a shot clock.",
    "The mental game separates 90% of golfers. Best swing in the world means nothing if your head isn't right.",
    "Amateur golfers spend too much on clubs and not enough on lessons. The shaft doesn't care about your grip.",
    "Links golf in wind teaches you more in one round than 10 rounds on a calm resort course.",
  ],
  Track: [
    "Hot take: the 400m is the hardest event in all of athletics. The pain in the last 100m is unlike anything else.",
    "Pacemakers are the unsung heroes of distance running. Nobody talks about them enough.",
    "Sprint technique is 70% of the race. Most people train fitness and ignore mechanics. That's why they plateau.",
    "The 4x100 relay is the most exciting 45 seconds in all of sports. No contest.",
  ],
  Hockey: [
    "Hot take: the instigator rule ruined the enforcer role and made the game less physical. Bring it back.",
    "A goalie who can handle the puck behind the net changes every defensive zone clearance play. Essential skill.",
    "Hockey players are pound-for-pound the toughest athletes on the planet. Broken bones? Play through it.",
    "Outdoor winter classics are the best event in professional sports. The atmosphere is unmatched.",
  ],
  MMA: [
    "Hot take: wrestling is still the most important base in MMA. You can't learn takedown defense in 2 years.",
    "The judges in MMA need a complete overhaul. Proximity to the fence is not control. Period.",
    "Cardio is the great equalizer. The most skilled fighter in the world can be finished by a conditioning gap.",
    "Kickboxers transitioning to MMA underestimate the chaos of grappling transitions. Technique goes out the window when someone shoots.",
  ],
  CrossFit: [
    "Hot take: the Open separates people who 'do CrossFit' from people who 'compete in CrossFit'. Two different things.",
    "If you're not tracking your lifts with a logbook you are leaving gainz on the gym floor. Document everything.",
    "Kipping pull-ups before strict pull-ups is like running a marathon before learning to walk. Get strict first.",
    "The best CrossFit athletes aren't the strongest or fastest — they're the most efficient movers under fatigue.",
  ],
};

// ─── FAMOUS QUOTES ────────────────────────────────────────────────────────────
const QUOTES = [
  { text: '"I\'ve missed more than 9,000 shots in my career. I\'ve lost almost 300 games. 26 times I\'ve been trusted to take the game-winning shot and missed. I\'ve failed over and over and over again in my life. And that is why I succeed." — Michael Jordan', sport: "Basketball", cat: "motivation" },
  { text: '"Do not let what you cannot do interfere with what you can do." — John Wooden', sport: null, cat: "motivation" },
  { text: '"The more difficult the victory, the greater the happiness in winning." — Pele', sport: "Soccer", cat: "motivation" },
  { text: '"Champions aren\'t made in gyms. Champions are made from something they have deep inside them — a desire, a dream, a vision." — Muhammad Ali', sport: "MMA", cat: "motivation" },
  { text: '"Somewhere behind the athlete you\'ve become, the hours of practice, and the coaches who pushed you, is a little girl who fell in love with the game and never looked back." — Mia Hamm', sport: "Soccer", cat: "motivation" },
  { text: '"You have to believe in yourself when no one else does. That\'s what makes you a winner." — Venus Williams', sport: "Tennis", cat: "motivation" },
  { text: '"If you fail to prepare, you\'re prepared to fail." — Mark Spitz', sport: "Swimming", cat: "motivation" },
  { text: '"It\'s not whether you get knocked down; it\'s whether you get up." — Vince Lombardi', sport: "Football", cat: "motivation" },
  { text: '"Hard work beats talent when talent doesn\'t work hard." — Tim Notke', sport: null, cat: "motivation" },
  { text: '"You miss 100% of the shots you don\'t take." — Wayne Gretzky', sport: "Hockey", cat: "motivation" },
  { text: '"The secret is to work less as individuals and more as a team. As a coach, I play not my eleven best, but my best eleven." — Knute Rockne', sport: "Football", cat: "coaching" },
  { text: '"I am not concerned with your liking or disliking me. All I ask is that you respect me as a human being." — Jackie Robinson', sport: "Baseball", cat: "motivation" },
  { text: '"Ask not what your teammates can do for you. Ask what you can do for your teammates." — Magic Johnson', sport: "Basketball", cat: "motivation" },
  { text: '"The five S\'s of sports training are: Stamina, Speed, Strength, Skill, and Spirit; but the greatest of these is Spirit." — Ken Doherty', sport: "Track", cat: "motivation" },
  { text: '"To uncover your true potential you must first find your own limits and then you have to have the courage to blow past them." — Picabo Street', sport: null, cat: "motivation" },
  { text: '"It\'s not about perfect. It\'s about effort. And when you bring that effort every single day, that\'s where transformation happens." — Jillian Michaels', sport: "CrossFit", cat: "motivation" },
  { text: '"Drive, determination, sacrifice. That is the difference between athletes who excel and those who don\'t." — Tiger Woods', sport: "Golf", cat: "motivation" },
  { text: '"When you win, say nothing. When you lose, say less." — Paul Brown', sport: null, cat: "motivation" },
  { text: '"Set your goals high, and don\'t stop till you get there." — Bo Jackson', sport: null, cat: "motivation" },
  { text: '"Pain is temporary. It may last for a minute, or an hour, or a day, or even a year. But eventually it will subside and something else will take its place. If I quit, however, it will last forever." — Lance Armstrong', sport: "Cycling", cat: "motivation" },
];

// ─── CELEBRATIONS / MILESTONES ───────────────────────────────────────────────
const CELEBRATIONS = {
  "jordan.williams@sportsphere.app": [
    "Just went 10/10 from the free throw line in the clutch. Ice in the veins. 🏀❄️",
    "First triple-double of the season last night. 24 pts, 11 reb, 10 ast. The grind is paying off 🙏",
    "Hit a new 1-rep max on the bench today — 315 lbs. Off-season is going different this year 💪",
  ],
  "marcus.silva@sportsphere.app": [
    "First hat-trick of the season! ⚽⚽⚽ Dedication over talent every single time. Grateful.",
    "Clean sheet and two assists today. When the whole team locks in, magic happens 🙌",
    "Just renewed my contract for two more years. This club is family. Proud to be here 💜",
  ],
  "emma.chen@sportsphere.app": [
    "Won my first WTA title today 🎾🏆 Three sets, two tiebreakers, all heart. I don't have words.",
    "New career-high ranking achieved! Every early morning and late night is worth it 🌟",
    "Served a personal best 118 mph in today's match. The technique work is finally clicking 🎯",
  ],
  "tyler.brooks@sportsphere.app": [
    "Just hit a new 40-yard dash PR — 4.41 seconds ⚡ The off-season work is showing up.",
    "Named team captain for the second season in a row. Leadership is a privilege not a title 🏈",
    "Got my first D1 offer today. Every kid who doubted me, I want you to see this moment 🙏",
  ],
  "sofia.rodriguez@sportsphere.app": [
    "Olympic trials QUALIFIED 🏊‍♀️🥹 Three years of 5am practices and hundreds of missed weekends. Worth every second.",
    "New personal best in the 100m free — 52.8 seconds. The taper is working. I'm ready.",
    "Coach told me today I'm the hardest worker she's ever coached. That means more than any medal.",
  ],
  "jack.obrien@sportsphere.app": [
    "Shot my first 65 in competition! Eagle on 18 to close it out ⛳🦅 Storybook stuff.",
    "Just turned professional. The amateur career is over. A new chapter starts now. Let's go.",
    "Qualified for my first major today. Still shaking. Dreams do come true if you put in the work.",
  ],
  "aisha.mohammed@sportsphere.app": [
    "Continental record broken today 🏃‍♀️🌍 The whole country was behind me on that last 100m. For Kenya 🇰🇪",
    "Medaled at the World Championships! 🥈 The silver burns but it's also proof I belong on this stage.",
    "Just signed my first sponsorship deal! Little Aisha from Nairobi could never have dreamed this 🙏",
  ],
  "ryan.park@sportsphere.app": [
    "First NHL hat trick tonight 🏒🎩🎩🎩 I cried in the locker room. Called my dad who drove me to 5am practices for 15 years. Everything is for him.",
    "30 games played, +17 plus/minus. Best statistical season of my career and we're just getting started.",
    "Named to the All-Star game for the first time. A dream since I was 6 years old lacing up skates.",
  ],
  "diego.fernandez@sportsphere.app": [
    "Complete game shutout ⚾ 9 innings, 1 hit, 14 strikeouts. The best start of my career. Period.",
    "Milestone: 1,000 career strikeouts today! Thank you to every catcher who's caught my stuff over the years 🙏",
    "Just landed in the majors for the first time. The kid from Santo Domingo made it. Never stop believing.",
  ],
  "zara.mitchell@sportsphere.app": [
    "Won the regional CrossFit competition today 🏋️‍♀️🥇 The Open prep has been paying dividends. Sydney represent!",
    "New clean and jerk PR — 112kg! Six months of technique work all clicked in one rep. I screamed.",
    "Just got my coaching certification. Giving back to the community that gave me everything. Next chapter 💪",
  ],
};

// ─── REACTION / COMMENTARY POSTS ─────────────────────────────────────────────
const REACTIONS = {
  "espn-news@sportsphere.app": [
    "That buzzer beater just broke the entire internet. The sports world is NOT okay right now 😭🔥 Replay it 100 times.",
    "Did y'all just SEE that trade?? The league is never going to be the same. Bold move or desperate move?",
    "Referee decision in the final minute just ended careers and started wars. The comment section is about to explode.",
    "Record attendance at tonight's game. The stadium was SHAKING. This is what sports is supposed to feel like 🔊",
    "The comeback is complete. Down 3-0 with 8 minutes left. Sports will never get old. Absolute scenes 🤯",
  ],
  "nba-daily@sportsphere.app": [
    "That crossover just broke ankles and the laws of physics simultaneously. Man's knees said goodbye 💀",
    "Overtime in game 7. Nobody's sleeping tonight. Get your snacks and strap in. This is why we love basketball 🍿",
    "The dunk that will live forever. In 20 years people will say 'where were you when you saw that?' 🔥",
    "40 points and the refs STILL found ways to give him no calls. The disrespect is astronomical 😤",
    "Three-way trade just dropped and my fantasy team is ruined but the basketball fan in me is HYPED 🏀",
  ],
  "premier-league@sportsphere.app": [
    "That goal in stoppage time... I need to sit down. Five years of therapy undone in 90+4 minutes 😭",
    "The crowd erupted so loud the broadcast cut out. Atmosphere of the DECADE. English football unmatched.",
    "VAR reviewed that for 4 minutes. Four. Minutes. I aged visibly watching it. Football is a cruel sport.",
    "Last minute winner. Away end going absolutely berserk. Players in tears. Football is the greatest sport ever created 💙",
    "The manager's face after that result said more than any press conference ever could 😬 Change incoming?",
  ],
  "ufc-hub@sportsphere.app": [
    "That KO in round 1 lasted 11 seconds. Nobody was ready. The arena went silent then ERUPTED 🤯",
    "The champion just called out three people simultaneously after winning the belt. Chaos. I love this sport.",
    "Submission so clean the crowd actually gasped before they cheered. This man is an assassin 🥋",
    "Trash talk during the weigh-in just added 500,000 PPV buys. The promo is genuinely elite 🎤",
  ],
  "olympic-sports@sportsphere.app": [
    "World record broken live on broadcast. The commentator lost their voice. We all lost our minds 🌍🏆",
    "The photo finish was 0.001 seconds. In any other timeline, the silver gets the gold. Sport is wild.",
    "Underdog nation just erupted. The upset of the decade happened in front of 80,000 people 🥹",
    "The winner's face when they saw the scoreboard… pure human joy. That's why we watch. That's everything.",
  ],
};

// ─── PHOTO CAPTIONS ───────────────────────────────────────────────────────────
const PHOTO_CAPTIONS = {
  Basketball: [
    "The court is the office. Every morning, first one in.",
    "When the gym is empty, that's when the real work begins 🏀",
    "Court vision isn't just seeing the game — it's seeing it before it happens.",
    "Defense wins championships. The stats that don't show up on the box score.",
    "Two-a-days and ice baths. The blueprint hasn't changed.",
  ],
  Soccer: [
    "Every touch matters. Every rep builds muscle memory ⚽",
    "First to arrive. Last to leave. The mentality that separates.",
    "Footwork is poetry when you've put in the hours.",
    "The pitch is where I think clearest. It's home.",
    "Rain or shine. The training doesn't stop.",
  ],
  Tennis: [
    "500 serves a day, every day. The serve is a weapon 🎾",
    "Footwork, footwork, footwork. Movement is everything.",
    "Mental strength is built in practice, not on match day.",
    "The racket is an extension of your arm. Make it feel that way.",
  ],
  Football: [
    "Film study is the homework. The game is the test 🏈",
    "Strength + speed + smarts. All three or none of it matters.",
    "The trenches decide everything. Show some respect to the big guys.",
    "Pre-dawn conditioning. Nobody sees this part.",
  ],
  Swimming: [
    "5am. Dark pool. Just you and the black line 🏊",
    "Every lap is a conversation between you and your limits.",
    "Underwater is the equalizer. Pure technique. Pure will.",
    "The finish wall doesn't care about your excuses.",
  ],
  Golf: [
    "100 chip shots before the range opens. That's the edge ⛳",
    "The short game is where scores are built or broken.",
    "Pre-shot routine: non-negotiable, every single time.",
    "Wind, terrain, pressure — all factors. Process stays the same.",
  ],
  Track: [
    "The track doesn't lie. Every 100th of a second is earned 🏃",
    "Block starts rehearsed until they're second nature.",
    "Lean at the tape. Every hundredth counts.",
    "Speed is a skill. Drill it, own it, race it.",
  ],
  Hockey: [
    "Edge work at 6am. The foundation of everything on ice 🏒",
    "Stick handling until the puck becomes an extension of your hands.",
    "Board battles: won in the weight room, decided on the ice.",
    "The cold doesn't care about your comfort. Neither does the puck.",
  ],
  Baseball: [
    "50 swings, 50 pitches. Routine is everything ⚾",
    "The mound is your domain. Confidence has a stance.",
    "Hip rotation, shoulder turn, follow through. Repeat forever.",
    "Between starts: mental reps matter as much as physical ones.",
  ],
  CrossFit: [
    "Chalk up. The barbell's waiting 🏋️",
    "Intensity is relative. Push your relative.",
    "The whiteboard doesn't lie. Chase the score.",
    "Community + competition. The CrossFit formula that works.",
  ],
  MMA: [
    "Drill, spar, drill again. The cage doesn't care about good intentions 🥋",
    "Cardio is your third fighter. Train it that way.",
    "Every stance, every angle, every exit — rehearsed.",
    "The belt doesn't make the fighter. The training camp does.",
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function recentDate(maxDaysAgo = 4) {
  const d = new Date();
  const daysBack = Math.random() * maxDaysAgo;
  d.setTime(d.getTime() - daysBack * 24 * 3600 * 1000);
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(Math.floor(Math.random() * 60));
  return d.toISOString();
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randLikes(count, pool) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

async function insertPosts(posts) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(posts),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert failed (${res.status}): ${err}`);
  }
}

async function fetchPexelsPhotos(query) {
  if (!PEXELS_API_KEY) return [];
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=square`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const json = await res.json();
    return (json.photos || []).map(p => p.src?.large || p.src?.medium).filter(Boolean);
  } catch (e) {
    console.warn(`  Pexels fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🎨 Sportsphere Variety Seed Script\n");

  const allEmails = BOTS.map(b => b.email);
  const allPosts = [];

  // ── Phase 1: Pexels photos ──
  console.log("📸 Fetching sports action photos from Pexels...");
  const PHOTO_QUERIES = {
    Basketball: "basketball athlete action",
    Soccer:     "soccer athlete action",
    Tennis:     "tennis athlete action",
    Football:   "american football athlete",
    Swimming:   "swimming athlete pool",
    Golf:       "golf athlete swing",
    Track:      "running athlete sprint",
    Hockey:     "ice hockey athlete",
    Baseball:   "baseball athlete pitcher",
    CrossFit:   "crossfit athlete workout",
    MMA:        "martial arts fighter training",
  };

  const photosByBot = {};
  for (const bot of BOTS.filter(b => b.sport && PHOTO_QUERIES[b.sport])) {
    const photos = await fetchPexelsPhotos(PHOTO_QUERIES[bot.sport]);
    photosByBot[bot.email] = photos;
    console.log(`  ✓ ${bot.name}: ${photos.length} photos`);
  }

  // ── Phase 2: Build posts ──
  console.log("\n📝 Building variety posts...");

  // 2a. HOT TAKES — athlete bots post their sport's hot takes
  for (const bot of BOTS.filter(b => b.type === "athlete")) {
    const takes = HOT_TAKES[bot.sport] || [];
    for (const text of takes) {
      allPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: bot.avatar,
        content: text,
        sport: bot.sport,
        category: "other",
        media_urls: [],
        likes: randLikes(rand(3, 45), allEmails),
        views: rand(80, 3000),
        comments_count: rand(1, 25),
        shares: rand(0, 12),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(4),
      });
    }
  }

  // 2b. HOT TAKES — channel bots post multi-sport takes
  const channelTakes = [
    ...HOT_TAKES.Basketball.slice(0, 2),
    ...HOT_TAKES.Soccer.slice(0, 2),
    ...HOT_TAKES.Football.slice(0, 2),
    ...HOT_TAKES.MMA.slice(0, 2),
  ];
  const channelBots = BOTS.filter(b => b.type === "channel");
  shuffle(channelTakes).forEach((text, i) => {
    const bot = channelBots[i % channelBots.length];
    allPosts.push({
      author_email: bot.email,
      author_name: bot.name,
      author_avatar: bot.avatar,
      content: text,
      sport: bot.sport,
      category: "other",
      media_urls: [],
      likes: randLikes(rand(15, 120), allEmails),
      views: rand(500, 8000),
      comments_count: rand(3, 40),
      shares: rand(1, 20),
      is_premium: false,
      comments_disabled: false,
      created_date: recentDate(3),
    });
  });

  // 2c. FAMOUS QUOTES
  for (const q of QUOTES) {
    const eligibleBots = q.sport ? BOTS.filter(b => b.sport === q.sport || b.type === "channel") : channelBots;
    const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
    allPosts.push({
      author_email: bot.email,
      author_name: bot.name,
      author_avatar: bot.avatar,
      content: q.text,
      sport: q.sport || bot.sport,
      category: q.cat,
      media_urls: [],
      likes: randLikes(rand(10, 80), allEmails),
      views: rand(300, 5000),
      comments_count: rand(0, 20),
      shares: rand(1, 15),
      is_premium: false,
      comments_disabled: false,
      created_date: recentDate(4),
    });
  }

  // 2d. CELEBRATIONS
  for (const [email, posts] of Object.entries(CELEBRATIONS)) {
    const bot = BOTS.find(b => b.email === email);
    if (!bot) continue;
    for (const text of posts) {
      allPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: bot.avatar,
        content: text,
        sport: bot.sport,
        category: "highlight",
        media_urls: [],
        likes: randLikes(rand(15, 90), allEmails),
        views: rand(400, 6000),
        comments_count: rand(3, 35),
        shares: rand(1, 18),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(2),
      });
    }
  }

  // 2e. REACTION / COMMENTARY
  for (const [email, posts] of Object.entries(REACTIONS)) {
    const bot = BOTS.find(b => b.email === email);
    if (!bot) continue;
    for (const text of posts) {
      allPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: bot.avatar,
        content: text,
        sport: bot.sport,
        category: "news",
        media_urls: [],
        likes: randLikes(rand(20, 150), allEmails),
        views: rand(600, 10000),
        comments_count: rand(5, 60),
        shares: rand(2, 30),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(3),
      });
    }
  }

  // 2f. PHOTO POSTS — athlete bots with Pexels images
  for (const bot of BOTS.filter(b => b.type === "athlete")) {
    const photos = photosByBot[bot.email] || [];
    const captions = shuffle(PHOTO_CAPTIONS[bot.sport] || ["Training day 📸"]);
    for (let i = 0; i < Math.min(photos.length, captions.length, 4); i++) {
      allPosts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: bot.avatar,
        content: captions[i],
        sport: bot.sport,
        category: "training",
        media_urls: [photos[i]],
        likes: randLikes(rand(8, 70), allEmails),
        views: rand(300, 5000),
        comments_count: rand(1, 20),
        shares: rand(0, 10),
        is_premium: false,
        comments_disabled: false,
        created_date: recentDate(4),
      });
    }
  }

  // ── Phase 3: Insert in batches ──
  console.log(`\n⬆️  Inserting ${allPosts.length} posts into Supabase...`);
  const BATCH = 25;
  let inserted = 0;
  for (let i = 0; i < allPosts.length; i += BATCH) {
    const batch = allPosts.slice(i, i + BATCH);
    try {
      await insertPosts(batch);
      inserted += batch.length;
      process.stdout.write(`\r   ${inserted}/${allPosts.length} inserted`);
    } catch (err) {
      console.error(`\n  ✗ Batch ${i / BATCH + 1} failed: ${err.message}`);
    }
  }

  const textCount = allPosts.filter(p => !p.media_urls?.length).length;
  const photoCount = allPosts.filter(p => p.media_urls?.length).length;
  console.log(`\n\n✅ Done! ${inserted} total posts inserted.`);
  console.log(`   📝 Text posts: ${textCount}`);
  console.log(`   📸 Photo posts: ${photoCount}`);
  console.log("\n   Refresh the Sportsphere feed — you should see immediate variety! 🎨");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
