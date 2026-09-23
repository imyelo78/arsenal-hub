// Download Champions League team crests from football-data CDN and convert to webp
// Output: public/images/crests/{teamId}.webp  (+ cl.webp for the competition logo)
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'crests')
const CREST_BASE = 'https://crests.football-data.org'

const Database = require('better-sqlite3')
const db = new Database(path.join(ROOT, '.data', 'arsenal.db'), { readonly: true })

const ids = new Set()
for (const r of db.prepare('SELECT team_h, team_a FROM cl_fixtures').all()) {
  ids.add(r.team_h)
  ids.add(r.team_a)
}
for (const r of db.prepare('SELECT team_id FROM cl_standings').all()) {
  ids.add(r.team_id)
}
db.close()

fs.mkdirSync(OUT_DIR, { recursive: true })

async function downloadConvert(id, label) {
  const out = path.join(OUT_DIR, `${id}.webp`)
  if (fs.existsSync(out)) {
    console.log(`skip ${label} ${id} (exists)`)
    return true
  }
  const url = `${CREST_BASE}/${id}.png`
  try {
    const res = await fetch(url, { timeout: 20000 })
    if (!res.ok) {
      console.log(`FAIL ${label} ${id}: HTTP ${res.status}`)
      return false
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await sharp(buf).resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).webp({ quality: 80 }).toFile(out)
    console.log(`OK ${label} ${id}: ${(fs.statSync(out).size / 1024).toFixed(1)} KB`)
    return true
  } catch (e) {
    console.log(`FAIL ${label} ${id}: ${e.message}`)
    return false
  }
}

async function main() {
  let ok = 0, fail = 0
  for (const id of [...ids].sort((a, b) => a - b)) {
    const r = await downloadConvert(id, 'team')
    if (r) ok++; else fail++
  }
  // competition logo
  const clOk = await downloadConvert('CL', 'club-comp')
  console.log(`done. teams: ${ok} ok / ${fail} fail, CL logo: ${clOk ? 'ok' : 'fail'}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})