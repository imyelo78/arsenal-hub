<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: nextMatchData } = await useFetch('/api/next-match')
const { data: lastResultsData } = await useFetch('/api/last-results')
const { data: clStandingsData } = await useFetch('/api/standings?comp=cl')

const nextMatch = computed(() => nextMatchData.value?.nextMatch || null)
const recentResults = computed(() => lastResultsData.value?.results || [])
const clStandings = computed(() => clStandingsData.value?.response || [])
const arsenalCl = computed(() =>
  clStandings.value.find((r: any) => ARSENAL_IDS.includes(r.team.id)) || null
)

// ===== Countdown =====
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: ReturnType<typeof setInterval> | null = null

const matchDate = computed(() => {
  if (!nextMatch.value) return null
  return new Date(nextMatch.value.fixture.date)
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function updateCountdown() {
  if (!matchDate.value) return
  const diff = matchDate.value.getTime() - Date.now()
  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (timer) clearInterval(timer)
    return
  }
  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  }
}

// ===== Reveal on scroll =====
let io: IntersectionObserver | null = null

function setupReveal() {
  if (typeof IntersectionObserver === 'undefined') return
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        io?.unobserve(e.target)
      }
    })
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach((el) => io!.observe(el))
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
  setupReveal()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  io?.disconnect()
})

// ===== Labels =====
const loc = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

