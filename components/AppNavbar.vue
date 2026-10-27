<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { locale, setLocale } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const navItems = [
  { key: 'home', path: '/', label: 'nav.home' },
  { key: 'matchcenter', path: '/matchcenter', label: 'nav.matchcenter' },
  { key: 'club', path: '/club', label: 'nav.club' },
  { key: 'squad', path: '/squad', label: 'nav.squad' },
  { key: 'legends', path: '/legends', label: 'nav.legends' }
]
const mobileItems = navItems

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// 首页顶部透明，滚动后毛玻璃；非首页始终深色底
const isHome = computed(() => {
  const p = route.path.replace(/\/+$/, '')
  return p === '' || p === '/en'
})
const transparent = computed(() => isHome.value && !scrolled.value)

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/' || route.path === '/en' || route.path === '/en/'
  return route.path.startsWith(path)
}

function toggleLocale() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(next)
  document.cookie = `i18n_redirected=${next}; path=/; max-age=31536000`
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    :class="transparent ? 'bg-transparent' : 'bg-arsenal-night/90 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.08)]'"
  >
    <div class="shell-wide h-[72px] flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="flex items-center gap-3 group">
        <img
          src="/images/badges/t3.png"
          alt="Arsenal"
          class="w-9 h-9 transition-transform duration-300 group-hover:scale-110"
        />
        <span class="font-bold text-white text-lg tracking-tight">Arsenal Hub</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="localePath(item.path)"
          class="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="isActive(item.path) ? 'text-white' : 'text-white/75 hover:text-white hover:bg-white/10'"
        >
          {{ $t(item.label) }}
          <span
            v-if="isActive(item.path)"
            class="absolute left-4 right-4 -bottom-0.5 h-0.5 bg-arsenal-red rounded-full"
          />
        </NuxtLink>

        <!-- Language Toggle -->
        <button
          @click="toggleLocale"
          class="ml-3 px-3.5 py-1.5 text-xs font-medium text-white/75 hover:text-white border border-white/20 rounded-lg hover:border-white/50 transition-colors"
        >
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
      </nav>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 -mr-2 text-white"
        @click="mobileMenuOpen = !mobileMenuOpen"
        aria-label="Menu"
      >
        <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="md:hidden bg-arsenal-night/95 backdrop-blur-md border-t border-white/10">
        <div class="shell-wide py-2">
          <NuxtLink
            v-for="item in mobileItems"
            :key="item.key"
            :to="localePath(item.path)"
            class="block px-2 py-3 text-sm font-medium border-b border-white/10 last:border-0 transition-colors"
            :class="isActive(item.path) ? 'text-arsenal-red' : 'text-white/80 hover:text-white'"
            @click="mobileMenuOpen = false"
          >
            {{ $t(item.label) }}
          </NuxtLink>
          <button
            @click="toggleLocale"
            class="w-full text-left px-2 py-3 text-sm font-medium text-white/60 hover:text-white"
          >
            {{ locale === 'zh' ? 'English' : '简体中文' }}
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>
