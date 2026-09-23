<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: nextMatchData, pending: nextPending } = await useFetch('/api/next-match')
const { data: lastResultsData } = await useFetch('/api/last-results')

const nextMatch = computed(() => nextMatchData.value?.nextMatch || null)
const recentResults = computed(() => lastResultsData.value?.results || [])

// ===== Banner carousel =====
const banners = [
  {
    image: '/images/banner1.webp',
    title: 'Arsenal',
    subtitle: 'Premier League 2024/25'
  },
  {
    image: '/images/banner2.webp',
    title: 'Emirates Stadium',
    subtitle: 'Home of the Gunners'
  }
]

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % banners.length
}
function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + banners.length) % banners.length
}
function goToSlide(i: number) {
  currentSlide.value = i
}

onMounted(() => {
  slideTimer = setInterval(nextSlide, 5000)
})
onBeforeUnmount(() => {
  if (slideTimer) clearInterval(slideTimer)
})

// ===== Countdown =====
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: ReturnType<typeof setInterval> | null = null

const matchDate = computed(() => {
  if (!nextMatch.value) return null
  return new Date(nextMatch.value.fixture.date)
})

function updateCountdown() {
  if (!matchDate.value) return
  const diff = matchDate.value.getTime() - Date.now()
  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (timer) clearInterval(timer)
    return
  }
  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const isHome = computed(() => ARSENAL_IDS.includes(nextMatch.value?.teams?.home?.id))