const homeTeam = computed(() => nextMatch.value?.teams?.home || null)
const awayTeam = computed(() => nextMatch.value?.teams?.away || null)
const matchDateLabel = computed(() => {
  if (!matchDate.value) return ''
  return matchDate.value.toLocaleString(loc.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
const matchdayLabel = computed(() => {
  const round = nextMatch.value?.league?.round || nextMatch.value?.fixture?.round
  if (!round) return ''
  if (nextMatch.value?.league?.id === 2001) {
    if (round === 'LEAGUE_STAGE') return locale.value === 'zh' ? '欧冠·联赛阶段' : 'UCL · League Stage'
    return `${locale.value === 'zh' ? '欧冠' : 'UCL'} · ${String(round).replace(/_/g, ' ')}`
  }
  if (typeof round === 'string' && round.startsWith('Regular Season - ')) {
    const n = round.replace('Regular Season - ', '')
    return locale.value === 'zh' ? `第${n}轮` : `GW ${n}`
  }
  if (typeof round === 'string' && round.startsWith('Gameweek ')) {
    const n = round.replace('Gameweek ', '')
    return locale.value === 'zh' ? `第${n}轮` : `GW ${n}`
  }
  return round
})

function dayLabel(d: Date) {
  return d.toLocaleDateString(loc.value, { month: 'long', day: 'numeric' })
}
function subLabel(d: Date) {
  return d.toLocaleString(loc.value, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

// ===== Result rows (arsenal perspective) =====
const resultRows = computed(() =>
  recentResults.value.map((m: any) => {
    const isHome = ARSENAL_IDS.includes(m.teams?.home?.id)
    const us = (isHome ? m.goals?.home : m.goals?.away) ?? 0
    const them = (isHome ? m.goals?.away : m.goals?.home) ?? 0
    const outcome = us > them ? 'W' : us === them ? 'D' : 'L'
    return { id: String(m.fixture?.id), m, outcome }
  })
)

function outcomeTag(o: string) {
  return o === 'W' ? t('common.won') : o === 'D' ? t('common.drawn') : t('common.lost')
}

// ===== UCL =====
const uclPlayed = computed(() => arsenalCl.value?.all?.played ?? 0)
const uclGoals = computed(
  () => `${arsenalCl.value?.all?.goals?.for ?? 0}:${arsenalCl.value?.all?.goals?.against ?? 0}`
)
const uclNote = computed(() =>
  (arsenalCl.value?.rank ?? 99) <= 8 ? t('home.uclTop8') : t('home.uclBehind')
)
const isNextUcl = computed(() => nextMatch.value?.league?.id === 2001)

// ===== Quick links =====
const quickLinks = computed(() => [
  { to: '/fixtures', icon: 'cal', title: t('nav.fixtures'), desc: t('home.quickFixturesDesc') },
  { to: '/standings', icon: 'chart', title: t('nav.standings'), desc: t('home.quickStandingsDesc') },
  { to: '/squad', icon: 'team', title: t('nav.squad'), desc: t('home.quickSquadDesc') },
  { to: '/legends', icon: 'trophy', title: t('nav.legends'), desc: t('home.quickLegendsDesc') }
])
</script>

<template>
  <div>
    <!-- ===== Hero ===== -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-mask"></div>
      <div class="hero-word">MATCHDAY</div>
      <div class="hero-content">
        <div class="hero-tag">
          <i></i>{{ t('home.nextMatch') }}<template v-if="matchDateLabel"> · {{ matchDateLabel }}</template>
        </div>

        <div v-if="homeTeam && awayTeam" class="hero-teams">
          <div class="hero-team">
            <img v-if="homeTeam.logo" :src="homeTeam.logo" :alt="homeTeam.name" />
            <span>{{ homeTeam.name }}</span>
          </div>
          <div class="hero-vs">VS</div>
          <div class="hero-team">
            <img v-if="awayTeam.logo" :src="awayTeam.logo" :alt="awayTeam.name" />
            <span>{{ awayTeam.name }}</span>
          </div>
        </div>

        <div v-if="matchdayLabel" class="hero-round">{{ matchdayLabel }}</div>

        <div v-if="matchDate && matchDate.getTime() > Date.now()" class="hero-count">
          <div class="hc-item">
            <div class="hc-num">{{ pad(countdown.days) }}</div>
            <div class="hc-label">{{ t('home.days') }}</div>
          </div>
          <div class="hc-colon">:</div>
          <div class="hc-item">
            <div class="hc-num">{{ pad(countdown.hours) }}</div>
            <div class="hc-label">{{ t('home.hours') }}</div>
          </div>
          <div class="hc-colon">:</div>
          <div class="hc-item">
            <div class="hc-num">{{ pad(countdown.minutes) }}</div>
            <div class="hc-label">{{ t('home.minutes') }}</div>
          </div>
          <div class="hc-colon">:</div>
          <div class="hc-item">
            <div class="hc-num">{{ pad(countdown.seconds) }}</div>
            <div class="hc-label">{{ t('home.seconds') }}</div>
          </div>
        </div>

        <div class="hero-cta">
          <NuxtLink :to="localePath('/fixtures')" class="btn-red">{{ t('home.viewAllFixtures') }}</NuxtLink>
          <NuxtLink :to="localePath('/watch')" class="btn-glass">{{ t('nav.watch') }}</NuxtLink>
        </div>
      </div>
      <div class="hero-scroll">SCROLL</div>
    </section>

    <!-- ===== Recent Results ===== -->
    <section class="section results">
      <div class="shell-wide">
        <div class="sec-head reveal">
          <div class="sec-title">
            <div>
              <h2>{{ t('home.recentResults') }}</h2>
              <small>{{ t('home.resultsSub') }}</small>
            </div>
          </div>
          <NuxtLink :to="localePath('/fixtures')" class="sec-more">{{ t('home.viewAllFixtures') }} →</NuxtLink>
        </div>

        <div v-if="resultRows.length" class="result-list">
          <div
            v-for="row in resultRows"
            :key="row.id"
            class="result-row reveal"
            :style="{ '--bar': row.outcome === 'W' ? '#22C55E' : row.outcome === 'D' ? '#F59E0B' : '#EF4444' }"
          >
            <div class="result-date">
              <b>{{ dayLabel(new Date(row.m.fixture.date)) }}</b>
              {{ subLabel(new Date(row.m.fixture.date)) }}
            </div>
            <div class="result-teams">
              <img v-if="row.m.teams.home.logo" :src="row.m.teams.home.logo" :alt="row.m.teams.home.name" />
              <span class="name">{{ row.m.teams.home.name }}</span>
              <span class="vsmark">VS</span>
              <img v-if="row.m.teams.away.logo" :src="row.m.teams.away.logo" :alt="row.m.teams.away.name" />
              <span class="name">{{ row.m.teams.away.name }}</span>
            </div>
            <div class="result-score">{{ row.m.goals.home }}<em>:</em>{{ row.m.goals.away }}</div>
            <div>
              <span class="result-tag" :data-outcome="row.outcome">{{ outcomeTag(row.outcome) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="results-empty">{{ t('common.noData') }}</p>
      </div>
    </section>

    <!-- ===== Atmosphere ===== -->
    <section class="atmo">
      <div class="atmo-inner">
        <div class="atmo-kicker reveal">North London Is Red</div>
        <h2 class="reveal">We Are<br />The Gunners</h2>
        <p class="reveal">{{ t('home.atmoDesc') }}</p>
      </div>
    </section>

    <!-- ===== UCL ===== -->
    <section v-if="arsenalCl" class="section ucl">
      <div class="shell-wide">
        <div class="sec-head reveal">
          <div class="sec-title">
            <div>
              <h2>{{ t('home.uclTitle') }}</h2>
              <small>{{ t('home.uclSub') }}</small>
            </div>
          </div>
          <NuxtLink :to="localePath('/standings')" class="sec-more">{{ t('home.viewStandings') }} →</NuxtLink>
        </div>

        <div class="ucl-grid">
          <div class="card-dark ucl-card reveal">
            <div class="ucl-kicker">{{ t('home.uclKicker') }}</div>
            <div class="ucl-rank">
              <b>#{{ arsenalCl.rank }}</b>
              <span>{{ t('home.uclPlayed', { n: uclPlayed }) }}<br />{{ uclNote }}</span>
            </div>
            <div class="ucl-stats">
              <div class="ucl-stat"><b>{{ arsenalCl.all?.win ?? 0 }}</b><span>{{ t('common.won') }}</span></div>
              <div class="ucl-stat"><b>{{ arsenalCl.all?.draw ?? 0 }}</b><span>{{ t('common.drawn') }}</span></div>
              <div class="ucl-stat"><b>{{ arsenalCl.all?.lose ?? 0 }}</b><span>{{ t('common.lost') }}</span></div>
              <div class="ucl-stat"><b>{{ uclGoals }}</b><span>{{ t('common.goalsFor') }}/{{ t('common.goalsAgainst') }}</span></div>
              <div class="ucl-stat"><b>{{ arsenalCl.points }}</b><span>{{ t('common.points') }}</span></div>
            </div>
          </div>

          <div v-if="isNextUcl && homeTeam && awayTeam" class="card-dark ucl-card ucl-next reveal">
            <div class="ucl-kicker ucl-center">{{ t('home.uclNextKicker') }}</div>
            <div class="matchline">
              <img v-if="homeTeam.logo" :src="homeTeam.logo" :alt="homeTeam.name" />
              <span class="vs">VS</span>
              <img v-if="awayTeam.logo" :src="awayTeam.logo" :alt="awayTeam.name" />
            </div>
            <div class="ucl-when">
              <b>{{ matchDateLabel }}</b><br />{{ matchdayLabel }}
            </div>
            <div class="ucl-cta">
              <NuxtLink :to="localePath('/fixtures')" class="btn-red">{{ t('home.goFixtures') }}</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Quick Links ===== -->
    <section class="section quick">
      <div class="shell-wide">
        <div class="sec-head reveal">
          <div class="sec-title">
            <div>
              <h2>{{ t('home.quickLinks') }}</h2>
              <small>QUICK LINKS</small>
            </div>
          </div>
        </div>
        <div class="quick-grid">
          <NuxtLink v-for="q in quickLinks" :key="q.to" :to="localePath(q.to)" class="quick-card reveal">
            <div class="quick-icon">
              <svg v-if="q.icon === 'cal'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <svg v-else-if="q.icon === 'chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M3 12h18M3 18h18" /><circle cx="8" cy="6" r="1.6" fill="currentColor" stroke="none" />
              </svg>
              <svg v-else-if="q.icon === 'team'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM3 21a9 9 0 0 1 18 0" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4zM7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5" />
              </svg>
            </div>
            <h3>{{ q.title }}</h3>
            <p>{{ q.desc }}</p>
            <span class="arrow">{{ t('home.viewMore') }} →</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ===== Hero ===== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0a0a0e;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: url('/images/hero-stadium.jpg') center 30% / cover no-repeat;
  animation: heroZoom 18s ease-out forwards;
}
@keyframes heroZoom {
  from { transform: scale(1.08); }
  to { transform: scale(1); }
}
.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 10, 14, 0.62) 0%, rgba(10, 10, 14, 0.3) 42%, rgba(10, 10, 14, 0.55) 74%, #0a0a0e 100%);
}
.hero-word {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: clamp(120px, 22vw, 340px);
  letter-spacing: 0.04em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}
.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 140px 48px 96px;
  text-align: center;
}
@media (max-width: 768px) {
  .hero-content { padding: 120px 20px 72px; }
}
.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
}
.hero-tag i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef0107;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.hero-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 6vw, 72px);
  margin-top: 40px;
}
.hero-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 160px;
}
.hero-team img {
  width: clamp(64px, 8vw, 96px);
  height: clamp(64px, 8vw, 96px);
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
}
.hero-team span {
  color: #fff;
  font-size: clamp(15px, 1.6vw, 19px);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.hero-vs {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 4vw, 48px);
  color: #ef0107;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 30px rgba(239, 1, 7, 0.45);
}
.hero-round {
  margin-top: 8px;
  color: #c9a24b;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
}
.hero-count {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(8px, 2vw, 20px);
  margin-top: 44px;
}
.hc-item { text-align: center; }
.hc-num {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: clamp(56px, 9vw, 116px);
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  text-shadow: 0 10px 50px rgba(0, 0, 0, 0.55);
}
.hc-label {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  letter-spacing: 0.3em;
}
.hc-colon {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: clamp(32px, 5vw, 64px);
  line-height: 1;
  color: #ef0107;
  padding-top: clamp(8px, 1.6vw, 20px);
  animation: blink 1s steps(2) infinite;
}
@keyframes blink {
  50% { opacity: 0.25; }
}
.hero-cta {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 52px;
  flex-wrap: wrap;
}
.hero-scroll {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
  letter-spacing: 0.3em;
  z-index: 2;
}

