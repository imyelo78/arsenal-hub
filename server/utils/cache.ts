import { promises as fs } from 'fs'
import { join } from 'path'

// Local file-based cache for dev; KV for production
// Cache TTLs:
//   fixtures: 24 hours (schedules rarely change)
//   next-match: 8 hours
//   last-results: 8 hours
//   standings: 30 minutes

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

const CACHE_DIR = join(process.cwd(), '.cache')

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  } catch {}
}

export async function getCache(key: string, ttl: number, event?: any): Promise<any | null> {
  // Try KV first (production)
  if (event?.context?.cloudflare?.env?.ARSENAL_KV) {
    try {
      const cached = await event.context.cloudflare.env.ARSENAL_KV.get(key)
      if (cached) return JSON.parse(cached)
    } catch {}
  }

  // Fallback to file cache (dev)
  try {
    await ensureCacheDir()
    const filePath = join(CACHE_DIR, `${key.replace(/[^a-zA-Z0-9-]/g, '_')}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const entry: CacheEntry = JSON.parse(content)
    const age = Date.now() - entry.timestamp
    if (age < ttl) {
      return entry.data
    }
  } catch {}

  return null
}

export async function setCache(key: string, data: any, ttl: number, event?: any): Promise<void> {
  // Try KV first (production)
  if (event?.context?.cloudflare?.env?.ARSENAL_KV) {
    try {
      await event.context.cloudflare.env.ARSENAL_KV.put(key, JSON.stringify(data), {
        expirationTtl: ttl
      })
      return
    } catch {}
  }

  // Fallback to file cache (dev)
  try {
    await ensureCacheDir()
    const filePath = join(CACHE_DIR, `${key.replace(/[^a-zA-Z0-9-]/g, '_')}.json`)
    const entry: CacheEntry = { data, timestamp: Date.now(), ttl }
    await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8')
  } catch (e) {
    console.error('Cache write failed:', e)
  }
}
