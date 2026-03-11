-- Add missing columns to posts table that CreatePost.jsx expects
-- These columns were added to the frontend but never migrated to the database,
-- causing HTTP 400 on every post creation attempt.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentioned_users text[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_chapters jsonb DEFAULT '[]';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_trim jsonb DEFAULT '[]';
