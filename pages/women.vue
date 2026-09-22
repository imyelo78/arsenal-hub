<script setup lang="ts">
import { womenInfo } from '~/utils/legends'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

const infoItems = computed(() => [
  { label: t('women.founded'), value: womenInfo.founded },
  { label: t('women.ground'), value: womenInfo.ground },
  { label: t('women.manager'), value: womenInfo.manager }
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('women.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('women.subtitle') }}</p>
    </div>

    <div class="card">
      <p class="text-gray-700 leading-relaxed">
        {{ womenInfo.description[locale] || womenInfo.description['en-US'] }}
      </p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="item in infoItems" :key="item.label" class="card py-3 px-4">
        <div class="text-xs text-gray-500">{{ item.label }}</div>
        <div class="text-sm font-semibold text-gray-900 mt-0.5">{{ item.value }}</div>
      </div>
    </div>

    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t('club.honours') }}</h2>
      <div class="space-y-2">
        <div
          v-for="honour in womenInfo.honours"
          :key="honour.title['en-US']"
          class="card flex items-center justify-between py-3"
        >
          <span class="font-medium text-gray-900">{{ honour.title[locale] || honour.title['en-US'] }}</span>
          <span class="text-2xl font-bold text-arsenal-red">{{ honour.count }}</span>
        </div>
      </div>
    </div>

    <div>
      <a
        :href="womenInfo.officialSite"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-sm text-arsenal-red hover:underline"
      >
        {{ t('club.officialSite') }} →
      </a>
    </div>
  </div>
</template>
