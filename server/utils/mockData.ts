// Mock data for development and demo purposes
// When API_FOOTBALL_KEY is not configured, these fallbacks are used

export interface Match {
  fixture: {
    id: number
    date: string
    venue: string
    round: string
    league: string
  }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
  status: string
}

export interface StandingRow {
  position: number
  team: { id: number; name: string }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string
}

const ARSENAL_ID = 42

// 2026-27 season fixtures (mock)
export const mockFixtures: Match[] = [
  {
    fixture: { id: 1, date: '2026-08-15T19:00:00+08:00', venue: 'Emirates Stadium', round: '1', league: 'Premier League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 76, name: 'Wolves', logo: '' } },
    goals: { home: 2, away: 0 },
    status: 'FT'
  },
  {
    fixture: { id: 2, date: '2026-08-22T22:00:00+08:00', venue: "Villa Park", round: '2', league: 'Premier League' },
    teams: { home: { id: 67, name: 'Aston Villa', logo: '' }, away: { id: ARSENAL_ID, name: 'Arsenal', logo: '' } },
    goals: { home: 1, away: 1 },
    status: 'FT'
  },
  {
    fixture: { id: 3, date: '2026-08-30T00:30:00+08:00', venue: 'Emirates Stadium', round: '3', league: 'Premier League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 79, name: 'Brighton', logo: '' } },
    goals: { home: 3, away: 1 },
    status: 'FT'
  },
  {
    fixture: { id: 4, date: '2026-09-12T22:00:00+08:00', venue: "St. James' Park", round: '4', league: 'Premier League' },
    teams: { home: { id: 34, name: 'Newcastle', logo: '' }, away: { id: ARSENAL_ID, name: 'Arsenal', logo: '' } },
    goals: { home: 0, away: 2 },
    status: 'FT'
  },
  {
    fixture: { id: 5, date: '2026-09-19T23:00:00+08:00', venue: 'Emirates Stadium', round: '5', league: 'Premier League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 40, name: 'Liverpool', logo: '' } },
    goals: { home: 2, away: 2 },
    status: 'FT'
  },
  {
    fixture: { id: 6, date: '2026-09-26T19:30:00+08:00', venue: 'Emirates Stadium', round: '1', league: 'Champions League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 541, name: 'Inter Milan', logo: '' } },
    goals: { home: 1, away: 0 },
    status: 'FT'
  },
  {
    fixture: { id: 7, date: '2026-10-03T22:00:00+08:00', venue: 'Old Trafford', round: '6', league: 'Premier League' },
    teams: { home: { id: 33, name: 'Man United', logo: '' }, away: { id: ARSENAL_ID, name: 'Arsenal', logo: '' } },
    goals: { home: 1, away: 3 },
    status: 'FT'
  },
  {
    fixture: { id: 8, date: '2026-10-17T19:30:00+08:00', venue: 'Emirates Stadium', round: '2', league: 'Champions League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 496, name: 'Bayern Munich', logo: '' } },
    goals: { home: null, away: null },
    status: 'NS'
  },
  {
    fixture: { id: 9, date: '2026-10-20T23:00:00+08:00', venue: 'Emirates Stadium', round: '7', league: 'Premier League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 39, name: 'Tottenham', logo: '' } },
    goals: { home: null, away: null },
    status: 'NS'
  },
  {
    fixture: { id: 10, date: '2026-10-27T00:30:00+08:00', venue: 'Stamford Bridge', round: '8', league: 'Premier League' },
    teams: { home: { id: 49, name: 'Chelsea', logo: '' }, away: { id: ARSENAL_ID, name: 'Arsenal', logo: '' } },
    goals: { home: null, away: null },
    status: 'NS'
  },
  {
    fixture: { id: 11, date: '2026-11-02T22:00:00+08:00', venue: 'Emirates Stadium', round: '3', league: 'Champions League' },
    teams: { home: { id: ARSENAL_ID, name: 'Arsenal', logo: '' }, away: { id: 503, name: 'PSG', logo: '' } },
    goals: { home: null, away: null },
    status: 'NS'
  },
  {
    fixture: { id: 12, date: '2026-11-06T23:00:00+08:00', venue: 'Etihad Stadium', round: '9', league: 'Premier League' },
    teams: { home: { id: 50, name: 'Man City', logo: '' }, away: { id: ARSENAL_ID, name: 'Arsenal', logo: '' } },
    goals: { home: null, away: null },
    status: 'NS'
  }
]

export const mockStandings: StandingRow[] = [
  { position: 1, team: { id: ARSENAL_ID, name: 'Arsenal' }, played: 7, won: 5, drawn: 2, lost: 0, goalsFor: 16, goalsAgainst: 6, goalDifference: 10, points: 17, form: 'WWWDW' },
  { position: 2, team: { id: 50, name: 'Man City' }, played: 7, won: 5, drawn: 2, lost: 0, goalsFor: 18, goalsAgainst: 7, goalDifference: 11, points: 17, form: 'WWDWW' },
  { position: 3, team: { id: 40, name: 'Liverpool' }, played: 7, won: 5, drawn: 1, lost: 1, goalsFor: 15, goalsAgainst: 7, goalDifference: 8, points: 16, form: 'WWDWL' },
  { position: 4, team: { id: 33, name: 'Man United' }, played: 7, won: 4, drawn: 1, lost: 2, goalsFor: 12, goalsAgainst: 10, goalDifference: 2, points: 13, form: 'WLWWL' },
  { position: 5, team: { id: 49, name: 'Chelsea' }, played: 7, won: 3, drawn: 3, lost: 1, goalsFor: 11, goalsAgainst: 8, goalDifference: 3, points: 12, form: 'DDWWD' },
  { position: 6, team: { id: 34, name: 'Newcastle' }, played: 7, won: 3, drawn: 2, lost: 2, goalsFor: 10, goalsAgainst: 9, goalDifference: 1, points: 11, form: 'LDWWD' },
  { position: 7, team: { id: 67, name: 'Aston Villa' }, played: 7, won: 3, drawn: 2, lost: 2, goalsFor: 9, goalsAgainst: 9, goalDifference: 0, points: 11, form: 'DWLDW' },
  { position: 8, team: { id: 79, name: 'Brighton' }, played: 7, won: 2, drawn: 4, lost: 1, goalsFor: 8, goalsAgainst: 7, goalDifference: 1, points: 10, form: 'DDWDL' },
  { position: 9, team: { id: 51, name: 'Tottenham' }, played: 7, won: 3, drawn: 1, lost: 3, goalsFor: 11, goalsAgainst: 12, goalDifference: -1, points: 10, form: 'LWLLW' },
  { position: 10, team: { id: 76, name: 'Wolves' }, played: 7, won: 2, drawn: 2, lost: 3, goalsFor: 7, goalsAgainst: 10, goalDifference: -3, points: 8, form: 'LLDWL' },
  { position: 11, team: { id: 35, name: 'Everton' }, played: 7, won: 2, drawn: 2, lost: 3, goalsFor: 6, goalsAgainst: 9, goalDifference: -3, points: 8, form: 'DLLWD' },
  { position: 12, team: { id: 36, name: 'Fulham' }, played: 7, won: 1, drawn: 4, lost: 2, goalsFor: 7, goalsAgainst: 8, goalDifference: -1, points: 7, form: 'DDDDL' },
  { position: 13, team: { id: 38, name: 'West Ham' }, played: 7, won: 2, drawn: 1, lost: 4, goalsFor: 8, goalsAgainst: 11, goalDifference: -3, points: 7, form: 'LLWLL' },
  { position: 14, team: { id: 41, name: 'Nottm Forest' }, played: 7, won: 1, drawn: 3, lost: 3, goalsFor: 6, goalsAgainst: 8, goalDifference: -2, points: 6, form: 'LDLDW' },
  { position: 15, team: { id: 42, name: 'Crystal Palace' }, played: 7, won: 1, drawn: 3, lost: 3, goalsFor: 5, goalsAgainst: 8, goalDifference: -3, points: 6, form: 'LDLDL' },
  { position: 16, team: { id: 57, name: 'Bournemouth' }, played: 7, won: 1, drawn: 2, lost: 4, goalsFor: 6, goalsAgainst: 10, goalDifference: -4, points: 5, form: 'LLLDW' },
  { position: 17, team: { id: 48, name: 'Leicester' }, played: 7, won: 1, drawn: 2, lost: 4, goalsFor: 5, goalsAgainst: 11, goalDifference: -6, points: 5, form: 'LLDLD' },
  { position: 18, team: { id: 77, name: 'Ipswich' }, played: 7, won: 1, drawn: 1, lost: 5, goalsFor: 4, goalsAgainst: 12, goalDifference: -8, points: 4, form: 'LLLDL' },
  { position: 19, team: { id: 78, name: 'Southampton' }, played: 7, won: 0, drawn: 3, lost: 4, goalsFor: 5, goalsAgainst: 10, goalDifference: -5, points: 3, form: 'LDLDL' },
  { position: 20, team: { id: 80, name: 'Brentford' }, played: 7, won: 0, drawn: 2, lost: 5, goalsFor: 4, goalsAgainst: 13, goalDifference: -9, points: 2, form: 'LLLDL' }
]

export const ARSENAL_TEAM_ID = ARSENAL_ID
