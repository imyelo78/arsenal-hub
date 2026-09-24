<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
  icon?: string
}>(), {
  title: '',
  message: '',
  icon: ''
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div
      v-if="icon"
      class="w-14 h-14 rounded-full bg-arsenal-surface flex items-center justify-center mb-4"
    >
      <span class="text-arsenal-muted text-2xl leading-none">{{ icon }}</span>
    </div>
    <p v-if="title" class="text-sm font-semibold text-arsenal-ink2 mb-1">{{ title }}</p>
    <p class="text-sm text-arsenal-muted">{{ message || $t('common.noData') }}</p>
  </div>
</template>