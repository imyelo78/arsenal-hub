<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, pending } = await useFetch('/api/squad')
const players = computed(() => data.value?.response || [])

const positionGroups = computed(() => {
  const groups: Record<string, any[]> = { GK: [], DEF: [], MID: [], FWD: [] }
  if (!players.value) return groups
  for (const p of players.value) {
    if (p?.position && groups[p.position]) {
      groups[p.position].push(p)
    }
  }
  return groups
})

const positionLabels: Record<string, { zh: string; en: string }> = {
  GK: { zh: '门将', en: 'Goalkeepers' },
  DEF: { zh: '后卫', en: 'Defenders' },
  MID: { zh: '中场', en: 'Midfielders' },
  FWD: { zh: '前锋', en: 'Forwards' }
}

const getPositionLabel = (key: string) => {
  const labels = positionLabels[key]
  if (!labels) return key
  return locale.value === 'zh-CN' ? labels.zh : labels.en
}

const posKeys = computed(() => Object.keys(positionGroups.value))
</script>

<template>
  <div class="page-enter">
    <!-- Page header -->
    <div class="mb-10">
      <h1 class="text-2xl sm:text-3xl font-bold text-arsenal-ink tracking-tight">{{ t('squad.title') }}</h1>
      <p class="text-arsenal-muted mt-1.5 text-sm">{{ t('squad.subtitle') }}</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="space-y-10">
      <div v-for="n in 4" :key="n" class="space-y-4">
        <div class="h-5 w-24 bg-arsenal-line2 rounded animate-pulse" />
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="m in 4" :key="m" class="bg-white border border-arsenal-line rounded-xl h-44 animate-pulse p-4">
            <div class="w-16 h-16 bg-arsenal-line2 rounded-full mx-auto mb-3" />
            <div class="h-4 bg-arsenal-line2 rounded w-1/2 mx-auto mb-2" />
            <div class="h-3 bg-arsenal-line2 rounded w-1/3 mx-auto" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="players.length === 0" class="text-center text-arsenal-muted py-16 text-sm">
      {{ t('common.noData') }}
    </div>

    <template v-else>
      <div class="space-y-10">
        <div v-for="posKey in posKeys" :key="posKey">
          <template v-if="positionGroups[posKey] && positionGroups[posKey].length > 0">
            <div class="section-title mb-5">
              <h2 class="text-base font-bold text-arsenal-ink">{{ getPositionLabel(posKey) }}</h2>
              <span class="text-xs text-arsenal-subtle bg-arsenal-line2 px-2 py-0.5 rounded-full">
                {{ positionGroups[posKey].length }}
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <NuxtLink
                v-for="player in positionGroups[posKey]"
                :key="player.id"
                :to="localePath(`/player/${player.id}`)"
                class="group bg-white border border-arsenal-line rounded-xl p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-card-hover"
              >
                <div class="flex flex-col items-center text-center">
                  <!-- Photo -->
                  <div class="relative w-20 h-20 mx-auto mb-3">
                    <div class="w-20 h-20 rounded-full bg-arsenal-surface overflow-hidden ring-2 ring-white">
                      <img
                        v-if="player.photo"
                        :src="player.photo"
                        :alt="player.fullName"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center text-arsenal-subtle text-xl font-medium">
                        {{ player.webName?.charAt(0) }}
                      </div>
                    </div>
                    <!-- Number badge (outside the circle) -->
                    <div
                      v-if="player.number"
                      class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-arsenal-red text-white text-xs font-bold flex items-center justify-center tabular ring-2 ring-white"
                    >
                      {{ player.number }}
                    </div>
                  </div>

                  <!-- Name -->
                  <div class="font-semibold text-arsenal-ink text-sm">{{ player.webName }}</div>
                  <div class="text-xs text-arsenal-subtle mt-0.5">{{ player.nationality || '' }}</div>

                  <!-- Stats -->
                  <div class="flex gap-3 mt-3 pt-3 border-t border-arsenal-line2 w-full">
                    <div class="flex-1 text-center">
                      <div class="text-sm font-bold text-arsenal-red tabular">{{ player.stats?.goals ?? 0 }}</div>
                      <div class="text-[10px] text-arsenal-muted uppercase tracking-wider">{{ t('squad.goals') }}</div>
                    </div>
                    <div class="w-px bg-arsenal-line2" />
                    <div class="flex-1 text-center">
                      <div class="text-sm font-bold text-arsenal-ink2 tabular">{{ player.stats?.assists ?? 0 }}</div>
                      <div class="text-[10px] text-arsenal-muted uppercase tracking-wider">{{ t('squad.assists') }}</div>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
