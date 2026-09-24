// Arsenal team IDs across all data sources
// FPL: 1, football-data.org: 57, API-Football: 42
export const ARSENAL_IDS = [1, 42, 57]

// Official live broadcast sources by competition (league id as used in API responses)
// Premier League -> Migu Video (exclusive CN rights 2025/26-2027/28)
// Champions League -> iQIYI Sports (exclusive CN rights)
export const LIVE_SOURCES: Record<number, { name: string; zhName: string; url: string }[]> = {
  39: [
    { name: 'Migu Video', zhName: '咪咕视频', url: 'https://www.miguvideo.com/p/home/0c40bbc85fa345bbba20f8e5fd11a922' }
  ],
  2001: [
    { name: 'iQIYI Sports', zhName: '爱奇艺体育', url: 'https://ssports.iqiyi.com/' }
  ]
}
