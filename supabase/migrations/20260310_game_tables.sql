-- ============================================================================
-- Games, Game Scores, and Game Events tables for live game viewing & scoring
-- ============================================================================

-- Games table: core game/match entity tied to an organization
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  sport TEXT NOT NULL,
  title TEXT NOT NULL,
  home_team_name TEXT NOT NULL,
  away_team_name TEXT NOT NULL,
  home_team_org_id UUID,
  away_team_org_id UUID,
  venue TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'warmup', 'live', 'final', 'cancelled')),
  current_period TEXT,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  live_stream_id UUID,
  mux_stream_id TEXT,
  mux_playback_id TEXT,
  mux_asset_id TEXT,
  scorekeeper_email TEXT,
  created_by_email TEXT NOT NULL,
  game_config JSONB DEFAULT '{}'::jsonb,
  final_box_score JSONB,
  ai_recap TEXT,
  highlight_clips JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Game scores: append-only log for real-time score tracking
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('score_update', 'period_start', 'period_end', 'game_start', 'game_end')),
  description TEXT,
  recorded_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Game events: play-by-play for highlights and stats
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  period TEXT,
  game_clock TEXT,
  stream_timestamp_seconds INT,
  player_name TEXT,
  player_email TEXT,
  team TEXT CHECK (team IN ('home', 'away')),
  details JSONB DEFAULT '{}'::jsonb,
  is_highlight BOOLEAN NOT NULL DEFAULT false,
  recorded_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_org ON games(organization_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_scheduled ON games(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_game_scores_game ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_game ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_highlight ON game_events(game_id, is_highlight) WHERE is_highlight = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_games_updated_at();

-- RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Games: anyone authenticated can read
CREATE POLICY games_select ON games FOR SELECT TO authenticated USING (true);

-- Games: org coaches/admins can insert/update
CREATE POLICY games_insert ON games FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = games.organization_id
        AND org_members.user_email = auth.jwt()->>'email'
        AND org_members.role IN ('admin', 'coach')
    )
  );

CREATE POLICY games_update ON games FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = games.organization_id
        AND org_members.user_email = auth.jwt()->>'email'
        AND org_members.role IN ('admin', 'coach')
    )
  );

-- Games: only org admins can delete
CREATE POLICY games_delete ON games FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = games.organization_id
        AND org_members.user_email = auth.jwt()->>'email'
        AND org_members.role = 'admin'
    )
  );

-- Game scores: authenticated can read, org coaches can write
CREATE POLICY game_scores_select ON game_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY game_scores_insert ON game_scores FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games g
      JOIN org_members om ON om.organization_id = g.organization_id
      WHERE g.id = game_scores.game_id
        AND om.user_email = auth.jwt()->>'email'
        AND om.role IN ('admin', 'coach')
    )
  );

-- Game events: authenticated can read, org coaches can write
CREATE POLICY game_events_select ON game_events FOR SELECT TO authenticated USING (true);

CREATE POLICY game_events_insert ON game_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games g
      JOIN org_members om ON om.organization_id = g.organization_id
      WHERE g.id = game_events.game_id
        AND om.user_email = auth.jwt()->>'email'
        AND om.role IN ('admin', 'coach')
    )
  );

-- Enable realtime for live score updates
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- ============================================================================
-- Phase 5: Future prep columns
-- ============================================================================

-- Multi-camera support: array of camera objects
-- Each: { "label": "Main", "mux_playback_id": "abc", "type": "phone"|"rtmp"|"facility" }
ALTER TABLE games ADD COLUMN IF NOT EXISTS cameras JSONB DEFAULT '[]'::jsonb;

-- Organization streaming tier: controls feature access
-- free = no game streaming, basic = phone only, pro = RTMP + VOD + highlights
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS game_streaming_tier TEXT DEFAULT 'pro'
  CHECK (game_streaming_tier IN ('free', 'basic', 'pro'));
