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

  const clRows = await dbAll(db, `
    SELECT id, kickoff_time, stage, group_name, matchday,
           team_h, team_h_name, team_a, team_a_name,
           team_h_score, team_a_score, winner, status, details
    FROM cl_fixtures
    WHERE (team_h = ? OR team_a = ?) AND status = 'FT'
    ORDER BY kickoff_time DESC
    LIMIT 3
  `, [ARSENAL_FD_ID, ARSENAL_FD_ID])

  const results = plRows.map((r: any) => ({
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

  for (const r of clRows) {
    results.push({
      fixture: {
        id: `cl-${r.id}`,
        date: r.kickoff_time,
        venue: null,
        status: { short: 'FT', elapsed: 90 }
      },
      league: {
        id: 2001,
        name: 'Champions League',
        logo: null,
        round: r.stage
      },
      teams: {
        home: { id: r.team_h, name: r.team_h_name, logo: null },
        away: { id: r.team_a, name: r.team_a_name, logo: null }
      },
      goals: {
        home: r.team_h_score,
        away: r.team_a_score
      },
      status: 'FT'
    })
  }

  results.sort((a: any, b: any) => String(b.fixture.date).localeCompare(String(a.fixture.date)))

  return { results, source: 'db' }
})