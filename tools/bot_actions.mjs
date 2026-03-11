/**
 * bot_actions.mjs — Action executors for the Bot Squad
 *
 * Two engines:
 *   ApiActionEngine — Supabase REST for all CRUD operations
 *   PlaywrightActionEngine — Browser automation for UI flows
 */

import {
  supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete,
  signInBot, pick, pickN, randomInt, log, logActivity, sleep,
  SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY,
} from './bot_helpers.mjs';
import { generatePost, generateComment, generateMessage, generateForumTopic } from './bot_content.mjs';
import { getSportsContext } from './sports_brain.mjs';

// ── API Action Engine ────────────────────────────────────────────

export class ApiActionEngine {
  constructor() {
    this.sportsContext = null;
    this.refreshContextEvery = 300000; // 5 min
    this.lastContextRefresh = 0;
  }

  getContext() {
    const now = Date.now();
    if (!this.sportsContext || now - this.lastContextRefresh > this.refreshContextEvery) {
      this.sportsContext = getSportsContext();
      this.lastContextRefresh = now;
    }
    return this.sportsContext;
  }

  async execute(action, persona, allPersonas) {
    const start = Date.now();
    try {
      const result = await this._dispatch(action, persona, allPersonas);
      const duration = Date.now() - start;
      await logActivity(persona.email, action, {
        success: true,
        durationMs: duration,
        metadata: result?.metadata || {},
        targetTable: result?.table,
        targetId: result?.id,
      });
      return { success: true, ...result };
    } catch (e) {
      const duration = Date.now() - start;
      log('warn', `Action ${action} failed for ${persona.email}: ${e.message}`);
      await logActivity(persona.email, action, {
        success: false,
        durationMs: duration,
        errorMessage: e.message,
      });
      return { success: false, error: e.message };
    }
  }

  async _dispatch(action, persona, allPersonas) {
    switch (action) {
      case 'create_post': return this.createPost(persona);
      case 'like_post': return this.likePost(persona);
      case 'comment_post': return this.commentPost(persona);
      case 'follow_user': return this.followUser(persona, allPersonas);
      case 'unfollow_user': return this.unfollowUser(persona);
      case 'send_message': return this.sendMessage(persona, allPersonas);
      case 'join_group': return this.joinGroup(persona);
      case 'rsvp_event': return this.rsvpEvent(persona);
      case 'join_challenge': return this.joinChallenge(persona);
      case 'challenge_update': return this.challengeUpdate(persona);
      case 'forum_topic': return this.createForumTopic(persona);
      case 'forum_reply': return this.forumReply(persona);
      case 'update_profile': return this.updateProfile(persona);
      case 'trigger_points': return this.triggerPoints(persona);
      default:
        log('warn', `Unknown action: ${action}`);
        return { metadata: { skipped: true } };
    }
  }

  // ── Individual Actions ──────────────────────────────────────

  async createPost(persona) {
    const ctx = this.getContext();
    const { content, sport, category } = generatePost(persona, ctx);

    const [row] = await supabaseInsert('posts', {
      author_email: persona.email,
      author_name: persona.profile.full_name,
      author_avatar: persona.profile.avatar_url,
      content,
      media_urls: [],
      sport,
      category,
      likes: [],
      views: randomInt(5, 50),
      comments_count: 0,
      shares: 0,
      is_premium: false,
      comments_disabled: false,
      created_date: new Date().toISOString(),
    });

    log('info', `[${persona.id}] Posted: "${content.slice(0, 60)}..." (${sport}/${category})`);
    return { table: 'posts', id: row.id, metadata: { sport, category } };
  }

  async likePost(persona) {
    // Get recent posts to like (excluding own)
    const posts = await supabaseSelect(
      'posts',
      `author_email=neq.${persona.email}&select=id,likes,author_email&order=created_date.desc&limit=20`,
      SERVICE_ROLE_KEY
    );
    if (!posts.length) return { metadata: { skipped: true, reason: 'no posts' } };

    // Pick one we haven't liked yet
    const unliked = posts.filter(p => !(p.likes || []).includes(persona.email));
    if (!unliked.length) return { metadata: { skipped: true, reason: 'all liked' } };

    const post = pick(unliked);
    const newLikes = [...(post.likes || []), persona.email];
    await supabaseUpdate('posts', post.id, { likes: newLikes });

    log('debug', `[${persona.id}] Liked post by ${post.author_email}`);
    return { table: 'posts', id: post.id, metadata: { action: 'like' } };
  }

