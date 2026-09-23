// Database abstraction layer
// Dev: better-sqlite3 (local file)
// Production: Cloudflare D1 (via event.context.cloudflare.env.DB)

import { createRequire } from 'node:module'

const nodeRequire = createRequire(import.meta.url)

let dbInstance: any = null

function isCloudflarePages(): boolean {
  return !!(globalThis as any).cf_pages || process.env.CF_PAGES === '1'
}

function getLocalDb(): any {
  if (dbInstance) return dbInstance

  const Database = nodeRequire('better-sqlite3')
  const fs = nodeRequire('node:fs')
  const path = nodeRequire('node:path')

  const DB_PATH = path.join(process.cwd(), '.data', 'arsenal.db')
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  dbInstance = new Database(DB_PATH)
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')
  initSchema(dbInstance)
  return dbInstance
}

// In production, D1 is accessed via event.context.cloudflare.env.DB
// We need to pass the event to useDb
export function useDb(event?: any): any {
  // Cloudflare Pages: use D1 binding
  if (event?.context?.cloudflare?.env?.DB) {
    return event.context.cloudflare.env.DB
  }
  // Local dev: use better-sqlite3
  return getLocalDb()
}

// D1 uses .bind() and .all() / .first() / .run() instead of .prepare().all()
// We need wrapper functions that work with both

// Detect D1: the D1 Database object has .batch()/.dump()/etc but NOT .bind()
// (the .bind() method lives on the prepared Statement). better-sqlite3's
// Database has neither .batch() nor .dump().
function isD1(db: any): boolean {
  return !!(db && typeof db.batch === 'function')
}

export async function dbAll(db: any, sql: string, params: any[] = []): Promise<any[]> {
  if (isD1(db)) {
    // D1 (async)
    const stmt = db.prepare(sql).bind(...params)
    const result = await stmt.all()
    return result.results || []
  }
  // better-sqlite3 (sync)
  return db.prepare(sql).all(...params)
}

export async function dbGet(db: any, sql: string, params: any[] = []): Promise<any | null> {
  if (isD1(db)) {
    // D1 (async)
    const result = await db.prepare(sql).bind(...params).first()
    return result || null
  }
  // better-sqlite3 (sync)
  return db.prepare(sql).get(...params) || null
}

export async function dbRun(db: any, sql: string, params: any[] = []): Promise<any> {
  if (isD1(db)) {
    // D1 (async)
    return await db.prepare(sql).bind(...params).run()
  }
  // better-sqlite3 (sync)
  return db.prepare(sql).run(...params)
}

function initSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      code INTEGER,
      badge_url TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fixtures (
      id INTEGER PRIMARY KEY,
      kickoff_time TEXT NOT NULL,
      event INTEGER,
      team_h INTEGER NOT NULL,
      team_a INTEGER NOT NULL,
      team_h_score INTEGER,
      team_a_score INTEGER,
      finished INTEGER DEFAULT 0,
      started INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      stats TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS standings (
      team_id INTEGER PRIMARY KEY,
      position INTEGER NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      played INTEGER NOT NULL DEFAULT 0,
      win INTEGER NOT NULL DEFAULT 0,
      draw INTEGER NOT NULL DEFAULT 0,
      loss INTEGER NOT NULL DEFAULT 0,
      goals_for INTEGER NOT NULL DEFAULT 0,
      goals_against INTEGER NOT NULL DEFAULT 0,
      goal_difference INTEGER NOT NULL DEFAULT 0,
      form TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      team_id INTEGER NOT NULL,
      first_name TEXT,
      second_name TEXT,
      web_name TEXT,
      element_type INTEGER,
      squad_number INTEGER,
      photo_url TEXT,
      nationality TEXT,
      age INTEGER,
      is_current INTEGER DEFAULT 1,
      news TEXT,
      appearances INTEGER DEFAULT 0,
      starts INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      goals_scored INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      clean_sheets INTEGER DEFAULT 0,
      goals_conceded INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      bps INTEGER DEFAULT 0,
      form TEXT,
      total_points INTEGER DEFAULT 0,
      points_per_game TEXT,
      now_cost INTEGER DEFAULT 0,
      selected_by_percent TEXT,
      influence TEXT,
      creativity TEXT,
      threat TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS player_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      fixture_id INTEGER NOT NULL,
      event INTEGER NOT NULL,
      opponent_team INTEGER NOT NULL,
      was_home INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      goals_scored INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      clean_sheets INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      bonus INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL,
      UNIQUE(player_id, fixture_id)
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      last_sync INTEGER NOT NULL,
      next_sync INTEGER NOT NULL
    );

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

    CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff ON fixtures(kickoff_time);
    CREATE INDEX IF NOT EXISTS idx_fixtures_teams ON fixtures(team_h, team_a);
    CREATE INDEX IF NOT EXISTS idx_standings_position ON standings(position);
    CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
    CREATE INDEX IF NOT EXISTS idx_players_position ON players(element_type);
    CREATE INDEX IF NOT EXISTS idx_player_history_player ON player_history(player_id);
    CREATE INDEX IF NOT EXISTS idx_cl_fixtures_kickoff ON cl_fixtures(kickoff_time);
    CREATE INDEX IF NOT EXISTS idx_cl_fixtures_teams ON cl_fixtures(team_h, team_a);
    CREATE INDEX IF NOT EXISTS idx_cl_standings_position ON cl_standings(position);
  `)
}

export { getLocalDb as getDb }
