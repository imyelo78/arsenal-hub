<script setup lang="ts">
import { ARSENAL_IDS, LIVE_SOURCES } from '~/utils/constants'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useFetch(() => `/api/fixture/${route.params.id}`)

const match = computed(() => data.value?.response || null)

const isArsenalHome = computed(() =>
  ARSENAL_IDS.includes(match.value?.teams?.home?.id)
)

const matchDateLabel = computed(() => {
  if (!match.value?.fixture?.date) return ''
  const d = new Date(match.value.fixture.date)
  return d.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long'
  })
})

const isFinished = computed(() => {
  const s = match.value?.fixture?.status?.short || match.value?.status
  return ['FT', 'AET', 'PEN'].includes(s)
})

const isCl = computed(() => match.value?.league?.id === 2001)

const liveSources = computed(() => {
  const id = match.value?.league?.id
  if (id === undefined || id === null) return []
  return LIVE_SOURCES[id] || []
})

const matchStageLabel = computed(() => {
  const stage = match.value?.fixture?.stage
  if (!stage) return ''
  if (stage === 'LEAGUE_STAGE') return locale.value === 'zh' ? '联赛阶段' : 'League Stage'
  return stage.replace(/_/g, ' ')
})

const result = computed(() => {
  if (!isFinished.value || !match.value?.goals) return null
  const arsenalGoals = isArsenalHome.value
    ? match.value.goals.home
    : match.value.goals.away
  const oppGoals = isArsenalHome.value
    ? match.value.goals.away
    : match.value.goals.home
  if (arsenalGoals > oppGoals) return 'win'
  if (arsenalGoals < oppGoals) return 'loss'
  return 'draw'
})

const roundLabel = computed(() => {
  const round = match.value?.league?.round || match.value?.fixture?.round
  if (!round) return ''
  if (match.value?.league?.id === 2001) {
    if (round === 'LEAGUE_STAGE') return locale.value === 'zh' ? '联赛阶段' : 'League Stage'
    return String(round).replace(/_/g, ' ')
  }
  if (typeof round === 'string' && round.startsWith('Regular Season - ')) {
    return locale.value === 'zh' ? `第${round.replace('Regular Season - ', '')}轮` : `GW ${round.replace('Regular Season - ', '')}`
  }
  if (typeof round === 'string' && round.startsWith('Gameweek ')) {
    return locale.value === 'zh' ? `第${round.replace('Gameweek ', '')}轮` : `GW ${round.replace('Gameweek ', '')}`
  }
  return round
})

const h2h = computed(() => {
  const h = match.value?.fixture?.h2h
  if (!h || !h.total) return null
  // h2h.wins.{home,draw,away} 以本场主队视角统计
  return h
})

const h2hText = computed(() => {
  const h = h2h.value
  if (!h) return ''
  if (locale.value === 'zh') {
    return `${t('fixture.h2hHeading')} 两队近${h.total}次交手:${h.wins.home}${t('fixture.h2hWin')} ${h.wins.draw}${t('fixture.h2hDraw')} ${h.wins.away}${t('fixture.h2hLoss')}`
  }
  return `H2H (last ${h.total}): ${h.wins.home}W ${h.wins.draw}D ${h.wins.away}L`
})

const isArsenalMatchName = (name: string) => /Arsenal/i.test(name)

const h2hOutcomeClass = (m: any) => {
  if (m.hs === null || m.as === null) return 'tag-gray'
  const arsenalHome = isArsenalMatchName(m.home)
  const ah = arsenalHome ? m.hs : m.as
  const aa = arsenalHome ? m.as : m.hs
  if (ah > aa) return 'tag-green'
  if (ah < aa) return 'tag-red'
  return 'tag-gray'
}

const h2hOutcomeText = (m: any) => {
  if (m.hs === null || m.as === null) return (locale.value === 'zh' ? '未赛' : '-')
  const arsenalHome = isArsenalMatchName(m.home)
  const ah = arsenalHome ? m.hs : m.as
  const aa = arsenalHome ? m.as : m.hs
  if (ah > aa) return locale.value === 'zh' ? '胜' : 'W'
  if (ah < aa) return locale.value === 'zh' ? '负' : 'L'
  return locale.value === 'zh' ? '平' : 'D'
}

