/**
 * bot_content.mjs — Content template banks for the Bot Squad
 *
 * NO training drills or workout content.
 * Focus: game recaps, highlights, news, opinions, motivation,
 *        tournament talk, parent perspective, season discussion.
 */

import { pick, pickN, randomInt } from './bot_helpers.mjs';
import { getSportsContext } from './sports_brain.mjs';

// ── Baseball/Softball Parent Content ─────────────────────────────

const BB_PARENT_POSTS = [
  // Game recaps
  "Tournament weekend! {kid} went 3-for-4 with a double and scored the winning run. This team is something special.",
  "Down 5-2 in the 6th and these kids came back to win 7-5. Never count them out. What a game!",
  "Rain delay at the tournament. Kids are playing cards in the car. This is the travel ball life.",
  "First game of the double header: W. Second game: extra innings loss. These kids left everything on the field today.",
  "Championship Sunday. Win or go home. These kids have worked so hard for this moment.",
  "Lost a tough one today 3-2. {kid} pitched a great game — sometimes baseball just doesn't go your way.",
  "5am wake up, 3 hour drive, 2 games, sunburn, memories that'll last forever. Travel ball season is HERE.",
  "Pool play done. 2-1 going into bracket. These kids are locked in right now.",
  // Milestones
  "First home run of the season for {kid}! Over the center field fence. I may have screamed louder than anyone.",
  "{kid} caught a runner stealing at second to end the game. That throw was PERFECT.",
  "College coaches were at the game today watching {kid}. Trying to stay calm but internally I'm freaking out.",
  "Pitching milestone — {kid} threw a complete game shutout today. 5 innings, 9 Ks. Unreal.",
  // Community / humor
  "Tournament snack bar prices should be a crime. $8 for a hot dog? But here I am, buying two.",
  "My trunk right now: 3 bats, 2 gloves, folding chairs, a cooler, sunscreen, bug spray, and somewhere in there... my sanity.",
  "Friendly reminder that the umpire is someone's kid too. Let's keep it classy out there, parents.",
  "Sat in the wrong team's bleachers for half an inning. In my defense, both teams wear blue.",
  "Whoever invented the bucket hat knew it was for baseball parents watching 4 games in 95 degree heat.",
  // Season talk
  "Spring season schedule just dropped. 22 games plus tournaments. Here. We. Go.",
  "Tryout season is intense. So many talented kids out there competing for spots.",
  "Fall ball starts next week. Time to work on fundamentals and try some new positions.",
  "Offseason but still at the cages every week. You don't get better by taking time off.",
  // Motivation
  "Watching {kid} pick up a younger player who struck out and tell them 'you'll get it next time' — that's what sports is about.",
  "The best part of youth sports isn't the wins. It's watching your kid learn to handle the losses.",
  "Win or lose, the car ride home is for ice cream. That's the rule.",
  // Recruiting / showcase
  "First PBR event this weekend for {kid}. Nervous but excited. This is a big opportunity.",
  "College visit last weekend. {kid} loved the campus and the coach was great. This recruiting process is wild.",
  "Got the PG ranking back. {kid} placed really well. All that hard work is paying off.",
  "Showcase season is here. 4 events in the next 6 weeks. Packed schedule but worth every mile.",
];

const BB_PARENT_COMMENTS = {
  game: ["Great game!", "What a win!", "These kids are special", "Love watching them compete", "Way to battle back!", "That's how you play the game!", "So proud of this team"],
  milestone: ["Congrats!", "So deserved!", "Hard work pays off!", "What a moment!", "That's amazing!", "The future is bright!"],
  parent: ["I feel this so hard 😂", "Same here!", "Travel ball life!", "This is so relatable", "Been there!", "100% accurate"],
  support: ["Keep grinding!", "The work shows!", "Love the dedication", "That kid is going places", "Great family support!"],
  news: ["Interesting!", "Big news", "Didn't see that coming", "This changes things", "Good analysis"],
};

