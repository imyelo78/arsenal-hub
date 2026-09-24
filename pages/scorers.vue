<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

const { t } = useI18n()

const { data } = await useFetch('/api/scorers')
const scorers = computed(() => data.value?.response || [])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('scorers.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('scorers.subtitle') }}</p>
    </div>

    <EmptyState v-if="scorers.length === 0" icon="⚽" :message="t('common.noData')" />

    <div v-if="scorers.length > 0" class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-center py-2 px-2 font-semibold text-gray-500">#</th>
            <th class="text-left py-2 px-2 font-semibold text-gray-500">{{ t('scorers.player') }}</th>
            <th class="text-left py-2 px-2 font-semibold text-gray-500">{{ t('scorers.team') }}</th>
            <th class="text-center py-2 px-2 font-bold text-gray-900">{{ t('scorers.goals') }}</th>
            <th class="text-center py-2 px-2 font-semibold text-gray-500 hidden sm:table-cell">{{ t('scorers.assists') }}</th>
            <th class="text-center py-2 px-2 font-semibold text-gray-500 hidden sm:table-cell">{{ t('scorers.penalties') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="scorer in scorers"
            :key="scorer.player.id"
            class="border-b border-gray-100 hover:bg-gray-50"
            :class="ARSENAL_IDS.includes(scorer.team.id) ? 'bg-arsenal-red/5' : ''"
          >
            <td class="text-center py-2.5 px-2 text-gray-500">{{ scorer.rank }}</td>
            <td class="py-2.5 px-2 font-medium text-gray-900">
              {{ scorer.player.name }}
              <div class="text-xs text-gray-400">{{ scorer.player.nationality }}</div>
            </td>
            <td class="py-2.5 px-2 text-gray-600">
              <div class="flex items-center gap-1.5">
                <img v-if="scorer.team.logo" :src="scorer.team.logo" :alt="scorer.team.name" class="w-4 h-4 object-contain" />
                <span :class="ARSENAL_IDS.includes(scorer.team.id) ? 'text-arsenal-red font-bold' : ''">{{ scorer.team.name }}</span>
              </div>
            </td>
            <td class="text-center py-2.5 px-2 font-bold text-gray-900">{{ scorer.goals }}</td>
            <td class="text-center py-2.5 px-2 text-gray-600 hidden sm:table-cell">{{ scorer.assists }}</td>
            <td class="text-center py-2.5 px-2 text-gray-600 hidden sm:table-cell">{{ scorer.penalties }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
