<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const legendsList = legends as any[]
const legend = computed(() => legendsList.find((l) => l.id === route.params.id) || null)

if (!legend.value) {
  throw createError({ statusCode: 404, statusMessage: 'Legend not found' })
}

const isManager = computed(() => legend.value?.position === 'Manager')

/* 上/下一位（循环） */
const idx = computed(() => legendsList.findIndex((l) => l.id === route.params.id))
const prevLegend = computed(() => legendsList[(idx.value - 1 + legendsList.length) % legendsList.length])
const nextLegend = computed(() => legendsList[(idx.value + 1) % legendsList.length])

const desc = (l: any) => l.description?.[locale.value] || l.description?.['en-US'] || ''
const honoursOf = computed(() => legend.value?.honours?.[locale.value] || legend.value?.honours?.['en-US'] || [])
const highlightsOf = computed(() => legend.value?.highlights || [])

const positionLabels: Record<string, { zh: string; en: string }> = {
  Manager: { zh: '主教练', en: 'Manager' },
  Forward: { zh: '前锋', en: 'Forward' },
  Midfielder: { zh: '中场', en: 'Midfielder' },
  Defender: { zh: '后卫', en: 'Defender' },
  Goalkeeper: { zh: '门将', en: 'Goalkeeper' }
}
const positionLabel = (p: string) => {
  const labels = positionLabels[p]
  if (!labels) return p
  return locale.value === 'zh-CN' ? labels.zh : labels.en
}

/* 描边大字：球员用号码，主帅用执教起始年份 */
const strokeWord = computed(() => {
  if (!legend.value) return ''
  if (legend.value.number) return String(legend.value.number)
  return legend.value.years?.split('-')[0] || 'LEGEND'
})

/* 执教/效力年限数字（如 1996-2018 → 22） */
const yearsNum = computed(() => {
  const m = legend.value?.years?.match(/(\d{4})-(\d{4})/)
  return m ? Number(m[2]) - Number(m[1]) : 0
})

/* Hero 统计 5 格 */
const heroStats = computed(() => {
  const l = legend.value
  if (!l) return []
  if (l.position === 'Manager') {
    return [
      { v: (l.matches ?? 0).toLocaleString(), l: t('legends.fmMatches'), gold: true },
      { v: yearsNum.value, l: t('legends.fmYears'), gold: false },
      { v: l.plTitles ?? 0, l: t('legends.fmPl'), gold: false },
      { v: l.faCups ?? 0, l: t('legends.fmFa'), gold: false },
      { v: honoursOf.value.length, l: t('legends.honoursCount'), gold: true }
    ]
  }
  return [
    { v: (l.apps ?? 0).toLocaleString(), l: t('legends.apps'), gold: false },
    { v: l.goals ?? 0, l: t('legends.goals'), gold: true },
    { v: l.plTitles ?? 0, l: t('legends.plTitles'), gold: false },
    { v: l.faCups ?? 0, l: t('legends.faCups'), gold: false },
    { v: honoursOf.value.length, l: t('legends.honoursCount'), gold: true }
  ]
})

/* 荣誉 chip：球员含 × 的红色、其余金色；主帅全金色 */
const chipGold = (s: string) => isManager.value || !/×/.test(s)

useHead({ title: () => `${legend.value?.name || ''} · Arsenal Hub` })

/* ---------- 滚动入场 ---------- */
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    })
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
})
</script>

