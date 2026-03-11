/**
 * Sports Brain — Calendar + Season Intelligence Engine
 *
 * Shared module that ALL bot behavior flows through.
 * Provides awareness of current sports seasons, major events,
 * and dynamically adjusts content priority weights.
 *
 * Usage:
 *   import { getSportsContext, getContentWeights, isGameDay } from './sports_brain.mjs';
 *   const ctx = getSportsContext();          // full context object
 *   const weights = getContentWeights();     // { baseball: 0.45, basketball: 0.20, ... }
 *   const gameDay = isGameDay('baseball');   // true/false
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const calendar = JSON.parse(readFileSync(join(__dirname, 'sports_calendar.json'), 'utf-8'));

// ── Helpers ──────────────────────────────────────────────────────

function parseMMDD(mmdd, year) {
  const [m, d] = mmdd.split('-').map(Number);
  return new Date(year, m - 1, d);
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function isDateInRange(now, startMMDD, endMMDD) {
  const year = now.getFullYear();
  const current = dayOfYear(now);
  const start = dayOfYear(parseMMDD(startMMDD, year));
  const end = dayOfYear(parseMMDD(endMMDD, year));

  // Handle wrap-around (e.g., Nov-Feb for baseball offseason)
  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

function daysUntil(now, mmdd) {
  const year = now.getFullYear();
  let target = parseMMDD(mmdd, year);
  if (target < now) target = parseMMDD(mmdd, year + 1);
  return Math.ceil((target - now) / 86400000);
}

// ── Season Detection ─────────────────────────────────────────────

function getCurrentPhase(sport, now) {
  if (!sport.seasons) return { phase: 'unknown', name: 'Unknown' };

  for (const [name, range] of Object.entries(sport.seasons)) {
    if (isDateInRange(now, range.start, range.end)) {
      return { phase: range.phase, name };
    }
  }
  return { phase: 'offseason', name: 'offseason' };
}

// ── Active Events Detection ──────────────────────────────────────

function getActiveEvents(sport, now) {
  if (!sport.events) return [];
  const year = now.getFullYear();
  const active = [];

  for (const event of sport.events) {
    // Skip year-specific events that don't match current year
    if (event.years && !event.years.includes(year)) continue;

    const eventStart = parseMMDD(event.date, year);
    const eventEnd = new Date(eventStart.getTime() + event.duration_days * 86400000);

    if (now >= eventStart && now <= eventEnd) {
      const dayNum = Math.ceil((now - eventStart) / 86400000) + 1;
      active.push({
        name: event.name,
        boost: event.boost,
        day: dayNum,
        totalDays: event.duration_days,
        remaining: event.duration_days - dayNum
      });
    }
  }
  return active;
}

function getUpcomingEvents(sport, now, withinDays = 14) {
  if (!sport.events) return [];
  const year = now.getFullYear();
  const upcoming = [];

  for (const event of sport.events) {
    if (event.years && !event.years.includes(year)) continue;

    const days = daysUntil(now, event.date);
    if (days > 0 && days <= withinDays) {
      upcoming.push({ name: event.name, daysAway: days, date: event.date });
    }
  }
  return upcoming.sort((a, b) => a.daysAway - b.daysAway);
}

// ── Content Weight Calculation ───────────────────────────────────

function calculateWeights(now) {
  const weights = {};
  let totalBoost = 0;

  for (const [key, sport] of Object.entries(calendar.sports)) {
    const base = sport.baseWeight || 0;
    const activeEvents = getActiveEvents(sport, now);
    const eventBoost = activeEvents.reduce((sum, e) => sum + e.boost, 0);

    const phase = getCurrentPhase(sport, now);
    let phaseMultiplier = 1.0;
    if (phase.phase === 'playoffs') phaseMultiplier = 1.3;
    else if (phase.phase === 'preseason') phaseMultiplier = 1.1;
    else if (phase.phase === 'offseason') phaseMultiplier = 0.7;

    weights[key] = base * phaseMultiplier + eventBoost;
    totalBoost += weights[key];
  }

  // Normalize to sum to 1.0
  if (totalBoost > 0) {
    for (const key of Object.keys(weights)) {
      weights[key] = Math.round((weights[key] / totalBoost) * 100) / 100;
    }
  }

  // Ensure baseball never drops below 25% (our core audience)
  if (weights.baseball < 0.25) {
    const deficit = 0.25 - weights.baseball;
    weights.baseball = 0.25;
    // Redistribute deficit proportionally from others
    const otherTotal = Object.entries(weights)
      .filter(([k]) => k !== 'baseball')
      .reduce((s, [, v]) => s + v, 0);
    for (const key of Object.keys(weights)) {
      if (key !== 'baseball' && otherTotal > 0) {
        weights[key] -= deficit * (weights[key] / otherTotal);
        weights[key] = Math.max(0.02, Math.round(weights[key] * 100) / 100);
      }
    }
  }

  return weights;
}

// ── Game Day Check ───────────────────────────────────────────────

function isGameDay(sportKey, now = new Date()) {
  const sport = calendar.sports[sportKey];
  if (!sport || !sport.gameDays) return false;
  const phase = getCurrentPhase(sport, now);
  if (phase.phase === 'offseason') return false;
  return sport.gameDays.includes(now.getDay());
}

// ── Youth Sports Context ─────────────────────────────────────────

function getYouthContext(now) {
  const month = now.getMonth() + 1;
  const youth = calendar.youthSports;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  return {
    travelBallActive: youth.travelBall.peakMonths.includes(month),
    tournamentWeekend: isWeekend && youth.travelBall.peakMonths.includes(month),
    showcaseSeason: youth.showcaseEvents.peakMonths.includes(month),
    recLeagueSpring: month >= 3 && month <= 6,
    recLeagueFall: month >= 9 && month <= 11,
    parentActivityBoost: isWeekend ? 1.5 : 1.0,
    context: getYouthNarrative(month, isWeekend)
  };
}

function getYouthNarrative(month, isWeekend) {
  if (month >= 3 && month <= 5) {
    return isWeekend ? 'Tournament weekend — travel ball in full swing' : 'Spring season — games and practices all week';
  }
  if (month >= 6 && month <= 7) {
    return isWeekend ? 'Showcase tournament weekend' : 'Summer ball — showcases, camps, and all-stars';
  }
  if (month === 8) return 'Little League World Series time — end of summer ball';
  if (month >= 9 && month <= 10) return 'Fall ball season — development and tryouts';
  if (month >= 11 || month <= 2) return 'Offseason — indoor hitting, conditioning, team tryouts';
  return 'Youth sports season';
}

// ── Primetime Check ──────────────────────────────────────────────

function isPrimetime(now = new Date()) {
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const pt = isWeekend ? calendar.primetime.weekend : calendar.primetime.weekday;
  return hour >= pt.start && hour <= pt.end;
}

// ── Hot Topics (injectable) ──────────────────────────────────────

let hotTopics = [];

function setHotTopics(topics) {
  hotTopics = topics.map(t => ({
    ...t,
    addedAt: new Date().toISOString()
  }));
}

function getHotTopics() {
  // Auto-expire topics older than 48 hours
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  hotTopics = hotTopics.filter(t => new Date(t.addedAt).getTime() > cutoff);
  return hotTopics;
}

// ── Main Export: getSportsContext() ───────────────────────────────

export function getSportsContext(dateOverride = null) {
  const now = dateOverride ? new Date(dateOverride) : new Date();

  const sportContexts = {};
  const allActiveEvents = [];
  const allUpcomingEvents = [];

  for (const [key, sport] of Object.entries(calendar.sports)) {
    const phase = getCurrentPhase(sport, now);
    const active = getActiveEvents(sport, now);
    const upcoming = getUpcomingEvents(sport, now, 14);

    sportContexts[key] = {
      label: sport.label,
      phase: phase.phase,
      seasonName: phase.name,
      isGameDay: isGameDay(key, now),
      activeEvents: active,
      upcomingEvents: upcoming,
      offseasonTopics: phase.phase === 'offseason' ? (sport.offseasonTopics || []) : []
    };

    allActiveEvents.push(...active.map(e => ({ ...e, sport: key })));
    allUpcomingEvents.push(...upcoming.map(e => ({ ...e, sport: key })));
  }

  const weights = calculateWeights(now);
  const youth = getYouthContext(now);

  return {
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()],
    isPrimetime: isPrimetime(now),
    sports: sportContexts,
    weights,
    activeEvents: allActiveEvents,
    upcomingEvents: allUpcomingEvents.sort((a, b) => a.daysAway - b.daysAway),
    youth,
    hotTopics: getHotTopics(),
    summary: buildSummary(sportContexts, weights, allActiveEvents, youth, now)
  };
}

function buildSummary(sports, weights, activeEvents, youth, now) {
  const lines = [];

  // Top sport right now
  const topSport = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];
  lines.push(`Top priority: ${sports[topSport[0]].label} (${Math.round(topSport[1] * 100)}%)`);

  // Active events
  if (activeEvents.length > 0) {
    lines.push(`Active events: ${activeEvents.map(e => e.name).join(', ')}`);
  }

  // Youth context
  lines.push(`Youth: ${youth.context}`);

  // Phase summary
  const phases = Object.entries(sports).map(([k, v]) => `${v.label}: ${v.phase}`);
  lines.push(`Seasons: ${phases.join(' | ')}`);

  return lines.join('\n');
}

// ── Convenience Exports ──────────────────────────────────────────

export { calculateWeights as getContentWeights, isGameDay, isPrimetime, getYouthContext, setHotTopics, getHotTopics };

// ── CLI Test ─────────────────────────────────────────────────────

const isMain = process.argv[1] && fileURLToPath(import.meta.url).includes(process.argv[1].replace(/\\/g, '/'));
if (isMain) {
  const dateArg = process.argv[2];
  const ctx = getSportsContext(dateArg || null);
  console.log(JSON.stringify(ctx, null, 2));
}
