/**
 * Supabase compatibility layer — replaces @base44/sdk
 * Exports the same `base44` object shape so all existing page/component code
 * continues to work without changes.
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
// Returns an object matching base44.entities.X interface:
//   .filter(filters, sortField, limit)
//   .list(sortField, limit)
//   .create(data)
//   .update(id, data)
//   .delete(id)
//   .subscribeToChanges(filters, callback) → { unsubscribe }
// ---------------------------------------------------------------------------
const makeEntity = (tableName) => ({
  filter: async (filters = {}, sortField = null, limit = null) => {
    let query = supabase.from(tableName).select('*');
    const entries = Object.entries(filters);
    for (const [key, val] of entries) {
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
// Auth compatibility
// Matches base44.auth.me(), .logout(), .redirectToLogin(), .updateMe()
// ---------------------------------------------------------------------------
const auth = {
  me: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
// Integrations compatibility
// Matches base44.integrations.Core.UploadFile(), .InvokeLLM(), .SendEmail()
// ---------------------------------------------------------------------------
const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || 'anon';
      const ext = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(data.path);
      return { url: publicUrl };
    },

    InvokeLLM: async ({ prompt, response_json_schema, add_context_from_internet }) => {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt, response_json_schema, add_context_from_internet },
      });
      if (error) throw error;
      return data;
    },

    SendEmail: async ({ to, subject, body }) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body },
      });
      if (error) throw error;
      return data;
    },
  },
};

// ---------------------------------------------------------------------------
// Functions compatibility
// Matches base44.functions.invoke(name, args)
// ---------------------------------------------------------------------------
const functions = {
  invoke: async (name, args) => {
    const { data, error } = await supabase.functions.invoke(name, { body: args });
    if (error) throw error;
    return data;
  },
};

// ---------------------------------------------------------------------------
// Agents compatibility
// Matches base44.agents.createConversation, addMessage, subscribeToConversation
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const participants = user?.email ? [user.email] : [];
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        agent_name,
        metadata,
        messages: [],
        participants,
        is_group: false,
      })
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

    // Call the AI agent edge function
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
    return { unsubscribe: () => supabase.removeChannel(channel) };
  },
};

// ---------------------------------------------------------------------------
// All entities mapped to Supabase table names
// ---------------------------------------------------------------------------
const entities = {
  // User / Profiles
  User: {
    ...makeEntity('profiles'),
    // override filter to also return auth.users fields merged in
    filter: makeEntity('profiles').filter,
    list: makeEntity('profiles').list,
  },

  // Org
  Organization: makeEntity('organizations'),
  OrgMember: makeEntity('org_members'),
  OrgInvite: makeEntity('org_invites'),

  // Training
  TrainingPlan: makeEntity('training_plans'),
  WorkoutItem: makeEntity('workout_items'),
  TrainingSession: makeEntity('training_sessions'),
  AthleteVideo: makeEntity('athlete_videos'),
  TrainingProgram: makeEntity('training_programs'),

  // Sport Profiles
  SportProfile: makeEntity('sport_profiles'),
  StatEntry: makeEntity('stat_entries'),

  // Social
  Post: makeEntity('posts'),
  Follow: makeEntity('follows'),
  Highlight: makeEntity('highlights'),

  // Community
  Group: makeEntity('groups'),
  Event: makeEntity('events'),
  Forum: makeEntity('forums'),
  ForumTopic: makeEntity('forum_topics'),
  Advice: makeEntity('advice'),

  // Gamification
  UserPoints: makeEntity('user_points'),
  UserBadge: makeEntity('user_badges'),
  Challenge: makeEntity('challenges'),
  ChallengeParticipant: makeEntity('challenge_participants'),

  // Live streaming
  LiveStream: makeEntity('live_streams'),
  ScheduledStream: makeEntity('scheduled_streams'),
  LiveChat: makeEntity('live_chats'),
  StreamPoll: makeEntity('stream_polls'),

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

  // Comments (dedicated table)
  Comment: makeEntity('comments'),

  // Typing indicators (for messaging)
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
// Main export — matches the shape of the old base44 client
// ---------------------------------------------------------------------------
export const base44 = {
  auth,
  entities,
  integrations,
  functions,
  agents,
  _supabase: supabase, // escape hatch for advanced Supabase-specific usage
};

export default base44;
