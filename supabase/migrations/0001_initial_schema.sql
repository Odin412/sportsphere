-- ================================================================
-- Sportsphere (ProPath) - Initial Database Schema
-- Migrated from Base44 to Supabase PostgreSQL
-- ================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ================================================================
-- PROFILES (extends auth.users)
-- ================================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  skill_level text check (skill_level in ('beginner','intermediate','advanced','professional','elite')),
  preferred_sports text[],
  location text,
  age int,
  gender text,
  weight numeric,
  height numeric,
  professional_team text,
  college text,
  highschool text,
  highschool_grad_year int,
  social_links jsonb default '{}',
  is_creator boolean default false,
  is_premium boolean default false,
  premium_expires timestamptz,
  subscription_price numeric,
  is_accepting_donations boolean default false,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- ORGANIZATIONS (tenants)
-- ================================================================
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text,
  location text,
  description text,
  owner_email text not null,
  logo_url text,
  subscription_plan text default 'free',
  subscription_status text default 'trialing' check (subscription_status in ('trialing','active','past_due','canceled')),
  max_athletes int default 10,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table if not exists org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade not null,
  user_email text not null,
  user_name text,
  role text not null check (role in ('admin','coach','athlete','parent')),
  status text default 'active' check (status in ('active','invited')),
  sport text,
  position text,
  phone text,
  athlete_emails text[] default '{}',
  avatar_url text,
  created_at timestamptz default now(),
  unique(organization_id, user_email)
);

create table if not exists org_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade not null,
  invited_email text not null,
  role text not null,
  invited_by_email text,
  status text default 'pending' check (status in ('pending','accepted','declined')),
  token text unique default gen_random_uuid()::text,
  created_at timestamptz default now()
);

-- ================================================================
-- TRAINING
-- ================================================================
create table if not exists training_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  athlete_email text,
  athlete_name text,
  coach_email text,
  title text,
  goal text,
  status text default 'active' check (status in ('draft','active','completed','paused')),
  sport text,
  start_date date,
  end_date date,
  ai_generated boolean default false,
  created_at timestamptz default now()
);

create table if not exists workout_items (
  id uuid primary key default gen_random_uuid(),
  training_plan_id uuid references training_plans on delete cascade not null,
  title text not null,
  description text,
  target text,
  due_date date,
  order_index int default 0,
  completed_by_email text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  coach_email text,
  coach_name text,
  title text,
  description text,
  session_type text check (session_type in ('practice','game','strength','recovery','review','meeting','other')),
  sport text,
  scheduled_date timestamptz,
  duration_minutes int,
  location text,
  is_virtual boolean default false,
  meeting_link text,
  notes text,
  attendees text[] default '{}',
  status text default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  is_paid boolean default false,
  price numeric,
  max_participants int,
  image_url text,
  resources jsonb default '[]',
  available_slots jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists athlete_videos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  athlete_email text,
  title text,
  video_url text,
  mux_asset_id text,
  mux_playback_id text,
  coach_reviewed boolean default false,
  coach_feedback text,
  coach_rating int check (coach_rating between 1 and 5),
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists training_programs (
  id uuid primary key default gen_random_uuid(),
  creator_email text,
  title text,
  description text,
  sport text,
  followers text[] default '{}',
  created_at timestamptz default now()
);

-- ================================================================
-- SPORT PROFILES & USER DATA
-- ================================================================
create table if not exists sport_profiles (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_name text,
  sport text not null,
  role text check (role in ('athlete','coach','trainer','instructor','fan')),
  level text check (level in ('beginner','intermediate','advanced','professional','elite')),
  bio text,
  team text,
  location text,
  years_experience int,
  avatar_url text,
  achievements text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists stat_entries (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  sport_profile_id uuid references sport_profiles on delete cascade,
  sport text,
  date date default current_date,
  stats jsonb default '{}',
  created_at timestamptz default now()
);

-- ================================================================
-- SOCIAL
-- ================================================================
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_name text,
  author_avatar text,
  content text,
  media_urls text[] default '{}',
  sport text,
  category text,
  likes text[] default '{}',
  comments jsonb default '[]',
  reposts int default 0,
  views int default 0,
  is_premium boolean default false,
  comments_disabled boolean default false,
  created_date timestamptz default now()
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_email text not null,
  following_email text not null,
  status text default 'accepted' check (status in ('pending','accepted','blocked')),
  created_date timestamptz default now(),
  unique(follower_email, following_email)
);

create table if not exists highlights (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  item_type text,
  item_id text,
  item_data jsonb default '{}',
  is_pinned boolean default false,
  created_date timestamptz default now()
);

-- ================================================================
-- GROUPS & EVENTS
-- ================================================================
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sport text,
  category text,
  location text,
  is_public boolean default true,
  membership_fee numeric default 0,
  creator_email text,
  admins text[] default '{}',
  members text[] default '{}',
  image_url text,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  creator_email text not null,
  creator_name text,
  creator_avatar text,
  title text not null,
  description text,
  event_type text check (event_type in ('competition','workshop','meetup','training','tournament','other')),
  sport text,
  date timestamptz,
  end_date timestamptz,
  location text,
  city text,
  country text,
  is_virtual boolean default false,
  meeting_link text,
  max_attendees int,
  price numeric default 0,
  image_url text,
  attendees text[] default '{}',
  created_at timestamptz default now()
);

