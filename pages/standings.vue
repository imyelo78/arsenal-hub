<script setup lang="ts">
// 积分榜已并入赛事中心：/standings → /matchcenter?tab=pl
const localePath = useLocalePath()
await navigateTo({ path: localePath('/matchcenter'), query: { tab: 'pl' } }, { redirectCode: 301, replace: true })
</script>

<template>
  <div></div>
</template>
