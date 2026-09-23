import { useDb, dbGet, dbAll } from '../../utils/db'
import { syncPlayers, syncFixtures } from '../../utils/sync'
import { FPL_POSITIONS } from '../../utils/fpl'

function resolvePhoto(photoUrl: string | null, localPhotos: Set<string>): string | null {
  if (!photoUrl) return null
  const match = photoUrl.match(/p(\d+)\.png/)
  if (!match) return photoUrl
  const filename = `p${match[1]}.png`
  if (localPhotos.has(filename)) {
    return `/images/players/${filename}`
  }
  return photoUrl
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing player id' })
  }

  await syncPlayers(event)
  await syncFixtures(event)

  const db = useDb(event)

  // Check local photos (dev only)
  let localPhotos = new Set<string>()
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const PLAYERS_DIR = path.join(process.cwd(), 'public', 'images', 'players')
    if (fs.existsSync(PLAYERS_DIR)) {
      fs.readdirSync(PLAYERS_DIR).forEach((f: string) => {
        if (f.endsWith('.png') && fs.statSync(path.join(PLAYERS_DIR, f)).size > 1000) {
          localPhotos.add(f)
        }
      })
    }
  } catch {}

  const player = await dbGet(db, 'SELECT * FROM players WHERE id = ?', [id])

  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  const pos = FPL_POSITIONS[player.element_type] || { key: 'UNK', short: 'UNK' }

  const historyRows = await dbAll(db, `
    SELECT ph.*, t.name as opponent_name, t.badge_url as opponent_logo
    FROM player_history ph
    JOIN teams t ON ph.opponent_team = t.id
    WHERE ph.player_id = ?
    ORDER BY ph.event DESC
    LIMIT 5
  `, [id])

  const lastFive = historyRows.map((h: any) => ({
    gameweek: h.event,
    opponent: h.opponent_name,
    opponentLogo: h.opponent_logo,
    isHome: h.was_home === 1,
    minutes: h.minutes || 0,
    goals: h.goals_scored || 0,
    assists: h.assists || 0,
    cleanSheets: h.clean_sheets || 0,
    yellowCards: h.yellow_cards || 0,
    redCards: h.red_cards || 0,
    bonus: h.bonus || 0,
    totalPoints: h.total_points || 0
  }))

  const response = {
    id: player.id,
    firstName: player.first_name,
    secondName: player.second_name,
    webName: player.web_name,
    fullName: `${player.first_name} ${player.second_name}`,
    number: player.squad_number,
    position: pos.key,
    positionShort: pos.short,
    photo: resolvePhoto(player.photo_url, localPhotos),
    nationality: player.nationality,
    age: player.age,
    news: player.news || '',
    stats: {
      appearances: player.appearances || 0,
      starts: player.starts || 0,
      minutes: player.minutes || 0,
      goals: player.goals_scored || 0,
      assists: player.assists || 0,
      cleanSheets: player.clean_sheets || 0,
      goalsConceded: player.goals_conceded || 0,
      yellowCards: player.yellow_cards || 0,
      redCards: player.red_cards || 0,
      saves: player.saves || 0,
      bonusPoints: player.bps || 0,
      form: player.form || '0',
      totalPoints: player.total_points || 0,
      pointsPerGame: player.points_per_game || '0',
      nowCost: player.now_cost ? (p.now_cost / 10).toFixed(1) : '0',
      selectedBy: player.selected_by_percent || '0',
      influence: player.influence || '0',
      creativity: player.creativity || '0',
      threat: player.threat || '0'
    },
    lastFive
  }

  return { response, source: 'db' }
})
