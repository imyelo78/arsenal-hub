-- Migration: create Champions League tables
-- 欧冠赛程与积分榜(数据源: football-data.org)
-- football-data 的球队 id 体系与 FPL 不同(阿森纳=57),欧冠对手不在 FPL teams 表,
-- 因此独立建表、自包含队名,不 JOIN teams.
-- crest URL 直接引用 football-data 免费 CDN(https://crests.football-data.org/{id}.png),
-- 存库即可由 Cloudflare 边缘缓存,无需本地下载.

CREATE TABLE IF NOT EXISTS cl_fixtures (
  id INTEGER PRIMARY KEY,
  kickoff_time TEXT NOT NULL,
  stage TEXT,
  group_name TEXT,
  matchday INTEGER,
  team_h INTEGER NOT NULL,
  team_h_name TEXT NOT NULL,
  team_a INTEGER NOT NULL,
  team_a_name TEXT NOT NULL,
  team_h_score INTEGER,
  team_a_score INTEGER,
  winner TEXT,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  details TEXT,
  home_logo TEXT,
  away_logo TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cl_standings (
  team_id INTEGER PRIMARY KEY,
  stage TEXT NOT NULL,
  position INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  logo TEXT,
  played INTEGER NOT NULL DEFAULT 0,
  win INTEGER NOT NULL DEFAULT 0,
  draw INTEGER NOT NULL DEFAULT 0,
  loss INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  form TEXT,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cl_fixtures_kickoff ON cl_fixtures(kickoff_time);
CREATE INDEX IF NOT EXISTS idx_cl_fixtures_teams ON cl_fixtures(team_h, team_a);
CREATE INDEX IF NOT EXISTS idx_cl_standings_position ON cl_standings(position);