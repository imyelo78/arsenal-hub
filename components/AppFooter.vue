<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const links = [
  { path: '/', label: 'nav.home' },
  { path: '/matchcenter', label: 'nav.matchcenter' },
  { path: '/club', label: 'nav.club' },
  { path: '/squad', label: 'nav.squad' },
  { path: '/legends', label: 'nav.legends' }
]
</script>

<template>
  <footer class="bg-arsenal-night mt-auto">
    <div class="shell-wide pt-16 pb-10">
      <!-- Top row -->
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <img
            src="/images/badges/t3.png"
            alt="Arsenal"
            class="w-8 h-8"
            loading="lazy"
          />
          <span class="font-bold text-white">Arsenal Hub</span>
        </div>
        <nav class="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/55">
          <NuxtLink
            v-for="link in links"
            :key="link.path"
            :to="localePath(link.path)"
            class="hover:text-white transition-colors"
          >{{ t(link.label) }}</NuxtLink>
        </nav>
      </div>

      <!-- Divider -->
      <div class="h-px bg-white/10 my-7"></div>

      <!-- Bottom text -->
      <div class="text-xs leading-7 text-white/40 space-y-1">
        <p>{{ t('footer.disclaimer') }}</p>
        <p>{{ t('footer.dataSource') }}</p>
        <p class="text-white/30">{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>