/* ===== Sections ===== */
.section { padding: 96px 0; }
@media (max-width: 768px) {
  .section { padding: 64px 0; }
}
.sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
}
.sec-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sec-title::before {
  content: '';
  width: 5px;
  height: 28px;
  background: #ef0107;
  border-radius: 4px;
  flex-shrink: 0;
}
.sec-title h2 {
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  margin: 0;
}
.sec-title small {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.06em;
}
.sec-more {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s;
}
.sec-more:hover { color: #ef0107; }

/* ===== Recent Results ===== */
.results { background: #fff; }
.result-list {
  display: grid;
  gap: 12px;
}
.results-empty {
  color: #6b7280;
  font-size: 14px;
}
.result-row {
  display: grid;
  grid-template-columns: 110px 1fr auto auto;
  align-items: center;
  gap: 24px;
  background: #f7f7f8;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px 28px;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
  position: relative;
  overflow: hidden;
}
.result-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--bar, #22c55e);
}
.result-row:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}
.result-date {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}
.result-date b {
  display: block;
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 600;
}
.result-teams {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.result-teams img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.result-teams .name {
  font-weight: 600;
  font-size: 15px;
  color: #1a1a1a;
}
.vsmark {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}
.result-score {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 32px;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: #1a1a1a;
  min-width: 120px;
  text-align: center;
}
.result-score em {
  font-style: normal;
  color: #9ca3af;
  padding: 0 10px;
  font-weight: 500;
}
.result-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
}
.result-tag[data-outcome='W'] { background: #f0fdf4; color: #15803d; }
.result-tag[data-outcome='D'] { background: #fffbeb; color: #b45309; }
.result-tag[data-outcome='L'] { background: #fef2f2; color: #b91c1c; }
@media (max-width: 860px) {
  .result-row {
    grid-template-columns: 1fr auto;
    row-gap: 10px;
    padding: 16px 20px;
  }
  .result-date { order: 1; }
  .result-row > div:last-child { order: 2; justify-self: end; }
  .result-teams { order: 3; }
  .result-score { order: 4; justify-self: end; min-width: 0; }
}

/* ===== Atmosphere ===== */
.atmo {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  background: url('/images/fans-stand.jpg') center / cover no-repeat fixed;
}
@media (max-width: 1024px) {
  .atmo { background-attachment: scroll; }
}
.atmo::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(10, 10, 14, 0.88) 0%, rgba(10, 10, 14, 0.55) 50%, rgba(10, 10, 14, 0.25) 100%);
}
.atmo-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 80px 48px;
}
@media (max-width: 768px) {
  .atmo-inner { padding: 64px 20px; }
}
.atmo-kicker {
  color: #c9a24b;
  font-size: 13px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-weight: 500;
}
.atmo h2 {
  margin: 18px 0 0;
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: clamp(44px, 7vw, 96px);
  line-height: 1.02;
  color: #fff;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.atmo p {
  margin-top: 20px;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  line-height: 1.8;
}

