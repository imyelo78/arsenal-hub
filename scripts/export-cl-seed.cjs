// 从本地 SQLite 导出欧冠表(cl_fixtures / cl_standings)为 D1 可用 INSERT SQL
// 用法: node scripts/export-cl-seed.cjs  (输出到 ./cl-seed.sql)
// 通过 wrangler d1 execute arsenal-hub-db --remote --file=cl-seed.sql 应用到线上
const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', '.data', 'arsenal.db')
const OUT = path.join(__dirname, '..', 'cl-seed.sql')

const db = new Database(SRC, { readonly: true })

function esc(v) {
  if (v === null || v === undefined) return 'NULL'
  if (Buffer.isBuffer(v)) return "X'" + v.toString('hex') + "'"
  if (typeof v === 'number') return String(v)
  return "'" + String(v).replace(/'/g, "''") + "'"
}

const TABLES = ['cl_fixtures', 'cl_standings']

let sql = '-- Champions League seed generated from local .data/arsenal.db\n'
sql += 'PRAGMA foreign_keys = OFF;\n\n'

for (const t of TABLES) {
  const colsInfo = db.prepare('PRAGMA table_info("' + t + '")').all()
  const cols = colsInfo.map(c => c.name)
  const rows = db.prepare('SELECT * FROM "' + t + '"').all()
  sql += '-- ' + t + ' (' + rows.length + ' rows)\n'
  if (rows.length) {
    const colList = cols.map(c => '"' + c + '"').join(', ')
    for (const r of rows) {
      const vals = cols.map(c => esc(r[c])).join(', ')
      sql += 'INSERT OR REPLACE INTO "' + t + '" (' + colList + ') VALUES (' + vals + ');\n'
    }
  }
  sql += '\n'
}

db.close()
fs.writeFileSync(OUT, sql, 'utf8')
console.log('Wrote ' + OUT + ' (' + (sql.length / 1024).toFixed(1) + ' KB)')