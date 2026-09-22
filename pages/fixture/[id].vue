<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

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
    <div v-else-if="error" class="text-center py-16">
      <p class="text-arsenal-muted">{{ t('common.noData') }}</p>
      <NuxtLink :to="localePath('/fixtures')" class="btn-primary mt-4 inline-block">
        {{ t('fixtures.title') }}
      </NuxtLink>
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
          <span v-if="match.league?.round" class="text-xs text-arsenal-subtle">· {{ match.league.round }}</span>
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
              {{ match.fixture?.status?.short || match.status }}
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
        </div>
      </div>

      <!-- Match events / stats -->
      <div v-if="isFinished" class="bg-white border border-arsenal-line rounded-2xl p-6">
        <h3 class="text-base font-bold text-arsenal-ink mb-5">{{ t('fixture.matchStats') || 'Match Stats' }}</h3>

        <div v-if="match.stats" class="space-y-4">
          <!-- Goals -->
          <div class="flex items-center gap-4">
            <div class="flex-1 text-right font-medium text-arsenal-ink2 tabular">
              {{ match.stats.goals_scored?.home?.length || 0 }}
            </div>
            <div class="w-24 text-center text-xs text-arsenal-muted uppercase tracking-wider">
              {{ t('squad.goals') }}
            </div>
            <div class="flex-1 text-left font-medium text-arsenal-ink2 tabular">
              {{ match.stats.goals_scored?.away?.length || 0 }}
            </div>
          </div>

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

        <p v-else class="text-sm text-arsenal-muted text-center py-4">
          {{ t('common.noData') }}
        </p>
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
