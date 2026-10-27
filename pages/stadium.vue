<script setup lang="ts">
// 球场内容已并入俱乐部页：/stadium → /club#stadium
const localePath = useLocalePath()
await navigateTo({ path: localePath('/club'), hash: '#stadium' }, { redirectCode: 301, replace: true })
</script>

<template>
  <div></div>
</template>
