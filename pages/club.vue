<script setup lang="ts">
import { clubInfo, honours } from '~/utils/legends'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

const infoItems = computed(() => [
  { label: t('club.founded'), value: clubInfo.founded },
  { label: t('club.ground'), value: `${clubInfo.ground} (${clubInfo.groundCapacity})` },
  { label: t('club.city'), value: clubInfo.city },
  { label: t('club.manager'), value: clubInfo.manager },
  { label: t('club.chairman'), value: clubInfo.chairman },
  { label: t('club.nickname'), value: clubInfo.nickname }
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('club.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('club.subtitle') }}</p>
    </div>

    <!-- Description -->
    <div class="card">
      <p class="text-gray-700 leading-relaxed">
        {{ clubInfo.description[locale] || clubInfo.description['en-US'] }}
      </p>
    </div>

    <!-- Basic info -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="item in infoItems" :key="item.label" class="card py-3 px-4">
        <div class="text-xs text-gray-500">{{ item.label }}</div>
        <div class="text-sm font-semibold text-gray-900 mt-0.5">{{ item.value }}</div>
      </div>
    </div>

    <!-- Honours -->
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t('club.honours') }}</h2>
      <div class="space-y-2">
        <div
          v-for="honour in honours"
          :key="honour.title['en-US']"
          class="card flex items-center justify-between py-3"
        >
          <span class="font-medium text-gray-900">{{ honour.title[locale] || honour.title['en-US'] }}</span>
          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold text-arsenal-red">{{ honour.count }}</span>
            <span class="text-xs text-gray-400 hidden sm:inline">{{ honour.years.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- External link -->
    <div>
      <a
        :href="clubInfo.officialSite"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-sm text-arsenal-red hover:underline"
      >
        {{ t('club.officialSite') }} →
      </a>
    </div>
  </div>
</template>