-- ================================================================
-- FORUMS
-- ================================================================
create table if not exists forums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sport text,
  category text,
  creator_email text,
  created_at timestamptz default now()
);

create table if not exists forum_topics (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid references forums on delete cascade,
  title text not null,
  content text,
  author_email text,
  author_name text,
  author_avatar text,
  replies jsonb default '[]',
  views int default 0,
  likes text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists advice (
  id uuid primary key default gen_random_uuid(),
  author_email text,
  author_name text,
  content text,
  sport text,
  category text,
  likes text[] default '{}',
  created_at timestamptz default now()
);

-- ================================================================
-- GAMIFICATION
-- ================================================================
create table if not exists user_points (
  id uuid primary key default gen_random_uuid(),
  user_email text unique not null,
  total_points int default 0,
  level int default 1,
  workouts_completed int default 0,
  challenges_completed int default 0,
  sessions_attended int default 0,
  posts_created int default 0,
  forum_contributions int default 0,
  last_login_date date,
  created_at timestamptz default now()
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  badge_id text,
  badge_name text,
  badge_icon text,
  badge_description text,
  earned_date timestamptz default now()
);

-- ================================================================
-- CHALLENGES
-- ================================================================
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  creator_email text,
  title text not null,
  description text,
  difficulty text check (difficulty in ('beginner','intermediate','advanced','expert')),
  status text default 'upcoming' check (status in ('upcoming','active','completed')),
  sport text,
  image_url text,
  start_date timestamptz,
  end_date timestamptz,
  created_date timestamptz default now()
);

create table if not exists challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges on delete cascade,
  user_email text not null,
  joined_at timestamptz default now(),
  unique(challenge_id, user_email)
);

-- ================================================================
-- LIVE STREAMING
-- ================================================================
create table if not exists live_streams (
  id uuid primary key default gen_random_uuid(),
  host_email text not null,
  host_name text,
  host_avatar text,
  title text,
  description text,
  sport text,
  status text default 'live' check (status in ('live','ended','scheduled')),
  started_at timestamptz default now(),
  ended_at timestamptz,
  viewers text[] default '{}',
  is_premium boolean default false,
  price numeric default 0,
  stream_url text,
  thumbnail_url text,
  ai_summary text,
  ai_tags text[],
  ai_transcript text,
  trim_start_seconds int,
  trim_end_seconds int,
  trim_applied boolean default false,
  text_overlays jsonb default '[]',
  merge_transition text,
  merged_from_ids text[],
  created_at timestamptz default now()
);

create table if not exists scheduled_streams (
  id uuid primary key default gen_random_uuid(),
  host_email text not null,
  host_name text,
  host_avatar text,
  title text,
  description text,
  sport text,
  scheduled_at timestamptz,
  duration_minutes int,
  status text default 'upcoming' check (status in ('upcoming','cancelled','completed')),
  rsvp_emails text[] default '{}',
  is_premium boolean default false,
  price numeric default 0,
  notified_followers boolean default false,
  created_at timestamptz default now()
);

create table if not exists live_chats (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid,
  sender_email text not null,
  sender_name text,
  message text,
  is_pinned boolean default false,
  created_date timestamptz default now()
);

create table if not exists stream_polls (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid,
  creator_email text,
  question text not null,
  options jsonb default '[]',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ================================================================
-- MESSAGING
-- ================================================================
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  participants text[] not null default '{}',
  participant_names jsonb default '{}',
  group_name text,
  is_group boolean default false,
  unread_by text[] default '{}',
  last_message text,
  last_message_at timestamptz,
  -- For AI agent conversations
  agent_name text,
  messages jsonb default '[]',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade,
  sender_email text not null,
  sender_name text,
  content text,
  media_url text,
  media_type text,
  shared_post_data jsonb,
  read_by text[] default '{}',
  created_date timestamptz default now()
);

