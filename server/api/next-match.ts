import { useDb, dbGet, dbAll } from '../utils/db'
import { syncFixtures, syncCLFixtures } from '../utils/sync'
import { ARSENAL_FPL_ID } from '../utils/fpl'
import { ARSENAL_FD_ID, CL_COMPETITION_LOGO } from '../utils/football-data'

export default defineEventHandler(async (event) => {
  await syncFixtures(event)
  await syncCLFixtures(event)

  const db = useDb(event)

  const plRow = await dbGet(db, `
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

  const clRow = await dbGet(db, `
    SELECT id, kickoff_time, stage, group_name, matchday,
           team_h, team_h_name, team_a, team_a_name,
           team_h_score, team_a_score, winner, status, details,
           home_logo, away_logo
    FROM cl_fixtures
    WHERE (team_h = ? OR team_a = ?) AND status IN ('NS', 'LIVE')
    ORDER BY kickoff_time ASC
    LIMIT 1
  `, [ARSENAL_FD_ID, ARSENAL_FD_ID])

  // 取时间最早的一个
  let nextMatch: any = null
  if (plRow && clRow) {
    nextMatch = plRow.kickoff_time <= clRow.kickoff_time
      ? { source: 'pl', row: plRow }
      : { source: 'cl', row: clRow }
  } else if (plRow) {
    nextMatch = { source: 'pl', row: plRow }
  } else if (clRow) {
    nextMatch = { source: 'cl', row: clRow }
  }

  if (!nextMatch) {
    return { nextMatch: null }
  }

  const { source, row } = nextMatch

  const response = source === 'cl' ? {
    fixture: {
      id: `cl-${row.id}`,
      date: row.kickoff_time,
      venue: null,
      status: { short: row.status, elapsed: row.status === 'LIVE' ? 60 : 0 }
    },
    league: {
      id: 2001,
      name: 'Champions League',
      logo: CL_COMPETITION_LOGO,
      round: row.stage
    },
    teams: {
      home: { id: row.team_h, name: row.team_h_name, logo: row.home_logo || null },
      away: { id: row.team_a, name: row.team_a_name, logo: row.away_logo || null }
    },
    goals: null,
    status: row.status
  } : {
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
    goals: null,
    status: row.started ? 'LIVE' : 'NS'
  }

  return { nextMatch: response, source: 'db' }
})