const matchStatusLabel = computed(() => {
  const s = match.value?.fixture?.status?.short || match.value?.status
  if (!s) return ''
  const map: Record<string, string> = {
    TBD: locale.value === 'zh' ? '时间待定' : 'TBD',
    NS: locale.value === 'zh' ? '未开始' : 'Not Started',
    '1H': locale.value === 'zh' ? '上半场' : '1st Half',
    HT: locale.value === 'zh' ? '中场' : 'Half Time',
    '2H': locale.value === 'zh' ? '下半场' : '2nd Half',
    ET: locale.value === 'zh' ? '加时赛' : 'Extra Time',
    BT: locale.value === 'zh' ? '加时中场' : 'Break Time',
    P: locale.value === 'zh' ? '点球大战' : 'Penalties',
    SUSP: locale.value === 'zh' ? '中断' : 'Suspended',
    INT: locale.value === 'zh' ? '中断' : 'Interrupted',
    FT: locale.value === 'zh' ? '已结束' : 'Full Time',
    AET: locale.value === 'zh' ? '加时结束' : 'After Extra Time',
    PEN: locale.value === 'zh' ? '点球结束' : 'After Penalties',
    LIVE: locale.value === 'zh' ? '直播中' : 'LIVE'
  }
  return map[s] || s
})
</script>

