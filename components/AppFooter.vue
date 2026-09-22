<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="border-t border-arsenal-line mt-auto">
    <div class="container-page py-8">
      <div class="flex flex-col gap-5">
        <!-- Top row -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2.5">
            <img
              src="https://resources.premierleague.com/premierleague/badges/50/t3.png"
              alt="Arsenal"
              class="w-6 h-6"
            />
            <span class="font-semibold text-arsenal-ink text-sm">Arsenal Hub</span>
          </div>
          <nav class="flex gap-5 text-xs text-arsenal-muted">
            <NuxtLink :to="localePath('/')" class="hover:text-arsenal-ink transition-colors">{{ t('nav.home') }}</NuxtLink>
            <NuxtLink :to="localePath('/fixtures')" class="hover:text-arsenal-ink transition-colors">{{ t('nav.fixtures') }}</NuxtLink>
            <NuxtLink :to="localePath('/standings')" class="hover:text-arsenal-ink transition-colors">{{ t('nav.standings') }}</NuxtLink>
            <NuxtLink :to="localePath('/squad')" class="hover:text-arsenal-ink transition-colors">{{ t('nav.squad') }}</NuxtLink>
          </nav>
        </div>

        <!-- Divider -->
        <div class="divider" />

        <!-- Bottom text -->
        <div class="text-xs text-arsenal-subtle leading-relaxed space-y-2">
          <p>{{ t('footer.disclaimer') }}</p>
          <p>{{ t('footer.dataSource') }}</p>
          <p class="text-arsenal-muted">{{ t('footer.copyright') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>
