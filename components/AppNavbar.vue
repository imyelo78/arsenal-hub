<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { locale, setLocale } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)

const navItems = [
  { key: 'home', path: '/', label: 'nav.home' },
  { key: 'fixtures', path: '/fixtures', label: 'nav.fixtures' },
  { key: 'standings', path: '/standings', label: 'nav.standings' },
  { key: 'squad', path: '/squad', label: 'nav.squad' }
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function toggleLocale() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(next)
  document.cookie = `i18n_redirected=${next}; path=/; max-age=31536000`
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-arsenal-line">
    <div class="container-page h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5 group">
        <img
          src="/images/badges/t3.png"
          alt="Arsenal"
          class="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
        />
        <span class="font-bold text-arsenal-ink text-lg tracking-tight">Arsenal Hub</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="localePath(item.path)"
          class="relative px-3.5 py-2 text-sm font-medium transition-colors"
          :class="isActive(item.path) ? 'text-arsenal-ink' : 'text-arsenal-muted hover:text-arsenal-ink2'"
        >
          {{ $t(item.label) }}
          <span
            v-if="isActive(item.path)"
            class="absolute left-3.5 right-3.5 -bottom-px h-0.5 bg-arsenal-red rounded-full"
          />
        </NuxtLink>

        <!-- Language Toggle -->
        <button
          @click="toggleLocale"
          class="ml-3 px-3 py-1.5 text-xs font-medium text-arsenal-muted hover:text-arsenal-ink2 border border-arsenal-line rounded-md hover:border-gray-300 transition-colors"
        >
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
      </nav>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 -mr-2 text-arsenal-ink2 hover:text-arsenal-ink"
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
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-arsenal-line">
        <div class="container-page py-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.key"
            :to="localePath(item.path)"
            class="block px-2 py-3 text-sm font-medium border-b border-arsenal-line2 last:border-0"
            :class="isActive(item.path) ? 'text-arsenal-red' : 'text-arsenal-ink2'"
            @click="mobileMenuOpen = false"
          >
            {{ $t(item.label) }}
          </NuxtLink>
          <button
            @click="toggleLocale"
            class="w-full text-left px-2 py-3 text-sm font-medium text-arsenal-muted"
          >
            {{ locale === 'zh' ? 'English' : '简体中文' }}
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>
