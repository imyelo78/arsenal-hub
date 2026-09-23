<script setup lang="ts">
const { t, locale } = useI18n()

const { data, pending } = await useFetch('/api/fixtures')
const fixtures = computed(() => data.value?.response || [])

const leagueFilter = ref('all')
const statusFilter = ref<'all' | 'upcoming' | 'finished'>('all')

const leagueDisplay = (name: string) => {
  const map: Record<string, string> = {
    'Premier League': t('fixtures.premierLeague'),
    'Champions League': t('fixtures.championsLeague')
  }
  return map[name] || name
}

const leagues = computed(() => {
  const set = new Set<string>()
  fixtures.value.forEach((f: any) => {
    const name = f.league?.name || f.fixture?.league
    if (name) set.add(name)
  })
  return Array.from(set)
})

const getMatchStatus = (f: any) => {
  const status = typeof f.fixture?.status === 'object' ? f.fixture.status.short : f.status
  return status
}
const isFinished = (f: any) => {
  const s = getMatchStatus(f)
  return s === 'FT' || s === 'AET' || s === 'PEN' || (f.goals?.home !== null && f.goals?.home !== undefined)
}

const filteredFixtures = computed(() => {
  return fixtures.value.filter((f: any) => {
    const leagueName = f.league?.name || f.fixture?.league
    const leagueOk = leagueFilter.value === 'all' || leagueName === leagueFilter.value
    const finished = isFinished(f)
    const statusOk = statusFilter.value === 'all'
      || (statusFilter.value === 'finished' && finished)
      || (statusFilter.value === 'upcoming' && !finished)
    return leagueOk && statusOk
  })
})
</script>

<template>
  <div class="page-enter">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-arsenal-ink tracking-tight">{{ t('fixtures.title') }}</h1>
      <p class="text-arsenal-muted mt-1.5 text-sm">{{ t('fixtures.subtitle') }}</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-8">
      <!-- Status tabs -->
      <div class="flex bg-arsenal-line2 rounded-lg p-0.5">
        <button
          v-for="opt in ['all', 'upcoming', 'finished'] as const"
          :key="opt"
          @click="statusFilter = opt"
          class="px-3.5 py-1.5 text-xs font-medium rounded-md transition-all"
          :class="statusFilter === opt
            ? 'bg-white text-arsenal-ink shadow-sm'
            : 'text-arsenal-muted hover:text-arsenal-ink2'"
        >
          {{ t(`fixtures.${opt}`) }}
        </button>
      </div>

      <!-- League filter -->
      <select
        v-model="leagueFilter"
        class="px-3 py-1.5 border border-arsenal-line rounded-lg text-sm bg-white text-arsenal-ink2 focus:outline-none focus:border-gray-400 transition-colors"
      >
        <option value="all">{{ t('fixtures.all') }}</option>
        <option v-for="league in leagues" :key="league" :value="league">
          {{ leagueDisplay(league) }}
        </option>
      </select>
    </div>

    <!-- Fixtures list -->
    <div v-if="pending" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-16 bg-arsenal-line2 rounded-xl animate-pulse" />
    </div>

    <div v-else class="space-y-2">
      <div v-if="filteredFixtures.length === 0" class="text-center text-arsenal-muted py-16 text-sm">
        {{ t('common.noData') }}
      </div>

      <FixtureCard
        v-for="match in filteredFixtures"
        :key="match.fixture.id"
        :match="match"
      />
    </div>
  </div>
</template>