<template>
  <div class="page-enter">
    <!-- Back link -->
    <NuxtLink
      :to="localePath('/fixtures')"
      class="inline-flex items-center gap-1 text-sm text-arsenal-muted hover:text-arsenal-ink transition-colors mb-6"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t('fixtures.title') }}
    </NuxtLink>

    <!-- Loading -->
    <div v-if="pending" class="py-16">
      <div class="animate-pulse space-y-8">
        <div class="h-12 bg-arsenal-line2 rounded w-48 mx-auto" />
        <div class="h-20 bg-arsenal-line2 rounded-xl" />
        <div class="h-32 bg-arsenal-line2 rounded-xl" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error">
      <EmptyState icon="📭" :message="t('common.noData')" />
      <div class="text-center">
        <NuxtLink :to="localePath('/fixtures')" class="btn-primary mt-4 inline-block">
          {{ t('fixtures.title') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Match Detail -->
    <div v-else-if="match" class="space-y-8">
      <!-- Match header card -->
      <div class="bg-white border border-arsenal-line rounded-2xl p-6 sm:p-8">
        <!-- League & status -->
        <div class="flex items-center justify-center gap-3 mb-6">
          <span
            class="tag"
            :class="result === 'win' ? 'tag-green' : result === 'loss' ? 'tag-red' : 'tag-gray'"
          >
            {{ result === 'win' ? (locale === 'zh' ? '胜' : 'W') : result === 'loss' ? (locale === 'zh' ? '负' : 'L') : (locale === 'zh' ? '平' : 'D') }}
          </span>
          <span class="text-xs text-arsenal-muted">{{ match.league?.name }}</span>
          <span v-if="isCl && matchStageLabel" class="text-xs text-arsenal-subtle">· {{ matchStageLabel }}</span>
          <span v-if="match.league?.round" class="text-xs text-arsenal-subtle">· {{ roundLabel }}</span>
        </div>

        <!-- Teams & Score -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <!-- Home -->
          <div class="flex-1 text-center">
            <img
              v-if="match.teams?.home?.logo"
              :src="match.teams.home.logo"
              :alt="match.teams.home.name"
              class="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h2 class="text-lg sm:text-xl font-bold text-arsenal-ink">{{ match.teams?.home?.name }}</h2>
            <div v-if="isArsenalHome" class="text-xs text-arsenal-red mt-1 font-medium">
              {{ t('common.home') }}
            </div>
          </div>

          <!-- Score -->
          <div class="flex-shrink-0 px-4 sm:px-8 text-center">
            <div v-if="isFinished" class="text-4xl sm:text-5xl font-black text-arsenal-ink tabular-nums tracking-tight">
              {{ match.goals?.home ?? 0 }} - {{ match.goals?.away ?? 0 }}
            </div>
            <div v-else class="text-lg font-medium text-arsenal-muted">
              {{ t('fixture.upcoming') }}
            </div>
            <div class="text-xs text-arsenal-subtle mt-2">
              {{ matchStatusLabel }}
            </div>
            <div
              v-if="isFinished && isCl && match.fixture?.halfTime && (match.fixture.halfTime.home !== null || match.fixture.halfTime.away !== null)"
              class="text-xs text-arsenal-subtle mt-1"
            >
              {{ t('fixture.halfTime') }} {{ match.fixture.halfTime.home ?? '-' }} - {{ match.fixture.halfTime.away ?? '-' }}
            </div>
          </div>

          <!-- Away -->
          <div class="flex-1 text-center">
            <img
              v-if="match.teams?.away?.logo"
              :src="match.teams.away.logo"
              :alt="match.teams.away.name"
              class="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h2 class="text-lg sm:text-xl font-bold text-arsenal-ink">{{ match.teams?.away?.name }}</h2>
            <div v-if="!isArsenalHome" class="text-xs text-arsenal-red mt-1 font-medium">
              {{ t('common.home') }}
            </div>
          </div>
        </div>

        <!-- Date & venue -->
        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-arsenal-muted">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ matchDateLabel }}</span>
          </div>
          <div v-if="match.fixture?.venue?.name" class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ match.fixture.venue.name }}</span>
          </div>
          <div v-if="match.fixture?.referee" class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ t('fixture.referee') }}: {{ match.fixture.referee }}</span>
          </div>
        </div>
      </div>

      <!-- Watch live -->
      <div
        v-if="!isFinished && liveSources.length"
        class="bg-white border border-arsenal-line rounded-2xl p-6"
      >
        <h3 class="text-base font-bold text-arsenal-ink mb-3">{{ t('fixture.watchLive') }}</h3>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="(src, i) in liveSources"
            :key="i"
            :href="src.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-arsenal-red text-white text-sm font-medium hover:bg-arsenal-red-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>{{ locale === 'zh' ? src.zhName : src.name }}</span>
          </a>
        </div>
        <p class="text-xs text-arsenal-subtle mt-3">{{ t('fixture.liveDisclaimer') }}</p>
      </div>

      <!-- Head to head -->
      <div
        v-if="isCl && h2h"
        class="bg-white border border-arsenal-line rounded-2xl p-6"
      >
        <h3 class="text-base font-bold text-arsenal-ink mb-2">{{ t('fixture.h2hHeading') }}</h3>
        <p class="text-sm text-arsenal-muted mb-4">{{ h2hText }}</p>

        <ul class="space-y-2">
          <li
            v-for="(m, i) in h2h.matches"
            :key="i"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="tag" :class="h2hOutcomeClass(m)">{{ h2hOutcomeText(m) }}</span>
              <span class="text-xs text-arsenal-subtle whitespace-nowrap">{{ m.date }}</span>
              <span class="truncate text-arsenal-ink2">
                {{ m.home }} {{ m.hs ?? '-' }} - {{ m.as ?? '-' }} {{ m.away }}
              </span>
            </div>
            <span v-if="m.comp" class="text-xs text-arsenal-subtle whitespace-nowrap">{{ m.comp }}</span>
          </li>
        </ul>
      </div>

      <!-- Goalscorers -->
      <div v-if="isFinished" class="bg-white border border-arsenal-line rounded-2xl p-6">
        <h3 class="text-base font-bold text-arsenal-ink mb-5">{{ t('fixture.goalscorers') }}</h3>

        <div v-if="match.stats?.goals_scored" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Home -->
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-arsenal-ink2 truncate">{{ match.teams?.home?.name }}</span>
              <span class="text-arsenal-red font-bold tabular-nums text-lg">{{ match.stats.goals_scored.home?.length || 0 }}</span>
            </div>
            <ul class="space-y-2">
              <li
                v-for="(g, gi) in match.stats.goals_scored.home"
                :key="gi"
                class="flex items-center gap-2 text-sm text-arsenal-ink2"
              >
                <span class="inline-block w-2 h-2 rounded-full bg-arsenal-red shrink-0" />
                <span class="font-medium">{{ g.name }}</span>
                <template v-if="g.value > 1">
                  <span class="text-xs text-arsenal-subtle">×{{ g.value }}</span>
                </template>
              </li>
              <li v-if="!match.stats.goals_scored.home?.length" class="text-sm text-arsenal-subtle">—</li>
            </ul>
            <p
              v-if="match.stats.assists?.home?.length"
              class="text-xs text-arsenal-subtle pt-2 border-t border-arsenal-line"
            >
              {{ t('fixture.assists') }}:
              <template v-for="(a, ai) in match.stats.assists.home" :key="ai">
                {{ a.name }}<template v-if="a.value > 1"> ×{{ a.value }}</template><template v-if="ai < match.stats.assists.home.length - 1">, </template>
              </template>
            </p>
          </div>

          <!-- Away -->
          <div class="space-y-3 sm:border-l sm:border-arsenal-line sm:pl-6">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-arsenal-ink2 truncate">{{ match.teams?.away?.name }}</span>
              <span class="text-arsenal-red font-bold tabular-nums text-lg">{{ match.stats.goals_scored.away?.length || 0 }}</span>
            </div>
            <ul class="space-y-2">
              <li
                v-for="(g, gi) in match.stats.goals_scored.away"
                :key="gi"
                class="flex items-center gap-2 text-sm text-arsenal-ink2"
              >
                <span class="inline-block w-2 h-2 rounded-full bg-white border border-arsenal-ink3 shrink-0" />
                <span class="font-medium">{{ g.name }}</span>
                <template v-if="g.value > 1">
                  <span class="text-xs text-arsenal-subtle">×{{ g.value }}</span>
                </template>
              </li>
              <li v-if="!match.stats.goals_scored.away?.length" class="text-sm text-arsenal-subtle">—</li>
            </ul>
            <p
              v-if="match.stats.assists?.away?.length"
              class="text-xs text-arsenal-subtle pt-2 border-t border-arsenal-line"
            >
              {{ t('fixture.assists') }}:
              <template v-for="(a, ai) in match.stats.assists.away" :key="ai">
                {{ a.name }}<template v-if="a.value > 1"> ×{{ a.value }}</template><template v-if="ai < match.stats.assists.away.length - 1">, </template>
              </template>
            </p>
          </div>
        </div>

        <p v-else class="text-sm text-arsenal-muted text-center py-4">
          {{ t('fixture.noScorerData') }}
        </p>
      </div>

      <!-- Match stats -->
      <div v-if="isFinished && match.stats" class="bg-white border border-arsenal-line rounded-2xl p-6">
        <h3 class="text-base font-bold text-arsenal-ink mb-5">{{ t('fixture.matchStats') || 'Match Stats' }}</h3>

        <div class="space-y-4">
          <!-- Saves -->
          <div class="flex items-center gap-4">
            <div class="flex-1 text-right font-medium text-arsenal-ink2 tabular">
              {{ match.stats.saves?.home?.reduce((s: number, x: any) => s + x.value, 0) || 0 }}
            </div>
            <div class="w-24 text-center text-xs text-arsenal-muted uppercase tracking-wider">
              {{ t('fixture.saves') || 'Saves' }}
            </div>
            <div class="flex-1 text-left font-medium text-arsenal-ink2 tabular">
              {{ match.stats.saves?.away?.reduce((s: number, x: any) => s + x.value, 0) || 0 }}
            </div>
          </div>

          <!-- Yellow cards -->
          <div class="flex items-center gap-4">
            <div class="flex-1 text-right font-medium text-arsenal-ink2 tabular">
              {{ match.stats.yellow_cards?.home?.length || 0 }}
            </div>
            <div class="w-24 text-center text-xs text-arsenal-muted uppercase tracking-wider">
              {{ t('fixture.yellowCards') || 'Yellow' }}
            </div>
            <div class="flex-1 text-left font-medium text-arsenal-ink2 tabular">
              {{ match.stats.yellow_cards?.away?.length || 0 }}
            </div>
          </div>

          <!-- Bonus points -->
          <div class="flex items-center gap-4">
            <div class="flex-1 text-right font-medium text-arsenal-ink2 tabular">
              {{ match.stats.bonus?.home?.reduce((s: number, x: any) => s + x.value, 0) || 0 }}
            </div>
            <div class="w-24 text-center text-xs text-arsenal-muted uppercase tracking-wider">
              {{ t('fixture.bonus') || 'Bonus' }}
            </div>
            <div class="flex-1 text-left font-medium text-arsenal-ink2 tabular">
              {{ match.stats.bonus?.away?.reduce((s: number, x: any) => s + x.value, 0) || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Back button -->
      <div class="text-center">
        <NuxtLink :to="localePath('/fixtures')" class="btn-outline inline-flex">
          {{ t('fixture.backToList') || 'Back to fixtures' }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
