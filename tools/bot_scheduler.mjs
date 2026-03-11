/**
 * bot_scheduler.mjs — Action scheduling engine for Bot Squad
 *
 * Distributes actions across time with weighted randomization,
 * peak-hour awareness, jitter, and Sports Brain integration.
 */

import { pick, randomInt, randomFloat, jitter, isWithinHours } from './bot_helpers.mjs';
import { getSportsContext } from './sports_brain.mjs';
import { getModeConfig, getConfig } from './bot_config.mjs';

// ── Action Weights (organic mode baseline) ───────────────────────

const ACTION_WEIGHTS = {
  like_post:        25,
  create_post:      15,
  comment_post:     15,
  follow_user:       8,
  send_message:      5,
  forum_reply:       5,
  challenge_update:  5,
  browse_feed:       4,
  join_group:        3,
  rsvp_event:        3,
  join_challenge:    3,
  forum_topic:       3,
  unfollow_user:     2,
  watch_stream:      2,
  update_profile:    1,
  trigger_points:    1,
};

const PLAYWRIGHT_ACTIONS = new Set(['browse_feed', 'watch_stream']);

// ── Scheduler ────────────────────────────────────────────────────

export class BotScheduler {
  constructor(persona) {
    this.persona = persona;
    this.behavior = persona.behavior;
    this.dailyActionCounts = {};  // Track daily actions per type
    this.lastReset = new Date().toDateString();
  }

  /**
   * Get the next action for this bot.
   * Returns: { action, delayMs, engine }
   */
  getNextAction() {
    this._resetDailyIfNeeded();
    const config = getConfig();
    const modeConfig = getModeConfig();

    // Check if within active hours
    if (!isWithinHours(this.behavior.active_hours.start, this.behavior.active_hours.end)) {
      // Sleep until active hours start
      const now = new Date();
      const hour = now.getHours();
      let hoursUntilActive;
      if (hour < this.behavior.active_hours.start) {
        hoursUntilActive = this.behavior.active_hours.start - hour;
      } else {
        hoursUntilActive = 24 - hour + this.behavior.active_hours.start;
      }
      return {
        action: null,
        delayMs: hoursUntilActive * 3600000,
        engine: null,
        reason: 'outside active hours',
      };
    }

    // Select action based on weights
    const action = this._weightedActionSelect(config, modeConfig);
    if (!action) {
      return { action: null, delayMs: 60000, engine: null, reason: 'no actions available' };
    }

    // Calculate delay
    const delayMs = this._calculateDelay(config, modeConfig);
    const engine = PLAYWRIGHT_ACTIONS.has(action) ? 'playwright' : 'api';

    return { action, delayMs, engine };
  }

  _weightedActionSelect(config, modeConfig) {
    // Build weighted pool
    const pool = [];
    const ctx = getSportsContext();
    const isGameDay = ctx.sports[this._sportKey()]?.isGameDay;
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const isPrimetime = ctx.isPrimetime;

    for (const [action, baseWeight] of Object.entries(ACTION_WEIGHTS)) {
      let weight = baseWeight;

      // Skip playwright actions if disabled in this mode
      if (PLAYWRIGHT_ACTIONS.has(action) && !modeConfig.enablePlaywright) continue;

      // Boost engagement actions during primetime / game days
      if (isPrimetime && ['like_post', 'comment_post', 'create_post'].includes(action)) {
        weight *= 1.5;
      }
      if (isGameDay && ['create_post', 'comment_post', 'like_post'].includes(action)) {
        weight *= 1.3;
      }

      // Weekend boost for parent bots
      if (isWeekend && this.persona.profile.role === 'parent') {
        weight *= (this.behavior.weekend_multiplier || 1.0);
      }

      // QA mode: boost edge-case actions
      if (config.mode === 'qa-testing') {
        if (['create_post', 'update_profile', 'join_group', 'unfollow_user'].includes(action)) {
          weight *= 2;
        }
      }

      // Marketing mode: boost content creation, reduce noise
      if (config.mode === 'marketing') {
        if (action === 'create_post') weight *= 2;
        if (['unfollow_user', 'update_profile'].includes(action)) weight *= 0.2;
      }

      // Check daily limits
      const dailyLimit = this._getDailyLimit(action);
      const todayCount = this.dailyActionCounts[action] || 0;
      if (dailyLimit && todayCount >= dailyLimit) continue;

      pool.push({ action, weight });
    }

    if (!pool.length) return null;

    // Weighted random selection
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let r = Math.random() * totalWeight;
    for (const p of pool) {
      r -= p.weight;
      if (r <= 0) {
        this.dailyActionCounts[p.action] = (this.dailyActionCounts[p.action] || 0) + 1;
        return p.action;
      }
    }
    return pool[pool.length - 1].action;
  }

  _calculateDelay(config, modeConfig) {
    // Base interval: how often should a bot act?
    // At speed=1 and organic mode: ~1 action per 5 minutes
    // At speed=10: ~1 action per 30 seconds
    const baseIntervalMs = 300000; // 5 minutes
    const speedFactor = config.speed / 5; // speed 5 = 1x, speed 10 = 2x, speed 1 = 0.2x
    const modeFactor = modeConfig.speedMultiplier;

    const interval = baseIntervalMs / (speedFactor * modeFactor);
    const jitterAmount = modeConfig.timingJitter || 0.2;

    // Apply jitter
    return Math.round(jitter(interval, jitterAmount));
  }

  _getDailyLimit(action) {
    const b = this.behavior;
    const limits = {
      create_post: b.posts_per_day?.max || 3,
      like_post: b.likes_per_day?.max || 20,
      comment_post: b.comments_per_day?.max || 10,
      follow_user: Math.ceil((b.follows_per_week?.max || 10) / 7),
      unfollow_user: Math.ceil((b.follows_per_week?.max || 10) / 14),
      send_message: b.messages_per_day?.max || 2,
    };
    return limits[action] || null; // null = unlimited
  }

  _sportKey() {
    const sport = this.persona.profile.sport || 'Baseball';
    return sport.toLowerCase().replace(/\/.*/, '');
  }

  _resetDailyIfNeeded() {
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.dailyActionCounts = {};
      this.lastReset = today;
    }
  }
}

// ── Utility: Check if a bot is in peak hours ─────────────────────

export function isInPeakHours(persona) {
  const hour = new Date().getHours();
  return (persona.behavior.peak_hours || []).includes(hour);
}
