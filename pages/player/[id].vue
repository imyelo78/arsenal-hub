<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const playerId = route.params.id as string
const { data } = await useFetch(`/api/player/${playerId}`)
const player = computed(() => data.value?.response || null)

const statItems = computed(() => {
  if (!player.value) return []
  const s = player.value.stats
  return [
    { label: t('squad.appearances'), value: s.appearances },
    { label: t('squad.minutes'), value: s.minutes },
    { label: t('squad.goals'), value: s.goals },
    { label: t('squad.assists'), value: s.assists },
    { label: t('squad.cleanSheets'), value: s.cleanSheets },
    { label: t('squad.yellowCards'), value: s.yellowCards },
    { label: t('squad.redCards'), value: s.redCards },
    { label: t('squad.form'), value: s.form },
    { label: t('squad.totalPoints'), value: s.totalPoints },
    { label: t('squad.selectedBy'), value: s.selectedBy + '%' }
  ]
})

const positionLabels: Record<string, { zh: string; en: string }> = {
  GK: { zh: '门将', en: 'Goalkeeper' },
  DEF: { zh: '后卫', en: 'Defender' },
  MID: { zh: '中场', en: 'Midfielder' },
  FWD: { zh: '前锋', en: 'Forward' }
}
const getPositionLabel = (key: string) => {
  const labels = positionLabels[key]
  if (!labels) return key
  return locale.value === 'zh-CN' ? labels.zh : labels.en
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!player" class="text-center text-gray-400 py-12">
      {{ t('common.noData') }}
    </div>

    <template v-if="player">
      <!-- Player header -->
      <div class="card flex flex-col sm:flex-row items-center gap-6">
        <div class="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
          <img
            v-if="player.photo"
            :src="player.photo"
            :alt="player.fullName"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>
        <div class="flex-1 text-center sm:text-left">
          <div class="flex items-center gap-3 justify-center sm:justify-start">
            <span v-if="player.number" class="text-xl font-bold text-white bg-arsenal-red rounded-full w-10 h-10 inline-flex items-center justify-center">{{ player.number }}</span>
            <h1 class="text-2xl font-bold text-gray-900">{{ player.fullName }}</h1>
          </div>
          <div class="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start text-sm text-gray-500">
            <span class="px-2 py-0.5 bg-gray-100 rounded">{{ getPositionLabel(player.position) }}</span>
            <span v-if="player.nationality" class="px-2 py-0.5 bg-gray-100 rounded">{{ player.nationality }}</span>
            <span v-if="player.age" class="px-2 py-0.5 bg-gray-100 rounded">{{ player.age }} {{ t('squad.yearsOld') }}</span>
          </div>
          <div v-if="player.news" class="mt-2 text-sm text-orange-600">
            <span class="font-medium">{{ t('squad.news') }}: </span>{{ player.news }}
          </div>
        </div>
      </div>

      <!-- Season stats -->
      <div>
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t('squad.seasonStats') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div v-for="stat in statItems" :key="stat.label" class="card text-center py-4">
            <div class="text-2xl font-bold text-arsenal-red">{{ stat.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Last 5 matches -->
      <div v-if="player.lastFive && player.lastFive.length > 0">
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t('squad.lastFive') }}</h2>
        <div class="space-y-2">
          <div
            v-for="match in player.lastFive"
            :key="match.gameweek"
            class="card flex items-center gap-4 py-3"
          >
            <span class="text-sm font-bold text-gray-400 w-16">GW{{ match.gameweek }}</span>
            <span class="text-sm" :class="match.isHome ? 'text-arsenal-red font-medium' : 'text-gray-600'">
              {{ match.isHome ? t('common.home') : t('common.away') }}
            </span>
            <span class="text-sm font-medium text-gray-900 flex-1">{{ match.opponent }}</span>
            <div class="flex gap-2 text-xs">
              <span v-if="match.goals > 0" class="text-green-600 font-bold">{{ match.goals }}G</span>
              <span v-if="match.assists > 0" class="text-blue-600 font-bold">{{ match.assists }}A</span>
              <span v-if="match.cleanSheets > 0" class="text-gray-600 font-bold">CS</span>
              <span class="text-gray-400">{{ match.minutes }}'</span>
              <span class="text-gray-700 font-bold">{{ match.totalPoints }}pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back link -->
      <div>
        <NuxtLink :to="localePath('/squad')" class="text-sm text-arsenal-red hover:underline">
          ← {{ t('squad.backToList') }}
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
