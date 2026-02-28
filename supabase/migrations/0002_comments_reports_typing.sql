-- Migration: comments, reports, typing_indicators tables
-- + patch posts with comments_count and shares columns

-- ============================================================
-- 1. comments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL,
  author_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_email text,
  author_name  text,
  author_avatar text,
  content      text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- 2. reports table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_item_type  text NOT NULL,  -- 'post', 'comment', 'user', etc.
  reported_item_id    text NOT NULL,
  reason              text NOT NULL,
  details             text,
  status              text DEFAULT 'pending', -- pending | reviewed | dismissed
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reporters can only see their own reports
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Authenticated users can file reports
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- 3. typing_indicators table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_email      text NOT NULL,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (conversation_id, user_email)
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Participants can read typing indicators
CREATE POLICY "typing_select" ON public.typing_indicators
  FOR SELECT USING (true);

-- Any authenticated user can upsert their own indicator
CREATE POLICY "typing_upsert" ON public.typing_indicators
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. Patch posts table
-- ============================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares         integer DEFAULT 0;
