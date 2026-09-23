-- Migration: add is_current column to players
-- 标记球员是否在当前(2026/27)阿森纳阵容
-- 已离队:G.Jesus(→Barcelona), Martinelli(→Al-Hilal), Fábio Vieira(→HSV),
--        Nwaneri(→Dortmund loan), Nelson(→free agent)
ALTER TABLE players ADD COLUMN is_current INTEGER DEFAULT 1;