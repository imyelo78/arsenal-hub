// Data sync service - pulls from FPL and writes to DB
// Sync intervals:
//   teams:     30 days
//   fixtures:  1 hour
//   standings: 30 min
//   players:   7 days

import { useDb, dbRun, dbAll, dbGet } from './db'
import {
  getFplBootstrap,
  getFplFixtures,
  getFplTeamBadge,
  ARSENAL_FPL_ID
} from './fpl'
import {
  getFdTeamMatches,
  getFdClStandings,
  getFdMatchDetail,
  getFdHead2Head,
  mapFdMatchToRow,
  mapFdHead2Head,
  getFdCrestLocal,
  ARSENAL_FD_ID
} from './football-data'

export const SYNC_INTERVALS = {
  teams: 30 * 24 * 60 * 60 * 1000,
  fixtures: 60 * 60 * 1000,
  standings: 30 * 60 * 1000,
  players: 7 * 24 * 60 * 60 * 1000,
  cl_fixtures: 12 * 60 * 60 * 1000,
  cl_standings: 12 * 60 * 60 * 1000
}

async function shouldSync(db: any, key: string, interval: number): Promise<boolean> {
  const row = await dbGet(db, 'SELECT last_sync FROM sync_meta WHERE key = ?', [key])
  if (!row) return true
  return Date.now() - row.last_sync > interval
}

async function updateSyncTime(db: any, key: string) {
  await dbRun(db, `
    INSERT INTO sync_meta (key, last_sync, next_sync)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET last_sync = excluded.last_sync, next_sync = excluded.next_sync
  `, [key, Date.now(), Date.now() + (SYNC_INTERVALS as any)[key] || 0])
}

// ===== Teams =====
export async function syncTeams(event?: any, force = false): Promise<number> {
  const db = useDb(event)
  if (!force && !(await shouldSync(db, 'teams', SYNC_INTERVALS.teams))) {
    return 0
  }

  const bootstrap = await getFplBootstrap()
  if (!bootstrap?.teams) return 0

  const now = Date.now()
  for (const t of bootstrap.teams) {
    await dbRun(db, `
      INSERT INTO teams (id, name, short_name, code, badge_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        short_name = excluded.short_name,
        code = excluded.code,
        badge_url = excluded.badge_url,
        updated_at = excluded.updated_at
    `, [t.id, t.name, t.short_name, t.code, getFplTeamBadge(t.code), now])
  }

  await updateSyncTime(db, 'teams')
  return bootstrap.teams.length
}

// ===== Fixtures =====
export async function syncFixtures(event?: any, force = false): Promise<number> {
  const db = useDb(event)
  if (!force && !(await shouldSync(db, 'fixtures', SYNC_INTERVALS.fixtures))) {
    return 0
  }

  await syncTeams(event)

  const fixtures = await getFplFixtures()
  if (!fixtures.length) return 0

  const now = Date.now()
  for (const f of fixtures) {
    await dbRun(db, `
      INSERT INTO fixtures (id, kickoff_time, event, team_h, team_a, team_h_score, team_a_score, finished, started, minutes, stats, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        kickoff_time = excluded.kickoff_time,
        event = excluded.event,
        team_h_score = excluded.team_h_score,
        team_a_score = excluded.team_a_score,
        finished = excluded.finished,
        started = excluded.started,
        minutes = excluded.minutes,
        stats = excluded.stats,
        updated_at = excluded.updated_at
    `, [
      f.id, f.kickoff_time, f.event || null, f.team_h, f.team_a,
      f.team_h_score, f.team_a_score,
      f.finished ? 1 : 0, f.started ? 1 : 0, f.minutes || 0,
      f.stats ? JSON.stringify(f.stats) : null, now
    ])
  }

  await updateSyncTime(db, 'fixtures')
  return fixtures.length
}

