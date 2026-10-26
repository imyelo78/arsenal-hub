import { syncAll } from '../utils/sync'

// GET /api/sync - 手动触发全量强制同步（修复/补全 D1 数据用）
// 返回各表写入条数，60 秒内重复调用会被拒绝，防止外部滥用

let lastRunAt = 0

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')

  const now = Date.now()
  if (lastRunAt && now - lastRunAt < 60_000) {
    return {
      ok: false,
      message: 'sync ran recently, retry in a minute',
      secondsSinceLastRun: Math.round((now - lastRunAt) / 1000)
    }
  }
  lastRunAt = now

  const started = Date.now()
  try {
    const counts = await syncAll(event, true)
    return { ok: true, durationMs: Date.now() - started, counts }
  } catch (e: any) {
    return {
      ok: false,
      durationMs: Date.now() - started,
      error: e?.message || String(e)
    }
  }
})
