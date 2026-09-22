import { getCache, setCache } from '../utils/cache'

const SCORERS_TTL = 28800 // 8 hours

// GET /api/scorers
// Returns Premier League top scorers from football-data.org

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const cacheKey = 'scorers-v1'
  const ttl = query.refresh ? 0 : SCORERS_TTL

  const cached = await getCache(cacheKey, ttl, event)
  if (cached) {
    return cached
  }

  if (!config.footballDataKey) {
    return { response: [], source: 'error', error: 'No football-data.org API key' }
  }

  try {
    const response = await $fetch(
      `${config.public.footballDataBaseUrl}/competitions/PL/scorers`,
      {
        headers: { 'X-Auth-Token': config.footballDataKey },
        params: { limit: 20 }
      }
    ) as any

    const formatted = (response.scorers || []).map((s: any, i: number) => ({
      rank: i + 1,
      player: {
        id: s.player?.id,
        name: s.player?.name,
        nationality: s.player?.nationality,
        position: s.player?.section || s.player?.position
      },
      team: {
        id: s.team?.id,
        name: s.team?.name,
        logo: s.team?.crest
      },
      goals: s.goals || 0,
      assists: s.assists || 0,
      penalties: s.penalties || 0
    }))

    const result = { response: formatted, source: 'football-data' }
    await setCache(cacheKey, result, ttl, event)
    return result
  } catch (error) {
    console.error('football-data.org scorers failed:', error)
    return { response: [], source: 'error', error: 'Failed to fetch scorers' }
  }
})
