<script setup lang="ts">
import { clubInfo, honours, stadiumInfo, womenInfo } from '~/utils/legends'

const { t, locale } = useI18n()
const localePath = useLocalePath()

/* ---------- Hero 统计 ---------- */
const clubYears = computed(() => new Date().getFullYear() - clubInfo.founded)
const heroStats = computed(() => [
  { v: clubYears.value, l: t('club.statYears'), gold: false },
  { v: 49, l: t('club.statTrophies'), gold: true },
  { v: 14, l: t('club.statTitles'), gold: false },
  { v: 14, l: t('club.statFa'), gold: false },
  { v: clubInfo.groundCapacity.toLocaleString(), l: t('club.statCapacity'), gold: true }
])

/* ---------- 荣誉室：联赛/足总杯/社区盾在前，三大项金色大卡 ---------- */
const honoursOrdered = computed<any[]>(() => [honours[0], honours[1], honours[3], honours[2], honours[4], honours[5]])

const tagKeys: Record<string, string> = {
  'First Division / Premier League': 'club.tagLeague',
  'FA Cup': 'club.tagFa',
  'FA Community Shield': 'club.tagShield',
  'UEFA Cup Winners\' Cup': 'club.tagCwc',
  'Inter-Cities Fairs Cup': 'club.tagFairs'
}
const honourTag = (h: any) => {
  const key = tagKeys[h.title['en-US']]
  return key ? t(key) : ''
}

/* 年份 chip：单杯用红色高亮，其余双冠年与最近一年金色高亮 */
const hotYears = new Set([1971, 1998, 2002])
const isHotYear = (h: any, y: number) =>
  h.count === 1 || hotYears.has(y) || y === h.years[h.years.length - 1]

/* ---------- 王朝时代 ---------- */
const eras = computed(() => [
  {
    years: '1930s',
    title: t('club.era1Title'),
    desc: t('club.era1Desc'),
    tags: ['1931', '1933', '1934', '1935', '1938'],
    bg: '/images/banner1.webp',
    gold: false
  },
  {
    years: '1971-91',
    title: t('club.era2Title'),
    desc: t('club.era2Desc'),
    tags: [t('club.era1Tag2'), '1989', '1991'],
    bg: '/images/banner2.webp',
    gold: false
  },
  {
    years: '1996-2018',
    title: t('club.era3Title'),
    desc: t('club.era3Desc'),
    tags: [t('club.era3Tag1'), t('club.era3Tag2'), t('club.era3Tag3')],
    bg: '/images/legends/legends-hero.jpg',
    gold: true
  },
  {
    years: '2019-',
    title: t('club.era4Title'),
    desc: t('club.era4Desc'),
    tags: [t('club.era4Tag1'), t('club.era4Tag2')],
    bg: '/images/fans-stand.jpg',
    gold: false
  }
])

/* ---------- 俱乐部信息 ---------- */
const factCells = computed(() => [
  { label: t('club.founded'), value: clubInfo.founded },
  { label: t('club.nickname'), value: clubInfo.nickname },
  { label: t('club.ground'), value: clubInfo.ground },
  { label: t('club.factCapacity'), value: clubInfo.groundCapacity.toLocaleString() },
  { label: t('club.city'), value: clubInfo.city },
  { label: t('club.manager'), value: clubInfo.manager },
  { label: t('club.chairman'), value: clubInfo.chairman },
  { label: t('club.factDirector'), value: clubInfo.sportDirector }
])

/* ---------- 酋长球场 ---------- */
const zhKey = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const stadiumDesc = computed(() => stadiumInfo.description[zhKey.value] || stadiumInfo.description['en-US'])
const stadiumCells = computed(() => [
  { label: t('stadium.name'), value: locale.value === 'zh' ? stadiumInfo.nameZh : stadiumInfo.name },
  { label: t('stadium.capacity'), value: stadiumInfo.capacity.toLocaleString() },
  { label: t('stadium.opened'), value: stadiumInfo.opened },
  { label: t('stadium.architect'), value: stadiumInfo.architect },
  { label: t('stadium.cost'), value: stadiumInfo.cost },
  { label: t('stadium.address'), value: stadiumInfo.address }
])
const stands = computed(() =>
  stadiumInfo.stands.map((s: any) => ({ name: locale.value === 'zh' ? s.nameZh : s.name, capacity: s.capacity }))
)
const transportRows = computed(() => stadiumInfo.transport.map((r: any) => r[zhKey.value] || r['en-US']))

