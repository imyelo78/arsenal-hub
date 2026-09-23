import { useDb, dbAll } from '../utils/db'
import { syncStandings, syncCLStandings } from '../utils/sync'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const competition = query.comp || 'pl'

  const db = useDb(event)

  if (competition === 'cl') {
    await syncCLStandings(event)
    const rows = await dbAll(db, `
      SELECT team_id, stage, position, team_name,
             played, win, draw, loss,
             goals_for, goals_against, goal_difference, points, form
      FROM cl_standings
      ORDER BY position ASC
    `)
    const standings = rows.map((r: any) => ({
      group: r.stage,
      rank: r.position,
      team: {
        id: r.team_id,
        name: r.team_name,
        logo: null
      },
      points: r.points,
      goalsDiff: r.goal_difference,
      form: r.form || '',
      all: {
        played: r.played,
        win: r.win,
        draw: r.draw,
        lose: r.loss,
        goals: {
          for: r.goals_for,
          against: r.goals_against
        }
      }
    }))
    return { response: standings, source: 'db' }
  }

  await syncStandings(event)

  const rows = await dbAll(db, `
    SELECT
      s.position, s.points, s.played, s.win, s.draw, s.loss,
      s.goals_for, s.goals_against, s.goal_difference, s.form,
      t.id as team_id, t.name as team_name, t.badge_url as team_logo
    FROM standings s
    JOIN teams t ON s.team_id = t.id
    ORDER BY s.position ASC
  `)

  const response = rows.map((r: any) => ({
    rank: r.position,
    team: {
      id: r.team_id,
      name: r.team_name,
      logo: r.team_logo
    },
    points: r.points,
    goalsDiff: r.goal_difference,
    form: r.form || '',
    all: {
      played: r.played,
      win: r.win,
      draw: r.draw,
      lose: r.loss,
      goals: {
        for: r.goals_for,
        against: r.goals_against
      }
    }
  }))

  return { response, source: 'db' }
})