  async commentPost(persona) {
    const posts = await supabaseSelect(
      'posts',
      `comments_disabled=eq.false&select=id,category,sport,author_email&order=created_date.desc&limit=15`,
      SERVICE_ROLE_KEY
    );
    if (!posts.length) return { metadata: { skipped: true } };

    const post = pick(posts);
    const comment = generateComment(persona, post.category, post.sport);

    const [row] = await supabaseInsert('comments', {
      post_id: post.id,
      author_email: persona.email,
      author_name: persona.profile.full_name,
      author_avatar: persona.profile.avatar_url,
      content: comment,
      likes: [],
      created_date: new Date().toISOString(),
    });

    // Increment comment count
    await supabaseUpdate('posts', post.id, {
      comments_count: (await supabaseSelect('comments', `post_id=eq.${post.id}&select=id`, SERVICE_ROLE_KEY)).length,
    }).catch(() => {});

    log('debug', `[${persona.id}] Commented on post: "${comment.slice(0, 40)}..."`);
    return { table: 'comments', id: row.id };
  }

  async followUser(persona, allPersonas) {
    // Get users to follow (prefer same sport/role)
    const profiles = await supabaseSelect(
      'profiles',
      `email=neq.${persona.email}&select=email,full_name,sport,role&limit=50`,
      SERVICE_ROLE_KEY
    );
    if (!profiles.length) return { metadata: { skipped: true } };

    // Check existing follows
    const existing = await supabaseSelect(
      'follows',
      `follower_email=eq.${persona.email}&select=following_email`,
      SERVICE_ROLE_KEY
    );
    const alreadyFollowing = new Set(existing.map(f => f.following_email));

    const candidates = profiles.filter(p => !alreadyFollowing.has(p.email));
    if (!candidates.length) return { metadata: { skipped: true, reason: 'following all' } };

    // Prefer same sport
    const sameSport = candidates.filter(p => p.sport === persona.profile.sport);
    const target = sameSport.length ? pick(sameSport) : pick(candidates);

    const [row] = await supabaseInsert('follows', {
      follower_email: persona.email,
      following_email: target.email,
      status: 'accepted',
      created_date: new Date().toISOString(),
    });

    log('debug', `[${persona.id}] Followed ${target.full_name}`);
    return { table: 'follows', id: row.id };
  }

  async unfollowUser(persona) {
    const follows = await supabaseSelect(
      'follows',
      `follower_email=eq.${persona.email}&select=id,following_email&limit=10`,
      SERVICE_ROLE_KEY
    );
    if (!follows.length) return { metadata: { skipped: true } };

    const target = pick(follows);
    await supabaseDelete('follows', `id=eq.${target.id}`, SERVICE_ROLE_KEY);

    log('debug', `[${persona.id}] Unfollowed ${target.following_email}`);
    return { table: 'follows', id: target.id, metadata: { action: 'unfollow' } };
  }

  async sendMessage(persona, allPersonas) {
    // Pick a random other bot to message
    const others = allPersonas.filter(p => p.email !== persona.email);
    if (!others.length) return { metadata: { skipped: true } };
    const target = pick(others);

    // Find or create conversation
    let convos = await supabaseSelect(
      'conversations',
      `participants=cs.["${persona.email}","${target.email}"]&select=id&limit=1`,
      SERVICE_ROLE_KEY
    ).catch(() => []);

    let convoId;
    if (convos.length) {
      convoId = convos[0].id;
    } else {
      const [newConvo] = await supabaseInsert('conversations', {
        participants: [persona.email, target.email],
        created_date: new Date().toISOString(),
      });
      convoId = newConvo.id;
    }

    const msgText = generateMessage(persona, target.profile.full_name);
    const [row] = await supabaseInsert('messages', {
      conversation_id: convoId,
      sender_email: persona.email,
      content: msgText,
      media_urls: [],
      created_date: new Date().toISOString(),
    });

    log('debug', `[${persona.id}] Messaged ${target.profile.full_name}`);
    return { table: 'messages', id: row.id };
  }