// ── Baseball/Softball Athlete Content ────────────────────────────

const BB_ATHLETE_POSTS = [
  "Started today. 7 innings, 2 ER, 8 Ks. Got the W. Good team win.",
  "2-for-4 with an RBI double in the gap. We stay hot.",
  "Tough loss tonight but we competed. Back at it tomorrow.",
  "Walk-off single in the bottom of the 9th. There's no better feeling in sports.",
  "Bus rides after a series sweep hit different. Great road trip for the squad.",
  "Spring training energy is unmatched. Excited to be back on the field.",
  "Bullpen session felt great today. Everything was moving well.",
  "Grateful for this opportunity. Every day in this uniform is a blessing.",
  "Weekend series starts tomorrow. Big matchup against the #3 team in the conference.",
  "The grind of a long season teaches you things no classroom ever will.",
  "College baseball doesn't get enough love. The atmosphere at these games is incredible.",
  "Opening Day vibes. Nothing beats this time of year.",
  "Minor league buses, stadium hot dogs, and chasing a dream. I love this life.",
  "Offseason work is where championships are won. Staying ready.",
];

// ── Basketball Content ───────────────────────────────────────────

const BK_POSTS = [
  "Game day energy. Nothing like it when the gym is packed.",
  "40 piece tonight with 8 assists. We rolling.",
  "March Madness bracket is wild this year. My picks are already busted.",
  "NBA trade deadline always shakes things up. Some of these deals are crazy.",
  "Youth basketball tournament this weekend. These kids are hooping at a high level.",
  "AAU season starting to heat up. Jordan had 22 points and 6 assists today. Proud moment.",
  "Watching the NBA playoffs and this series is going to 7. No doubt.",
  "Basketball IQ is the most underrated skill. You can teach shooting, you can't teach instinct.",
  "Gym is empty at 6am. That's when the real work happens.",
  "First day of basketball practice. New season, new goals, same grind.",
  "These young players today are so much more skilled than we were at that age. The game is evolving.",
  "My bracket is destroyed but I'm not even mad. March Madness never disappoints.",
];

// ── Football Content ─────────────────────────────────────────────

const FB_POSTS = [
  "Super Bowl reactions still hitting different. What a game that was.",
  "NFL Draft day is my favorite non-game day of the year. The drama is unreal.",
  "Pop Warner game today. Cam had 2 touchdowns and a fumble recovery. Saturday mornings are the best.",
  "Film don't lie. You either did your job or you didn't. Simple game.",
  "NFL free agency is chaos and I'm here for every minute of it.",
  "Fantasy football draft strategy already in the works. It's never too early.",
  "Friday night lights. There's something special about high school football under the lights.",
  "The defensive line is the heartbeat of any great team. Always has been.",
  "Combine numbers are fun but football is played on the field, not in shorts.",
  "Playoff football is the best version of sports. Every play matters.",
  "College Football Playoff needs to expand even more. So many deserving teams get left out.",
  "Offseason for the NFL but never offseason for the grind. Players are already working.",
];

// ── Soccer Content ───────────────────────────────────────────────

const SC_POSTS = [
  "Match day. Nothing beats the energy of the pitch right before kickoff.",
  "The beautiful game never gets old. Every touch, every pass, every goal.",
  "Club soccer weekend. Sofia scored from 20 yards out. The celebration was epic!",
  "Champions League nights are special. European football at its finest.",
  "Youth soccer development should focus on creativity, not results. Let kids play.",
  "MLS is growing so fast. The quality of play improves every season.",
  "World Cup qualifying is heating up. Every match feels like a final.",
  "Set pieces win games. If you're not practicing them, you're leaving points on the table.",
  "First touch is everything in this sport. The great ones make it look effortless.",
  "Soccer parent life: standing in the rain for 90 minutes and loving every second.",
];

// ── General / News / Multi-sport Content ─────────────────────────