create table if not exists call_signals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid,
  from_email text,
  to_email text,
  signal_type text check (signal_type in ('offer','answer','ice-candidate','hangup')),
  signal_data jsonb,
  created_at timestamptz default now()
);

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  type text,
  actor_name text,
  actor_email text,
  actor_avatar text,
  message text,
  related_item_id text,
  related_item_type text,
  is_read boolean default false,
  created_date timestamptz default now()
);

create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_email text unique not null,
  likes_email boolean default true,
  comments_email boolean default true,
  mentions_email boolean default true,
  follows_email boolean default true,
  messages_email boolean default true,
  tips_email boolean default true,
  subscriptions_email boolean default true,
  challenge_updates_email boolean default true,
  stream_reminders_email boolean default true,
  created_at timestamptz default now()
);

-- ================================================================
-- MODERATION
-- ================================================================
create table if not exists moderation_flags (
  id uuid primary key default gen_random_uuid(),
  content_type text,
  content_id text,
  content_text text,
  author_email text,
  violations text[] default '{}',
  severity text check (severity in ('none','low','medium','high','critical')),
  ai_confidence numeric,
  ai_explanation text,
  status text default 'pending' check (status in ('pending','reviewed','resolved','dismissed')),
  reviewed_by text,
  created_at timestamptz default now()
);

-- ================================================================
-- MONETIZATION
-- ================================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_email text not null,
  creator_email text not null,
  amount numeric,
  status text default 'active' check (status in ('active','cancelled','expired')),
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  unique(subscriber_email, creator_email)
);

create table if not exists creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_email text not null,
  creator_email text not null,
  tier text,
  status text default 'active' check (status in ('active','cancelled','expired')),
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  creator_email text not null,
  name text not null,
  description text,
  price_monthly numeric,
  price_yearly numeric,
  benefits text[] default '{}',
  color text,
  emoji text,
  is_active boolean default true,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  from_email text,
  to_email text,
  type text check (type in ('donation','subscription','tip','ppv')),
  amount numeric,
  status text default 'completed' check (status in ('pending','completed','failed','refunded')),
  stripe_payment_intent_id text,
  stream_id uuid,
  message text,
  created_at timestamptz default now()
);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  to_email text not null,
  amount numeric,
  message text,
  context_type text,
  context_id text,
  status text default 'completed',
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

-- ================================================================
-- RECOMMENDATIONS
-- ================================================================
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  recommended_streams jsonb default '[]',
  recommended_users jsonb default '[]',
  generated_at timestamptz default now()
);

-- ================================================================
-- FEED PREFERENCES
-- ================================================================
create table if not exists feed_preferences (
  id uuid primary key default gen_random_uuid(),
  user_email text unique not null,
  preferred_sports text[] default '{}',
  excluded_sports text[] default '{}',
  content_types text[] default '{}',
  updated_at timestamptz default now()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
create index if not exists idx_org_members_org_id on org_members(organization_id);
create index if not exists idx_org_members_user_email on org_members(user_email);
create index if not exists idx_training_plans_org_id on training_plans(organization_id);
create index if not exists idx_training_plans_athlete_email on training_plans(athlete_email);
create index if not exists idx_workout_items_plan_id on workout_items(training_plan_id);
create index if not exists idx_training_sessions_org_id on training_sessions(organization_id);
create index if not exists idx_athlete_videos_org_id on athlete_videos(organization_id);
create index if not exists idx_posts_author_email on posts(author_email);
create index if not exists idx_posts_created_date on posts(created_date desc);
create index if not exists idx_follows_follower on follows(follower_email);
create index if not exists idx_follows_following on follows(following_email);
create index if not exists idx_notifications_recipient on notifications(recipient_email, is_read);
create index if not exists idx_notifications_created on notifications(created_date desc);
create index if not exists idx_live_chats_stream_id on live_chats(stream_id, created_date);
create index if not exists idx_messages_conversation on messages(conversation_id, created_date);
create index if not exists idx_user_points_email on user_points(user_email);
create index if not exists idx_user_points_total on user_points(total_points desc);
create index if not exists idx_sport_profiles_user_email on sport_profiles(user_email);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

-- Profiles: users can read all, only update their own
alter table profiles enable row level security;
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_trigger" on profiles for insert with check (auth.uid() = id);

-- Organizations: members can see their org
alter table organizations enable row level security;
create policy "orgs_select_members" on organizations for select using (
  owner_email = auth.jwt()->>'email'
  or id in (select organization_id from org_members where user_email = auth.jwt()->>'email')
);
create policy "orgs_insert_owner" on organizations for insert with check (
  owner_email = auth.jwt()->>'email'
);
create policy "orgs_update_admin" on organizations for update using (
  owner_email = auth.jwt()->>'email'
  or id in (select organization_id from org_members where user_email = auth.jwt()->>'email' and role = 'admin')
);

-- Org members: members see own org's members
alter table org_members enable row level security;
create policy "org_members_select" on org_members for select using (
  user_email = auth.jwt()->>'email'
  or organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email'
  )
);
create policy "org_members_insert_admin" on org_members for insert with check (
  organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin')
  )
  or organization_id in (select id from organizations where owner_email = auth.jwt()->>'email')
);
create policy "org_members_update" on org_members for update using (
  user_email = auth.jwt()->>'email'
  or organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin','coach')
  )
);
create policy "org_members_delete_admin" on org_members for delete using (
  organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role = 'admin'
  )
);

