// football-data.org client (v4)
// 欧冠赛程、积分榜、比赛详情数据源
// 注意: 免费档 X-Auth-Token 每天限 10 次请求, 同步必须节流

const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4'
const ARSENAL_FD_ID = 57
const CHAMPIONS_LEAGUE_CODE = 'CL'

// 球队 crest 下载至本地静态资源(webp),生产用本地路径,见 scripts/download-crests.cjs
export function getFdCrestLocal(teamId: number | null | undefined): string | null {
  if (!teamId) return null
  return `/images/crests/${teamId}.webp`
}

export const CL_COMPETITION_LOGO = '/images/crests/CL.webp'

function fdApiKey(): string {
  try {
    const cfg = useRuntimeConfig()
    if (cfg.footballDataKey) return cfg.footballDataKey
  } catch {}
  return process.env.FOOTBALL_DATA_KEY || process.env.NUXT_FOOTBALL_DATA_KEY || ''
}

async function fdFetch(path: string): Promise<any> {
  const key = fdApiKey()
  if (!key) {
    throw new Error('FOOTBALL_DATA_KEY is not configured')
  }
  const res = await $fetch<any>(`${FOOTBALL_DATA_BASE}${path}`, {
    headers: { 'X-Auth-Token': key },
    timeout: 15000
  })
  return res
}

// Team matches: 单个请求返回该队整赛季全部赛事(英超+欧冠等)
export async function getFdTeamMatches(teamId = ARSENAL_FD_ID, season = 2026): Promise<any[]> {
  const data = await fdFetch(`/teams/${teamId}/matches?season=${season}`)
  return data.matches || []
}

// Champions League standings (联赛阶段单桌 TOTAL)
export async function getFdClStandings(season = 2026): Promise<any[]> {
  const data = await fdFetch(`/competitions/${CHAMPIONS_LEAGUE_CODE}/standings?season=${season}`)
  return data.standings || []
}

// 单场比赛详情 (裁判/球场/上座/半场比分/阶段)
export async function getFdMatchDetail(matchId: number): Promise<any> {
  // /matches/{id} 返回的对象就是 match 本身(没有 match 包裹)
  return fdFetch(`/matches/${matchId}`)
}

// 两队历史交锋 (免费档 TIER_ONE: 仅返回本场所在赛事的历史交手)
export async function getFdHead2Head(matchId: number, limit = 5): Promise<any> {
  return fdFetch(`/matches/${matchId}/head2head?limit=${limit}`)
}

// 将 h2h 响应整理为精简结构, 存入 details.h2h
export function mapFdHead2Head(h: any): any {
  const agg = h?.aggregates || {}
  const matches = (h?.matches || []).map((m: any) => ({
    date: m.utcDate ? m.utcDate.slice(0, 10) : null,
    home: m.homeTeam?.name || '',
    away: m.awayTeam?.name || '',
    hs: m.score?.fullTime?.home ?? null,
    as: m.score?.fullTime?.away ?? null,
    comp: m.competition?.name || null
  }))
  return {
    total: agg.numberOfMatches ?? matches.length,
    wins: {
      home: agg.homeTeam?.wins ?? 0,
      draw: agg.homeTeam?.draws ?? 0,
      away: agg.homeTeam?.losses ?? 0
    },
    goals: agg.totalGoals ?? 0,
    matches
  }
}

export interface ClFixtureRow {
  id: number
  kickoff_time: string
  stage: string | null
  group_name: string | null
  matchday: number | null
  team_h: number
  team_h_name: string
  team_a: number
  team_a_name: string
  team_h_score: number | null
  team_a_score: number | null
  winner: string | null
  status: string
  details: string | null
  home_logo: string | null
  away_logo: string | null
  updated_at: number
}

function mapStatus(status: string): string {
  // football-data 状态 -> 统一状态
  const map: Record<string, string> = {
    SCHEDULED: 'NS',
    TIMED: 'NS',
    IN_PLAY: 'LIVE',
    LIVE: 'LIVE',
    PAUSED: 'LIVE',
    FINISHED: 'FT',
    AWARDED: 'FT',
    POSTPONED: 'PST',
    CANCELLED: 'CAN',
    SUSPENDED: 'SUSP',
    ABANDONED: 'ABD'
  }
  return map[status] || status
}

// 将 football-data match 转为 DB 行
export function mapFdMatchToRow(m: any, now: number): ClFixtureRow {
  const h = m.homeTeam || {}
  const a = m.awayTeam || {}
  const sc = m.score || {}
  const details = {
    venue: m.venue || null,
    attendance: m.attendance || null,
    referees: Array.isArray(m.referees) ? m.referees.map((r: any) => r.name) : [],
    halfTime: sc.halfTime || null,
    fullTime: sc.fullTime || null
  }
  return {
    id: m.id,
    kickoff_time: m.utcDate,
    stage: m.stage || null,
    group_name: m.group || null,
    matchday: m.matchday || null,
    team_h: h.id,
    team_h_name: h.name || '',
    team_a: a.id,
    team_a_name: a.name || '',
    team_h_score: sc.fullTime?.home ?? null,
    team_a_score: sc.fullTime?.away ?? null,
    winner: sc.winner || null,
    status: mapStatus(m.status || 'SCHEDULED'),
    details: JSON.stringify(details),
    home_logo: getFdCrestLocal(h.id),
    away_logo: getFdCrestLocal(a.id),
    updated_at: now
  }
}

export { ARSENAL_FD_ID, CHAMPIONS_LEAGUE_CODE }