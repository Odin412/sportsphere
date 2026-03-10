/**
 * Sportsphere database client — direct Supabase + Anthropic
 * Replaces all base44 SDK references.
 */
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
    },
  }
);

// ---------------------------------------------------------------------------
// Entity factory
// Returns an object with: .filter() .list() .create() .update() .delete()
// ---------------------------------------------------------------------------
const makeEntity = (tableName) => ({
  filter: async (filters = {}, sortField = null, limit = null) => {
    let query = supabase.from(tableName).select('*');
    for (const [key, val] of Object.entries(filters)) {
      if (Array.isArray(val)) {
        query = query.overlaps(key, val);
      } else if (val === null) {
        query = query.is(key, null);
      } else {
        query = query.eq(key, val);
      }
    }
    if (sortField) {
      const asc = !sortField.startsWith('-');
      query = query.order(sortField.replace('-', ''), { ascending: asc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  list: async (sortField = null, limit = null) => {
    let query = supabase.from(tableName).select('*');
    if (sortField) {
      const asc = !sortField.startsWith('-');
      query = query.order(sortField.replace('-', ''), { ascending: asc });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (data) => {
    const { data: row, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  update: async (id, data) => {
    const { data: row, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  },

  search: async (query, fields = [], sortField = null, limit = 50) => {
    let q = supabase.from(tableName).select('*');
    if (query && fields.length) {
      const orClause = fields.map(f => `${f}.ilike.%${query}%`).join(',');
      q = q.or(orClause);
    }
    if (sortField) {
      const asc = !sortField.startsWith('-');
      q = q.order(sortField.replace('-', ''), { ascending: asc });
    }
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  subscribeToChanges: (filters = {}, callback) => {
    let channel = supabase.channel(`${tableName}_${Date.now()}`);
    const filterStr = Object.entries(filters)
      .map(([k, v]) => `${k}=eq.${v}`)
      .join(',');
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        ...(filterStr ? { filter: filterStr } : {}),
      },
      callback
    );
    channel.subscribe();
    return { unsubscribe: () => supabase.removeChannel(channel) };
  },
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const auth = {
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return { ...profile, id: user.id, email: user.email };
  },

  logout: async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  },

  redirectToLogin: () => {
    window.location.href = '/login';
  },

  updateMe: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return profile;
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ---------------------------------------------------------------------------
// AI — direct Anthropic via Supabase Edge Function
// ---------------------------------------------------------------------------
const ai = {
  invoke: async ({ prompt, schema, system } = {}) => {
    const { data, error } = await supabase.functions.invoke('claude', {
      body: { prompt, response_json_schema: schema, system },
    });
    if (error) throw error;
    return data;
  },
};

// ---------------------------------------------------------------------------
// Storage — Supabase Storage
// ---------------------------------------------------------------------------
const storage = {
  upload: async ({ file }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anon';
    const ext = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);
    return { file_url: publicUrl };
  },
};

// ---------------------------------------------------------------------------
// Email — Supabase Edge Function
// ---------------------------------------------------------------------------
const email = {
  send: async ({ to, subject, body }) => {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body },
    });
    if (error) throw error;
    return data;
  },
};

// ---------------------------------------------------------------------------
// Functions — invoke Supabase Edge Functions by name
// ---------------------------------------------------------------------------
const functions = {
  invoke: async (name, args) => {
    const { data, error } = await supabase.functions.invoke(name, { body: args });
    if (error) throw error;
    return data;
  },
};

// ---------------------------------------------------------------------------
// Agents / AI conversations
// ---------------------------------------------------------------------------
const agents = {
  listConversations: async ({ agent_name } = {}) => {
    let query = supabase
      .from('conversations')
      .select('*')
      .not('agent_name', 'is', null)
      .order('created_at', { ascending: false });
    if (agent_name) query = query.eq('agent_name', agent_name);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getConversation: async (id) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  createConversation: async ({ agent_name, metadata = {} }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const participants = user?.email ? [user.email] : [];
    const { data, error } = await supabase
      .from('conversations')
      .insert({ agent_name, metadata, messages: [], participants, is_group: false })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  addMessage: async (conversationId, { role, content }) => {
    const { data: conv } = await supabase
      .from('conversations')
      .select('messages, agent_name')
      .eq('id', conversationId)
      .single();

    const userMsg = { role, content, created_at: new Date().toISOString() };
    const messages = [...(conv?.messages || []), userMsg];

    const { data: aiReply } = await supabase.functions.invoke('ai-agent', {
      body: { conversationId, message: content, agentName: conv?.agent_name, messages },
    });

    const assistantMsg = {
      role: 'assistant',
      content: aiReply?.reply || '',
      created_at: new Date().toISOString(),
    };
    const updatedMessages = [...messages, assistantMsg];

    await supabase
      .from('conversations')
      .update({ messages: updatedMessages })
      .eq('id', conversationId);

    return { messages: updatedMessages };
  },

  subscribeToConversation: (conversationId, callback) => {
    const channel = supabase
      .channel(`conv_${conversationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `id=eq.${conversationId}`,
      }, callback)
      .subscribe();
    return { unsubscribe: () => supabase.removeChannel(channel) };
  },
};

// ---------------------------------------------------------------------------
// Entities mapped to Supabase tables
// ---------------------------------------------------------------------------
const entities = {
  // User / Profiles
  User: makeEntity('profiles'),

  // Org
  Organization: makeEntity('organizations'),
  OrgMember: makeEntity('org_members'),
  OrgInvite: makeEntity('org_invites'),
  OrgMessage: makeEntity('org_messages'),

  // Training
  TrainingPlan: makeEntity('training_plans'),
  WorkoutItem: makeEntity('workout_items'),
  TrainingSession: makeEntity('training_sessions'),
  CoachingSession: makeEntity('coaching_sessions'),
  AthleteVideo: makeEntity('athlete_videos'),
  TrainingProgram: makeEntity('training_programs'),
  TrainingContent: makeEntity('training_content'),

  // Sport Profiles
  SportProfile: makeEntity('sport_profiles'),
  StatEntry: makeEntity('stat_entries'),

  // ProPath
  ProfileView: makeEntity('profile_views'),
  CardCustomization: makeEntity('card_customizations'),

  // Social
  Post: makeEntity('posts'),
  Follow: makeEntity('follows'),
  Highlight: makeEntity('highlights'),
  SavedContent: makeEntity('saved_content'),

  // Community
  Group: makeEntity('groups'),
  Event: makeEntity('events'),
  Forum: makeEntity('forums'),
  ForumTopic: makeEntity('forum_topics'),
  Advice: makeEntity('advice'),
  AdviceRequest: makeEntity('advice_requests'),

  // Gamification
  UserPoints: makeEntity('user_points'),
  UserBadge: makeEntity('user_badges'),
  Challenge: makeEntity('challenges'),
  ChallengeParticipant: makeEntity('challenge_participants'),
  ChallengeUpdate: makeEntity('challenge_updates'),

  // Live streaming
  LiveStream: makeEntity('live_streams'),
  ScheduledStream: makeEntity('scheduled_streams'),
  LiveChat: makeEntity('live_chats'),
  StreamPoll: makeEntity('stream_polls'),

  // Game Day (live game viewing, scoring, events)
  Game: makeEntity('games'),
  GameScore: makeEntity('game_scores'),
  GameEvent: makeEntity('game_events'),

  // Messaging
  Conversation: makeEntity('conversations'),
  Message: makeEntity('messages'),
  CallSignal: makeEntity('call_signals'),

  // Notifications
  Notification: makeEntity('notifications'),
  NotificationPreferences: makeEntity('notification_preferences'),

  // Moderation
  ModerationFlag: makeEntity('moderation_flags'),
  Report: makeEntity('reports'),

  // Comments
  Comment: makeEntity('comments'),

  // Typing indicators
  TypingIndicator: makeEntity('typing_indicators'),

  // Monetization
  Subscription: makeEntity('subscriptions'),
  CreatorSubscription: makeEntity('creator_subscriptions'),
  SubscriptionPlan: makeEntity('subscription_plans'),
  Transaction: makeEntity('transactions'),
  Tip: makeEntity('tips'),

  // Other
  FeedPreferences: makeEntity('feed_preferences'),
  Recommendation: makeEntity('recommendations'),
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export const db = {
  auth,
  entities,
  ai,
  storage,
  email,
  functions,
  agents,
  // Backwards-compat aliases (for any remaining integrations references)
  integrations: {
    Core: {
      InvokeLLM: ({ prompt, response_json_schema, add_context_from_internet }) =>
        ai.invoke({ prompt, schema: response_json_schema }),
      UploadFile: ({ file }) => storage.upload({ file }),
      SendEmail: ({ to, subject, body }) => email.send({ to, subject, body }),
    },
  },
  _supabase: supabase,
};

export default db;
