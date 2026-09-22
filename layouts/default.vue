<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppNavbar />
    <main class="flex-1 pt-16">
      <div class="container-page py-8 sm:py-12">
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
