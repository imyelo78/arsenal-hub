<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()

// 首页为全宽沉浸式布局（zh: /, en: /en）
const isHome = computed(() => {
  const p = route.path.replace(/\/+$/, '')
  return p === '' || p === '/en'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppNavbar />
    <main class="flex-1" :class="isHome ? '' : 'pt-16'">
      <div v-if="isHome">
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
