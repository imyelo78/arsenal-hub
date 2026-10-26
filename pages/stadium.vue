<script setup lang="ts">
import { stadiumInfo } from '~/utils/legends'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

const infoItems = computed(() => [
  { label: t('stadium.name'), value: locale === 'zh-CN' ? stadiumInfo.nameZh : stadiumInfo.name },
  { label: t('stadium.capacity'), value: stadiumInfo.capacity.toLocaleString() },
  { label: t('stadium.opened'), value: stadiumInfo.opened },
  { label: t('stadium.architect'), value: stadiumInfo.architect },
  { label: t('stadium.cost'), value: stadiumInfo.cost },
  { label: t('stadium.address'), value: stadiumInfo.address }
])

const stands = computed(() => stadiumInfo.stands)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('stadium.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('stadium.subtitle') }}</p>
    </div>

    <!-- Description -->
    <div class="card">
      <p class="text-gray-700 leading-relaxed">
        {{ stadiumInfo.description[locale] || stadiumInfo.description['en-US'] }}
      </p>
    </div>

    <!-- Info grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="item in infoItems" :key="item.label" class="card py-3 px-4">
        <div class="text-xs text-gray-500">{{ item.label }}</div>
        <div class="text-sm font-semibold text-gray-900 mt-0.5">{{ item.value }}</div>
      </div>
    </div>

    <!-- Stands -->
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t('stadium.stands') }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="stand in stands" :key="stand.name" class="card text-center py-4">
          <div class="font-semibold text-gray-900">{{ locale === 'zh-CN' ? stand.nameZh : stand.name }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ stand.capacity.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- Transport -->
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t('stadium.transport') }}</h2>
      <div class="space-y-2">
        <div
          v-for="(route, i) in stadiumInfo.transport"
          :key="i"
          class="card flex items-center gap-3 py-3"
        >
          <span class="w-6 h-6 rounded-full bg-arsenal-red/10 text-arsenal-red text-xs font-bold inline-flex items-center justify-center">{{ i + 1 }}</span>
          <span class="text-sm text-gray-700">{{ route[locale] || route['en-US'] }}</span>
        </div>
      </div>
    </div>

    <!-- Map -->
    <div>
      <div class="card overflow-hidden p-0">
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1720%2C51.5450%2C-0.1370%2C51.5650&layer=mapnik&marker=51.5549%2C-0.1547"
          width="100%"
          height="300"
          style="border:0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Emirates Stadium map"
        />
      </div>
    </div>
  </div>
</template>
