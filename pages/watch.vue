<script setup lang="ts">
// 观赛指南已并入赛事中心：/watch → /matchcenter?tab=watch
const localePath = useLocalePath()
await navigateTo({ path: localePath('/matchcenter'), query: { tab: 'watch' } }, { redirectCode: 301, replace: true })
</script>

<template>
  <div></div>
</template>
