import { useDb, dbGet } from '../utils/db'
import { syncFixtures } from '../utils/sync'
import { ARSENAL_FPL_ID } from '../utils/fpl'

export default defineEventHandler(async (event) => {
  await syncFixtures(event)

  const db = useDb(event)

  const row = await dbGet(db, `
    SELECT
      f.id, f.kickoff_time, f.event, f.team_h, f.team_a,
      f.team_h_score, f.team_a_score, f.finished, f.started, f.minutes,
      th.name as home_name, th.badge_url as home_logo,
      ta.name as away_name, ta.badge_url as away_logo
    FROM fixtures f
    JOIN teams th ON f.team_h = th.id
    JOIN teams ta ON f.team_a = ta.id
    WHERE (f.team_h = ? OR f.team_a = ?) AND f.finished = 0
    ORDER BY f.kickoff_time ASC
    LIMIT 1
  `, [ARSENAL_FPL_ID, ARSENAL_FPL_ID])

  if (!row) {
    return { nextMatch: null }
  }

  const nextMatch = {
    fixture: {
      id: row.id,
      date: row.kickoff_time,
      venue: null,
      status: {
        short: row.started ? 'LIVE' : 'NS',
        elapsed: row.minutes || 0
      }
    },
    league: {
      id: 39,
      name: 'Premier League',
      logo: null,
      round: row.event ? `Gameweek ${row.event}` : null
    },
    teams: {
      home: { id: row.team_h, name: row.home_name, logo: row.home_logo },
      away: { id: row.team_a, name: row.away_name, logo: row.away_logo }
    },
    goals: {
      home: row.started ? row.team_h_score : null,
      away: row.started ? row.team_a_score : null
    },
    status: row.started ? 'LIVE' : 'NS'
  }

  return { nextMatch, source: 'db' }
})