-- Training plans: org members can see plans for their org
alter table training_plans enable row level security;
create policy "training_plans_select" on training_plans for select using (
  organization_id in (select organization_id from org_members where user_email = auth.jwt()->>'email')
  or athlete_email = auth.jwt()->>'email'
  or coach_email = auth.jwt()->>'email'
);
create policy "training_plans_insert" on training_plans for insert with check (
  organization_id in (select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin','coach'))
);
create policy "training_plans_update" on training_plans for update using (
  organization_id in (select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin','coach'))
);

-- Workout items: same as training plans
alter table workout_items enable row level security;
create policy "workout_items_select" on workout_items for select using (
  training_plan_id in (select id from training_plans)
);
create policy "workout_items_all" on workout_items for all using (true);

-- Posts: everyone can see; only author can modify
alter table posts enable row level security;
create policy "posts_select_all" on posts for select using (true);
create policy "posts_insert_own" on posts for insert with check (author_email = auth.jwt()->>'email');
create policy "posts_update_own" on posts for update using (author_email = auth.jwt()->>'email');
create policy "posts_delete_own" on posts for delete using (author_email = auth.jwt()->>'email');

-- Notifications: users see only their own
alter table notifications enable row level security;
create policy "notifications_own" on notifications for all using (
  recipient_email = auth.jwt()->>'email'
);

-- Conversations: only participants
alter table conversations enable row level security;
create policy "conversations_participants" on conversations for all using (
  auth.jwt()->>'email' = any(participants)
);

-- Messages: only conversation participants
alter table messages enable row level security;
create policy "messages_select" on messages for select using (
  conversation_id in (
    select id from conversations where auth.jwt()->>'email' = any(participants)
  )
);
create policy "messages_insert" on messages for insert with check (
  sender_email = auth.jwt()->>'email'
);

-- Live streams, follows, challenges, events - public read
alter table live_streams enable row level security;
create policy "live_streams_all" on live_streams for select using (true);
create policy "live_streams_host_manage" on live_streams for all using (host_email = auth.jwt()->>'email');

alter table follows enable row level security;
create policy "follows_all" on follows for select using (true);
create policy "follows_own" on follows for insert with check (follower_email = auth.jwt()->>'email');
create policy "follows_delete_own" on follows for delete using (follower_email = auth.jwt()->>'email');

alter table challenges enable row level security;
create policy "challenges_all" on challenges for select using (true);
create policy "challenges_manage" on challenges for all using (creator_email = auth.jwt()->>'email');

alter table events enable row level security;
create policy "events_all" on events for select using (true);
create policy "events_manage" on events for all using (creator_email = auth.jwt()->>'email');

alter table groups enable row level security;
create policy "groups_public" on groups for select using (true);
create policy "groups_manage" on groups for all using (creator_email = auth.jwt()->>'email');

-- User points and badges - public read
alter table user_points enable row level security;
create policy "user_points_read" on user_points for select using (true);
create policy "user_points_own" on user_points for all using (user_email = auth.jwt()->>'email');

alter table user_badges enable row level security;
create policy "user_badges_read" on user_badges for select using (true);
create policy "user_badges_own" on user_badges for all using (user_email = auth.jwt()->>'email');

-- Athlete videos: org scoped
alter table athlete_videos enable row level security;
create policy "athlete_videos_org" on athlete_videos for all using (
  athlete_email = auth.jwt()->>'email'
  or organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin','coach')
  )
);

-- Subscriptions, tips, transactions: private
alter table subscriptions enable row level security;
create policy "subscriptions_own" on subscriptions for select using (
  subscriber_email = auth.jwt()->>'email' or creator_email = auth.jwt()->>'email'
);
create policy "subscriptions_insert" on subscriptions for insert with check (subscriber_email = auth.jwt()->>'email');
create policy "subscriptions_update" on subscriptions for update using (
  subscriber_email = auth.jwt()->>'email' or creator_email = auth.jwt()->>'email'
);

alter table creator_subscriptions enable row level security;
create policy "creator_subs_own" on creator_subscriptions for all using (
  subscriber_email = auth.jwt()->>'email' or creator_email = auth.jwt()->>'email'
);

alter table tips enable row level security;
create policy "tips_own" on tips for all using (
  from_email = auth.jwt()->>'email' or to_email = auth.jwt()->>'email'
);

alter table transactions enable row level security;
create policy "transactions_own" on transactions for all using (
  from_email = auth.jwt()->>'email' or to_email = auth.jwt()->>'email'
);

-- Other tables with permissive policies for now
alter table sport_profiles enable row level security;
create policy "sport_profiles_all" on sport_profiles for select using (true);
create policy "sport_profiles_own" on sport_profiles for all using (user_email = auth.jwt()->>'email');

alter table live_chats enable row level security;
create policy "live_chats_all" on live_chats for select using (true);
create policy "live_chats_insert" on live_chats for insert with check (sender_email = auth.jwt()->>'email');

alter table scheduled_streams enable row level security;
create policy "scheduled_streams_all" on scheduled_streams for select using (true);
create policy "scheduled_streams_host" on scheduled_streams for all using (host_email = auth.jwt()->>'email');

alter table stream_polls enable row level security;
create policy "stream_polls_all" on stream_polls for select using (true);
create policy "stream_polls_creator" on stream_polls for all using (creator_email = auth.jwt()->>'email');

alter table moderation_flags enable row level security;
create policy "moderation_flags_insert" on moderation_flags for insert with check (true);
create policy "moderation_flags_admin" on moderation_flags for select using (true);

alter table feed_preferences enable row level security;
create policy "feed_prefs_own" on feed_preferences for all using (user_email = auth.jwt()->>'email');

alter table recommendations enable row level security;
create policy "recommendations_own" on recommendations for all using (user_email = auth.jwt()->>'email');

alter table call_signals enable row level security;
create policy "call_signals_participants" on call_signals for all using (
  from_email = auth.jwt()->>'email' or to_email = auth.jwt()->>'email'
);

alter table training_sessions enable row level security;
create policy "training_sessions_org" on training_sessions for all using (
  organization_id in (select organization_id from org_members where user_email = auth.jwt()->>'email')
);

alter table org_invites enable row level security;
create policy "org_invites_select" on org_invites for select using (
  invited_email = auth.jwt()->>'email'
  or organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin')
  )
);
create policy "org_invites_insert" on org_invites for insert with check (
  organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role in ('admin')
    union
    select id from organizations where owner_email = auth.jwt()->>'email'
  )
);
create policy "org_invites_update" on org_invites for update using (
  invited_email = auth.jwt()->>'email'
  or organization_id in (
    select organization_id from org_members where user_email = auth.jwt()->>'email' and role = 'admin'
  )
);

