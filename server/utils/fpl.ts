// FPL team ID mapping (fallback)
export const FPL_TEAM_IDS: Record<number, string> = {
  1: 'Arsenal',
  2: 'Aston Villa',
  3: 'Bournemouth',
  4: 'Brentford',
  5: 'Brighton',
  6: 'Chelsea',
  7: 'Coventry',
  8: 'Crystal Palace',
  9: 'Everton',
  10: 'Fulham',
  11: 'Hull City',
  12: 'Ipswich',
  13: 'Leeds United',
  14: 'Leicester',
  15: 'Liverpool',
  16: 'Manchester City',
  17: 'Manchester United',
  18: 'Newcastle',
  19: 'Nottingham Forest',
  20: 'Sunderland',
  21: 'Tottenham',
  22: 'West Ham',
  23: 'Wolves'
}

export const ARSENAL_FPL_ID = 1

// FPL team badge (local, stored in public/images/badges/)
// Badges are downloaded once per season and served locally
export function getFplTeamBadge(code: string | number): string {
  return `/images/badges/t${code}.png`
}

// FPL team data map (loaded from bootstrap-static)
type FplTeamInfo = { name: string; short_name: string; code: number }
let fplTeamsMap: Record<number, FplTeamInfo> = {}

// Shared in-memory cache for bootstrap-static
let fplBootstrapCache: { data: any; timestamp: number } | null = null
const BOOTSTRAP_TTL = 3600000 // 1 hour

export async function getFplBootstrap(): Promise<any> {
  if (fplBootstrapCache && Date.now() - fplBootstrapCache.timestamp < BOOTSTRAP_TTL) {
    return fplBootstrapCache.data
  }
  try {
    const data = await $fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      timeout: 6000
    }) as any
    if (data.teams) {
      for (const team of data.teams) {
        fplTeamsMap[team.id] = {
          name: team.name,
          short_name: team.short_name,
          code: team.code
        }
      }
    }
    fplBootstrapCache = { data, timestamp: Date.now() }
    return data
  } catch (e) {
    console.error('Failed to load FPL bootstrap:', e)
    return null
  }
}

// Shared in-memory cache for fixtures
let fplFixturesCache: { data: any[]; timestamp: number } | null = null
const FIXTURES_TTL = 600000 // 10 minutes

export async function getFplFixtures(): Promise<any[]> {
  if (fplFixturesCache && Date.now() - fplFixturesCache.timestamp < FIXTURES_TTL) {
    return fplFixturesCache.data
  }
  try {
    const data = await $fetch('https://fantasy.premierleague.com/api/fixtures/', {
      timeout: 6000
    }) as any[]
    fplFixturesCache = { data, timestamp: Date.now() }
    return data
  } catch (e) {
    console.error('Failed to load FPL fixtures:', e)
    return []
  }
}

export async function loadFplTeams(): Promise<void> {
  if (Object.keys(fplTeamsMap).length > 0) return
  await getFplBootstrap()
}

export function getFplTeamName(id: number): string {
  return fplTeamsMap[id]?.name || FPL_TEAM_IDS[id] || `Team ${id}`
}

export function getFplTeamShort(id: number): string {
  return fplTeamsMap[id]?.short_name || ''
}

export function getFplTeamLogo(id: number): string | null {
  const code = fplTeamsMap[id]?.code
  return code ? getFplTeamBadge(code) : null
}

export function formatFplFixtures(fixtures: any[]) {
  return fixtures.map((f) => {
    const homeName = getFplTeamName(f.team_h)
    const awayName = getFplTeamName(f.team_a)
    const homeLogo = getFplTeamLogo(f.team_h)
    const awayLogo = getFplTeamLogo(f.team_a)
    const isFinished = f.finished
    const homeScore = f.started ? f.team_h_score : null
    const awayScore = f.started ? f.team_a_score : null

    return {
      fixture: {
        id: f.id,
        date: f.kickoff_time,
        venue: null,
        status: {
          short: isFinished ? 'FT' : f.started ? 'LIVE' : 'NS',
          elapsed: f.minutes || 0
        }
      },
      league: {
        id: 39,
        name: 'Premier League',
        logo: null,
        round: f.event ? `Gameweek ${f.event}` : null
      },
      teams: {
        home: { id: f.team_h, name: homeName, logo: homeLogo },
        away: { id: f.team_a, name: awayName, logo: awayLogo }
      },
      goals: {
        home: homeScore,
        away: awayScore
      },
      status: isFinished ? 'FT' : f.started ? 'LIVE' : 'NS'
    }
  })
}

// FPL element type (position) mapping
export const FPL_POSITIONS: Record<number, { key: string; short: string }> = {
  1: { key: 'GK', short: 'GK' },
  2: { key: 'DEF', short: 'DEF' },
  3: { key: 'MID', short: 'MID' },
  4: { key: 'FWD', short: 'FWD' }
}

