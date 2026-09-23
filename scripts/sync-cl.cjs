// Standalone CL backfill: pulls Arsenal CL fixtures + CL standings from
// football-data.org into the LOCAL sqlite DB (dev). For production D1 use
// export-cl-seed.cjs to generate SQL and apply via wrangler d1 execute.
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const ROOT = path.join(__dirname, '..')
const DB_PATH = path.join(ROOT, '.data', 'arsenal.db')
const envFile = fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const KEY = env.FOOTBALL_DATA_KEY || process.env.FOOTBALL_DATA_KEY
if (!KEY) {
  console.error('FOOTBALL_DATA_KEY not found in .env')
  process.exit(1)
}

const BASE = 'https://api.football-data.org/v4'
const ARSENAL_FD_ID = 57

async function fdFetch(p) {
  const res = await fetch(BASE + p, { headers: { 'X-Auth-Token': KEY }, timeout: 15000 })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${p}`)
  return res.json()
}

function mapStatus(s) {
  const map = {
    SCHEDULED: 'NS', TIMED: 'NS', IN_PLAY: 'LIVE', LIVE: 'LIVE', PAUSED: 'LIVE',
    FINISHED: 'FT', AWARDED: 'FT', POSTPONED: 'PST', CANCELLED: 'CAN',
    SUSPENDED: 'SUSP', ABANDONED: 'ABD'
  }
  return map[s] || s
}

const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

const now = Date.now()

async function main() {
  const matches = await fdFetch(`/teams/${ARSENAL_FD_ID}/matches?season=2026`)
  const cl = (matches.matches || []).filter((m) => m.competition?.code === 'CL')
  console.log('CL matches:', cl.length)

  const upsertFixture = db.prepare(`
    INSERT INTO cl_fixtures (
      id, kickoff_time, stage, group_name, matchday,
      team_h, team_h_name, team_a, team_a_name,
      team_h_score, team_a_score, winner, status, details,
      home_logo, away_logo, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      kickoff_time = excluded.kickoff_time,
      stage = excluded.stage,
      group_name = excluded.group_name,
      matchday = excluded.matchday,
      team_h = excluded.team_h,
      team_h_name = excluded.team_h_name,
      team_a = excluded.team_a,
      team_a_name = excluded.team_a_name,
      team_h_score = excluded.team_h_score,
      team_a_score = excluded.team_a_score,
      winner = excluded.winner,
      status = excluded.status,
      details = excluded.details,
      home_logo = excluded.home_logo,
      away_logo = excluded.away_logo,
      updated_at = excluded.updated_at
  `)

  const seen = new Set()
  let withDetails = 0
  let withH2h = 0

  const existingDetailsStmt = db.prepare('SELECT details FROM cl_fixtures WHERE id = ?')

  for (const m of cl) {
    const h = m.homeTeam || {}
    const a = m.awayTeam || {}
    const sc = m.score || {}

    // fetch detail for finished matches (rich detail: referees/venue/attendance/HT)
    let details = {
      venue: m.venue || null,
      attendance: m.attendance || null,
      referees: Array.isArray(m.referees) ? m.referees.map((r) => r.name) : [],
      halfTime: sc.halfTime || null,
      fullTime: sc.fullTime || null
    }
    if (mapStatus(m.status) === 'FT') {
      try {
        const d = await fdFetch(`/matches/${m.id}`)
        const dm = d
        details = {
          venue: dm.venue || m.venue || null,
          attendance: dm.attendance || m.attendance || null,
          referees: Array.isArray(dm.referees) ? dm.referees.map((r) => r.name) : [],
          halfTime: dm.score?.halfTime || null,
          fullTime: dm.score?.fullTime || null
        }
        withDetails++
      } catch (e) {
        console.log('  detail fetch failed for', m.id, e.message)
      }
    }

    // head2head: 两队历史交锋(免费档每天10次,已存过则跳过)
    let hasH2h = false
    try {
      const ex = existingDetailsStmt.get(m.id)
      if (ex?.details) {
        const parsed = JSON.parse(ex.details)
        if (parsed.h2h) hasH2h = true
      }
    } catch {}
    if (!hasH2h) {
      try {
        const h2h = await fdFetch(`/matches/${m.id}/head2head?limit=5`)
        const agg = h2h.aggregates || {}
        details.h2h = {
          total: agg.numberOfMatches ?? (h2h.matches || []).length,
          wins: {
            home: agg.homeTeam?.wins ?? 0,
            draw: agg.homeTeam?.draws ?? 0,
            away: agg.homeTeam?.losses ?? 0
          },
          goals: agg.totalGoals ?? 0,
          matches: (h2h.matches || []).map((mm) => ({
            date: mm.utcDate ? mm.utcDate.slice(0, 10) : null,
            home: mm.homeTeam?.name || '',
            away: mm.awayTeam?.name || '',
            hs: mm.score?.fullTime?.home ?? null,
            as: mm.score?.fullTime?.away ?? null,
            comp: mm.competition?.name || null
          }))
        }
        withH2h++
      } catch (e) {
        console.log('  h2h fetch failed for', m.id, e.message)
      }
    }

    seen.add(m.id)
    const crestLocal = (id) => (id ? `/images/crests/${id}.webp` : null)
    upsertFixture.run(
      m.id, m.utcDate, m.stage || null, m.group || null, m.matchday || null,
      h.id, h.name || '', a.id, a.name || '',
      sc.fullTime?.home ?? null, sc.fullTime?.away ?? null, sc.winner || null,
      mapStatus(m.status || 'SCHEDULED'), JSON.stringify(details),
      crestLocal(h.id), crestLocal(a.id),
      now
    )
  }

  if (seen.size) {
    const ids = Array.from(seen)
    const placeholders = ids.map(() => '?').join(',')
    db.prepare(`DELETE FROM cl_fixtures WHERE id NOT IN (${placeholders})`).run(...ids)
  }

  console.log('fixtures upserted:', cl.length, '| finished w/ detail:', withDetails, '| w/ h2h:', withH2h)

  // ===== Standings =====
  const st = await fdFetch('/competitions/CL/standings?season=2026')
  const table = st.standings?.[0]
  if (table?.table?.length) {
    const upsertStanding = db.prepare(`
      INSERT INTO cl_standings (
        team_id, stage, position, team_name, logo, played, win, draw, loss,
        goals_for, goals_against, goal_difference, points, form, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(team_id) DO UPDATE SET
        stage = excluded.stage, position = excluded.position, team_name = excluded.team_name,
        logo = excluded.logo,
        played = excluded.played, win = excluded.win, draw = excluded.draw, loss = excluded.loss,
        goals_for = excluded.goals_for, goals_against = excluded.goals_against,
        goal_difference = excluded.goal_difference, points = excluded.points,
        form = excluded.form, updated_at = excluded.updated_at
    `)
    for (const r of table.table) {
      upsertStanding.run(
        r.team.id, table.stage, r.position, r.team.name,
        r.team.id ? `/images/crests/${r.team.id}.webp` : null,
        r.playedGames || 0, r.won || 0, r.draw || 0, r.lost || 0,
        r.goalsFor || 0, r.goalsAgainst || 0, r.goalDifference || 0,
        r.points || 0, r.form || '', now
      )
    }
    console.log('standings upserted:', table.table.length)
  }

  // refresh sync_meta so runtime sync is warm
  const upsertMeta = db.prepare(`
    INSERT INTO sync_meta (key, last_sync, next_sync)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET last_sync = excluded.last_sync, next_sync = excluded.next_sync
  `)
  upsertMeta.run('cl_fixtures', now, now + 12 * 60 * 60 * 1000)
  upsertMeta.run('cl_standings', now, now + 12 * 60 * 60 * 1000)

  db.close()
  console.log('done')
}

main().catch((e) => {
  console.error(e)
  db.close()
  process.exit(1)
})