const GEN_POSTS = [
  "Three kids, three games, three different fields. The minivan gets a workout every Saturday.",
  "Sports teach kids more about life than any textbook. Teamwork, resilience, discipline.",
  "Game day snack duty this week. 20 juice boxes and granola bars. Let's go.",
  "The real MVP is every parent who drives their kid to 6am practice without complaining. Just kidding, we all complain.",
  "Multiple sport kids are the happiest kids. Let them try everything while they're young.",
  "Youth sports registration season hits the wallet different. Worth every penny though.",
  "Saturday morning: baseball at 9, soccer at 12, basketball at 3. We need a clone.",
  "The best investment in kids isn't equipment. It's showing up and being present.",
];

const NEWS_POSTS = [
  "BREAKING: Major trade shakes up the {sport} world. Reactions are pouring in.",
  "Season preview: Everything you need to know heading into {sport} season.",
  "Top 10 plays of the week across {sport}. Number 1 is absolutely unreal.",
  "Injury report update: Key players returning just in time for the {event}.",
  "Power rankings updated after this week's results. Some surprising moves.",
  "Rookie of the Year race is heating up. Three strong candidates making their case.",
  "Offseason moves that will define the next {sport} season. Which teams improved the most?",
  "Breaking down the biggest storylines heading into {event}. Here's what to watch for.",
  "Historic moment: A record that stood for decades was just broken.",
  "Trade deadline recap: Winners and losers from a wild day of deals.",
];

// ── Offseason Content by Sport ───────────────────────────────────

const OFFSEASON = {
  baseball: [
    "Hot stove season is the best. Every rumor, every trade talk. Baseball never really stops.",
    "Free agency predictions: Who ends up where? My top 5 predictions.",
    "Prospect rankings just dropped. Some exciting young talent coming up through the system.",
    "Baseball winter meetings are like the NFL Draft for us. Pure drama.",
    "Offseason moves so far have been wild. The landscape of the league is changing.",
  ],
  basketball: [
    "NBA offseason trades heating up. Which team got better? Let's debate.",
    "Summer league is underrated entertainment. You can see the future stars right now.",
    "Draft analysis: Breaking down every first round pick. Who got the steal?",
  ],
  football: [
    "NFL Draft grades are in. My takes don't match ESPN at all.",
    "OTAs starting soon. The offseason program separates the contenders from pretenders.",
    "Free agency recap: Every major signing ranked. Some teams crushed it.",
  ],
  soccer: [
    "Transfer window madness. The rumors are flying. Half won't be true but it's fun.",
    "International break always makes club soccer feel longer. Can't wait for league play to return.",
  ],
};

// ── Content Generation Functions ─────────────────────────────────

function fillTemplate(template, vars = {}) {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  }
  return result;
}

const KID_NAMES = ['Jake', 'Emma', 'Aiden', 'Mia', 'Tyler', 'Riley', 'Noah', 'Chloe', 'Jordan', 'Sofia', 'Cam'];