/* ===== UCL ===== */
.ucl {
  background: #0a0a0e;
  position: relative;
  overflow: hidden;
}
.ucl::before {
  content: '';
  position: absolute;
  width: 640px;
  height: 640px;
  border-radius: 50%;
  border: 1px solid rgba(201, 162, 75, 0.16);
  top: -280px;
  right: -180px;
  pointer-events: none;
}
.ucl::after {
  content: '';
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  border: 1px solid rgba(239, 1, 7, 0.14);
  bottom: -180px;
  left: -120px;
  pointer-events: none;
}
.ucl .sec-head {
  position: relative;
  z-index: 2;
}
.ucl .sec-title::before { background: #c9a24b; }
.ucl .sec-title h2 { color: #fff; }
.ucl .sec-title small { color: rgba(255, 255, 255, 0.5); }
.ucl .sec-more { color: rgba(255, 255, 255, 0.55); }
.ucl .sec-more:hover { color: #c9a24b; }
.ucl-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  position: relative;
  z-index: 2;
}
@media (max-width: 960px) {
  .ucl-grid { grid-template-columns: 1fr; }
}
.ucl-card { padding: 36px; }
@media (max-width: 768px) {
  .ucl-card { padding: 26px; }
}
.ucl-kicker {
  color: #c9a24b;
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-weight: 600;
}
.ucl-center { text-align: center; }
.ucl-rank {
  display: flex;
  align-items: baseline;
  gap: 18px;
  margin-top: 20px;
}
.ucl-rank b {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: clamp(72px, 8vw, 120px);
  line-height: 0.9;
  color: #fff;
}
.ucl-rank span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 15px;
  line-height: 1.7;
}
.ucl-stats {
  display: flex;
  margin-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
}
.ucl-stat { flex: 1; text-align: center; }
.ucl-stat + .ucl-stat { border-left: 1px solid rgba(255, 255, 255, 0.1); }
.ucl-stat b {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 30px;
  color: #fff;
}
.ucl-stat span {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  letter-spacing: 0.1em;
}
.ucl-next {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.matchline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin: 30px 0;
}
.matchline img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}
@media (max-width: 768px) {
  .matchline img { width: 56px; height: 56px; }
}
.matchline .vs {
  font-family: 'Oswald', 'Bahnschrift', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 26px;
  color: #c9a24b;
  letter-spacing: 0.1em;
}
.ucl-when {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.9;
}
.ucl-when b {
  color: #fff;
  font-size: 18px;
}
.ucl-cta {
  text-align: center;
  margin-top: 26px;
}
.ucl-cta .btn-red {
  padding: 12px 28px;
  font-size: 14px;
}

/* ===== Quick Links ===== */
.quick { background: #fff; }
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .quick-grid { grid-template-columns: 1fr; }
}
.quick-card {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 32px 28px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  background: #fff;
}
.quick-card::after {
  content: '';
  position: absolute;
  right: -40px;
  bottom: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 1, 7, 0.08), transparent 70%);
  transition: transform 0.3s;
}
.quick-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.09);
  border-color: rgba(239, 1, 7, 0.35);
}
.quick-card:hover::after { transform: scale(1.5); }
.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #ef0107;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(239, 1, 7, 0.3);
}
.quick-icon svg {
  width: 24px;
  height: 24px;
}
.quick-card h3 {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}
.quick-card p {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}
.quick-card .arrow {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ef0107;
  font-size: 13px;
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .hero-bg { animation: none; }
  .hero-tag i { animation: none; }
  .hc-colon { animation: none; }
}
</style>
