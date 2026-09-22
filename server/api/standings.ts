import { getDb, dbAll } from '../utils/db'
import { syncStandings } from '../utils/sync'

export default defineEventHandler(async () => {
  await syncStandings()

  const db = getDb()

  const rows = dbAll(db, `
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
