<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()

// 首页为全宽沉浸式布局（zh: /, en: /en）
const isHome = computed(() => {
  const p = route.path.replace(/\/+$/, '')
  return p === '' || p === '/en'
})

// 球员列表页同为全宽沉浸式布局（zh: /squad, en: /en/squad）
const isSquad = computed(() => {
  const p = route.path.replace(/\/+$/, '')
  return p === '/squad' || p === '/en/squad'
})

// 传奇殿堂（列表 + 传奇个人页）为全宽沉浸式布局（zh: /legends, en: /en/legends）
const isLegends = computed(() => {
  const p = route.path.replace(/\/+$/, '')
  return p === '/legends' || p === '/en/legends' || p.startsWith('/legends/') || p.startsWith('/en/legends/')
})

// 球员个人页同为全宽沉浸式布局（zh: /player/:id, en: /en/player/:id）
const isPlayerDetail = computed(() => {
  const p = route.path.replace(/\/+$/, '')
  return p.startsWith('/player/') || p.startsWith('/en/player/')
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppNavbar />
    <main class="flex-1" :class="isHome || isSquad || isLegends || isPlayerDetail ? '' : 'pt-16'">
      <div v-if="isHome || isSquad || isLegends || isPlayerDetail">
        <div class="page-transition">
          <slot />
        </div>
      </div>
      <div v-else class="container-page py-8 sm:py-12">
        <div class="page-transition">
          <slot />
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style>
.page-transition {
  animation: pageFadeIn 0.35s ease-out;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: pageFadeIn 0.35s ease-out;
}
</style>
