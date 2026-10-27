<script setup lang="ts">
// 射手榜已并入赛事中心：/scorers → /matchcenter?tab=scorers
const localePath = useLocalePath()
await navigateTo({ path: localePath('/matchcenter'), query: { tab: 'scorers' } }, { redirectCode: 301, replace: true })
</script>

<template>
  <div></div>
</template>