const opponent = computed(() => {
  if (!nextMatch.value) return ''
  return isHome.value
    ? nextMatch.value.teams.away.name
    : nextMatch.value.teams.home.name
})
const opponentLogo = computed(() => {
  if (!nextMatch.value) return ''
  return isHome.value
    ? nextMatch.value.teams.away.logo
    : nextMatch.value.teams.home.logo
})
const homeLogo = computed(() => {
  if (!nextMatch.value) return ''
  return isHome.value
    ? nextMatch.value.teams.home.logo
    : nextMatch.value.teams.away.logo
})
const matchDateLabel = computed(() => {
  if (!matchDate.value) return ''
  return matchDate.value.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
const matchdayLabel = computed(() => {
  const round = nextMatch.value?.league?.round || nextMatch.value?.fixture?.round
  if (!round) return ''
  if (nextMatch.value?.league?.id === 2001) {
    if (round === 'LEAGUE_STAGE') return locale.value === 'zh' ? '欧冠·联赛阶段' : 'UCL · League Stage'
    return `${locale.value === 'zh' ? '欧冠' : 'UCL'} · ${String(round).replace(/_/g, ' ')}`
  }
  if (typeof round === 'string' && round.startsWith('Regular Season - ')) {
    const n = round.replace('Regular Season - ', '')
    return locale.value === 'zh' ? `第${n}轮` : `GW ${n}`
  }
  if (typeof round === 'string' && round.startsWith('Gameweek ')) {
    const n = round.replace('Gameweek ', '')
    return locale.value === 'zh' ? `第${n}轮` : `GW ${n}`
  }
  return round
})
</script>

<template>
  <div class="page-enter space-y-14">
    <!-- ===== Hero Banner with Carousel ===== -->
    <section class="relative overflow-hidden rounded-2xl">
      <!-- Banner images -->
      <div class="relative h-56 sm:h-72 lg:h-80">
        <TransitionGroup name="fade">
          <div
            v-for="(banner, index) in banners"
            v-show="index === currentSlide"
            :key="index"
            class="absolute inset-0"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20 z-10" />
            <img
              :src="banner.image"
              :alt="banner.title"
              class="w-full h-full object-cover"
              loading="eager"
              @error="($event.target as HTMLImageElement).style.opacity = '0'"
            />
            <!-- Banner text (left side) -->
            <div class="absolute inset-0 z-20 flex items-center pl-6 sm:pl-10">
              <div class="max-w-md">
                <div class="text-white/70 text-xs font-semibold uppercase tracking-[0.2em] mb-2 sm:mb-3">
                  {{ banner.subtitle }}
                </div>
                <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {{ banner.title }}
                </h1>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Prev / Next buttons -->
        <button
          @click="prevSlide"
          class="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center"
          aria-label="Previous"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center"
          aria-label="Next"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dots -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          <button
            v-for="(_, i) in banners"
            :key="i"
            @click="goToSlide(i)"
            class="w-1.5 h-1.5 rounded-full transition-all"
            :class="i === currentSlide ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'"
            :aria-label="`Slide ${i + 1}`"
          />
        </div>

        <!-- ===== Floating Next Match Card (top-right) ===== -->
        <div
          v-if="nextMatch && !nextPending"
          class="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 w-48 sm:w-56"
        >
          <div class="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/30">
            <!-- Label -->
            <div class="flex items-center gap-1.5 mb-2">
              <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-arsenal-red opacity-60"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-arsenal-red"></span>
              </span>
              <span class="text-[10px] font-bold text-arsenal-red uppercase tracking-wider">{{ t('home.nextMatch') }}</span>
            </div>

            <!-- Teams -->
            <div class="flex items-center justify-between gap-1.5 mb-2">
              <div class="flex flex-col items-center gap-1 flex-1">
                <img v-if="homeLogo" :src="homeLogo" :alt="nextMatch.teams.home.name" class="w-7 h-7 object-contain" />
                <span class="text-[10px] font-medium text-arsenal-ink text-center truncate w-full">
                  {{ nextMatch.teams.home.name }}
                </span>
              </div>
              <div class="text-arsenal-subtle text-[10px] font-bold tracking-widest">VS</div>
              <div class="flex flex-col items-center gap-1 flex-1">
                <img v-if="opponentLogo" :src="opponentLogo" :alt="opponent" class="w-7 h-7 object-contain" />
                <span class="text-[10px] font-medium text-arsenal-ink text-center truncate w-full">
                  {{ opponent }}
                </span>
              </div>
            </div>

            <!-- Date & countdown -->
            <div class="text-center mb-2">
              <div class="text-[11px] text-arsenal-muted">{{ matchDateLabel }}</div>
              <div v-if="matchDate && matchDate.getTime() > Date.now()" class="flex justify-center gap-1 mt-1.5">
                <div v-for="(v, k) in countdown" :key="k" class="text-center">
                  <div class="bg-arsenal-red/10 rounded px-1 py-0.5 text-[10px] font-bold text-arsenal-red tabular-nums">
                    {{ String(v).padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <NuxtLink
              :to="localePath('/fixtures')"
              class="block text-center text-[11px] font-medium text-white bg-arsenal-red rounded-lg py-1.5 hover:bg-arsenal-red-dark transition-colors"
            >
              {{ t('home.viewAllFixtures') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Quick Links ===== -->
    <section>
      <div class="section-title mb-5">
        <h2 class="text-base font-bold">{{ t('home.quickLinks') || 'Quick Links' }}</h2>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <NuxtLink :to="localePath('/fixtures')" class="card !p-5 group">
          <div class="w-9 h-9 rounded-lg bg-arsenal-red-50 flex items-center justify-center mb-3 transition-colors group-hover:bg-arsenal-red/15">
            <svg class="w-4.5 h-4.5 text-arsenal-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="font-semibold text-arsenal-ink text-sm">{{ t('nav.fixtures') }}</div>
          <div class="text-xs text-arsenal-muted mt-1">{{ t('fixtures.subtitle') }}</div>
        </NuxtLink>

        <NuxtLink :to="localePath('/standings')" class="card !p-5 group">
          <div class="w-9 h-9 rounded-lg bg-arsenal-red-50 flex items-center justify-center mb-3 transition-colors group-hover:bg-arsenal-red/15">
            <svg class="w-4.5 h-4.5 text-arsenal-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="font-semibold text-arsenal-ink text-sm">{{ t('nav.standings') }}</div>
          <div class="text-xs text-arsenal-muted mt-1">{{ t('standings.subtitle') }}</div>
        </NuxtLink>

        <NuxtLink :to="localePath('/squad')" class="card !p-5 group">
          <div class="w-9 h-9 rounded-lg bg-arsenal-red-50 flex items-center justify-center mb-3 transition-colors group-hover:bg-arsenal-red/15">
            <svg class="w-4.5 h-4.5 text-arsenal-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="font-semibold text-arsenal-ink text-sm">{{ t('nav.squad') }}</div>
          <div class="text-xs text-arsenal-muted mt-1">{{ t('squad.subtitle') }}</div>
        </NuxtLink>

        <NuxtLink :to="localePath('/club')" class="card !p-5 group">
          <div class="w-9 h-9 rounded-lg bg-arsenal-red-50 flex items-center justify-center mb-3 transition-colors group-hover:bg-arsenal-red/15">
            <svg class="w-4.5 h-4.5 text-arsenal-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="font-semibold text-arsenal-ink text-sm">{{ t('nav.club') }}</div>
          <div class="text-xs text-arsenal-muted mt-1">{{ t('club.subtitle') }}</div>
        </NuxtLink>
      </div>
    </section>

    <!-- Divider -->
    <div class="divider" />

    <!-- ===== Recent Results ===== -->
    <section v-if="recentResults.length > 0">
      <div class="flex items-center justify-between mb-5">
        <div class="section-title">
          <h2 class="text-base font-bold">{{ t('home.recentResults') }}</h2>
        </div>
        <NuxtLink :to="localePath('/fixtures')" class="text-sm text-arsenal-red hover:underline font-medium inline-flex items-center gap-1">
          {{ t('home.viewAllFixtures') }}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
      <div class="space-y-2">
        <FixtureCard
          v-for="match in recentResults"
          :key="match.fixture.id"
          :match="match"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