// ===== Standings =====
export async function syncStandings(event?: any, force = false): Promise<number> {
  const db = useDb(event)
  const fixturesUpdated = await syncFixtures(event)

  if (!force && !(await shouldSync(db, 'standings', SYNC_INTERVALS.standings))) {
    if (!fixturesUpdated) return 0
  }

  const teams = await dbAll(db, 'SELECT id, name, code FROM teams ORDER BY id')
  if (!teams.length) {
    const synced = await syncTeams(event, true)
    if (!synced) return 0
    return syncStandings(event, true)
  }

  const fixtures = await dbAll(db, `
    SELECT team_h, team_a, team_h_score, team_a_score
    FROM fixtures WHERE finished = 1
  `)

  const table: Record<number, any> = {}
  for (const t of teams) {
    table[t.id] = {
      team_id: t.id, position: 0, points: 0, played: 0,
      win: 0, draw: 0, loss: 0,
      goals_for: 0, goals_against: 0, goal_difference: 0, form: ''
    }
  }

  for (const f of fixtures) {
    const h = table[f.team_h]
    const a = table[f.team_a]
    if (!h || !a) continue
    h.played++; a.played++
    h.goals_for += f.team_h_score || 0
    h.goals_against += f.team_a_score || 0
    a.goals_for += f.team_a_score || 0
    a.goals_against += f.team_h_score || 0
    if (f.team_h_score > f.team_a_score) { h.win++; h.points += 3; a.loss++ }
    else if (f.team_h_score < f.team_a_score) { a.win++; a.points += 3; h.loss++ }
    else { h.draw++; h.points += 1; a.draw++; a.points += 1 }
  }

  const sorted = Object.values(table).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goals_for - a.goals_against
    const gdB = b.goals_for - b.goals_against
    if (gdB !== gdA) return gdB - gdA
    return b.goals_for - a.goals_for
  })

  const now = Date.now()
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i] as any
    r.position = i + 1
    r.goal_difference = r.goals_for - r.goals_against
    await dbRun(db, `
      INSERT INTO standings (team_id, position, points, played, win, draw, loss, goals_for, goals_against, goal_difference, form, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(team_id) DO UPDATE SET
        position = excluded.position, points = excluded.points,
        played = excluded.played, win = excluded.win, draw = excluded.draw,
        loss = excluded.loss, goals_for = excluded.goals_for,
        goals_against = excluded.goals_against, goal_difference = excluded.goal_difference,
        form = excluded.form, updated_at = excluded.updated_at
    `, [r.team_id, r.position, r.points, r.played, r.win, r.draw, r.loss,
        r.goals_for, r.goals_against, r.goal_difference, r.form, now])
  }

  await updateSyncTime(db, 'standings')
  return sorted.length
}

