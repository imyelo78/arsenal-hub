import { getDb, dbAll } from '../utils/db'
import { syncFixtures } from '../utils/sync'
import { ARSENAL_FPL_ID } from '../utils/fpl'

export default defineEventHandler(async (event) => {
  // Ensure data is synced (will skip if fresh)
  await syncFixtures()

  const db = getDb()

  // Get all Arsenal fixtures
  const rows = dbAll(db, `
    SELECT
      f.id, f.kickoff_time, f.event, f.team_h, f.team_a,
      f.team_h_score, f.team_a_score, f.finished, f.started, f.minutes, f.stats,
      th.name as home_name, th.code as home_code, th.badge_url as home_logo,
      ta.name as away_name, ta.code as away_code, ta.badge_url as away_logo
    FROM fixtures f
    JOIN teams th ON f.team_h = th.id
    JOIN teams ta ON f.team_a = ta.id
    WHERE f.team_h = ? OR f.team_a = ?
    ORDER BY f.kickoff_time ASC
  `, [ARSENAL_FPL_ID, ARSENAL_FPL_ID])

  const response = rows.map((r: any) => ({
    fixture: {
      id: r.id,
      date: r.kickoff_time,
      venue: null,
      status: {
        short: r.finished ? 'FT' : r.started ? 'LIVE' : 'NS',
        elapsed: r.minutes || 0
      }
    },
    league: {
      id: 39,
      name: 'Premier League',
      logo: null,
      round: r.event ? `Gameweek ${r.event}` : null
    },
    teams: {
      home: { id: r.team_h, name: r.home_name, logo: r.home_logo },
      away: { id: r.team_a, name: r.away_name, logo: r.away_logo }
    },
    goals: {
      home: r.started ? r.team_h_score : null,
      away: r.started ? r.team_a_score : null
    },
    status: r.finished ? 'FT' : r.started ? 'LIVE' : 'NS'
  }))

  return { response, source: 'db' }
})
