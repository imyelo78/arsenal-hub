// 补齐阿森纳球员的号码/国籍/年龄,并标记是否在目前阵容(in_current)
// 数据源: 英超官方 + Arsenal.com 2026/27 阵容号码 + football-data.org(国籍/年龄)
// 图片使用本地静态文件 public/images/players/p{code}.png(不走数据库 BLOB)
// 用法: node scripts/update-player-details.cjs
const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', '.data', 'arsenal.db')
const ARSENAL_FD_ID = 57 // football-data Arsenal id

// Arsenal.com 官方 2026/27 阵容号码 (web_name -> number)
// 仅包含当前在队球员(已剔除离队球员:G.Jesus, Martinelli, Vieira, Nwaneri, Nelson)
// 号码与英超官方名单 + Transfermarkt 交叉核实(2026/27)
const OFFICIAL_NUMBERS = {
  Raya: 1, Saliba: 2, Mosquera: 3, White: 4, Hincapie: 5, Gabriel: 6,
  Saka: 7, 'Ødegaard': 8, 'Odegaard': 8,
  Eze: 10, 'J.Timber': 12, Timber: 12, 'Arrizabalaga': 13, Kepa: 13,
  'Gyökeres': 14, Gyokeres: 14, Konsa: 15, Tzolis: 17, 'Madueke': 20,
  'Merino': 23, 'Havertz': 29, Meslier: 30, Calafiori: 33, 'Zubimendi': 36,
  'Bruno G.': 39, Rice: 41, 'Lewis-Skelly': 49, Dowman: 56
}

// 已离队球员(2026 夏窗): news 字段有标记,需从当前阵容剔除
// G.Jesus -> Barcelona, Martinelli -> Al-Hilal, Fabio Vieira -> HSV, Nwaneri -> Dortmund(loan), Nelson -> free agent
const DEPARTED = new Set(['Martinelli', 'G.Jesus', 'Fábio Vieira', 'Nwaneri', 'Nelson'])

// football-data 数据(国籍 + 出生日期)从官网 57 拉取后按名字匹配
async function fetchNationalityData(apiKey) {
  const resp = await fetch(`https://api.football-data.org/v4/teams/${ARSENAL_FD_ID}`, {
    headers: { 'X-Auth-Token': apiKey }
  })
  if (!resp.ok) throw new Error('football-data HTTP ' + resp.status + ': ' + await resp.text())
  const data = await resp.json()
  return data.squad || []
}

function normalize(s) {
  if (!s) return ''
  return String(s)
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c').replace(/[ø]/g, 'o').replace(/[æ]/g, 'ae').replace(/[õ]/g, 'o')
    .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

function firstTokenNorm(s) {
  const n = normalize(s)
  const parts = n.split(' ')
  // 去掉我国陈名字缩写如 'j.timber' -> 'j timber'
  return n
}

function ageFromDob(dob) {
  if (!dob) return null
  const y = parseInt(dob.slice(0, 4), 10)
  const m = parseInt(dob.slice(5, 7), 10) - 1
  const d = parseInt(dob.slice(8, 10), 10)
  const now = new Date()
  let age = now.getFullYear() - y
  if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < d)) age--
  return age
}

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return {}
  const out = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

