import { useDb, dbGet } from '../../utils/db'
import { syncFixtures } from '../../utils/sync'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fixture id' })
  }

  await syncFixtures(event)

  const db = useDb(event)

  const row = await dbGet(db, `
    SELECT
      f.id, f.kickoff_time, f.event, f.team_h, f.team_a,
      f.team_h_score, f.team_a_score, f.finished, f.started, f.minutes, f.stats,
      th.name as home_name, th.code as home_code, th.badge_url as home_logo,
      ta.name as away_name, ta.code as away_code, ta.badge_url as away_logo
    FROM fixtures f
    JOIN teams th ON f.team_h = th.id
    JOIN teams ta ON f.team_a = ta.id
    WHERE f.id = ?
  `, [id])

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Fixture not found' })
  }

  let stats = null
  if (row.stats) {
    try {
      const statsArr = JSON.parse(row.stats)
      stats = {}
      for (const s of statsArr) {
        stats[s.identifier] = {
          home: s.h || [],
          away: s.a || []
        }
      }
    } catch {}
  }

  const response = {
    fixture: {
      id: row.id,
      date: row.kickoff_time,
      venue: null,
      status: {
        short: row.finished ? 'FT' : row.started ? 'LIVE' : 'NS',
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
    status: row.finished ? 'FT' : row.started ? 'LIVE' : 'NS',
    stats
  }

  return { response }
})
