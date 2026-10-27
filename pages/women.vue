<script setup lang="ts">
// 女足内容已并入俱乐部页：/women → /club#women
const localePath = useLocalePath()
await navigateTo({ path: localePath('/club'), hash: '#women' }, { redirectCode: 301, replace: true })
</script>

<template>
  <div></div>
</template>