<template>
  <div v-if="legend" class="min-h-screen bg-arsenal-night">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="lg-hero-bg absolute inset-0 bg-cover bg-[center_28%]"
        :style="{ backgroundImage: `url('/images/legends/${legend.id}.jpg')` }"
      ></div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.72)_0%,rgba(10,10,14,.28)_38%,rgba(10,10,14,.55)_68%,#0A0A0E_100%)]"></div>
      <div class="stroke-word pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-score text-[clamp(140px,22vw,340px)] font-bold leading-none tracking-[.04em] select-none">{{ strokeWord }}</div>

      <div class="relative z-[2] shell-wide px-6 pt-36 pb-52">
        <div class="inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[.32em] text-white/70">
          <i class="h-[2px] w-[26px]" :class="isManager ? 'bg-arsenal-gold' : 'bg-arsenal-red'"></i>
          {{ t('legends.profileKicker') }}
        </div>
        <h1 class="mt-4 font-score text-[clamp(42px,6.5vw,84px)] font-bold uppercase leading-[1.06] tracking-[.02em] text-white drop-shadow-[0_14px_60px_rgba(0,0,0,.55)]">{{ legend.name }}</h1>
        <div class="mt-5 flex flex-wrap gap-2.5">
          <span class="rounded-full border border-arsenal-gold/45 bg-arsenal-gold/10 px-3.5 py-1.5 text-xs tracking-[.08em] text-arsenal-gold">{{ legend.years }}</span>
          <span class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ positionLabel(legend.position) }}</span>
          <span class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ legend.nationality }}</span>
          <span v-if="isManager" class="rounded-full border border-arsenal-gold/40 bg-arsenal-gold/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.2em] text-arsenal-gold">{{ t('legends.managerBadge') }}</span>
        </div>
      </div>

      <!-- Hero 底部统计条 -->
      <div class="absolute inset-x-0 bottom-0 z-[3] border-t border-white/10 bg-gradient-to-b from-transparent via-arsenal-night/55 to-arsenal-night/90 backdrop-blur-sm">
        <div class="shell-wide grid grid-cols-2 gap-y-5 md:grid-cols-5">
          <div v-for="(stat, i) in heroStats" :key="i" class="py-6 text-center" :class="i > 0 ? 'md:border-l md:border-white/10' : ''">
            <b class="block font-score text-4xl font-bold leading-none tabular-nums md:text-[40px]" :class="stat.gold ? 'text-arsenal-gold' : 'text-white'">{{ stat.v }}</b>
            <span class="mt-2 block text-[11px] tracking-[.22em] text-white/45">{{ stat.l }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 荣誉墙 -->
    <section class="pt-20 md:pt-24">
      <div class="shell-wide">
        <div class="reveal mb-8 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded" :class="isManager ? 'bg-arsenal-gold' : 'bg-arsenal-red'"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('legends.honoursTitle') }}</h2>
            <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">HONOURS</p>
          </div>
        </div>
        <div class="reveal flex flex-wrap gap-3">
          <span
            v-for="(h, i) in honoursOf"
            :key="i"
            class="inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[13.5px] font-semibold"
            :class="chipGold(h)
              ? 'border-arsenal-gold/40 bg-arsenal-gold/10 text-arsenal-gold'
              : 'border-arsenal-red/35 bg-arsenal-red/[0.08] text-[#ff9b9d]'"
          >
            <i class="h-[7px] w-[7px] flex-none rounded-full" :class="chipGold(h) ? 'bg-arsenal-gold' : 'bg-arsenal-red'"></i>
            {{ h }}
          </span>
        </div>
      </div>
    </section>

    <!-- 生涯大事记 + 传奇印记 -->
    <section class="pt-16 md:pt-20">
      <div class="shell-wide grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div class="reveal">
          <div class="mb-8 flex items-end gap-3.5">
            <span class="h-7 w-[5px] flex-none rounded" :class="isManager ? 'bg-arsenal-gold' : 'bg-arsenal-red'"></span>
            <div>
              <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('legends.timelineTitle') }}</h2>
              <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">CAREER TIMELINE</p>
            </div>
          </div>
          <div v-if="highlightsOf.length" class="timeline ml-2.5">
            <div v-for="(h, i) in highlightsOf" :key="i" class="tl-item">
              <div class="tl-year font-score text-[22px] font-bold tracking-[.04em] text-arsenal-gold">{{ h.year }}</div>
              <h4 class="mt-1 text-base font-bold text-white">{{ h.title?.[locale.value] || h.title?.['en-US'] }}</h4>
              <p class="mt-1.5 max-w-[640px] text-[13.5px] leading-[1.85] text-white/60">{{ h.text?.[locale.value] || h.text?.['en-US'] }}</p>
            </div>
          </div>
        </div>

        <div class="reveal">
          <div class="mb-8 flex items-end gap-3.5">
            <span class="h-7 w-[5px] flex-none rounded" :class="isManager ? 'bg-arsenal-gold' : 'bg-arsenal-red'"></span>
            <div>
              <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('legends.legacyTitle') }}</h2>
              <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">LEGACY</p>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-7 md:p-8">
            <p class="text-[14.5px] leading-[2.1] text-white/60">{{ desc(legend) }}</p>
            <div v-if="legend.extraChips?.length" class="mt-6 flex flex-wrap gap-2">
              <span v-for="(c, i) in legend.extraChips" :key="i" class="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs tracking-[.08em] text-white/60">{{ c }}</span>
            </div>
          </div>
          <NuxtLink :to="localePath('/legends')" class="mt-7 inline-flex items-center gap-2 text-[13.5px] text-white/60 transition-colors hover:text-white">← {{ t('legends.backHall') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- 上/下一位 -->
    <div class="shell-wide">
      <div class="flex flex-col gap-4 py-14 sm:flex-row sm:justify-between md:py-16">
        <NuxtLink
          :to="localePath(`/legends/${prevLegend.id}`)"
          class="group flex min-w-[220px] flex-col gap-1.5 rounded-2xl border border-white/10 bg-arsenal-night-soft px-6 py-[18px] transition-all hover:-translate-y-0.5 hover:border-arsenal-red/50"
        >
          <small class="text-[11px] tracking-[.2em] text-white/40">← {{ t('legends.prev') }}</small>
          <b class="text-[15.5px] text-white">{{ prevLegend.name }}</b>
        </NuxtLink>
        <NuxtLink
          :to="localePath(`/legends/${nextLegend.id}`)"
          class="group flex min-w-[220px] flex-col gap-1.5 rounded-2xl border border-white/10 bg-arsenal-night-soft px-6 py-[18px] text-right transition-all hover:-translate-y-0.5 hover:border-arsenal-red/50 sm:ml-auto"
        >
          <small class="text-[11px] tracking-[.2em] text-white/40">{{ t('legends.next') }} →</small>
          <b class="text-[15.5px] text-white">{{ nextLegend.name }}</b>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lg-hero-bg {
  animation: lgHeroZoom 18s ease-out forwards;
}
@keyframes lgHeroZoom {
  from { transform: scale(1.08); }
  to { transform: scale(1); }
}
.stroke-word {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, .13);
}
.timeline {
  border-left: 2px solid rgba(201, 162, 75, .28);
  padding-left: 36px;
  display: grid;
  gap: 30px;
}
.tl-item {
  position: relative;
}
.tl-item::before {
  content: '';
  position: absolute;
  left: -43px;
  top: 7px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0A0A0E;
  border: 3px solid #C9A24B;
}
@media (prefers-reduced-motion: reduce) {
  .lg-hero-bg { animation: none; }
}
</style>
