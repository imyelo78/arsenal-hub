// 全站日期显示时区：中文站固定北京时间，英文站固定英国时间
// 不依赖访客/服务器本地时区（SSR 为 UTC、客户端各异），避免「组头是 UTC 日期、时间是北京时间」的跨日歧义
export function displayTimeZone(locale: string): string {
  return locale === 'zh' ? 'Asia/Shanghai' : 'Europe/London'
}

// 按显示时区把比赛时间归到所属日期，返回 YYYY-MM-DD key（用于赛程分组/月份筛选）
export function dayKeyInZone(date: Date | string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}
