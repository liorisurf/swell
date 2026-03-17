-- ============================================================
-- SWELL - Instagram Growth Copilot
-- Complete Supabase SQL Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE workspace_role AS ENUM ('owner', 'manager', 'viewer');

CREATE TYPE tracked_account_list_type AS ENUM (
  'competitor', 'inspiration', 'collaboration', 'audience_source'
);

CREATE TYPE recommendation_type AS ENUM (
  'account_visit', 'post_engage', 'content_idea',
  'posting_window', 'collaboration', 'stop_doing'
);

CREATE TYPE recommendation_status AS ENUM ('pending', 'done', 'skipped', 'saved');

CREATE TYPE feedback_vote AS ENUM ('up', 'down');

CREATE TYPE content_idea_status AS ENUM (
  'idea', 'saved', 'in_progress', 'scheduled', 'published', 'skipped'
);

CREATE TYPE calendar_status AS ENUM ('planned', 'creating', 'ready', 'published');

CREATE TYPE outreach_status AS ENUM (
  'identified', 'draft_ready', 'sent', 'replied', 'closed', 'not_interested'
);

CREATE TYPE experiment_status AS ENUM ('planned', 'running', 'completed', 'abandoned');

CREATE TYPE trend_item_status AS ENUM ('new', 'saved', 'used', 'dismissed');

-- ============================================================
-- TABLES
-- ============================================================

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id                    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email                 TEXT UNIQUE NOT NULL,
  full_name             TEXT,
  avatar_url            TEXT,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON users
  FOR DELETE USING (auth.uid() = id);

