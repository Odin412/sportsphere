#!/usr/bin/env node
/**
 * UserPersonaBot.js — Persona-driven simulation engine for Sportsphere
 *
 * Simulates authentic user behavior for stress testing and feature validation.
 * Each bot runs as a persona-driven agent with its own browser context.
 *
 * Usage:
 *   node tests/simulation/UserPersonaBot.js --persona hype --count 1 --headed
 *   node tests/simulation/UserPersonaBot.js --persona athlete --count 3
 *   node tests/simulation/UserPersonaBot.js --persona scout --count 2 --skip-signup
 *
 * Personas: hype, scout, athlete
 * Flags:   --headed (show browser), --count N, --skip-signup (reuse existing accounts),
 *          --iterations N (feed loop rounds, default 15)
 */

import { chromium } from "playwright";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(APP_ROOT, ".env") });

// ── Config ───────────────────────────────────────────────────────────────────

const APP_URL = "https://sportsphere-titan-one.vercel.app";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "mGO6Aa1rkzHppsuNpv3R2MP6Xf1AG5NJ09EM7N8eETyIUCkg6D1V9yPr";
const BOT_PASSWORD = "SimBot2026!Secure";

const SPORT_AVATAR_QUERIES = {
  Basketball: "basketball player portrait athletic young",
  Soccer: "soccer player portrait athletic",
  Football: "american football player athlete portrait",
  Baseball: "baseball player athlete portrait",
  Tennis: "tennis player portrait athletic",
  Swimming: "swimmer athlete portrait",
  "Track & Field": "runner sprinter athlete portrait",
  MMA: "martial arts fighter athlete portrait",
  Boxing: "boxer athlete gym portrait",
  Volleyball: "volleyball player athlete portrait",
};