// FPL player photo URL
export function getFplPlayerPhoto(id: number): string {
  const padded = String(id).padStart(6, '0')
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${padded}.png`
}

// Format FPL players (from bootstrap-static elements array)
export function formatFplPlayers(elements: any[], elementType: any[]) {
  return elements
    .filter((p: any) => p.team === ARSENAL_FPL_ID)
    .map((p: any) => {
      const pos = FPL_POSITIONS[p.element_type] || { key: 'UNK', short: 'UNK' }
      return {
        id: p.id,
        firstName: p.first_name,
        secondName: p.second_name,
        webName: p.web_name,
        fullName: `${p.first_name} ${p.second_name}`,
        number: p.squad_number || null,
        position: pos.key,
        positionShort: pos.short,
        photo: getFplPlayerPhoto(p.code),
        nationality: p.nationality || null,
        age: p.age || null,
        stats: {
          appearances: p.games_started || 0,
          minutes: p.minutes || 0,
          goals: p.goals_scored || 0,
          assists: p.assists || 0,
          cleanSheets: p.clean_sheets || 0,
          yellowCards: p.yellow_cards || 0,
          redCards: p.red_cards || 0,
          saves: p.saves || 0,
          bonusPoints: p.bps || 0,
          form: p.form || '0',
          totalPoints: p.total_points || 0,
          nowCost: p.now_cost ? (p.now_cost / 10).toFixed(1) : '0',
          selectedBy: p.selected_by_percent || '0',
          influence: p.influence || '0',
          creativity: p.creativity || '0',
          threat: p.threat || '0'
        }
      }
    })
    .sort((a: any, b: any) => {
      const posOrder: Record<string, number> = { GK: 1, DEF: 2, MID: 3, FWD: 4 }
      return (posOrder[a.position] || 99) - (posOrder[b.position] || 99)
    })
}

export function formatFplPlayerDetail(element: any, history: any[], fixtures: any[]) {
  const pos = FPL_POSITIONS[element.element_type] || { key: 'UNK', short: 'UNK' }

  const lastFive = (history || [])
    .sort((a: any, b: any) => b.event - a.event)
    .slice(0, 5)
    .map((h: any) => {
      const fixture = fixtures?.find((f: any) => f.id === h.fixture)
      return {
        gameweek: h.event,
        opponent: fixture ? getFplTeamName(fixture.team_h === element.team ? fixture.team_a : fixture.team_h) : '',
        opponentLogo: fixture ? getFplTeamLogo(fixture.team_h === element.team ? fixture.team_a : fixture.team_h) : null,
        isHome: fixture ? fixture.team_h === element.team : false,
        minutes: h.minutes || 0,
        goals: h.goals_scored || 0,
        assists: h.assists || 0,
        cleanSheets: h.clean_sheets || 0,
        yellowCards: h.yellow_cards || 0,
        redCards: h.red_cards || 0,
        bonus: h.bonus || 0,
        totalPoints: h.total_points || 0
      }
    })

  return {
    id: element.id,
    firstName: element.first_name,
    secondName: element.second_name,
    webName: element.web_name,
    fullName: `${element.first_name} ${element.second_name}`,
    number: element.squad_number || null,
    position: pos.key,
    positionShort: pos.short,
    photo: getFplPlayerPhoto(element.code),
    nationality: element.nationality || null,
    age: element.age || null,
    news: element.news || '',
    stats: {
      appearances: element.games_started || 0,
      minutes: element.minutes || 0,
      goals: element.goals_scored || 0,
      assists: element.assists || 0,
      cleanSheets: element.clean_sheets || 0,
      yellowCards: element.yellow_cards || 0,
      redCards: element.red_cards || 0,
      saves: element.saves || 0,
      bonusPoints: element.bps || 0,
      form: element.form || '0',
      totalPoints: element.total_points || 0,
      nowCost: element.now_cost ? (element.now_cost / 10).toFixed(1) : '0',
      selectedBy: element.selected_by_percent || '0',
      influence: element.influence || '0',
      creativity: element.creativity || '0',
      threat: element.threat || '0'
    },
    lastFive
  }
}

export function formatFplStandings(teams: any[]) {
  return teams
    .map((t) => ({
      rank: t.position,
      team: {
        id: t.id,
        name: t.name,
        logo: t.code ? getFplTeamBadge(t.code) : null
      },
      points: t.points,
      goalsDiff: 0,
      form: '',
      all: {
        played: t.played,
        win: t.win,
        draw: t.draw,
        lose: t.loss,
        goals: { for: 0, against: 0 }
      }
    }))
    .sort((a, b) => a.rank - b.rank)
}
