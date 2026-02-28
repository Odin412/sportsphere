/**
 * Sportsphere Bot Seed Script
 * ───────────────────────────
 * Creates 15 bot accounts (5 official channels + 10 athlete personas) and seeds
 * 120+ posts into the Supabase posts table. Optionally fetches real sports video
 * URLs from Pexels to populate the Reels tab.
 *
 * Usage:
 *   node tools/seed_bots.mjs
 *
 * Requirements:
 *   - Node.js 18+ (uses native fetch)
 *   - Set PEXELS_API_KEY below (or leave empty to skip video reels)
 *   - Supabase service role key embedded below (already set)
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";

// Get your FREE Pexels API key at: https://www.pexels.com/api/
// Leave empty ("") to skip video fetching (text posts only)
const PEXELS_API_KEY = "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";

// ─── BOT ACCOUNTS ────────────────────────────────────────────────────────────
const BOTS = [
  // Official channels
  {
    email: "espn-news@sportsphere.app",
    name: "ESPN SportsSphere",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=ESPN&backgroundColor=dc2626&textColor=ffffff&fontFamily=Arial&fontSize=40",
    sport: null,
    type: "channel",
    likes_pool: [],
  },
  {
    email: "nba-daily@sportsphere.app",
    name: "NBA Daily",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=NBA&backgroundColor=1d4ed8&textColor=ffffff&fontFamily=Arial&fontSize=40",
    sport: "Basketball",
    type: "channel",
    likes_pool: [],
  },
  {
    email: "premier-league@sportsphere.app",
    name: "Premier League HQ",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=PL&backgroundColor=3b0764&textColor=ffffff&fontFamily=Arial&fontSize=40",
    sport: "Soccer",
    type: "channel",
    likes_pool: [],
  },
  {
    email: "ufc-hub@sportsphere.app",
    name: "UFC Fight Hub",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=UFC&backgroundColor=dc2626&textColor=ffffff&fontFamily=Arial&fontSize=40",
    sport: "MMA",
    type: "channel",
    likes_pool: [],
  },
  {
    email: "olympic-sports@sportsphere.app",
    name: "Olympic Sports Network",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=OSN&backgroundColor=ca8a04&textColor=ffffff&fontFamily=Arial&fontSize=40",
    sport: null,
    type: "channel",
    likes_pool: [],
  },
  // Athlete personas
  {
    email: "jordan.williams@sportsphere.app",
    name: "Jordan Williams",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanWilliams&backgroundColor=1f2937",
    sport: "Basketball",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "marcus.silva@sportsphere.app",
    name: "Marcus Silva",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusSilva&backgroundColor=1f2937",
    sport: "Soccer",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "emma.chen@sportsphere.app",
    name: "Emma Chen",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=EmmaChen&backgroundColor=1f2937",
    sport: "Tennis",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "tyler.brooks@sportsphere.app",
    name: "Tyler Brooks",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=TylerBrooks&backgroundColor=1f2937",
    sport: "Football",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "sofia.rodriguez@sportsphere.app",
    name: "Sofia Rodriguez",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SofiaRodriguez&backgroundColor=1f2937",
    sport: "Swimming",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "jack.obrien@sportsphere.app",
    name: "Jack O'Brien",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JackOBrien&backgroundColor=1f2937",
    sport: "Golf",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "aisha.mohammed@sportsphere.app",
    name: "Aisha Mohammed",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AishaMohammed&backgroundColor=1f2937",
    sport: "Track",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "ryan.park@sportsphere.app",
    name: "Ryan Park",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RyanPark&backgroundColor=1f2937",
    sport: "Hockey",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "diego.fernandez@sportsphere.app",
    name: "Diego Fernandez",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DiegoFernandez&backgroundColor=1f2937",
    sport: "Baseball",
    type: "athlete",
    likes_pool: [],
  },
  {
    email: "zara.mitchell@sportsphere.app",
    name: "Zara Mitchell",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ZaraMitchell&backgroundColor=1f2937",
    sport: "CrossFit",
    type: "athlete",
    likes_pool: [],
  },
];

// ─── CONTENT BANK ────────────────────────────────────────────────────────────
const CONTENT = {
  "espn-news@sportsphere.app": [
    { text: "BREAKING: Record-breaking performances across the league this week. Athletes are pushing limits we've never seen before. Full breakdown inside.", cat: "news" },
    { text: "Top 10 moments from this weekend's action: From buzzer-beaters to photo finishes, sports delivered everything. Which was your favorite?", cat: "highlight" },
    { text: "INJURY UPDATE: Several key players listed as questionable heading into the weekend. Fantasy managers, take note.", cat: "news" },
    { text: "Championship race tightens — three teams separated by just one game with four weeks to play. The stretch run is here.", cat: "news" },
    { text: "Rookie of the year candidates are making their cases loud and clear. The stats don't lie — this generation is special.", cat: "highlight" },
    { text: "TRADE DEADLINE WATCH: Front offices are busy. Multiple blockbuster deals reportedly in the works. Stay tuned for updates.", cat: "news" },
    { text: "This week's Power Rankings are live. Major shifts at the top — see if your team made the cut.", cat: "news" },
    { text: "Coaching hot seat report: Three coaches feeling the pressure after tough losses. Who stays, who goes?", cat: "news" },
    { text: "Athletes of the week announced! Six performances that stopped the sports world in its tracks.", cat: "highlight" },
    { text: "SPORTS SCIENCE: How elite athletes train their minds as much as their bodies. The mental game is everything.", cat: "training" },
  ],
  "nba-daily@sportsphere.app": [
    { text: "Tonight's marquee matchup: Both teams coming off back-to-backs. Fatigue management will be key. Who has the edge?", cat: "news" },
    { text: "Three-pointer revolution continues: League average from deep hits an all-time high. Is this good for basketball?", cat: "news" },
    { text: "Rising star alert: This second-year player is averaging 28/7/6 in the last 10 games. Contract extension incoming?", cat: "highlight" },
    { text: "The analytics on this season's MVP race: Two players so close it might come down to team record. Follow the data.", cat: "news" },
    { text: "Defensive Player of the Year conversation heats up. This lockdown defender is making opponents' lives miserable.", cat: "highlight" },
    { text: "Draft scouting report drops: Top 5 prospects evaluated. Who fits which system best?", cat: "news" },
    { text: "Comeback story of the year: 18 months after surgery, this veteran is balling like it's 2019. Inspiring.", cat: "highlight" },
    { text: "Western Conference standings update: Five teams within 2.5 games. Every game is a playoff game right now.", cat: "news" },
    { text: "Signature move breakdown: We analyzed 200 clips of this elite scorer's footwork. The details are incredible.", cat: "training" },
    { text: "G-League to NBA: Three call-ups this week. Follow these names — they're going to be stars.", cat: "news" },
  ],
  "premier-league@sportsphere.app": [
    { text: "Matchday preview: The weekend's biggest clashes and what's at stake for each club's season.", cat: "news" },
    { text: "Tactical breakdown: How the league's top pressing team makes your defense look like amateurs.", cat: "training" },
    { text: "Transfer window rumor mill: A marquee striker linked with three clubs. Where will he land?", cat: "news" },
    { text: "Golden Boot race update: Five strikers within three goals. It's wide open.", cat: "news" },
    { text: "CHAMPIONS LEAGUE draw reaction: Who got the harder bracket? Group stage analysis.", cat: "news" },
    { text: "Academy graduates dominating: Six youth products in starting XIs this weekend. The future is bright.", cat: "highlight" },
    { text: "VAR controversy round-up: The decisions that changed results this week and the debate they sparked.", cat: "news" },
    { text: "Manager of the month nominees revealed. Who deserves the award for turning their club's form around?", cat: "news" },
    { text: "Set piece statistics: This team scores 40% of goals from set pieces. The data behind dead ball mastery.", cat: "training" },
    { text: "Relegation battle intensifies: Three clubs in desperate form. Every point is priceless now.", cat: "news" },
  ],
  "ufc-hub@sportsphere.app": [
    { text: "FIGHT NIGHT RESULTS: Main card recap with finish of the night, performance bonuses, and what's next for the winners.", cat: "news" },
    { text: "Title fight announced: Two of the division's best will finally settle it. Date and venue confirmed.", cat: "news" },
    { text: "Training camp footage: Fighters are putting in the work 8 weeks out. The intensity is next level.", cat: "training" },
    { text: "Submission of the year candidate just happened. The technique, the timing, the execution — perfection.", cat: "highlight" },
    { text: "Pound-for-pound rankings update after this weekend's action. Major movement at the top.", cat: "news" },
    { text: "Debut watch: Three fighters making their promotional debuts this month. Who has the most upside?", cat: "news" },
    { text: "Striking breakdown: Coach analysis of the most devastating combinations in combat sports right now.", cat: "training" },
    { text: "Contender series results: Multiple contracts handed out. The next wave of talent is arriving.", cat: "news" },
    { text: "Mental preparation secrets: Elite fighters share how they control fear and perform under pressure.", cat: "training" },
    { text: "Championship defense record: Who has defended most times in history? The numbers might surprise you.", cat: "highlight" },
  ],
  "olympic-sports@sportsphere.app": [
    { text: "World Athletics Championships preview: The 400m final promises to be one for the ages. Four sub-44 second runners in the same heat.", cat: "news" },
    { text: "Swimming world records fell TWICE this week. The sport is in its fastest era ever.", cat: "highlight" },
    { text: "Road to Paris 2028 begins: Qualification standards released. Athletes are already targeting key events.", cat: "news" },
    { text: "Paralympic athletes are setting world records that able-bodied athletes can't match. The human spirit is extraordinary.", cat: "highlight" },
    { text: "Tennis Grand Slam preview: Draw released. Potential dream matchups in the quarterfinals.", cat: "news" },
    { text: "Golf's major season begins: Defending champion preps on the same course where they made history.", cat: "news" },
    { text: "Cycling stage race digest: The mountains decided everything. Three riders separated by 12 seconds.", cat: "highlight" },
    { text: "Youth Olympic Games: Watch these 17-year-olds — they're your future world champions.", cat: "news" },
    { text: "Cross-training science: How multi-sport athletes develop superior body awareness and movement quality.", cat: "training" },
    { text: "Historic achievements this season: Five firsts that will be in the record books forever.", cat: "highlight" },
  ],
  "jordan.williams@sportsphere.app": [
    { text: "Just wrapped up a brutal 3-hour practice session. Hit 500 free throws today. 423 made. The grind never stops 🏀", cat: "training" },
    { text: "Film study at 6am before anyone else gets to the gym. You want it? Outwork everyone. Every single day.", cat: "training" },
    { text: "The mid-range pull-up jumper is the most underrated shot in basketball. Plant foot, square shoulders, follow through. Repeat 1000 times.", cat: "training" },
    { text: "Game night feels. Nothing compares to that moment when the gym goes quiet and all you hear is your heartbeat 🔥 We got the W.", cat: "highlight" },
    { text: "Recovery day: ice bath, foam roll, film review, 8 hours of sleep. The invisible work is where championships are built.", cat: "training" },
    { text: "Dropped 31 tonight on 12/18 shooting. Defense was switched every possession. You have to be able to score off ANY screen.", cat: "highlight" },
    { text: "To every young baller in my mentions: I was cut from my 9th grade JV squad. Use every rejection as fuel. I promise you.", cat: "motivation" },
    { text: "Ball handling drill I've been working on: triple threat, jab-step, jab-step, crossover attack. Defenders have to respect the jab first.", cat: "training" },
  ],
  "marcus.silva@sportsphere.app": [
    { text: "Technique drill day: first touch with both feet, 45 minutes each side. Left foot still needs work. No shortcuts, no excuses ⚽", cat: "training" },
    { text: "The best teams I've played against all shared one trait — communication. Verbal and non-verbal. On and off the pitch.", cat: "training" },
    { text: "Two-a-days this week. Pre-season pain hits different when you have a clear goal. Suffer now, celebrate later.", cat: "training" },
    { text: "Vision and anticipation separate good players from great ones. Know where you'll play the ball BEFORE it arrives. Always.", cat: "training" },
    { text: "Match recap: 2-1 win. Proud of the team but we left clear chances on the pitch. No celebrations — more work tomorrow.", cat: "highlight" },
    { text: "Pressing high is about timing and triggers, not just energy. Press on the goalkeeper's bad touch. Press on the back pass. Be specific.", cat: "training" },
    { text: "Growing up in Brazil, I kicked a ball before I could walk. Every kid in my neighborhood wanted to be Ronaldo. I still do.", cat: "motivation" },
    { text: "Set piece rehearsal this morning: corner kick routines, free kick walls, penalty practice. 1% improvements compound.", cat: "training" },
  ],
  "emma.chen@sportsphere.app": [
    { text: "Serving clinic today. Working on pronation through contact to add 8-10 mph to my first serve. The shoulder turn is everything.", cat: "training" },
    { text: "Match analysis: I won the first set 6-2, dropped the second 3-6. The mental reset between sets is a skill you have to practice.", cat: "highlight" },
    { text: "String tension matters more than most players think. I go tighter in humid conditions, looser in dry. Feel the ball, don't just hit it.", cat: "training" },
    { text: "After 6 months of working on my backhand slice, it finally felt natural in a real match today. Patient practice changes everything.", cat: "training" },
    { text: "WTA circuit life: 30 weeks a year on tour, hotel rooms, airport lounges, different time zones every week. I wouldn't trade it for anything.", cat: "motivation" },
    { text: "Footwork is 80% of tennis. Most players focus on their strokes but the race to the ball determines everything. Work your split step.", cat: "training" },
    { text: "Reached the quarterfinals today 🎾 Took out the 4th seed in 3 sets. Best match of my season. The next round is mine.", cat: "highlight" },
    { text: "Mental toughness tip: when you're down a break, only think about the next point. Not the score, not the match — one point.", cat: "training" },
  ],
  "tyler.brooks@sportsphere.app": [
    { text: "Film room at 7am. I've watched this offense's tendencies 40 times this week. I know every formation, every motion, every tell. Ready.", cat: "training" },
    { text: "Linebacker keys: eyes on the guard's down hand. A pulling guard tells you everything about where the run is going. Read, react, attack.", cat: "training" },
    { text: "250 lbs and I still run a 4.5. Power AND speed. That's the combination you need at this level. Never stop developing both.", cat: "training" },
    { text: "Hit a huge stop on 3rd and 1 tonight. Defense wins championships — I believe that 100%. Our D gave up 7 points. Special.", cat: "highlight" },
    { text: "D1 college football truth: the game is infinitely faster than high school. I got humbled my first week. Embrace the learning curve.", cat: "motivation" },
    { text: "Off-season is when you make the team. In-season you just show what you built. I'm in the weight room every single morning.", cat: "training" },
    { text: "Communication on defense is non-negotiable. Pre-snap you should have every gap assignment confirmed. Talk to your teammates. Always.", cat: "training" },
    { text: "Picked up my first sack of the season today 🏈 Beat a blindside block, got skinny through the gap, got home. The work is paying off.", cat: "highlight" },
  ],
  "sofia.rodriguez@sportsphere.app": [
    { text: "6,000 meters in the pool today. Every rep of every set. The yardage adds up to championships. Trust the process. 🏊", cat: "training" },
    { text: "Technique focus this week: underwater dolphin kicks off every wall. The breakout is where you win or lose in elite swimming.", cat: "training" },
    { text: "Olympic trials are 8 months away. I have a training plan that touches every energy system. Every day has a purpose.", cat: "training" },
    { text: "New personal best in the 200 fly today 🏆 Dropped 0.8 seconds from my best. I cried in the locker room. I've never been this fast.", cat: "highlight" },
    { text: "Swimming is a lonely sport. 5am. Dark pool. You and the black line. But that solitude is where I find out exactly who I am.", cat: "motivation" },
    { text: "Nutrition timing for swimmers: high carb 3 hours before a hard session, protein and carbs within 30 minutes after. Fueling is training.", cat: "training" },
    { text: "Altitude camp this month in Colorado. Training at 7,000 feet so sea level feels easy. The adaptation is real. Feel the difference.", cat: "training" },
    { text: "Everyone sees the race. Nobody sees the 4am alarms, the shoulder rehab, the bad days when you want to quit. This sport demands everything.", cat: "motivation" },
  ],
  "jack.obrien@sportsphere.app": [
    { text: "Chipping clinic: 60% of all scoring chances come within 30 yards of the pin. Most amateurs spend 90% of practice time on driving. Wrong.", cat: "training" },
    { text: "Course management over ego: I took a 7-iron off the tee on a 415-yard par 4 today and made birdie. Know your miss, play away from trouble.", cat: "training" },
    { text: "Shot a 67 at the qualifier. 5 birdies, 0 bogeys, 1 eagle. The irons were dialed. Proud of the mental game today ⛳", cat: "highlight" },
    { text: "The mental side of golf is 90% of the game. You can have a perfect swing and still shoot 80 if your head isn't right.", cat: "training" },
    { text: "Growing up in Dublin meant links golf in wind and rain. Every American pro I've played against tells me my iron game is special. Thank you, Portmarnock.", cat: "motivation" },
    { text: "Putting drill that changed my game: 3-foot circles around the hole. Make 100 in a row before you leave. Simple, devastating for bad putters.", cat: "training" },
    { text: "Pre-shot routine is sacred. Mine: two practice swings, one look at target, one deep breath, commit. 8 seconds. Same every time. Never skip it.", cat: "training" },
    { text: "Just received my amateur ranking update — top 100 globally. One more big result and I turn pro. The dream is real. Onwards.", cat: "highlight" },
  ],
  "aisha.mohammed@sportsphere.app": [
    { text: "400m training philosophy: the first 200 is a controlled sprint, the third 100 is the race, the last 100 is war. Run accordingly.", cat: "training" },
    { text: "Track session this morning: 4×400 at 95% with 3-minute recovery. Last rep was my fastest. That's when you know the fitness is there.", cat: "training" },
    { text: "New national record 🏃‍♀️ 49.3 seconds. I've been chasing that number for 3 years. Today was the day. Nairobi, we did it!", cat: "highlight" },
    { text: "Running economy tip: keep your arms at 90 degrees, hands loose like you're holding chips, drive the elbow back not forward. Efficiency matters.", cat: "training" },
    { text: "I train twice a day, 6 days a week, while taking online university classes. Time management is my most important athletic skill.", cat: "motivation" },
    { text: "Heat acclimatization: two weeks of training in high temperatures before racing in hot conditions cuts your time loss in half. Science wins.", cat: "training" },
    { text: "The last 100 meters of a 400: your body is screaming stop. Your mind has to be stronger. Train the pain. Embrace the suffering.", cat: "motivation" },
    { text: "World Championship prep: 12 weeks out. The peaking cycle starts now. Every session has to count. Every rep has purpose. Let's go.", cat: "training" },
  ],
  "ryan.park@sportsphere.app": [
    { text: "Skating edges clinic: inside and outside edge work for 90 minutes today. Hockey is played on edges, not the blade. Master the edge.", cat: "training" },
    { text: "Defensive positioning: never let a player beat you to the inside. Force them to the wall, battle for puck possession, win the battle. Always.", cat: "training" },
    { text: "Physical game truth: you have to win the battles along the board before you win the puck races. Get your stick on their hands first.", cat: "training" },
    { text: "Minus-8 last season. Plus-14 this season. Changed my gap control, my defensive reads, and my work ethic. Everything can change. Trust the process 🏒", cat: "highlight" },
    { text: "Grew up in Vancouver skating on outdoor rinks. -15 degrees. Toque on. Coffee thermos rinkside. Those memories make the grind feel normal.", cat: "motivation" },
    { text: "Penalty kill philosophy: get sticks in shooting lanes, take away the pass to the back door, make them shoot from the outside. Active, not passive.", cat: "training" },
    { text: "Recovery between games in the NHL schedule: contrast therapy (cold/hot), compression, nutrition, sleep. You have to maintain your body like a machine.", cat: "training" },
    { text: "Scored my first NHL goal tonight in front of my family. Couldn't speak after. Worth every single morning skate and gym session 🔥", cat: "highlight" },
  ],
  "diego.fernandez@sportsphere.app": [
    { text: "Bullpen session today: 45 pitches, focused on tunneling my fastball and changeup. If they look the same out of the hand, both become more dangerous.", cat: "training" },
    { text: "Grip pressure is everything in pitching. Most young pitchers grip too tight and kill their arm speed. Relax. Let the ball come out naturally.", cat: "training" },
    { text: "Struck out 11 over 7 innings. Mixed speeds all night: 96, 88, 96, 80. Kept them off balance the entire game. That's the plan ⚾", cat: "highlight" },
    { text: "Grew up in Santo Domingo throwing a crushed bottle cap as a kid because we couldn't afford real balls. Now I'm throwing in professional stadiums. Grateful.", cat: "motivation" },
    { text: "Arm care routine: band work, long toss program, proper mechanical sequencing. Your arm is your career. Protect it like your most valuable asset.", cat: "training" },
    { text: "Velocity is a tool, not the goal. Command is the goal. I'd rather have a 90mph pitch I can throw anywhere than a 98 I can't locate.", cat: "training" },
    { text: "0-3 through 5 innings tonight. Could have panicked. Stayed with my game plan, trusted my stuff, got 6 straight outs to finish strong.", cat: "highlight" },
    { text: "The hardest part of pitching isn't physical — it's staying locked in for 5 hours between starts. The mental discipline between outings determines your career.", cat: "motivation" },
  ],
  "zara.mitchell@sportsphere.app": [
    { text: "Open WOD dropped today. My strategy: pace the first half, go unbroken on the gymnastics, sprint the final 2 minutes. Execution over emotion 💪", cat: "training" },
    { text: "Overhead squat mobility: if you can't hold a broomstick in the catch position pain-free, you need to address thoracic and shoulder mobility NOW.", cat: "training" },
    { text: "PR'd my clean & jerk today — 105kg 🏋️‍♀️ Six months of technique work paid off in one moment. Every rep in the gym builds towards these seconds.", cat: "highlight" },
    { text: "CrossFit truth that nobody tells beginners: the first 6 months are mostly about learning movement, not fitness. Slow down. Get the technique right.", cat: "training" },
    { text: "Sydney winter training: cold mornings, dark boxes, chalk everywhere. I wouldn't trade this community for anything in the world. My gym family.", cat: "motivation" },
    { text: "Gymnastics base in CrossFit: kipping pull-ups, muscle-ups, toes-to-bar. If you can't do them strict first, learn them strict. The kip is a power transfer, not a shortcut.", cat: "training" },
    { text: "Competition prep nutrition: 2 weeks out, increase protein to 1.8g/kg, drop refined carbs, keep complex carbs for training days. Simple, effective.", cat: "training" },
    { text: "Finished 47th globally in the Open last year. Top 25 is my target this year. The gap between 47 and 25 is built in 5am sessions. Every day.", cat: "highlight" },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function daysAgo(n, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(6 + Math.floor(Math.random() * 16) + hourOffset);
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

async function fetchPexelsVideos(query) {
  if (!PEXELS_API_KEY) return [];
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=6&orientation=portrait`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const json = await res.json();
    const urls = [];
    for (const video of json.videos || []) {
      const sdFile = video.video_files?.find(
        (f) => f.quality === "sd" && f.file_type === "video/mp4"
      );
      const hdFile = video.video_files?.find(
        (f) => f.quality === "hd" && f.file_type === "video/mp4"
      );
      const file = sdFile || hdFile;
      if (file?.link) urls.push(file.link);
    }
    return urls;
  } catch (e) {
    console.warn(`  Pexels fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Sportsphere Bot Seed Script\n");

  const allEmails = BOTS.map((b) => b.email);

  // Phase 1: Fetch Pexels videos for each athlete sport
  console.log("📹 Fetching Pexels sports videos...");
  const SPORT_QUERIES = {
    Basketball: "basketball training dribbling",
    Soccer: "soccer football training skills",
    Tennis: "tennis training match",
    Football: "american football training",
    Swimming: "swimming pool training",
    Golf: "golf swing training",
    Track: "running track athletics sprint",
    Hockey: "ice hockey training",
    Baseball: "baseball pitching training",
    CrossFit: "crossfit gym workout training",
  };

  const videosByBot = {};
  for (const bot of BOTS.filter((b) => b.type === "athlete")) {
    const query = SPORT_QUERIES[bot.sport] || bot.sport;
    const videos = await fetchPexelsVideos(query);
    videosByBot[bot.email] = videos;
    if (videos.length > 0) {
      console.log(`  ✓ ${bot.name}: ${videos.length} videos`);
    } else {
      console.log(`  ○ ${bot.name}: no videos (text-only posts)`);
    }
  }

  // Phase 2: Build and insert all posts
  console.log("\n📝 Building seed posts...");
  let totalInserted = 0;

  for (const bot of BOTS) {
    const contentList = CONTENT[bot.email] || [];
    if (!contentList.length) {
      console.warn(`  ⚠ No content bank for ${bot.name}`);
      continue;
    }

    const posts = [];
    const videos = videosByBot[bot.email] || [];
    let videoIdx = 0;
    let dayOffset = 0;

    // Text posts (all bots)
    contentList.forEach((item, idx) => {
      dayOffset = Math.floor((idx / contentList.length) * 28) + rand(0, 2);
      const likeCount = bot.type === "channel" ? rand(20, 200) : rand(5, 80);

      posts.push({
        author_email: bot.email,
        author_name: bot.name,
        author_avatar: bot.avatar,
        content: item.text,
        sport: bot.sport,
        category: item.cat,
        media_urls: [],
        likes: randLikes(likeCount, allEmails),
        views: rand(200, 8000),
        comments_count: rand(0, 30),
        shares: rand(0, 15),
        is_premium: false,
        comments_disabled: false,
        created_date: daysAgo(28 - dayOffset),
      });
    });

    // Video reel posts (athletes only, 2-3 videos each)
    if (bot.type === "athlete" && videos.length > 0) {
      const reelCount = Math.min(3, videos.length);
      for (let i = 0; i < reelCount; i++) {
        const videoUrl = videos[videoIdx % videos.length];
        videoIdx++;
        posts.push({
          author_email: bot.email,
          author_name: bot.name,
          author_avatar: bot.avatar,
          content: `Training reel 🎬 ${bot.sport} • ${bot.name}`,
          sport: bot.sport,
          category: "training",
          media_urls: [videoUrl],
          likes: randLikes(rand(10, 60), allEmails),
          views: rand(500, 15000),
          comments_count: rand(2, 40),
          shares: rand(1, 20),
          is_premium: false,
          comments_disabled: false,
          created_date: daysAgo(rand(1, 20)),
        });
      }
    }

    try {
      await insertPosts(posts);
      totalInserted += posts.length;
      const videoCount = posts.filter((p) => p.media_urls.length > 0).length;
      console.log(
        `  ✓ ${bot.name}: ${posts.length} posts inserted` +
          (videoCount > 0 ? ` (${videoCount} video reels)` : "")
      );
    } catch (err) {
      console.error(`  ✗ ${bot.name}: ${err.message}`);
    }
  }

  console.log(`\n✅ Done! ${totalInserted} posts inserted into Supabase.`);
  console.log("   Open the Sportsphere feed — you should see content immediately.");
  if (!PEXELS_API_KEY) {
    console.log("\n💡 To add video reels:");
    console.log("   1. Get a free Pexels API key at https://www.pexels.com/api/");
    console.log("   2. Set PEXELS_API_KEY at the top of this file");
    console.log("   3. Run: node tools/seed_bots.mjs");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