async function fetchPexelsAvatar(sport, personaType = "athlete", gender = "male") {
  try {
    const genderWord = gender === "female" ? "woman" : "man";
    const baseQuery = SPORT_AVATAR_QUERIES[sport] || "athlete portrait sport";
    const query = personaType === "scout"
      ? `${genderWord} sports coach professional portrait`
      : `${genderWord} ${baseQuery}`;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=portrait`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) throw new Error(`Pexels ${res.status}`);
    const json = await res.json();
    const photos = json.photos || [];
    if (!photos.length) return null;
    const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 10))];
    return photo.src?.medium || photo.src?.small || null;
  } catch (e) {
    return null;
  }
}

const SPORTS = [
  "Basketball", "Soccer", "Football", "Baseball", "Tennis",
  "Swimming", "Track & Field", "MMA", "Boxing", "Volleyball",
];

const POSITIONS = {
  Basketball: "Point Guard", Soccer: "Midfielder", Football: "Wide Receiver",
  Baseball: "Shortstop", Tennis: "Singles", Swimming: "Freestyle",
  "Track & Field": "100m Sprinter", MMA: "Welterweight", Boxing: "Middleweight",
  Volleyball: "Outside Hitter",
};

const CITIES = [
  "Atlanta, GA", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Miami, FL", "Phoenix, AZ", "Denver, CO", "Seattle, WA",
  "Brooklyn, NY", "Dallas, TX",
];

const SCHOOLS = [
  "Jefferson High", "Westfield Academy", "Lincoln Prep", "Riverside High",
  "Eagle Creek HS", "City Hoops Club", "Bay Area Elite", "Thunder AAU",
];

// ── Persona Profiles ─────────────────────────────────────────────────────────

const PERSONAS = {
  hype: {
    label: "The Hype Fan",
    actionWeights: { like: 0.75, comment: 0.50, skip: 0.05 },
    commentStyle: "You are an extremely enthusiastic sports fan. Write SHORT, hype comments (1-2 sentences max). Use lots of fire emojis, caps, and slang. Examples: 'YOOO THAT WAS INSANE 🔥🔥🔥', 'NO WAY!! Absolute beast mode 💪😤', 'This is why I watch sports 🏆🔥'",
    postStyle: "Write a super hyped-up, short sports take (1-2 sentences). Be opinionated and energetic. Use emojis liberally.",
    emojiUsage: "heavy",
    postFrequency: 0.3, // 30% chance per cycle
    sports: ["Basketball", "Football", "MMA", "Boxing"],
  },
  scout: {
    label: "The Scout",
    actionWeights: { like: 0.30, comment: 0.45, skip: 0.25 },
    commentStyle: "You are a seasoned sports scout. Write analytical, insightful comments (1-2 sentences). Reference form, technique, stats, or potential. Examples: 'Great first step — that burst off the line is D1 caliber.', 'Film doesn\\'t lie. The footwork in the pocket has improved significantly.', 'Interesting mechanics. Would love to see the 40 time.'",
    postStyle: "Write a brief scouting observation or analysis about a sport (1-2 sentences). Be specific about skills, metrics, or player development. Professional tone.",
    emojiUsage: "minimal",
    postFrequency: 0.5,
    sports: ["Basketball", "Football", "Soccer", "Baseball"],
  },
  athlete: {
    label: "The Athlete",
    actionWeights: { like: 0.45, comment: 0.35, skip: 0.15 },
    commentStyle: "You are a competitive athlete. Write supportive, relatable comments from a fellow athlete\\'s perspective (1-2 sentences). Examples: 'Been grinding on that same drill — keep pushing 💪', 'That\\'s that off-season work showing up. Respect.', 'Recovery days hit different after sessions like this 😅'",
    postStyle: "Write a short post about your training, game prep, or sports motivation (1-2 sentences). Be authentic and grounded. Mention specific drills, workouts, or game situations.",
    emojiUsage: "moderate",
    postFrequency: 0.7,
    sports: null, // uses assigned sport
  },
};

// ── Fallback Comment Banks (when OpenRouter unavailable) ─────────────────────

const FALLBACK_COMMENTS = {
  hype: [
    "ABSOLUTE FIRE 🔥🔥🔥", "Bro this is INSANE 😤💪", "No words. Just greatness. 🏆",
    "They not ready for this conversation 🔥", "Built different fr fr 💯",
    "THIS IS WHY WE PLAY 🏀🔥", "Sheeeesh that was COLD 🥶🔥",
    "Dawg mode ACTIVATED 😤😤", "Top 5 content right here 💪",
    "The definition of ELITE 🏆🔥", "Can't stop watching this 👀🔥",
  ],
  scout: [
    "Impressive lateral quickness — projects well at the next level.",
    "The mechanics are clean. Would be interested to see game film.",
    "Good vision and court awareness. Decision-making under pressure is key.",
    "That change of direction is elite-level. First step is explosive.",
    "Footwork fundamentals are solid. Ceiling is high with the right development.",
    "Frame and athleticism suggest significant upside. Worth monitoring.",
    "Interesting skill set. The versatility creates matchup problems.",
  ],
  athlete: [
    "Respect the grind 💪 Keep going", "That post-workout feeling hits different 😅",
    "Been working on the same thing — it pays off trust me",
    "Game recognizes game. Solid work 🤝", "The off-season work is showing 💯",
    "Recovery day today but this got me motivated 🔥",
    "Love seeing the dedication. Iron sharpens iron ⚔️",
    "That's the daily grind right there. No shortcuts.",
  ],
};

const FALLBACK_POSTS = {
  hype: [
    "GAME DAY energy is UNMATCHED 🔥🔥🔥 Who's watching tonight?!",
    "Just saw the nastiest crossover of the season. THIS SPORT IS EVERYTHING 🏀😤",
    "4th quarter comeback wins hit DIFFERENT 🏆🔥 Never count us out!!!",
    "That highlight reel just broke my brain. INJECT THIS INTO MY VEINS 💉🔥",
  ],
  scout: [
    "Interesting film session today. Three players stood out with elite first-step quickness.",
    "The development curve on this year's class is fascinating. Athleticism is up across the board.",
    "Breaking down game tape — the defensive schemes are getting more sophisticated at every level.",
    "When you see consistent mechanics under pressure, that's when you know the ceiling is real.",
  ],
  athlete: [
    "5 AM workout complete 💪 The work doesn't stop. Two-a-days until we're ready.",
    "Film study + skill work + conditioning. That's the recipe. No shortcuts in this game.",
    "Rest day but still visualizing the gameplan. Mental reps count too 🧠",
    "New PR on the deadlift today. Strength is translating to the field. Progress. 📈",
  ],
};

// ── Utility Functions ────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BOT_NAMES = {
  hype: [
    { name: "Darius King", gender: "male" },
    { name: "Aaliyah Foster", gender: "female" },
    { name: "Terrence Webb", gender: "male" },
    { name: "Keisha Monroe", gender: "female" },
    { name: "Brandon Cruz", gender: "male" },
    { name: "Jasmine Okafor", gender: "female" },
    { name: "Devon Reyes", gender: "male" },
    { name: "Tiana Bell", gender: "female" },
    { name: "Elijah Stone", gender: "male" },
    { name: "Naomi Patel", gender: "female" },
  ],
  scout: [
    { name: "Ray Holloway", gender: "male" },
    { name: "Lisa Nguyen", gender: "female" },
    { name: "Frank Castellano", gender: "male" },
    { name: "Sandra Osei", gender: "female" },
    { name: "Greg Tanaka", gender: "male" },
    { name: "Maria Santos", gender: "female" },
    { name: "Calvin Price", gender: "male" },
    { name: "Diane Kowalski", gender: "female" },
    { name: "Victor Mensah", gender: "male" },
    { name: "Helen Burke", gender: "female" },
  ],
  athlete: [
    { name: "Zion Blake", gender: "male" },
    { name: "Simone Ortega", gender: "female" },
    { name: "Isaiah Grant", gender: "male" },
    { name: "Priya Sharma", gender: "female" },
    { name: "Carlos Rivera", gender: "male" },
    { name: "Amara Diallo", gender: "female" },
    { name: "Luca Ferretti", gender: "male" },
    { name: "Yuki Tanaka", gender: "female" },
    { name: "Marcus Obi", gender: "male" },
    { name: "Serena Volkov", gender: "female" },
  ],
};

function generateBotName(personaType, index) {
  const pool = BOT_NAMES[personaType] || BOT_NAMES.athlete;
  return pool[index % pool.length]; // returns { name, gender }
}

// ── AI Content Generation ────────────────────────────────────────────────────

async function callOpenRouter(systemPrompt, userPrompt, maxRetries = 2) {
  if (!OPENROUTER_API_KEY) return null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_URL,
          "X-Title": "Sportsphere SimBot",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 150,
          temperature: 0.9,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.warn(`  [AI] OpenRouter ${resp.status}: ${errText.slice(0, 100)}`);
        if (attempt < maxRetries) {
          await sleep(2000 * (attempt + 1));
          continue;
        }
        return null;
      }

      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      return text || null;
    } catch (err) {
      console.warn(`  [AI] OpenRouter error: ${err.message}`);
      if (attempt < maxRetries) await sleep(2000 * (attempt + 1));
    }
  }
  return null;
}

// ── Supabase Helpers ─────────────────────────────────────────────────────────

async function supabaseRequest(method, table, query = "", body = null, headers = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? "?" + query : ""}`;
  const opts = {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
      ...headers,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase ${method} ${table}: ${resp.status} — ${err.slice(0, 200)}`);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

async function createAuthUser(email, password, fullName, role = "athlete") {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    if (err.includes("already been registered") || err.includes("already exists")) {
      console.log(`  [Auth] Account ${email} already exists — reusing`);
      return { existing: true };
    }
    throw new Error(`Create auth user: ${resp.status} — ${err.slice(0, 200)}`);
  }
  const data = await resp.json();
  console.log(`  [Auth] Created account: ${email} (${fullName})`);
  return data;
}

// ── Wait for Auth (adapted from test_helpers.mjs) ────────────────────────────

async function waitForAuth(page, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasSidebar = await page
      .locator('[data-tour="nav-feed"], [data-tour="mobile-feed"]')
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    if (hasSidebar) return true;
    await sleep(1000);
  }
  return false;
}

// ── PersonaBot Class ─────────────────────────────────────────────────────────

class PersonaBot {
  constructor({
    personaType,
    email,
    password,
    name,
    gender,
    sport,
    index,
    headed = false,
  }) {
    this.persona = PERSONAS[personaType];
    this.personaType = personaType;
    this.email = email;
    this.password = password;
    this.name = name;
    this.gender = gender || "male";
    this.sport = sport;
    this.index = index;
    this.headed = headed;

    // Stats tracking
    this.stats = {
      postsCreated: 0,
      likesGiven: 0,
      commentsWritten: 0,
      postsViewed: 0,
      errors: [],
    };
  }

  // ── Human-like delay ───────────────────────────────────────────────

  async humanDelay(min = 1000, max = 3000) {
    const ms = randomBetween(min, max);
    await sleep(ms);
  }

  // ── AI Text Generation ─────────────────────────────────────────────

  async generateCaption(sport) {
    const prompt = `Write a single ${sport} post for social media. ${this.persona.postStyle}. Just the post text, nothing else. No hashtags.`;
    const text = await callOpenRouter(
      `You are "${this.name}", ${this.persona.label} on a sports platform called Sportsphere.`,
      prompt,
    );
    if (text) return text;
    // Fallback
    return pick(FALLBACK_POSTS[this.personaType] || FALLBACK_POSTS.hype);
  }

  async generateComment(postContent) {
    const prompt = `Reply to this social media post: "${postContent?.slice(0, 200) || "a sports post"}". ${this.persona.commentStyle}. Just the comment, nothing else.`;
    const text = await callOpenRouter(
      `You are "${this.name}", ${this.persona.label} on a sports platform.`,
      prompt,
    );
    if (text) return text;
    // Fallback
    return pick(FALLBACK_COMMENTS[this.personaType] || FALLBACK_COMMENTS.hype);
  }

  // ── Account Creation (API-based, fast) ─────────────────────────────

  async createAccount() {
    console.log(`\n[${this.name}] Creating account: ${this.email}`);
    const result = await createAuthUser(this.email, this.password, this.name, "athlete");

    // Set avatar + mark onboarding complete via profile update
    const pexelsAvatar = await fetchPexelsAvatar(this.sport, this.personaType, this.gender);
    const avatarUrl = pexelsAvatar || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80";
    this.avatarUrl = avatarUrl;
    const profileData = {
      avatar_url: avatarUrl,
      full_name: this.name,
      onboarding_complete: true,
      role: "athlete",
      preferred_sports: [this.sport],
      bio: `${this.sport} athlete | ${this.persona.label}`,
      location: pick(CITIES),
    };
    try {
      await supabaseRequest("PATCH", "profiles", `email=eq.${this.email}`, profileData);
    } catch (e) {
      // Profile may not exist yet if trigger is slow
      await sleep(3000);
      try {
        await supabaseRequest("PATCH", "profiles", `email=eq.${this.email}`, profileData);
      } catch (e2) {
        console.warn(`  [${this.name}] Could not update profile: ${e2.message}`);
      }
    }

    // Also create sport_profile for completeness
    try {
      await supabaseRequest("POST", "sport_profiles", "", {
        user_email: this.email,
        sport: this.sport,
        level: "Intermediate",
        position: POSITIONS[this.sport] || "Utility",
      });
    } catch (e) {
      // May already exist or table missing — non-critical
    }

    return result;
  }

  // ── Browser Login ──────────────────────────────────────────────────

  async login(page) {
    console.log(`[${this.name}] Logging in via browser...`);
    await page.context().clearCookies();

    await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle", timeout: 30000 });
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await sleep(2000);

    // Fill login form
    await page.fill("#email", this.email);
    await this.humanDelay(300, 800);
    await page.fill("#password", this.password);
    await this.humanDelay(500, 1000);

    // Click sign in
    await page.click('button[type="submit"]');
    await sleep(3000);

    // Wait for auth or onboarding redirect
    const authed = await waitForAuth(page, 15000);

    if (!authed && page.url().includes("Onboarding")) {
      console.log(`  [${this.name}] Redirected to Onboarding — bypassing...`);
      // Set bypass flag
      const userId = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const sessionKey = keys.find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (!sessionKey) return null;
        try { return JSON.parse(localStorage.getItem(sessionKey))?.user?.id || null; } catch { return null; }
      });
      if (userId) {
        await page.evaluate((uid) => { localStorage.setItem(`ob_${uid}`, "1"); }, userId);
      }
      await page.goto(`${APP_URL}/Feed`, { waitUntil: "networkidle", timeout: 30000 });
      const retryAuth = await waitForAuth(page, 15000);
      if (retryAuth) {
        console.log(`  [${this.name}] Logged in (onboarding bypassed)`);
        return true;
      }
      console.warn(`  [${this.name}] Auth failed after onboarding bypass`);
      return false;
    }

    if (!authed) {
      console.warn(`  [${this.name}] Auth timeout — page: ${page.url()}`);
      return false;
    }

    // Set onboarding bypass flag for this session
    await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const sessionKey = keys.find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
      if (!sessionKey) return;
      try {
        const uid = JSON.parse(localStorage.getItem(sessionKey))?.user?.id;
        if (uid) localStorage.setItem(`ob_${uid}`, "1");
      } catch {}
    });

    console.log(`  [${this.name}] Logged in successfully`);
    return true;
  }

  // ── Complete Onboarding (Athlete flow, 3 steps) ────────────────────

  async completeOnboarding(page) {
    if (!page.url().includes("Onboarding")) {
      console.log(`  [${this.name}] Not on onboarding — skipping`);
      return true;
    }

    console.log(`  [${this.name}] Completing onboarding as athlete...`);
    await sleep(2000);

    // Step 1: Select sport + level
    try {
      // Click sport pill — use getByRole for reliability
      const sportBtn = page.getByRole("button", { name: this.sport, exact: true }).first();
      if (await sportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await sportBtn.click();
        await this.humanDelay(500, 1000);
      }

      // Fill position
      const positionInput = page.locator('input[placeholder*="Point Guard"], input[placeholder*="position"], input[placeholder*="Event"]').first();
      if (await positionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await positionInput.fill(POSITIONS[this.sport] || "Utility");
        await this.humanDelay(300, 800);
      }

      // Click skill level (Intermediate)
      const levelBtn = page.getByRole("button", { name: "Intermediate" }).first();
      if (await levelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await levelBtn.click();
        await this.humanDelay(500, 800);
      }

      // Click Continue — use text matching that avoids "Skip" etc
      const continueBtn = page.getByRole("button", { name: /Continue/i }).first();
      if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await continueBtn.click();
        console.log(`    [${this.name}] Step 1 → Step 2`);
        await this.humanDelay(1500, 2500);
      }
    } catch (e) {
      console.warn(`  [${this.name}] Step 1 error: ${e.message}`);
    }

    // Step 2: Bio, location, school
    try {
      await sleep(1500);

      const bioInput = page.locator('textarea[placeholder*="Tell people"]').first();
      if (await bioInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await bioInput.fill(`${this.sport} athlete | ${this.persona.label} | Training daily`);
        await this.humanDelay(500, 1000);
      }

      const locationInput = page.locator('input[placeholder*="Atlanta"]').first();
      if (await locationInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await locationInput.fill(pick(CITIES));
        await this.humanDelay(300, 800);
      }

      const schoolInput = page.locator('input[placeholder*="Jefferson"], input[placeholder*="School"]').first();
      if (await schoolInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await schoolInput.fill(pick(SCHOOLS));
        await this.humanDelay(300, 800);
      }

      const continueBtn = page.getByRole("button", { name: /Continue/i }).first();
      if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await continueBtn.click();
        console.log(`    [${this.name}] Step 2 → Step 3`);
        await this.humanDelay(1500, 2500);
      }
    } catch (e) {
      console.warn(`  [${this.name}] Step 2 error: ${e.message}`);
    }

    // Step 3: Achievements + goal
    try {
      await sleep(1500);

      const achievementInputs = page.locator('input[placeholder*="Achievement"]');
      const count = await achievementInputs.count();
      if (count > 0) {
        await achievementInputs.first().fill(`${this.sport} Regional Champion 2025`);
        await this.humanDelay(300, 600);
      }

      const goalInput = page.locator('input[placeholder*="varsity"], input[placeholder*="improve"]').first();
      if (await goalInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await goalInput.fill("Make all-conference team this season");
        await this.humanDelay(300, 800);
      }

      // Click Finish Setup
      const finishBtn = page.locator('button:has-text("Finish Setup")').first();
      if (await finishBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await finishBtn.click();
        await sleep(3000);
      }
    } catch (e) {
      console.warn(`  [${this.name}] Step 3 error: ${e.message}`);
    }

    // Wait for redirect after onboarding
    const authed = await waitForAuth(page, 15000);
    if (authed) {
      console.log(`  [${this.name}] Onboarding completed`);
    } else {
      // Try bypass as fallback
      console.log(`  [${this.name}] Onboarding may have stalled — bypassing`);
      const userId = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const sessionKey = keys.find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (!sessionKey) return null;
        try {
          const session = JSON.parse(localStorage.getItem(sessionKey));
          return session?.user?.id || null;
        } catch { return null; }
      });
      if (userId) {
        await page.evaluate((uid) => { localStorage.setItem(`ob_${uid}`, "1"); }, userId);
        await page.goto(`${APP_URL}/Feed`, { waitUntil: "networkidle" });
        await waitForAuth(page, 10000);
      }
    }

    return true;
  }

  // ── Full Lifecycle: login + onboarding ─────────────────────────────

  async executeLifecycle(page) {
    console.log(`\n[${this.name}] Starting lifecycle...`);

    const loggedIn = await this.login(page);
    if (!loggedIn) {
      this.stats.errors.push("Login failed");
      return false;
    }

    if (page.url().includes("Onboarding")) {
      await this.completeOnboarding(page);
    }

    return true;
  }

  // ── Post Creation (via browser UI) ─────────────────────────────────

  async executePostCreation(page) {
    if (Math.random() > this.persona.postFrequency) {
      console.log(`  [${this.name}] Skipping post (persona roll)`);
      return;
    }

    console.log(`[${this.name}] Creating a post...`);

    // Ensure we're authed first — go to Feed then CreatePost
    if (!page.url().includes("Feed") && !page.url().includes("CreatePost")) {
      await page.goto(`${APP_URL}/Feed`, { waitUntil: "networkidle", timeout: 30000 });
      await waitForAuth(page, 15000);
    }

    // Navigate to CreatePost — retry if redirected to Onboarding/Login
    await page.goto(`${APP_URL}/CreatePost`, { waitUntil: "networkidle", timeout: 30000 });

    // Wait up to 15s for textarea (auth recovery + render)
    const textarea = page.locator("textarea").first();
    let textareaFound = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      // Check for redirect to Onboarding/Login
      if (page.url().includes("Onboarding") || page.url().includes("login")) {
        console.log(`  [${this.name}] CreatePost redirected to ${page.url().split("/").pop()} — setting bypass`);
        await page.evaluate(() => {
          const keys = Object.keys(localStorage);
          const sk = keys.find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
          if (!sk) return;
          try { const uid = JSON.parse(localStorage.getItem(sk))?.user?.id; if (uid) localStorage.setItem(`ob_${uid}`, "1"); } catch {}
        });
        await page.goto(`${APP_URL}/CreatePost`, { waitUntil: "networkidle", timeout: 30000 });
        continue;
      }
      textareaFound = await textarea.isVisible({ timeout: 1000 }).catch(() => false);
      if (textareaFound) break;
      await sleep(1000);
    }

    if (!textareaFound) {
      console.warn(`  [${this.name}] CreatePost textarea not found after 15s — falling back to API post`);
      await this.createPostViaAPI();
      return;
    }

    // Generate caption
    const caption = await this.generateCaption(this.sport);
    console.log(`  [${this.name}] Caption: "${caption.slice(0, 60)}..."`);

    // Type caption with human-like cadence
    await textarea.click();
    await this.humanDelay(300, 600);
    await page.keyboard.type(caption, { delay: randomBetween(15, 40) });
    await this.humanDelay(800, 1500);

    // Click Publish Post
    const publishBtn = page.locator('button:has-text("Publish Post")').first();
    if (await publishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await publishBtn.click();
      await sleep(4000);

      // Check for success (redirect to Feed)
      if (page.url().includes("Feed")) {
        console.log(`  [${this.name}] Post published successfully`);
        this.stats.postsCreated++;
      } else {
        console.warn(`  [${this.name}] Post may have failed — still on ${page.url()}`);
        this.stats.errors.push("Post publish uncertain");
      }
    } else {
      console.warn(`  [${this.name}] Publish button not found`);
      this.stats.errors.push("Publish button missing");
    }

    await this.humanDelay(1000, 2000);
  }

  // ── Create Post via API (for video posts with mock Mux URLs) ───────

  async createPostViaAPI() {
    console.log(`  [${this.name}] Creating video post via API...`);

    const caption = await this.generateCaption(this.sport);
    const mockMuxId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    try {
      const post = await supabaseRequest("POST", "posts", "", {
        author_email: this.email,
        author_name: this.name,
        author_avatar: this.avatarUrl || await fetchPexelsAvatar(this.sport, this.personaType, this.gender),
        content: caption,
        created_date: new Date().toISOString(),
        media_urls: [`https://stream.mux.com/${mockMuxId}.m3u8`],
        media_type: "video",
        sport: this.sport,
        category: pick(["training", "highlight", "motivation", "game"]),
        likes: [],
        comments_count: 0,
        views: 0,
        shares: 0,
        mentioned_users: [],
        is_premium: false,
      });

      console.log(`  [${this.name}] Video post created: ${post?.[0]?.id}`);
      this.stats.postsCreated++;
      return post?.[0];
    } catch (e) {
      console.warn(`  [${this.name}] API post failed: ${e.message}`);
      this.stats.errors.push(`API post: ${e.message}`);
      return null;
    }
  }

  // ── Feed Interaction Loop ──────────────────────────────────────────

  async executeFeedLoop(page, iterations = 15) {
    console.log(`\n[${this.name}] Starting feed interaction loop (${iterations} iterations)...`);

    await page.goto(`${APP_URL}/Feed`, { waitUntil: "networkidle", timeout: 30000 });
    await waitForAuth(page, 15000);
    await sleep(3000);

    for (let i = 0; i < iterations; i++) {
      console.log(`  [${this.name}] Feed iteration ${i + 1}/${iterations}`);

      // Find post cards on the page
      const postCards = page.locator('div.rounded-2xl.border, article');
      const cardCount = await postCards.count().catch(() => 0);

      if (cardCount === 0) {
        console.log(`  [${this.name}] No posts found — scrolling...`);
        await page.evaluate(() => window.scrollBy(0, 500));
        await this.humanDelay(2000, 4000);
        continue;
      }

      // Pick a random visible post card
      const targetIndex = randomBetween(0, Math.min(cardCount - 1, 4));
      const card = postCards.nth(targetIndex);

      if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) {
        await page.evaluate(() => window.scrollBy(0, 400));
        await this.humanDelay(1000, 2000);
        continue;
      }

      this.stats.postsViewed++;
      const roll = Math.random();

      // ── Like action ────────────────────────────────────────────
      if (roll < this.persona.actionWeights.like) {
        try {
          // Look for the reaction/emoji buttons row, click the first emoji (heart/fire)
          const emojiBtn = card.locator('button span.text-lg, button span.text-xl').first();
          if (await emojiBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emojiBtn.click();
            this.stats.likesGiven++;
            console.log(`    [${this.name}] Liked a post`);
            await this.humanDelay(500, 1500);
          }
        } catch (e) {
          // Silently skip
        }
      }

      // ── Comment action ─────────────────────────────────────────
      if (roll < this.persona.actionWeights.comment) {
        try {
          // Click the comment icon (MessageCircle)
          const commentIcon = card.locator('button:has(svg.lucide-message-circle), button:has(svg[class*="message"])').first();
          if (await commentIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
            await commentIcon.click();
            await this.humanDelay(800, 1500);

            // Get post text for context
            const postText = await card.locator("p").first().textContent().catch(() => "");

            // Generate comment
            const commentText = await this.generateComment(postText);

            // Find and fill the comment textarea
            const commentInput = page.locator('textarea[placeholder*="Write"], textarea[placeholder*="comment"], textarea[placeholder*="reply"]').first();
            if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
              await commentInput.click();
              await this.humanDelay(300, 600);
              await page.keyboard.type(commentText, { delay: randomBetween(20, 50) });
              await this.humanDelay(500, 1000);

              // Click Post/Submit button
              const submitBtn = page.locator('button:has-text("Post"):not(:has-text("Publish"))').last();
              if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await submitBtn.click();
                this.stats.commentsWritten++;
                console.log(`    [${this.name}] Commented: "${commentText.slice(0, 40)}..."`);
                await this.humanDelay(1000, 2000);
              }
            }
          }
        } catch (e) {
          // Silently skip comment failures
        }
      }

      // ── Dwell time + scroll ────────────────────────────────────
      await this.humanDelay(1500, 3500);
      await page.evaluate(() => window.scrollBy(0, 300 + Math.floor(Math.random() * 300)));
      await this.humanDelay(1000, 2500);
    }

    console.log(`  [${this.name}] Feed loop complete`);
  }

  // ── Summary Report ─────────────────────────────────────────────────

  printSummary() {
    console.log(`\n┌── ${this.name} (${this.persona.label}) ──────────────────`);
    console.log(`│  Email:    ${this.email}`);
    console.log(`│  Sport:    ${this.sport}`);
    console.log(`│  Posts:    ${this.stats.postsCreated}`);
    console.log(`│  Likes:    ${this.stats.likesGiven}`);
    console.log(`│  Comments: ${this.stats.commentsWritten}`);
    console.log(`│  Viewed:   ${this.stats.postsViewed} posts`);
    console.log(`│  Errors:   ${this.stats.errors.length}`);
    if (this.stats.errors.length > 0) {
      this.stats.errors.forEach(e => console.log(`│    ⚠ ${e}`));
    }
    console.log(`└${"─".repeat(50)}`);
  }
}