alter table notification_preferences enable row level security;
create policy "notif_prefs_own" on notification_preferences for all using (user_email = auth.jwt()->>'email');

alter table forums enable row level security;
create policy "forums_all" on forums for select using (true);
create policy "forums_manage" on forums for all using (creator_email = auth.jwt()->>'email');

alter table forum_topics enable row level security;
create policy "forum_topics_all" on forum_topics for select using (true);
create policy "forum_topics_own" on forum_topics for all using (author_email = auth.jwt()->>'email');

alter table advice enable row level security;
create policy "advice_all" on advice for select using (true);
create policy "advice_own" on advice for all using (author_email = auth.jwt()->>'email');

alter table highlights enable row level security;
create policy "highlights_own" on highlights for all using (user_email = auth.jwt()->>'email');

alter table challenge_participants enable row level security;
create policy "challenge_participants_all" on challenge_participants for select using (true);
create policy "challenge_participants_own" on challenge_participants for all using (user_email = auth.jwt()->>'email');

alter table training_programs enable row level security;
create policy "training_programs_all" on training_programs for select using (true);
create policy "training_programs_own" on training_programs for all using (creator_email = auth.jwt()->>'email');

alter table stat_entries enable row level security;
create policy "stat_entries_own" on stat_entries for all using (user_email = auth.jwt()->>'email');

alter table subscription_plans enable row level security;
create policy "subscription_plans_all" on subscription_plans for select using (true);
create policy "subscription_plans_own" on subscription_plans for all using (creator_email = auth.jwt()->>'email');