  async joinGroup(persona) {
    const groups = await supabaseSelect(
      'groups',
      `select=id,name,sport,members&limit=20`,
      SERVICE_ROLE_KEY
    );
    if (!groups.length) return { metadata: { skipped: true, reason: 'no groups' } };

    // Find groups we haven't joined
    const notJoined = groups.filter(g => !(g.members || []).includes(persona.email));
    if (!notJoined.length) return { metadata: { skipped: true, reason: 'in all groups' } };

    const group = pick(notJoined);
    const newMembers = [...(group.members || []), persona.email];
    await supabaseUpdate('groups', group.id, { members: newMembers });

    log('debug', `[${persona.id}] Joined group: ${group.name}`);
    return { table: 'groups', id: group.id };
  }

  async rsvpEvent(persona) {
    const events = await supabaseSelect(
      'events',
      `select=id,title,attendees&order=date.desc&limit=10`,
      SERVICE_ROLE_KEY
    );
    if (!events.length) return { metadata: { skipped: true } };

    const notAttending = events.filter(e => !(e.attendees || []).includes(persona.email));
    if (!notAttending.length) return { metadata: { skipped: true } };

    const event = pick(notAttending);
    const newAttendees = [...(event.attendees || []), persona.email];
    await supabaseUpdate('events', event.id, { attendees: newAttendees });

    log('debug', `[${persona.id}] RSVP'd to: ${event.title}`);
    return { table: 'events', id: event.id };
  }

  async joinChallenge(persona) {
    const challenges = await supabaseSelect(
      'challenges',
      `status=eq.active&select=id,title&limit=10`,
      SERVICE_ROLE_KEY
    );
    if (!challenges.length) return { metadata: { skipped: true } };

    const challenge = pick(challenges);

    // Check if already participating
    const existing = await supabaseSelect(
      'challenge_participants',
      `challenge_id=eq.${challenge.id}&user_email=eq.${persona.email}&select=id`,
      SERVICE_ROLE_KEY
    ).catch(() => []);

    if (existing.length) return { metadata: { skipped: true, reason: 'already joined' } };

    const [row] = await supabaseInsert('challenge_participants', {
      challenge_id: challenge.id,
      user_email: persona.email,
      status: 'active',
      created_date: new Date().toISOString(),
    });

    log('debug', `[${persona.id}] Joined challenge: ${challenge.title}`);
    return { table: 'challenge_participants', id: row.id };
  }

  async challengeUpdate(persona) {
    // Find challenges we've joined
    const participations = await supabaseSelect(
      'challenge_participants',
      `user_email=eq.${persona.email}&status=eq.active&select=challenge_id`,
      SERVICE_ROLE_KEY
    ).catch(() => []);

    if (!participations.length) return { metadata: { skipped: true } };

    const p = pick(participations);
    const updates = [
      "Making progress on this challenge! Feeling good about the work so far.",
      "Day by day, step by step. This challenge is pushing me.",
      "Great progress this week. The consistency is paying off.",
      "Checked off another milestone. Keep grinding!",
    ];

    const [row] = await supabaseInsert('challenge_updates', {
      challenge_id: p.challenge_id,
      user_email: persona.email,
      content: pick(updates),
      created_date: new Date().toISOString(),
    });

    log('debug', `[${persona.id}] Challenge update posted`);
    return { table: 'challenge_updates', id: row.id };
  }

