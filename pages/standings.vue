<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

const { t } = useI18n()

const { data, pending } = await useFetch('/api/standings')

const standings = computed(() => {
  const raw = data.value?.response
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return []
})

function isArsenal(teamId: number): boolean {
  return ARSENAL_IDS.includes(teamId)
}
</script>

<template>
  <div class="page-enter">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-arsenal-ink tracking-tight">{{ t('standings.title') }}</h1>
      <p class="text-arsenal-muted mt-1.5 text-sm">{{ t('standings.subtitle') }}</p>
    </div>

    <!-- Table -->
    <div v-if="pending" class="card !p-0 overflow-hidden">
      <div class="animate-pulse">
        <div v-for="i in 10" :key="i" class="h-11 border-b border-arsenal-line last:border-0">
          <div class="h-full flex items-center px-4 gap-3">
            <div class="w-5 h-5 bg-arsenal-line2 rounded-full" />
            <div class="h-3 bg-arsenal-line2 rounded w-32" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white border border-arsenal-line rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-arsenal-surface border-b border-arsenal-line">
            <th class="text-center py-3 px-2 w-10 font-semibold text-arsenal-muted text-xs uppercase tracking-wider">#</th>
            <th class="text-left py-3 px-3 font-semibold text-arsenal-muted text-xs uppercase tracking-wider">{{ t('standings.team') }}</th>
            <th class="text-center py-3 px-2 font-semibold text-arsenal-muted text-xs uppercase tracking-wider tabular">{{ t('common.played') }}</th>
            <th class="text-center py-3 px-1.5 font-semibold text-arsenal-muted text-xs uppercase tracking-wider tabular hidden sm:table-cell">W</th>
            <th class="text-center py-3 px-1.5 font-semibold text-arsenal-muted text-xs uppercase tracking-wider tabular hidden sm:table-cell">D</th>
            <th class="text-center py-3 px-1.5 font-semibold text-arsenal-muted text-xs uppercase tracking-wider tabular hidden sm:table-cell">L</th>
            <th class="text-center py-3 px-2 font-semibold text-arsenal-muted text-xs uppercase tracking-wider tabular hidden md:table-cell">GD</th>
            <th class="text-center py-3 px-3 font-semibold text-arsenal-ink text-xs uppercase tracking-wider tabular">{{ t('common.points') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in standings"
            :key="row.team.id"
            class="border-b border-arsenal-line2 last:border-0 transition-colors hover:bg-arsenal-surface"
            :class="isArsenal(row.team.id) ? 'bg-arsenal-red-50/50 hover:bg-arsenal-red-50' : ''"
          >
            <!-- Position -->
            <td class="text-center py-3 px-2">
              <span
                class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold tabular"
                :class="{
                  'bg-green-100 text-green-700': row.rank <= 4,
                  'bg-amber-100 text-amber-700': row.rank === 5,
                  'bg-red-100 text-red-600': row.rank >= 18,
                  'text-arsenal-muted': row.rank > 4 && row.rank < 5 && row.rank < 18
                }"
              >
                {{ row.rank }}
              </span>
            </td>

            <!-- Team -->
            <td class="py-3 px-3">
              <div class="flex items-center gap-2.5">
                <img
                  v-if="row.team.logo"
                  :src="row.team.logo"
                  :alt="row.team.name"
                  class="w-5 h-5 object-contain flex-shrink-0"
                  loading="lazy"
                />
                <span
                  class="font-medium truncate"
                  :class="isArsenal(row.team.id) ? 'text-arsenal-red' : 'text-arsenal-ink'"
                >
                  {{ row.team.name }}
                </span>
              </div>
            </td>

            <!-- Played -->
            <td class="text-center py-3 px-2 text-arsenal-ink2 tabular font-medium">{{ row.all.played }}</td>

            <!-- W/D/L -->
            <td class="text-center py-3 px-1.5 text-arsenal-ink2 tabular hidden sm:table-cell">{{ row.all.win }}</td>
            <td class="text-center py-3 px-1.5 text-arsenal-ink2 tabular hidden sm:table-cell">{{ row.all.draw }}</td>
            <td class="text-center py-3 px-1.5 text-arsenal-ink2 tabular hidden sm:table-cell">{{ row.all.lose }}</td>

            <!-- GD -->
            <td class="text-center py-3 px-2 tabular font-medium hidden md:table-cell"
              :class="row.goalsDiff > 0 ? 'text-green-600' : row.goalsDiff < 0 ? 'text-red-500' : 'text-arsenal-muted'"
            >
              {{ row.goalsDiff > 0 ? '+' : '' }}{{ row.goalsDiff }}
            </td>

            <!-- Points -->
            <td class="text-center py-3 px-3">
              <span class="font-bold text-arsenal-ink tabular">{{ row.points }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-4 mt-4 text-xs text-arsenal-muted">
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 bg-green-100 rounded-full"></span>
        {{ t('standings.championsLeague') || 'Champions League' }}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 bg-amber-100 rounded-full"></span>
        {{ t('standings.europaLeague') || 'Europa League' }}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 bg-red-100 rounded-full"></span>
        {{ t('standings.relegation') || 'Relegation' }}
      </span>
    </div>
  </div>
</template>