/* ---------- 女足 ---------- */
const womenDesc = computed(() => womenInfo.description[zhKey.value] || womenInfo.description['en-US'])
const womenCells = computed(() => [
  { label: t('women.founded'), value: womenInfo.founded },
  { label: t('women.ground'), value: womenInfo.ground },
  { label: t('women.manager'), value: womenInfo.manager }
])

useHead({ title: () => `${t('club.heroTitle')} · Arsenal Hub` })

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
  <div class="min-h-screen bg-arsenal-night">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="club-hero-bg absolute inset-0 bg-[url('/images/club-hero.jpg')] bg-cover bg-[center_38%]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.74)_0%,rgba(10,10,14,.30)_38%,rgba(10,10,14,.58)_68%,#0A0A0E_100%)]"></div>
      <div class="stroke-word pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-score text-[clamp(140px,22vw,340px)] font-bold leading-none tracking-[.04em] select-none">1886</div>

      <div class="relative z-[2] shell-wide px-6 pt-36 pb-52">
        <div class="inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[.32em] text-white/70">
          <i class="h-[2px] w-[26px] bg-arsenal-gold"></i>
          {{ t('club.heroKicker') }}
        </div>
        <h1 class="mt-4 font-score text-[clamp(42px,6.5vw,84px)] font-bold uppercase leading-[1.06] tracking-[.02em] text-white drop-shadow-[0_14px_60px_rgba(0,0,0,.55)]">{{ t('club.heroTitle') }}</h1>
        <p class="mt-4 max-w-[640px] text-[15.5px] leading-[1.9] text-white/60">{{ t('club.heroSub') }}</p>
        <div class="mt-5 flex flex-wrap gap-2.5">
          <span class="rounded-full border border-arsenal-red/45 bg-arsenal-red/10 px-3.5 py-1.5 text-xs tracking-[.08em] text-[#ff9b9d]">{{ t('club.chipGunners') }}</span>
          <span class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ t('club.chipLondon') }}</span>
          <span class="rounded-full border border-arsenal-gold/45 bg-arsenal-gold/10 px-3.5 py-1.5 text-xs tracking-[.08em] text-arsenal-gold">{{ t('club.chipEmirates') }}</span>
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

    <!-- 荣誉室 -->
    <section class="pt-20 md:pt-24">
      <div class="shell-wide">
        <div class="reveal mb-8 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded bg-arsenal-gold"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('club.honours') }}</h2>
            <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">{{ t('club.honoursSub') }}</p>
          </div>
        </div>

        <div class="reveal grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="h in honoursOrdered"
            :key="h.title['en-US']"
            class="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1"
            :class="h.count >= 10
              ? 'border-arsenal-gold/35 bg-[linear-gradient(160deg,rgba(201,162,75,.10)_0%,#131318_55%)] hover:border-arsenal-gold/60'
              : 'border-white/10 bg-arsenal-night-soft hover:border-arsenal-red/45'"
          >
            <div class="flex items-baseline gap-2">
              <b class="font-score text-[64px] font-bold leading-none" :class="h.count >= 10 ? 'text-arsenal-gold' : 'text-white'">{{ h.count }}</b>
              <em class="text-xs not-italic tracking-[.18em] text-white/40">× </em>
            </div>
            <h3 class="mt-2.5 text-[17px] font-extrabold text-white">{{ h.title[locale] || h.title['en-US'] }}</h3>
            <div v-if="honourTag(h)" class="mt-1.5 text-[11px] font-bold tracking-[.14em]" :class="h.count >= 10 ? 'text-arsenal-gold' : 'text-arsenal-red'">{{ honourTag(h) }}</div>
            <div class="mt-4 flex flex-wrap gap-1.5 border-t border-dashed border-white/[0.12] pt-3.5">
              <span
                v-for="y in h.years"
                :key="y"
                class="rounded-md border px-2 py-0.5 font-score text-xs font-semibold tracking-[.06em]"
                :class="isHotYear(h, y)
                  ? (h.count === 1 ? 'border-arsenal-red/40 bg-arsenal-red/[0.18] text-white' : 'border-arsenal-gold/40 bg-arsenal-gold/[0.15] text-arsenal-gold')
                  : 'border-white/10 bg-white/[0.06] text-white/60'"
              >{{ y }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 王朝时代 -->
    <section class="pt-16 md:pt-20">
      <div class="shell-wide">
        <div class="reveal mb-8 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('club.erasTitle') }}</h2>
            <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">{{ t('club.erasSub') }}</p>
          </div>
        </div>

        <div class="reveal grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="era in eras"
            :key="era.years"
            class="era group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,.45)]"
            :class="era.gold ? 'border-arsenal-gold/35 hover:border-arsenal-gold/60' : 'border-white/10 hover:border-arsenal-red/45'"
          >
            <div class="absolute inset-0 bg-cover bg-[center_30%] opacity-[0.16] transition-opacity duration-300 group-hover:opacity-[0.28]" :style="{ backgroundImage: `url('${era.bg}')` }"></div>
            <div class="relative z-[1] p-6">
              <div class="era-years font-score text-[30px] font-bold leading-none tracking-[.03em]" :class="era.gold ? 'text-arsenal-gold/80' : 'text-white/45'">{{ era.years }}</div>
              <h3 class="mt-2.5 text-[16.5px] font-extrabold text-white">{{ era.title }}</h3>
              <p class="mt-2 min-h-[96px] text-[13px] leading-[1.85] text-white/60">{{ era.desc }}</p>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="tag in era.tags"
                  :key="tag"
                  class="rounded-md border px-2 py-0.5 text-[11px] font-bold"
                  :class="era.gold ? 'border-arsenal-gold/35 bg-arsenal-gold/10 text-arsenal-gold' : 'border-arsenal-red/30 bg-arsenal-red/10 text-[#ff9b9d]'"
                >{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 49 场不败金色横带 -->
    <section class="mt-16 border-y border-arsenal-gold/25 bg-[linear-gradient(100deg,rgba(201,162,75,.16)_0%,rgba(10,10,14,0)_45%,rgba(239,1,7,.12)_100%)] md:mt-20">
      <div class="shell-wide flex flex-col items-start gap-8 py-14 md:flex-row md:items-center md:gap-14">
        <div class="reveal flex-none font-score text-[90px] font-bold leading-none text-arsenal-gold tabular-nums md:text-[130px]">49</div>
        <div class="reveal border-t border-arsenal-gold/20 pt-6 md:border-l md:border-t-0 md:pl-14 md:pt-0">
          <div class="text-[12.5px] font-bold uppercase tracking-[.35em] text-arsenal-gold">{{ t('legends.invLabel') }}</div>
          <h3 class="mt-2.5 text-2xl font-extrabold text-white md:text-[26px]">{{ t('legends.invTitle') }}</h3>
          <p class="mt-2.5 max-w-[560px] text-sm leading-[1.9] text-white/60">{{ t('legends.invSub') }}</p>
        </div>
      </div>
    </section>

    <!-- 俱乐部档案 + 信息表 -->
    <section class="py-16 md:py-20">
      <div class="shell-wide grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div class="reveal">
          <div class="mb-8 flex items-end gap-3.5">
            <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
            <div>
              <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('club.profileTitle') }}</h2>
              <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">CLUB PROFILE</p>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-7 md:p-8">
            <p class="text-[14.5px] leading-[2.1] text-white/60">{{ clubInfo.description[zhKey] || clubInfo.description['en-US'] }}</p>
            <div class="mt-7 flex flex-wrap gap-3.5">
              <a :href="clubInfo.officialSite" target="_blank" rel="noopener noreferrer" class="btn-red">{{ t('club.profileBtnSite') }}</a>
              <NuxtLink :to="localePath('/legends')" class="btn-ghost">{{ t('club.profileBtnLegends') }}</NuxtLink>
            </div>
          </div>
        </div>

        <div class="reveal">
          <div class="mb-8 flex items-end gap-3.5">
            <span class="h-7 w-[5px] flex-none rounded bg-arsenal-gold"></span>
            <div>
              <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('club.factsTitle') }}</h2>
              <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">FACT SHEET</p>
            </div>
          </div>
          <div class="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night-soft sm:grid-cols-2">
            <div v-for="(cell, i) in factCells" :key="i" class="fact-cell px-6 py-4">
              <small class="block text-[11px] tracking-[.18em] text-white/40">{{ cell.label }}</small>
              <b class="mt-1 block text-[14.5px] font-bold text-white">{{ cell.value }}</b>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 酋长球场 -->
    <section id="stadium" class="pt-16 md:pt-20">
      <div class="shell-wide">
        <div class="reveal mb-8 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded bg-arsenal-gold"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('club.stadiumTitle') }}</h2>
            <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">{{ t('club.stadiumSub') }}</p>
          </div>
        </div>

        <div class="reveal grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div class="lg:col-span-3">
            <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-6">
              <p class="text-[14px] leading-[2] text-white/65">{{ stadiumDesc }}</p>
              <div class="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div v-for="cell in stadiumCells" :key="cell.label">
                  <small class="block text-[11px] tracking-[.18em] text-white/40">{{ cell.label }}</small>
                  <b class="mt-1 block text-[13.5px] font-bold leading-relaxed text-white">{{ cell.value }}</b>
                </div>
              </div>
            </div>
            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div v-for="stand in stands" :key="stand.name" class="rounded-xl border border-white/10 bg-arsenal-night-soft px-3 py-3.5 text-center">
                <div class="text-[13px] font-bold text-white">{{ stand.name }}</div>
                <div class="mt-1 font-score text-lg font-semibold text-arsenal-gold">{{ stand.capacity.toLocaleString() }}</div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-2">
            <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-6">
              <h3 class="text-[15px] font-extrabold text-white">{{ t('stadium.transport') }}</h3>
              <div class="mt-4 space-y-3">
                <div v-for="(route, i) in transportRows" :key="i" class="flex items-start gap-3">
                  <span class="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-arsenal-red/15 text-xs font-bold text-[#ff9b9d]">{{ i + 1 }}</span>
                  <span class="text-[13px] leading-relaxed text-white/60">{{ route }}</span>
                </div>
              </div>
            </div>
            <div class="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1720%2C51.5450%2C-0.1370%2C51.5650&layer=mapnik&marker=51.5549%2C-0.1547"
                width="100%"
                height="240"
                class="block w-full grayscale-[0.35]"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Emirates Stadium map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 女足 -->
    <section id="women" class="pt-16 md:pt-20">
      <div class="shell-wide">
        <div class="reveal mb-8 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('club.womenTitle') }}</h2>
            <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">{{ t('club.womenSub') }}</p>
          </div>
        </div>

        <div class="reveal grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-6 lg:col-span-3">
            <p class="text-[14px] leading-[2] text-white/65">{{ womenDesc }}</p>
            <div class="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              <div v-for="cell in womenCells" :key="cell.label">
                <small class="block text-[11px] tracking-[.18em] text-white/40">{{ cell.label }}</small>
                <b class="mt-1 block text-[13.5px] font-bold text-white">{{ cell.value }}</b>
              </div>
            </div>
            <a :href="womenInfo.officialSite" target="_blank" rel="noopener noreferrer" class="btn-ghost mt-6">{{ t('club.officialSite') }} →</a>
          </div>
          <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-6 lg:col-span-2">
            <h3 class="text-[15px] font-extrabold text-white">{{ t('club.womenHonours') }}</h3>
            <div class="mt-4">
              <div v-for="h in womenInfo.honours" :key="h.title['en-US']" class="flex items-center justify-between border-b border-white/[0.07] py-2.5 last:border-0 last:pb-0">
                <span class="text-[13.5px] text-white/70">{{ h.title[zhKey] || h.title['en-US'] }}</span>
                <b class="font-score text-xl font-bold text-arsenal-gold">{{ h.count }}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative flex min-h-[380px] items-center bg-[url('/images/fans-stand.jpg')] bg-cover bg-center md:bg-fixed">
      <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,14,.92)_0%,rgba(10,10,14,.55)_55%,rgba(197,0,0,.35)_100%)]"></div>
      <div class="relative z-[2] w-full shell-wide px-6 py-16 md:py-20">
        <div class="reveal text-[13px] font-medium uppercase tracking-[.35em] text-arsenal-gold">{{ t('club.ctaKicker') }}</div>
        <h2 class="reveal mt-3.5 font-score text-[clamp(36px,6vw,68px)] font-bold uppercase leading-[1.05] text-white">{{ t('club.ctaTitle') }}</h2>
        <p class="reveal mt-3.5 max-w-[520px] text-[15px] leading-[1.9] text-white/70">{{ t('club.ctaSub') }}</p>
        <div class="reveal mt-7 flex flex-wrap gap-3.5">
          <NuxtLink :to="localePath('/squad')" class="btn-red">{{ t('club.ctaBtnSquad') }}</NuxtLink>
          <NuxtLink :to="localePath('/legends')" class="btn-ghost">{{ t('club.ctaBtnLegends') }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.club-hero-bg {
  animation: clubHeroZoom 18s ease-out forwards;
}
@keyframes clubHeroZoom {
  from { transform: scale(1.08); }
  to { transform: scale(1); }
}
.stroke-word {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, .13);
}
/* 信息表分隔线（1 列移动端 / 2 列桌面端） */
.fact-cell:nth-child(n+2) { border-top: 1px solid rgba(255,255,255,.1); }
@media (min-width: 640px) {
  .fact-cell:nth-child(n+2) { border-top: none; }
  .fact-cell:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,.1); }
  .fact-cell:nth-child(2n) { border-left: 1px solid rgba(255,255,255,.1); }
}
@media (prefers-reduced-motion: reduce) {
  .club-hero-bg { animation: none; }
}
</style>