-- ------------------------------------------------------------
-- workspaces
-- ------------------------------------------------------------
CREATE TABLE workspaces (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  owner_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_username TEXT,
  primary_goal       TEXT,
  target_audience    TEXT,
  content_styles     TEXT[],
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- workspace_members
-- ------------------------------------------------------------
CREATE TABLE workspace_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         workspace_role NOT NULL DEFAULT 'viewer',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Helper function: is the current user a member of a given workspace?
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$;

-- Workspace RLS (depends on workspace_members existing)
CREATE POLICY "workspaces_select_member" ON workspaces
  FOR SELECT USING (is_workspace_member(id));

CREATE POLICY "workspaces_insert_owner" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspaces_update_member" ON workspaces
  FOR UPDATE USING (is_workspace_member(id));

CREATE POLICY "workspaces_delete_owner" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- workspace_members RLS
CREATE POLICY "workspace_members_select" ON workspace_members
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_insert" ON workspace_members
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_update" ON workspace_members
  FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_delete" ON workspace_members
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- user_interests
-- ------------------------------------------------------------
CREATE TABLE user_interests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  sub_interests TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_interests_workspace_id ON user_interests(workspace_id);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_interests_select" ON user_interests
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "user_interests_insert" ON user_interests
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "user_interests_update" ON user_interests
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "user_interests_delete" ON user_interests
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- tracked_accounts
-- ------------------------------------------------------------
CREATE TABLE tracked_accounts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  username            TEXT NOT NULL,
  display_name        TEXT,
  avatar_url          TEXT,
  follower_count      INT,
  engagement_rate     NUMERIC,
  content_style_tags  TEXT[],
  relevance_score     INT,
  opportunity_score   INT,
  list_type           tracked_account_list_type NOT NULL,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracked_accounts_workspace_id ON tracked_accounts(workspace_id);
CREATE INDEX idx_tracked_accounts_list_type ON tracked_accounts(list_type);
CREATE UNIQUE INDEX idx_tracked_accounts_ws_username ON tracked_accounts(workspace_id, username);

ALTER TABLE tracked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_accounts_select" ON tracked_accounts
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_accounts_insert" ON tracked_accounts
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "tracked_accounts_update" ON tracked_accounts
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_accounts_delete" ON tracked_accounts
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- tracked_hashtags
-- ------------------------------------------------------------
CREATE TABLE tracked_hashtags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  hashtag         TEXT NOT NULL,
  post_count      BIGINT,
  relevance_score INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracked_hashtags_workspace_id ON tracked_hashtags(workspace_id);
CREATE UNIQUE INDEX idx_tracked_hashtags_ws_hashtag ON tracked_hashtags(workspace_id, hashtag);

ALTER TABLE tracked_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_hashtags_select" ON tracked_hashtags
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_hashtags_insert" ON tracked_hashtags
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "tracked_hashtags_update" ON tracked_hashtags
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_hashtags_delete" ON tracked_hashtags
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- tracked_topics
-- ------------------------------------------------------------
CREATE TABLE tracked_topics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  topic           TEXT NOT NULL,
  source          TEXT,
  momentum_score  INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracked_topics_workspace_id ON tracked_topics(workspace_id);

ALTER TABLE tracked_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_topics_select" ON tracked_topics
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_topics_insert" ON tracked_topics
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "tracked_topics_update" ON tracked_topics
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_topics_delete" ON tracked_topics
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- tracked_keywords
-- ------------------------------------------------------------
CREATE TABLE tracked_keywords (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  keyword      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracked_keywords_workspace_id ON tracked_keywords(workspace_id);
CREATE UNIQUE INDEX idx_tracked_keywords_ws_keyword ON tracked_keywords(workspace_id, keyword);

ALTER TABLE tracked_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_keywords_select" ON tracked_keywords
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_keywords_insert" ON tracked_keywords
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "tracked_keywords_update" ON tracked_keywords
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "tracked_keywords_delete" ON tracked_keywords
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- discovered_content
-- ------------------------------------------------------------
CREATE TABLE discovered_content (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_platform     TEXT,
  source_url          TEXT,
  title               TEXT,
  description         TEXT,
  engagement_metrics  JSONB,
  relevance_score     INT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discovered_content_workspace_id ON discovered_content(workspace_id);
CREATE INDEX idx_discovered_content_relevance ON discovered_content(relevance_score);
CREATE INDEX idx_discovered_content_created_at ON discovered_content(created_at);

ALTER TABLE discovered_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discovered_content_select" ON discovered_content
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "discovered_content_insert" ON discovered_content
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "discovered_content_update" ON discovered_content
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "discovered_content_delete" ON discovered_content
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- content_metrics
-- ------------------------------------------------------------
CREATE TABLE content_metrics (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  post_url     TEXT,
  post_type    TEXT,
  likes        INT DEFAULT 0,
  comments     INT DEFAULT 0,
  shares       INT DEFAULT 0,
  saves        INT DEFAULT 0,
  reach        INT DEFAULT 0,
  impressions  INT DEFAULT 0,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_metrics_workspace_id ON content_metrics(workspace_id);
CREATE INDEX idx_content_metrics_recorded_at ON content_metrics(recorded_at);

ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_metrics_select" ON content_metrics
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "content_metrics_insert" ON content_metrics
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "content_metrics_update" ON content_metrics
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "content_metrics_delete" ON content_metrics
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- daily_snapshots
-- ------------------------------------------------------------
CREATE TABLE daily_snapshots (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  follower_count      INT,
  following_count     INT,
  posts_count         INT,
  avg_engagement_rate NUMERIC,
  profile_visits      INT,
  reach               INT,
  impressions         INT,
  UNIQUE (workspace_id, date)
);

CREATE INDEX idx_daily_snapshots_workspace_id ON daily_snapshots(workspace_id);
CREATE INDEX idx_daily_snapshots_date ON daily_snapshots(date);

ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_snapshots_select" ON daily_snapshots
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "daily_snapshots_insert" ON daily_snapshots
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "daily_snapshots_update" ON daily_snapshots
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "daily_snapshots_delete" ON daily_snapshots
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- daily_recommendations
-- ------------------------------------------------------------
CREATE TABLE daily_recommendations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  type             recommendation_type NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  reason           TEXT,
  suggested_action TEXT,
  status           recommendation_status NOT NULL DEFAULT 'pending',
  feedback         feedback_vote,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_recommendations_workspace_id ON daily_recommendations(workspace_id);
CREATE INDEX idx_daily_recommendations_date ON daily_recommendations(date);
CREATE INDEX idx_daily_recommendations_status ON daily_recommendations(status);
CREATE INDEX idx_daily_recommendations_type ON daily_recommendations(type);

ALTER TABLE daily_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_recommendations_select" ON daily_recommendations
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "daily_recommendations_insert" ON daily_recommendations
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "daily_recommendations_update" ON daily_recommendations
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "daily_recommendations_delete" ON daily_recommendations
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- recommendation_feedback
-- ------------------------------------------------------------
CREATE TABLE recommendation_feedback (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID NOT NULL REFERENCES daily_recommendations(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feedback          feedback_vote NOT NULL,
  comment           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX idx_recommendation_feedback_workspace_id ON recommendation_feedback(workspace_id);

ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recommendation_feedback_select" ON recommendation_feedback
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "recommendation_feedback_insert" ON recommendation_feedback
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "recommendation_feedback_update" ON recommendation_feedback
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "recommendation_feedback_delete" ON recommendation_feedback
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- content_ideas
-- ------------------------------------------------------------
CREATE TABLE content_ideas (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  format                  TEXT,
  hooks                   TEXT[],
  hashtags                TEXT[],
  caption_draft           TEXT,
  content_potential_score  INT,
  status                  content_idea_status NOT NULL DEFAULT 'idea',
  feedback                TEXT,
  scheduled_for           TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_ideas_workspace_id ON content_ideas(workspace_id);
CREATE INDEX idx_content_ideas_status ON content_ideas(status);
CREATE INDEX idx_content_ideas_scheduled_for ON content_ideas(scheduled_for);

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_ideas_select" ON content_ideas
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "content_ideas_insert" ON content_ideas
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "content_ideas_update" ON content_ideas
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "content_ideas_delete" ON content_ideas
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- content_drafts
-- ------------------------------------------------------------
CREATE TABLE content_drafts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_idea_id UUID NOT NULL REFERENCES content_ideas(id) ON DELETE CASCADE,
  version         INT NOT NULL DEFAULT 1,
  caption         TEXT,
  hashtags        TEXT[],
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_drafts_workspace_id ON content_drafts(workspace_id);
CREATE INDEX idx_content_drafts_content_idea_id ON content_drafts(content_idea_id);

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_drafts_select" ON content_drafts
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "content_drafts_insert" ON content_drafts
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "content_drafts_update" ON content_drafts
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "content_drafts_delete" ON content_drafts
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- content_calendar
-- ------------------------------------------------------------
CREATE TABLE content_calendar (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME,
  format          TEXT,
  status          calendar_status NOT NULL DEFAULT 'planned',
  position        INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_calendar_workspace_id ON content_calendar(workspace_id);
CREATE INDEX idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_status ON content_calendar(status);
CREATE INDEX idx_content_calendar_content_idea_id ON content_calendar(content_idea_id);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_calendar_select" ON content_calendar
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "content_calendar_insert" ON content_calendar
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "content_calendar_update" ON content_calendar
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "content_calendar_delete" ON content_calendar
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- outreach_targets
-- ------------------------------------------------------------
CREATE TABLE outreach_targets (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  username                TEXT NOT NULL,
  display_name            TEXT,
  follower_count          INT,
  collaboration_potential  INT,
  status                  outreach_status NOT NULL DEFAULT 'identified',
  draft_message           TEXT,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_targets_workspace_id ON outreach_targets(workspace_id);
CREATE INDEX idx_outreach_targets_status ON outreach_targets(status);
CREATE UNIQUE INDEX idx_outreach_targets_ws_username ON outreach_targets(workspace_id, username);

ALTER TABLE outreach_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outreach_targets_select" ON outreach_targets
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "outreach_targets_insert" ON outreach_targets
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "outreach_targets_update" ON outreach_targets
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "outreach_targets_delete" ON outreach_targets
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- outreach_drafts
-- ------------------------------------------------------------
CREATE TABLE outreach_drafts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outreach_target_id UUID NOT NULL REFERENCES outreach_targets(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version            INT NOT NULL DEFAULT 1,
  message            TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_drafts_outreach_target_id ON outreach_drafts(outreach_target_id);
CREATE INDEX idx_outreach_drafts_workspace_id ON outreach_drafts(workspace_id);

ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outreach_drafts_select" ON outreach_drafts
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "outreach_drafts_insert" ON outreach_drafts
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "outreach_drafts_update" ON outreach_drafts
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "outreach_drafts_delete" ON outreach_drafts
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- outreach_log
-- ------------------------------------------------------------
CREATE TABLE outreach_log (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outreach_target_id UUID NOT NULL REFERENCES outreach_targets(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  action             TEXT NOT NULL,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_log_outreach_target_id ON outreach_log(outreach_target_id);
CREATE INDEX idx_outreach_log_workspace_id ON outreach_log(workspace_id);

ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outreach_log_select" ON outreach_log
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "outreach_log_insert" ON outreach_log
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "outreach_log_update" ON outreach_log
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "outreach_log_delete" ON outreach_log
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- experiments
-- ------------------------------------------------------------
CREATE TABLE experiments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  hypothesis     TEXT,
  success_metric TEXT,
  status         experiment_status NOT NULL DEFAULT 'planned',
  results        TEXT,
  ai_summary     TEXT,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_experiments_workspace_id ON experiments(workspace_id);
CREATE INDEX idx_experiments_status ON experiments(status);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiments_select" ON experiments
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "experiments_insert" ON experiments
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "experiments_update" ON experiments
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "experiments_delete" ON experiments
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- experiment_results
-- ------------------------------------------------------------
CREATE TABLE experiment_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  metric_name   TEXT NOT NULL,
  metric_value  NUMERIC,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes         TEXT
);

CREATE INDEX idx_experiment_results_experiment_id ON experiment_results(experiment_id);
CREATE INDEX idx_experiment_results_workspace_id ON experiment_results(workspace_id);
CREATE INDEX idx_experiment_results_recorded_at ON experiment_results(recorded_at);

ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiment_results_select" ON experiment_results
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "experiment_results_insert" ON experiment_results
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "experiment_results_update" ON experiment_results
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "experiment_results_delete" ON experiment_results
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- niche_signals
-- ------------------------------------------------------------
CREATE TABLE niche_signals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  signal_type  TEXT NOT NULL,
  source       TEXT,
  content      TEXT,
  strength     INT,
  detected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_niche_signals_workspace_id ON niche_signals(workspace_id);
CREATE INDEX idx_niche_signals_detected_at ON niche_signals(detected_at);

ALTER TABLE niche_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "niche_signals_select" ON niche_signals
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "niche_signals_insert" ON niche_signals
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "niche_signals_update" ON niche_signals
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "niche_signals_delete" ON niche_signals
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- trend_radar_items
-- ------------------------------------------------------------
CREATE TABLE trend_radar_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  topic             TEXT NOT NULL,
  description       TEXT,
  momentum_score    INT,
  growth_percentage NUMERIC,
  source_platform   TEXT,
  content_angles    TEXT[],
  example_creators  TEXT[],
  status            trend_item_status NOT NULL DEFAULT 'new',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trend_radar_items_workspace_id ON trend_radar_items(workspace_id);
CREATE INDEX idx_trend_radar_items_status ON trend_radar_items(status);
CREATE INDEX idx_trend_radar_items_created_at ON trend_radar_items(created_at);

ALTER TABLE trend_radar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trend_radar_items_select" ON trend_radar_items
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "trend_radar_items_insert" ON trend_radar_items
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "trend_radar_items_update" ON trend_radar_items
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "trend_radar_items_delete" ON trend_radar_items
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- profile_analysis_reports
-- ------------------------------------------------------------
CREATE TABLE profile_analysis_reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  instagram_username    TEXT NOT NULL,
  strengths             TEXT[],
  growth_blockers       TEXT[],
  content_opportunities TEXT[],
  audience_alignment    TEXT,
  bio_suggestions       TEXT[],
  posting_strategy      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_analysis_reports_workspace_id ON profile_analysis_reports(workspace_id);

ALTER TABLE profile_analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_analysis_reports_select" ON profile_analysis_reports
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "profile_analysis_reports_insert" ON profile_analysis_reports
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "profile_analysis_reports_update" ON profile_analysis_reports
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "profile_analysis_reports_delete" ON profile_analysis_reports
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- growth_strategies
-- ------------------------------------------------------------
CREATE TABLE growth_strategies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  niche_summary    TEXT,
  content_formats  TEXT[],
  posting_schedule JSONB,
  growth_levers    TEXT[],
  experiments      JSONB[],
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_growth_strategies_workspace_id ON growth_strategies(workspace_id);
CREATE INDEX idx_growth_strategies_is_active ON growth_strategies(is_active);

ALTER TABLE growth_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "growth_strategies_select" ON growth_strategies
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "growth_strategies_insert" ON growth_strategies
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "growth_strategies_update" ON growth_strategies
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "growth_strategies_delete" ON growth_strategies
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- activity_log
-- ------------------------------------------------------------
CREATE TABLE activity_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action       TEXT NOT NULL,
  details      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_workspace_id ON activity_log(workspace_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_select" ON activity_log
  FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "activity_log_insert" ON activity_log
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "activity_log_update" ON activity_log
  FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "activity_log_delete" ON activity_log
  FOR DELETE USING (is_workspace_member(workspace_id));

-- ------------------------------------------------------------
-- invite_links
-- ------------------------------------------------------------
CREATE TABLE invite_links (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code       TEXT UNIQUE NOT NULL,
  uses       INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invite_links_user_id ON invite_links(user_id);
CREATE INDEX idx_invite_links_code ON invite_links(code);

ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_links_select_own" ON invite_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invite_links_insert_own" ON invite_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invite_links_update_own" ON invite_links
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invite_links_delete_own" ON invite_links
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tracked_accounts_updated_at
  BEFORE UPDATE ON tracked_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_content_ideas_updated_at
  BEFORE UPDATE ON content_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_outreach_targets_updated_at
  BEFORE UPDATE ON outreach_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-insert workspace_members row when workspace created
-- ============================================================

CREATE OR REPLACE FUNCTION auto_add_workspace_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_workspace_auto_add_owner
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION auto_add_workspace_owner();
