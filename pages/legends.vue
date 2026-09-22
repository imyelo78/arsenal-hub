<script setup lang="ts">
import { legends } from '~/utils/legends'
import { useI18n } from '#imports'

const { t, locale } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('legends.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('legends.subtitle') }}</p>
    </div>

    <div class="space-y-4">
      <div
        v-for="legend in legends"
        :key="legend.id"
        class="card flex flex-col sm:flex-row gap-4"
      >
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-arsenal-red to-arsenal-red-darker flex items-center justify-center flex-shrink-0">
          <span class="text-white text-2xl font-bold">{{ legend.name.charAt(0) }}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-lg font-bold text-gray-900">{{ legend.name }}</h3>
            <span class="text-sm text-gray-400">{{ legend.years }}</span>
          </div>
          <div class="flex gap-2 mt-1 text-xs text-gray-500">
            <span class="px-2 py-0.5 bg-gray-100 rounded">{{ legend.position }}</span>
            <span class="px-2 py-0.5 bg-gray-100 rounded">{{ legend.nationality }}</span>
            <span class="px-2 py-0.5 bg-gray-100 rounded">{{ legend.apps }} apps</span>
            <span class="px-2 py-0.5 bg-gray-100 rounded">{{ legend.goals }} goals</span>
          </div>
          <p class="text-sm text-gray-600 mt-2 leading-relaxed">
            {{ legend.description[locale] || legend.description['en-US'] }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
