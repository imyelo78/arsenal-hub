<script setup lang="ts">
// 赛程已并入赛事中心：/fixtures → /matchcenter
const localePath = useLocalePath()
await navigateTo({ path: localePath('/matchcenter'), query: { tab: 'fixtures' } }, { redirectCode: 301, replace: true })
</script>

<template>
  <div></div>
</template>