export function generatePost(persona, sportsContext = null) {
  const ctx = sportsContext || getSportsContext();
  const sport = persona.profile.sport || 'Baseball';
  const sportKey = sport.toLowerCase().replace(/\/.*/, '');
  const role = persona.profile.role;
  const isParent = role === 'parent';

  let pool = [];
  const sportCtx = ctx.sports[sportKey] || ctx.sports.baseball;

  // Select content pool based on role and sport
  if (isParent && (sportKey === 'baseball' || sport === 'Baseball')) {
    pool = [...BB_PARENT_POSTS];
  } else if (role === 'athlete' && (sportKey === 'baseball' || sport === 'Baseball')) {
    pool = [...BB_ATHLETE_POSTS];
  } else if (sportKey === 'basketball') {
    pool = [...BK_POSTS];
  } else if (sportKey === 'football') {
    pool = [...FB_POSTS];
  } else if (sportKey === 'soccer') {
    pool = [...SC_POSTS];
  } else if (role === 'organization' && persona.personality.tone === 'professional-news') {
    pool = [...NEWS_POSTS];
  } else if (isParent) {
    pool = [...GEN_POSTS, ...BB_PARENT_POSTS.slice(0, 10)];
  } else {
    pool = [...GEN_POSTS];
  }

  // Add offseason content if applicable
  if (sportCtx.phase === 'offseason' && OFFSEASON[sportKey]) {
    pool.push(...OFFSEASON[sportKey]);
  }

  // Pick a template and fill variables
  const template = pick(pool);
  const kidName = pick(KID_NAMES);
  const text = fillTemplate(template, {
    kid: kidName,
    sport: sport,
    event: sportCtx.activeEvents?.[0]?.name || `${sport} season`,
  });

  // Determine category
  let category = 'other';
  if (text.match(/game|win|loss|score|pitch|hit|run|shutout|walk-off|touchdown|goal/i)) category = 'game';
  else if (text.match(/news|breaking|trade|draft|free agency|ranking/i)) category = 'news';
  else if (text.match(/proud|grateful|dream|blessing|best part|motivation/i)) category = 'motivation';
  else if (text.match(/highlight|play of|top 10|unreal/i)) category = 'highlight';
  else if (text.match(/community|parent|snack|bleacher|trunk|umpire/i)) category = 'community';

  return {
    content: text,
    sport: sport === null ? pick(['Baseball', 'Basketball', 'Football', 'Soccer']) : sport,
    category,
  };
}

export function generateComment(persona, postCategory = 'game', postSport = 'Baseball') {
  const role = persona.profile.role;
  const isParent = role === 'parent';
  const sportKey = (persona.profile.sport || 'Baseball').toLowerCase().replace(/\/.*/, '');

  // Select comment pool
  let pool;
  if (isParent) {
    pool = BB_PARENT_COMMENTS[postCategory] || BB_PARENT_COMMENTS.support;
  } else {
    pool = BB_PARENT_COMMENTS[postCategory] || BB_PARENT_COMMENTS.news;
  }

  return pick(pool);
}

export function generateMessage(persona, otherName) {
  const messages = [
    `Hey ${otherName}! Great post. What tournament are you guys playing in this weekend?`,
    `${otherName} — do you know if they're doing signups for fall ball yet?`,
    `Love the content! We should connect. What area are you in?`,
    `Hey! My kid plays the same position. Would love to chat about the recruiting process.`,
    `Great game recap! Reminds me of our game last weekend.`,
    `Thanks for the follow! Always great to connect with other sports families.`,
    `What league do you play in? We might have faced each other!`,
    `Hope the rest of the season goes well for your team!`,
  ];
  return pick(messages);
}

export function generateForumTopic(persona, sportsContext = null) {
  const ctx = sportsContext || getSportsContext();
  const sport = persona.profile.sport || 'Baseball';

  const topics = [
    { title: `Best travel ball tournaments in ${sport.toLowerCase()}?`, content: `Looking for recommendations on the best tournaments for youth ${sport.toLowerCase()} players. What events have you had the best experience at?`, category: 'discussion', sport },
    { title: `${sport} season predictions`, content: `Let's hear your bold predictions for this ${sport.toLowerCase()} season. Who surprises? Who disappoints?`, category: 'discussion', sport },
    { title: 'Bat recommendations for 12U?', content: "Looking for bat recommendations for my 12U player. What are you all swinging this season? Budget around $200-300.", category: 'question', sport: 'Baseball' },
    { title: 'How early is too early for travel ball?', content: "My kid is 7 and loves baseball. Some parents are already talking about travel ball. Is 8U too young to start?", category: 'discussion', sport: 'Baseball' },
    { title: 'College recruiting timeline', content: "When should athletes start reaching out to college coaches? What's the right timeline for the recruiting process?", category: 'question', sport },
    { title: 'Best sports cameras for recording games?', content: "Want to start recording my kid's games for highlights and recruiting tape. What cameras or setups do you recommend?", category: 'question', sport },
  ];

  return pick(topics);
}
