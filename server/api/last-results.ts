import { useDb, dbAll } from '../utils/db'
import { syncFixtures } from '../utils/sync'
import { ARSENAL_FPL_ID } from '../utils/fpl'

export default defineEventHandler(async (event) => {
  await syncFixtures(event)

  const db = useDb(event)

  const rows = await dbAll(db, `
    SELECT
      f.id, f.kickoff_time, f.event, f.team_h, f.team_a,
      f.team_h_score, f.team_a_score, f.finished, f.started, f.minutes,
      th.name as home_name, th.badge_url as home_logo,
      ta.name as away_name, ta.badge_url as away_logo
    FROM fixtures f
    JOIN teams th ON f.team_h = th.id
    JOIN teams ta ON f.team_a = ta.id
    WHERE (f.team_h = ? OR f.team_a = ?) AND f.finished = 1
    ORDER BY f.kickoff_time DESC
    LIMIT 5
  `, [ARSENAL_FPL_ID, ARSENAL_FPL_ID])

  const results = rows.map((r: any) => ({
    fixture: {
      id: r.id,
      date: r.kickoff_time,
      venue: null,
      status: {
        short: 'FT',
        elapsed: r.minutes || 90
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
      home: r.team_h_score,
      away: r.team_a_score
    },
    status: 'FT'
  }))

  return { results, source: 'db' }
})
