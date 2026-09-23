<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

const props = defineProps<{
  match: any
  showDate?: boolean
  compact?: boolean
}>()

const { t, locale } = useI18n()

const isArsenalHome = computed(() =>
  ARSENAL_IDS.includes(props.match?.teams?.home?.id)
)

const result = computed(() => {
  if (!props.match || !props.match.goals) return null
  const homeGoals = props.match.goals.home
  const awayGoals = props.match.goals.away
  if (homeGoals === null || awayGoals === null) return null

  const arsenalGoals = isArsenalHome.value ? homeGoals : awayGoals
  const oppGoals = isArsenalHome.value ? awayGoals : homeGoals

  if (arsenalGoals > oppGoals) return 'win'
  if (arsenalGoals < oppGoals) return 'loss'
  return 'draw'
})

const matchStatus = computed(() => {
  const status = props.match?.fixture?.status?.short || props.match?.status || 'NS'
  return status
})

const isFinished = computed(() => {
  return ['FT', 'AET', 'PEN'].includes(matchStatus.value)
})

const dateLabel = computed(() => {
  const date = props.match?.fixture?.date
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const leagueLabel = computed(() => {
  const league = props.match?.league
  if (!league) return ''
  const name = typeof league === 'string' ? league : league.name
  if (!name) return ''
  const map: Record<string, string> = {
    'Premier League': locale.value === 'zh' ? t('fixtures.premierLeague') : name,
    'Champions League': locale.value === 'zh' ? t('fixtures.championsLeague') : name
  }
  return map[name] || name
})

const roundLabel = computed(() => {
  const round = props.match?.league?.round || props.match?.fixture?.round
  if (!round) return ''
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
</script>

<template>
  <NuxtLink
    :to="`/fixture/${match.fixture.id}`"
    class="block group"
  >
    <div
      class="relative bg-white border border-arsenal-line rounded-xl transition-all duration-200 group-hover:border-gray-300 group-hover:shadow-card-hover overflow-hidden"
      :class="compact ? 'px-4 py-3' : 'px-5 py-4'"
    >
      <!-- Result indicator (left bar) -->
      <div
        v-if="isFinished && result"
        class="absolute left-0 top-0 bottom-0 w-1"
        :class="{
          'bg-green-500': result === 'win',
          'bg-gray-300': result === 'draw',
          'bg-red-400': result === 'loss'
        }"
      />

      <div class="flex items-center gap-4">
        <!-- Date / Status (left side) -->
        <div class="w-16 sm:w-20 flex-shrink-0 text-center">
          <div v-if="isFinished" class="text-xs font-medium text-arsenal-muted mb-1">
            {{ t('fixture.finished') }}
          </div>
          <div v-else class="text-xs font-medium text-arsenal-red mb-1">
            {{ matchStatus === 'LIVE' ? t('fixture.live') : t('fixture.upcoming') }}
          </div>
          <div class="text-xs text-arsenal-subtle tabular">
            {{ dateLabel }}
          </div>
        </div>

        <!-- Teams & Score -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <!-- Home team -->
            <div class="flex items-center gap-2.5 flex-1 min-w-0">
              <img
                v-if="match.teams?.home?.logo"
                :src="match.teams.home.logo"
                :alt="match.teams.home.name"
                class="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 object-contain"
                loading="lazy"
              />
              <span
                class="text-sm font-medium truncate"
                :class="isArsenalHome ? 'text-arsenal-ink' : 'text-arsenal-ink2'"
              >
                {{ match.teams?.home?.name }}
              </span>
            </div>

            <!-- Score -->
            <div class="flex-shrink-0 px-3">
              <span
                v-if="match.goals?.home !== null && match.goals?.home !== undefined"
                class="text-lg font-bold tabular-nums"
                :class="isFinished ? 'text-arsenal-ink' : 'text-arsenal-muted'"
              >
                {{ match.goals.home }} - {{ match.goals.away }}
              </span>
              <span v-else class="text-sm text-arsenal-subtle font-medium">
                VS
              </span>
            </div>

            <!-- Away team -->
            <div class="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
              <span
                class="text-sm font-medium truncate text-right"
                :class="!isArsenalHome ? 'text-arsenal-ink' : 'text-arsenal-ink2'"
              >
                {{ match.teams?.away?.name }}
              </span>
              <img
                v-if="match.teams?.away?.logo"
                :src="match.teams.away.logo"
                :alt="match.teams.away.name"
                class="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <!-- League / Round (right side, desktop only) -->
        <div class="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 w-24">
          <span v-if="leagueLabel" class="text-xs text-arsenal-muted">
            {{ leagueLabel }}
          </span>
          <span v-if="roundLabel" class="text-xs text-arsenal-subtle">
            {{ roundLabel }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
