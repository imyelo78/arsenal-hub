-- Migration: add crest logo columns to CL tables
-- 在 0003 之后补充球队 crest URL(https://crests.football-data.org/{id}.png)
-- 用于欧冠赛程/积分榜显示球队 logo

ALTER TABLE cl_fixtures ADD COLUMN home_logo TEXT;
ALTER TABLE cl_fixtures ADD COLUMN away_logo TEXT;
ALTER TABLE cl_standings ADD COLUMN logo TEXT;