import { useDb, dbAll } from '../utils/db'
import { syncPlayers } from '../utils/sync'
import { ARSENAL_FPL_ID, FPL_POSITIONS } from '../utils/fpl'

function resolvePhoto(photoUrl: string | null): string | null {
  if (!photoUrl) return null
  const match = photoUrl.match(/p(\d+)\.png/)
  if (!match) return photoUrl
  return `/images/players/p${match[1]}.png`
}

export default defineEventHandler(async (event) => {
  await syncPlayers(event)

  const db = useDb(event)

  const rows = await dbAll(db, `
    SELECT * FROM players
    WHERE team_id = ? AND is_current = 1
    ORDER BY element_type ASC, second_name ASC
  `, [ARSENAL_FPL_ID])

  const response = rows.map((p: any) => {
    const pos = FPL_POSITIONS[p.element_type] || { key: 'UNK', short: 'UNK' }
    return {
      id: p.id,
      firstName: p.first_name,
      secondName: p.second_name,
      webName: p.web_name,
      fullName: `${p.first_name} ${p.second_name}`,
      number: p.squad_number,
      position: pos.key,
      positionShort: pos.short,
      photo: resolvePhoto(p.photo_url),
      nationality: p.nationality,
      age: p.age,
      stats: {
        appearances: p.appearances || 0,
        starts: p.starts || 0,
        minutes: p.minutes || 0,
        goals: p.goals_scored || 0,
        assists: p.assists || 0,
        cleanSheets: p.clean_sheets || 0,
        goalsConceded: p.goals_conceded || 0,
        yellowCards: p.yellow_cards || 0,
        redCards: p.red_cards || 0,
        saves: p.saves || 0,
        bonusPoints: p.bps || 0,
        form: p.form || '0',
        totalPoints: p.total_points || 0,
        pointsPerGame: p.points_per_game || '0',
        nowCost: p.now_cost ? (p.now_cost / 10).toFixed(1) : '0',
        selectedBy: p.selected_by_percent || '0',
        influence: p.influence || '0',
        creativity: p.creativity || '0',
        threat: p.threat || '0'
      }
    }
  })

  return { response, source: 'db' }
})