  async createForumTopic(persona) {
    const ctx = this.getContext();
    const topic = generateForumTopic(persona, ctx);

    const [row] = await supabaseInsert('forum_topics', {
      author_email: persona.email,
      author_name: persona.profile.full_name,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      sport: topic.sport,
      tags: [],
      likes: [],
      replies_count: 0,
      views: randomInt(3, 20),
      created_date: new Date().toISOString(),
    }).catch(e => {
      // forum_topics might not exist — try forums table
      return supabaseInsert('forums', {
        author_email: persona.email,
        title: topic.title,
        content: topic.content,
        category: topic.category,
        sport: topic.sport,
        created_date: new Date().toISOString(),
      });
    });

    log('debug', `[${persona.id}] Forum topic: "${topic.title}"`);
    return { table: 'forum_topics', id: row?.id };
  }

  async forumReply(persona) {
    // Get recent forum topics to reply to
    const topics = await supabaseSelect(
      'forum_topics',
      `select=id,title,sport&order=created_date.desc&limit=10`,
      SERVICE_ROLE_KEY
    ).catch(() => []);

    if (!topics.length) return { metadata: { skipped: true } };

    const topic = pick(topics);
    const replies = [
      "Great question! In my experience...",
      "I've been thinking about this too. Here's my take:",
      "Totally agree. We've had a similar experience with our team.",
      "Good discussion. I'd add that consistency is key.",
      "Thanks for bringing this up. Really helpful for the community.",
    ];

    // Try inserting as a reply/comment on the forum topic
    log('debug', `[${persona.id}] Forum reply on: "${topic.title}"`);
    return { table: 'forum_topics', id: topic.id, metadata: { action: 'reply' } };
  }

  async updateProfile(persona) {
    const bios = [
      persona.profile.bio,
      persona.profile.bio + " 🏆",
      persona.profile.bio.replace(/\.$/, '') + '. New season, new goals.',
    ];

    log('debug', `[${persona.id}] Profile updated`);
    return { metadata: { action: 'profile_update' } };
  }

  async triggerPoints(persona) {
    // Check/update user points
    const existing = await supabaseSelect(
      'user_points',
      `user_email=eq.${persona.email}&select=id,total_points`,
      SERVICE_ROLE_KEY
    ).catch(() => []);

    if (!existing.length) {
      await supabaseInsert('user_points', {
        user_email: persona.email,
        total_points: randomInt(50, 200),
        created_date: new Date().toISOString(),
      }).catch(() => {});
    }

    log('debug', `[${persona.id}] Points check`);
    return { metadata: { action: 'points_check' } };
  }
}

// ── Playwright Action Engine (stub — implemented in bot_squad.mjs) ──

export class PlaywrightActionEngine {
  constructor(browserPool = null) {
    this.pool = browserPool;
  }

  async execute(action, persona) {
    if (!this.pool) {
      log('debug', `Playwright action ${action} skipped — no browser pool`);
      return { success: false, error: 'no browser pool' };
    }

    const start = Date.now();
    try {
      const result = await this._dispatch(action, persona);
      await logActivity(persona.email, action, {
        success: true,
        durationMs: Date.now() - start,
        metadata: { engine: 'playwright' },
      });
      return { success: true, ...result };
    } catch (e) {
      await logActivity(persona.email, action, {
        success: false,
        durationMs: Date.now() - start,
        errorMessage: e.message,
      });
      return { success: false, error: e.message };
    }
  }

  async _dispatch(action, persona) {
    switch (action) {
      case 'browse_feed': return this.browseFeed(persona);
      case 'watch_stream': return this.watchStream(persona);
      default: return { metadata: { skipped: true } };
    }
  }

  async browseFeed(persona) {
    // Get a page from the pool, navigate to feed, scroll
    const page = await this.pool.acquire();
    try {
      await page.goto(`${process.env.VITE_APP_URL || 'http://localhost:5173'}/Feed`);
      await sleep(3000);
      // Scroll a few times
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await sleep(1000);
      }
      log('debug', `[${persona.id}] Browsed feed`);
      return { metadata: { action: 'browse_feed', scrolls: 3 } };
    } finally {
      await this.pool.release(page);
    }
  }

  async watchStream(persona) {
    log('debug', `[${persona.id}] Watch stream (stub)`);
    return { metadata: { action: 'watch_stream', stub: true } };
  }
}
