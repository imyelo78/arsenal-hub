import { useDb, dbAll } from '../utils/db'
import { syncFixtures, syncCLFixtures } from '../utils/sync'
import { ARSENAL_FPL_ID } from '../utils/fpl'
import { ARSENAL_FD_ID } from '../utils/football-data'

export default defineEventHandler(async (event) => {
  await syncFixtures(event)
  await syncCLFixtures(event)

  const db = useDb(event)

  const plRows = await dbAll(db, `
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

  const response = plRows.map((r: any) => ({
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

  const clRows = await dbAll(db, `
    SELECT id, kickoff_time, stage, group_name, matchday,
           team_h, team_h_name, team_a, team_a_name,
           team_h_score, team_a_score, winner, status, details,
           home_logo, away_logo
    FROM cl_fixtures
    WHERE team_h = ? OR team_a = ?
    ORDER BY kickoff_time ASC
  `, [ARSENAL_FD_ID, ARSENAL_FD_ID])

  for (const r of clRows) {
    const isHome = r.team_h === ARSENAL_FD_ID
    let venue = null
    if (r.details) {
      try {
        const d = JSON.parse(r.details)
        if (d.venue) venue = { name: d.venue }
      } catch {}
    }
    response.push({
      fixture: {
        id: `cl-${r.id}`,
        date: r.kickoff_time,
        venue,
        status: { short: r.status, elapsed: r.status === 'FT' ? 90 : 0 }
      },
      league: {
        id: 2001,
        name: 'Champions League',
        logo: 'https://crests.football-data.org/CL.png',
        round: r.stage
      },
      teams: {
        home: { id: r.team_h, name: r.team_h_name, logo: r.home_logo },
        away: { id: r.team_a, name: r.team_a_name, logo: r.away_logo }
      },
      goals: {
        home: r.status === 'FT' || r.team_h_score !== null ? r.team_h_score : null,
        away: r.status === 'FT' || r.team_a_score !== null ? r.team_a_score : null
      },
      status: r.status
    })
  }

  response.sort((a: any, b: any) => {
    return String(a.fixture.date).localeCompare(String(b.fixture.date))
  })

  return { response, source: 'db' }
})