// ===== Players =====
export async function syncPlayers(event?: any, force = false): Promise<number> {
  const db = useDb(event)
  if (!force && !(await shouldSync(db, 'players', SYNC_INTERVALS.players))) {
    return 0
  }

  const bootstrap = await getFplBootstrap()
  if (!bootstrap?.elements) return 0

  await syncTeams(event)

  const now = Date.now()
  for (const p of bootstrap.elements) {
    const photoUrl = p.code
      ? `https://resources.premierleague.com/premierleague/photos/players/110x140/p${String(p.code).padStart(6, '0')}.png`
      : null

    const starts = p.starts || 0
    const minutes = p.minutes || 0

    await dbRun(db, `
      INSERT INTO players (
        id, team_id, first_name, second_name, web_name, element_type,
        squad_number, photo_url, nationality, age, news,
        appearances, starts, minutes, goals_scored, assists, clean_sheets,
        goals_conceded, yellow_cards, red_cards, saves, bps, form, total_points,
        points_per_game, now_cost, selected_by_percent, influence, creativity, threat, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        team_id = excluded.team_id, first_name = excluded.first_name,
        second_name = excluded.second_name, web_name = excluded.web_name,
        element_type = excluded.element_type,
        photo_url = excluded.photo_url,
        news = excluded.news,
        appearances = excluded.appearances, starts = excluded.starts,
        minutes = excluded.minutes, goals_scored = excluded.goals_scored,
        assists = excluded.assists, clean_sheets = excluded.clean_sheets,
        goals_conceded = excluded.goals_conceded, yellow_cards = excluded.yellow_cards,
        red_cards = excluded.red_cards, saves = excluded.saves, bps = excluded.bps,
        form = excluded.form, total_points = excluded.total_points,
        points_per_game = excluded.points_per_game, now_cost = excluded.now_cost,
        selected_by_percent = excluded.selected_by_percent,
        influence = excluded.influence, creativity = excluded.creativity,
        threat = excluded.threat, updated_at = excluded.updated_at
    `, [
      p.id, p.team, p.first_name, p.second_name, p.web_name, p.element_type,
      p.squad_number || null, photoUrl, p.nationality || null,
      p.age || null, p.news || '',
      starts, starts, minutes, p.goals_scored || 0, p.assists || 0,
      p.clean_sheets || 0, p.goals_conceded || 0,
      p.yellow_cards || 0, p.red_cards || 0, p.saves || 0, p.bps || 0,
      p.form || '0', p.total_points || 0, p.points_per_game || '0',
      p.now_cost || 0, p.selected_by_percent || '0',
      p.influence || '0', p.creativity || '0', p.threat || '0', now
    ])
  }

  // Sync player history for Arsenal players
  const arsenalPlayers = bootstrap.elements.filter((p: any) => p.team === ARSENAL_FPL_ID)
  for (const p of arsenalPlayers) {
    try {
      const summary = await $fetch(
        `https://fantasy.premierleague.com/api/element-summary/${p.id}/`,
        { timeout: 6000 }
      ) as any

      for (const h of (summary.history || [])) {
        await dbRun(db, `
          INSERT INTO player_history (
            player_id, fixture_id, event, opponent_team, was_home,
            minutes, goals_scored, assists, clean_sheets, yellow_cards,
            red_cards, bonus, total_points, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(player_id, fixture_id) DO UPDATE SET
            minutes = excluded.minutes, goals_scored = excluded.goals_scored,
            assists = excluded.assists, clean_sheets = excluded.clean_sheets,
            yellow_cards = excluded.yellow_cards, red_cards = excluded.red_cards,
            bonus = excluded.bonus, total_points = excluded.total_points,
            updated_at = excluded.updated_at
        `, [
          p.id, h.fixture, h.round || h.event, h.opponent_team,
          h.was_home ? 1 : 0,
          h.minutes || 0, h.goals_scored || 0, h.assists || 0,
          h.clean_sheets || 0, h.yellow_cards || 0, h.red_cards || 0,
          h.bonus || 0, h.total_points || 0, now
        ])
      }
    } catch (e) {
      // Skip failed player
    }
  }

  // Recalculate appearances from history
  await dbRun(db, `
    UPDATE players
    SET appearances = (
      SELECT COUNT(*) FROM player_history ph
      WHERE ph.player_id = players.id AND ph.minutes > 0
    )
    WHERE team_id = ?
  `, [ARSENAL_FPL_ID])

  await updateSyncTime(db, 'players')
  return bootstrap.elements.length
}

