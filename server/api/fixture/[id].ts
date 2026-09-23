import { useDb, dbGet } from '../../utils/db'
import { syncFixtures, syncCLFixtures } from '../../utils/sync'
import { ARSENAL_FD_ID, CL_COMPETITION_LOGO } from '../../utils/football-data'

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id')
  if (!rawId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fixture id' })
  }

  const db = useDb(event)
  const isCl = rawId.startsWith('cl-')

  if (isCl) {
    await syncCLFixtures(event)
    const id = Number(rawId.slice(3))

    const row = await dbGet(db, `
      SELECT id, kickoff_time, stage, group_name, matchday,
             team_h, team_h_name, team_a, team_a_name,
             team_h_score, team_a_score, winner, status, details,
             home_logo, away_logo
      FROM cl_fixtures WHERE id = ?
    `, [id])

    if (!row) {
      throw createError({ statusCode: 404, statusMessage: 'Fixture not found' })
    }

    let details = null
    if (row.details) {
      try {
        details = JSON.parse(row.details)
      } catch {}
    }

    const isArsenalHome = row.team_h === ARSENAL_FD_ID
    const showScore = row.status === 'FT' || row.team_h_score !== null

    const response = {
      fixture: {
        id: `cl-${row.id}`,
        date: row.kickoff_time,
        venue: details?.venue ? { name: details.venue } : null,
        referee: details?.referees?.length ? details.referees.join(', ') : null,
        attendance: details?.attendance || null,
        stage: row.stage || null,
        group: row.group_name || null,
        matchday: row.matchday || null,
        halfTime: {
          home: details?.halfTime?.home ?? null,
          away: details?.halfTime?.away ?? null
        },
        h2h: details?.h2h || null,
        status: {
          short: row.status,
          elapsed: row.status === 'FT' ? 90 : 0
        }
      },
      league: {
        id: 2001,
        name: 'Champions League',
        logo: CL_COMPETITION_LOGO,
        round: row.stage
      },
      teams: {
        home: { id: row.team_h, name: row.team_h_name, logo: row.home_logo },
        away: { id: row.team_a, name: row.team_a_name, logo: row.away_logo }
      },
      goals: {
        home: showScore ? row.team_h_score : null,
        away: showScore ? row.team_a_score : null
      },
      status: row.status,
      winner: row.winner,
      isArsenalHome
    }

    return { response }
  }

  await syncFixtures(event)

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
  `, [Number(rawId)])

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