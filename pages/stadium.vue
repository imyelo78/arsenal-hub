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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2481.1567!2d-0.1547!3d51.5549!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMzJzE3LjYiTi3DMMA5JzE2LjkiVw!5e0!3m2!1sen!2suk!4v1700000000000"
          width="100%"
          height="300"
          style="border:0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </div>
</template>