// ===== Champions League =====
export async function syncCLFixtures(event?: any, force = false): Promise<number> {
  const db = useDb(event)
  if (!force && !(await shouldSync(db, 'cl_fixtures', SYNC_INTERVALS.cl_fixtures))) {
    return 0
  }

  let matches: any[]
  try {
    matches = await getFdTeamMatches(ARSENAL_FD_ID)
  } catch (e) {
    // football-data 不可用(未配置 key / 达到每日配额)时静默保留已有数据
    console.error('syncCLFixtures: fetch failed', e)
    return 0
  }
  if (!matches.length) return 0

  // 只保留欧冠,排除英超及国内杯赛
  const clMatches = matches.filter((m: any) => m.competition?.code === 'CL')
  if (!clMatches.length) return 0

  const now = Date.now()
  const seen = new Set<number>()
  const batch: any[] = []
  for (const m of clMatches) {
    const row = mapFdMatchToRow(m, now)
    seen.add(row.id)
    batch.push(row)
  }

  // 已完赛且库中尚无详情(缺裁判/半场比分/交锋)的比赛,顺带补详情
  // 免费档每天10次,欧冠已完赛场次有限;先读库判断避免重复拉取
  for (const r of batch) {
    if (r.status !== 'FT') continue
    const existing = await dbGet(db, 'SELECT details FROM cl_fixtures WHERE id = ?', [r.id])
    let hasDetail = false
    let hasH2h = false
    let d: any = null
    if (existing?.details) {
      try {
        d = JSON.parse(existing.details)
        hasDetail = !!d.referees?.length && (d.halfTime !== null)
        hasH2h = !!d.h2h
      } catch {}
    }
    if (hasDetail && hasH2h) continue
    try {
      const detail = await getFdMatchDetail(r.id)
      if (detail) {
        d = {
          venue: detail.venue || null,
          attendance: typeof detail.attendance === 'number' ? detail.attendance : null,
          referees: Array.isArray(detail.referees) ? detail.referees.map((x: any) => x.name) : [],
          halfTime: detail.score?.halfTime || null,
          fullTime: detail.score?.fullTime || null,
          h2h: d?.h2h || null
        }
        r.details = JSON.stringify(d)
      }
    } catch {}
    if (!hasH2h) {
      try {
        const h = await getFdHead2Head(r.id, 5)
        if (h) {
          const merged = d ? { ...d, h2h: mapFdHead2Head(h) } : { h2h: mapFdHead2Head(h) }
          r.details = JSON.stringify(merged)
        }
      } catch {}
    }
  }

  for (const r of batch) {
    await dbRun(db, `
      INSERT INTO cl_fixtures (
        id, kickoff_time, stage, group_name, matchday,
        team_h, team_h_name, team_a, team_a_name,
        team_h_score, team_a_score, winner, status, details,
        home_logo, away_logo, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        kickoff_time = excluded.kickoff_time,
        stage = excluded.stage,
        group_name = excluded.group_name,
        matchday = excluded.matchday,
        team_h = excluded.team_h,
        team_h_name = excluded.team_h_name,
        team_a = excluded.team_a,
        team_a_name = excluded.team_a_name,
        team_h_score = excluded.team_h_score,
        team_a_score = excluded.team_a_score,
        winner = excluded.winner,
        status = excluded.status,
        details = excluded.details,
        home_logo = excluded.home_logo,
        away_logo = excluded.away_logo,
        updated_at = excluded.updated_at
    `, [
      r.id, r.kickoff_time, r.stage, r.group_name, r.matchday,
      r.team_h, r.team_h_name, r.team_a, r.team_a_name,
      r.team_h_score, r.team_a_score, r.winner, r.status, r.details,
      r.home_logo, r.away_logo, now
    ])
  }

  // 移除已不在当前赛程里的历史场次 (欧冠已过去的淘汰赛阶段 或 上赛季残留)
  if (seen.size) {
    const ids = Array.from(seen)
    const placeholders = ids.map(() => '?').join(',')
    await dbRun(db, `DELETE FROM cl_fixtures WHERE id NOT IN (${placeholders})`, ids)
  }

  await updateSyncTime(db, 'cl_fixtures')
  return batch.length
}

export async function syncCLStandings(event?: any, force = false): Promise<number> {
  const db = useDb(event)
  await syncCLFixtures(event, force)

  if (!force && !(await shouldSync(db, 'cl_standings', SYNC_INTERVALS.cl_standings))) {
    return 0
  }

  let standings: any[]
  try {
    standings = await getFdClStandings()
  } catch (e) {
    console.error('syncCLStandings: fetch failed', e)
    return 0
  }
  const table = standings[0]?.table || []
  if (!table.length) return 0

  const now = Date.now()
  const stage = standings[0]?.stage
  for (const row of table) {
    await dbRun(db, `
      INSERT INTO cl_standings (
        team_id, stage, position, team_name, logo, played, win, draw, loss,
        goals_for, goals_against, goal_difference, points, form, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(team_id) DO UPDATE SET
        stage = excluded.stage,
        position = excluded.position,
        team_name = excluded.team_name,
        logo = excluded.logo,
        played = excluded.played,
        win = excluded.win,
        draw = excluded.draw,
        loss = excluded.loss,
        goals_for = excluded.goals_for,
        goals_against = excluded.goals_against,
        goal_difference = excluded.goal_difference,
        points = excluded.points,
        form = excluded.form,
        updated_at = excluded.updated_at
    `, [
      row.team.id, stage, row.position, row.team.name,
      getFdCrestLocal(row.team.id),
      row.playedGames || 0, row.won || 0, row.draw || 0, row.lost || 0,
      row.goalsFor || 0, row.goalsAgainst || 0, row.goalDifference || 0,
      row.points || 0, row.form || '', now
    ])
  }

  await updateSyncTime(db, 'cl_standings')
  return table.length
}

// ===== Full sync =====
export async function syncAll(event?: any, force = false): Promise<any> {
  const [teams, fixtures, cl] = await Promise.all([
    syncTeams(event, force),
    syncFixtures(event, force),
    syncCLFixtures(event, force)
  ])
  const [standings, players] = await Promise.all([
    syncStandings(event, force),
    syncPlayers(event, force)
  ])
  const clStandings = await syncCLStandings(event, force)
  return { teams, fixtures, standings, players, clFixtures: cl, clStandings }
}