async function main() {
  const env = loadEnv()
  const fdKey = env.FOOTBALL_DATA_KEY || process.env.FOOTBALL_DATA_KEY
  if (!fdKey) {
    console.error('Need FOOTBALL_DATA_KEY in .env')
    process.exit(1)
  }

  const db = new Database(DB_PATH)
  const rows = db.prepare('SELECT id, web_name, first_name, second_name, squad_number, nationality, age, is_current FROM players WHERE team_id = 1').all()
  console.log('DB Arsenal players:', rows.length)

  // football-data: 国籍 + 年龄
  let fdByNorm = {}
  if (fdKey) {
    try {
      const fdSquad = await fetchNationalityData(fdKey)
      for (const s of fdSquad) {
        fdByNorm[firstTokenNorm(s.name)] = { nationality: s.nationality, dob: s.dateOfBirth }
      }
      console.log('football-data squad:', fdSquad.length)
    } catch (e) {
      console.log('football-data fetch failed:', e.message)
    }
  }

  // 为每个 DB 球员决定号码/国籍/年龄,并标记 is_current
  let numUpdated = 0
  let natAgeUpdated = 0
  let currentCount = 0
  let departedCount = 0
  for (const p of rows) {
    const changes = []

    // 离队判断: 仅对阿森纳球员(is_current=0)
    const isDeparted = Array.from(DEPARTED).some(d => {
      const nd = normalize(d)
      return (p.web_name && normalize(p.web_name) === nd) ||
             (p.second_name && normalize(p.second_name) === nd)
    })
    const want = isDeparted ? 0 : 1
    if (p.is_current !== undefined && p.is_current !== want) {
      changes.push(`is_current = ${want}`)
      if (want) currentCount++
      else departedCount++
    }

    // 1) 号码: 官方号码表优先(fallback 用归一化匹配)
    let number = null
    if (want) {
      const normKeys = {}
      for (const [k, v] of Object.entries(OFFICIAL_NUMBERS)) normKeys[normalize(k)] = v
      const pKeys = [p.web_name, p.second_name, p.first_name, p.web_name.replace(/\./g, ' '), p.first_name + ' ' + p.second_name]
      for (const k of pKeys) {
        if (normKeys[normalize(k)] != null) { number = normKeys[normalize(k)]; break }
      }
    }
    // 2) 国籍 + 年龄: football-data by first/second name tokens
    let fdInfo = null
    const pn = normalize([p.first_name, p.second_name].filter(Boolean).join(' '))
    const pn2 = normalize([p.first_name.replace(/[^a-z ]/gi, ''), p.second_name].filter(Boolean).join(' '))
    const candidates = fdByNorm[pn] || fdByNorm[pn2]
    if (!candidates) {
      // fallback: token 级包含匹配(处理 benjamin white vs ben white)
      const dbTokens = pn.split(' ').filter(t => t.length > 2)
      for (const [k, v] of Object.entries(fdByNorm)) {
        const fdTokens = k.split(' ').filter(t => t.length > 2)
        if (!fdTokens.length) continue
        if (fdTokens.every(t => dbTokens.includes(t)) || (dbTokens.length >= 2 && dbTokens.every(t => fdTokens.includes(t)))) {
          fdInfo = v
          break
        }
      }
    } else fdInfo = candidates

    if (number != null && number !== p.squad_number) changes.push(`squad_number = ${number}`)
    if (fdInfo) {
      if (fdInfo.nationality && fdInfo.nationality !== p.nationality) changes.push(`nationality = '${fdInfo.nationality.replace(/'/g, "''")}'`)
      const a = ageFromDob(fdInfo.dob)
      if (a != null && a !== p.age) changes.push(`age = ${a}`)
    }

    // 3) football-data 免费名单缺失或 token 匹配失败,用已核实数据覆盖
    const EXTRA = {
      White: { nationality: 'England', age: 28 },
      Martinelli: { nationality: 'Brazil', age: 25 },
      'G.Jesus': { nationality: 'Brazil', age: 29 },
      Nwaneri: { nationality: 'England', age: 18 },
      'Fábio Vieira': { nationality: 'Portugal', age: 26 },
      Nelson: { nationality: 'England', age: 26 }
    }
    for (const [name, info] of Object.entries(EXTRA)) {
      if ((p.web_name && normalize(p.web_name) === normalize(name)) ||
          (p.second_name && normalize(p.second_name) === normalize(name))) {
        if (info.nationality && info.nationality !== p.nationality) changes.push(`nationality = '${info.nationality}'`)
        if (info.age != null && info.age !== p.age) changes.push(`age = ${info.age}`)
      }
    }
    if (changes.length) {
      db.prepare('UPDATE players SET ' + changes.join(', ') + ' WHERE id = ?').run(p.id)
      numUpdated++
      console.log('updated', p.id, p.web_name, '->', changes.join(', '))
    }
  }

  db.close()
  console.log('Updated numbers/nationality/age for', numUpdated, 'players')
  console.log('is_current -> current:', currentCount, 'departed:', departedCount)
  console.log('当前照片使用本地静态文件 public/images/players/p{code}.png,不需要下载到数据库')
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})