// ── Master Orchestrator ──────────────────────────────────────────────────────

async function orchestrate({ personaType, count, headed, skipSignup, iterations }) {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       SPORTSPHERE SIMULATION BOT ENGINE v1.0       ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Persona:    ${personaType} (${PERSONAS[personaType].label})`);
  console.log(`  Bot count:  ${count}`);
  console.log(`  Mode:       ${headed ? "headed" : "headless"}`);
  console.log(`  Iterations: ${iterations}`);
  console.log(`  OpenRouter: ${OPENROUTER_API_KEY ? "configured" : "MISSING — using fallback banks"}`);
  console.log(`  Skip signup: ${skipSignup}`);
  console.log();

  // Validate config
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("ERROR: Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  // Create bot instances
  const bots = [];
  const uniqueRun = Date.now().toString(36);

  for (let i = 0; i < count; i++) {
    const { name, gender } = generateBotName(personaType, i);
    const sport = PERSONAS[personaType].sports
      ? pick(PERSONAS[personaType].sports)
      : pick(SPORTS);
    const email = `simbot-${personaType}-${i + 1}-${uniqueRun}@sportsphere.app`;

    bots.push(
      new PersonaBot({
        personaType,
        email,
        password: BOT_PASSWORD,
        name,
        gender,
        sport,
        index: i,
        headed,
      }),
    );
  }

  // Phase 1: Create accounts (parallel API calls, no browser needed)
  if (!skipSignup) {
    console.log("\n── Phase 1: Account Creation ──────────────────────────");
    await Promise.all(bots.map(bot => bot.createAccount()));
  }

  // Phase 2: Browser lifecycle (each bot in own context)
  console.log("\n── Phase 2: Browser Lifecycle ─────────────────────────");
  const browser = await chromium.launch({
    headless: !headed,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Run bots in batches of 3 to avoid memory issues
  const BATCH_SIZE = 3;
  for (let batch = 0; batch < bots.length; batch += BATCH_SIZE) {
    const batchBots = bots.slice(batch, batch + BATCH_SIZE);
    console.log(`\n  Running batch ${Math.floor(batch / BATCH_SIZE) + 1}/${Math.ceil(bots.length / BATCH_SIZE)}...`);

    await Promise.all(
      batchBots.map(async (bot) => {
        const context = await browser.newContext({
          viewport: { width: 1280, height: 720 },
        });
        const page = await context.newPage();

        try {
          // Login + Onboarding
          const success = await bot.executeLifecycle(page);
          if (!success) {
            console.warn(`  [${bot.name}] Lifecycle failed — skipping remaining actions`);
            await context.close();
            return;
          }

          // Create posts (UI-based text post + API-based video post)
          await bot.executePostCreation(page);
          if (Math.random() < 0.5) {
            await bot.createPostViaAPI();
          }

          // Feed interaction loop
          await bot.executeFeedLoop(page, iterations);

          // Save state for future runs
          const stateDir = path.join(APP_ROOT, ".tmp", "bot_states");
          if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
          await context.storageState({
            path: path.join(stateDir, `${bot.email.replace(/@/g, "_at_")}.json`),
          });
        } catch (err) {
          console.error(`  [${bot.name}] Fatal error: ${err.message}`);
          bot.stats.errors.push(`Fatal: ${err.message}`);
        } finally {
          await context.close();
        }
      }),
    );
  }

  await browser.close();

  // ── Summary Report ─────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("  SIMULATION SUMMARY");
  console.log("══════════════════════════════════════════════════════");

  let totalPosts = 0, totalLikes = 0, totalComments = 0, totalErrors = 0;
  for (const bot of bots) {
    bot.printSummary();
    totalPosts += bot.stats.postsCreated;
    totalLikes += bot.stats.likesGiven;
    totalComments += bot.stats.commentsWritten;
    totalErrors += bot.stats.errors.length;
  }

  console.log(`\n  Totals: ${totalPosts} posts, ${totalLikes} likes, ${totalComments} comments, ${totalErrors} errors`);
  console.log(`  Accounts: ${bots.map(b => b.email).join(", ")}`);
  console.log("══════════════════════════════════════════════════════\n");

  // Data verification
  console.log("── Data Verification ──────────────────────────────────");
  for (const bot of bots) {
    try {
      const posts = await supabaseRequest("GET", "posts", `author_email=eq.${bot.email}&select=id,content&limit=5`);
      console.log(`  [${bot.name}] ${posts?.length || 0} posts in DB`);
    } catch (e) {
      console.log(`  [${bot.name}] DB check failed: ${e.message}`);
    }
  }
  console.log();
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let persona = "hype", headed = false, count = 1, skipSignup = false, iterations = 15;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--persona" && args[i + 1]) { persona = args[i + 1]; i++; }
  if (args[i] === "--headed") headed = true;
  if (args[i] === "--count" && args[i + 1]) { count = parseInt(args[i + 1]); i++; }
  if (args[i] === "--skip-signup") skipSignup = true;
  if (args[i] === "--iterations" && args[i + 1]) { iterations = parseInt(args[i + 1]); i++; }
  if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Usage: node tests/simulation/UserPersonaBot.js [options]

Options:
  --persona TYPE    Bot persona: hype, scout, or athlete (default: hype)
  --count N         Number of bots to run (default: 1)
  --headed          Show browser windows (default: headless)
  --skip-signup     Reuse existing bot accounts (skip account creation)
  --iterations N    Feed interaction loop rounds (default: 15)
  --help            Show this help message

Examples:
  node tests/simulation/UserPersonaBot.js --persona hype --count 1 --headed
  node tests/simulation/UserPersonaBot.js --persona athlete --count 3
  node tests/simulation/UserPersonaBot.js --persona scout --count 2 --iterations 30
`);
    process.exit(0);
  }
}

if (!PERSONAS[persona]) {
  console.error(`Unknown persona: "${persona}". Choose: hype, scout, athlete`);
  process.exit(1);
}

orchestrate({ personaType: persona, count, headed, skipSignup, iterations }).catch(err => {
  console.error("Orchestrator failed:", err);
  process.exit(1);
});
