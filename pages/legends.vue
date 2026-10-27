<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const legendsList = legends as any[]

/* 温格（主帅）作为焦点，其余球员进网格 */
const featured = computed(() => legendsList.find((l) => l.position === 'Manager') || null)
const playerLegends = computed(() => legendsList.filter((l) => l.position !== 'Manager'))

const desc = (l: any) => l.description?.[locale.value] || l.description?.['en-US'] || ''

/* ---------- Hero 统计 ---------- */
const statLegends = legendsList.length
const statApps = legendsList.reduce((sum, l) => sum + (l.matches ?? l.apps ?? 0), 0)
const statGoals = legendsList.reduce((sum, l) => sum + (l.goals ?? 0), 0)

/* ---------- 图片回退：优先 /images/legends/{id}.jpg，缺失时用首字母占位 ---------- */
const failedArt = reactive(new Set<string>())
const artUrl = (id: string) => `/images/legends/${id}.jpg`
const initial = (name: string) => (name || '?').trim().charAt(0)

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
    <section class="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      <div class="lg-hero-bg absolute inset-0 bg-[url('/images/legends/legends-hero.jpg')] bg-cover bg-[center_30%]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.66)_0%,rgba(10,10,14,.3)_40%,rgba(10,10,14,.6)_72%,#0A0A0E_100%)]"></div>
      <div class="stroke-word pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-score text-[clamp(100px,19vw,320px)] font-bold leading-none tracking-[.06em] select-none">LEGENDS</div>

      <div class="relative z-[2] w-full shell-wide px-6 pt-36 pb-48 text-center">
        <div class="inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[.12em] text-white/85">
          <i class="h-2 w-2 animate-pulse rounded-full bg-arsenal-gold"></i>
          {{ t('legends.heroKicker') }}
        </div>
        <h1 class="mt-6 font-score text-[clamp(44px,8vw,104px)] font-bold uppercase leading-[1.05] tracking-[.04em] text-white drop-shadow-[0_14px_60px_rgba(0,0,0,.55)]">
          {{ t('legends.title') }}
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-base leading-8 text-white/70">{{ t('legends.heroSub') }}</p>
      </div>

      <!-- 底部统计条 -->
      <div class="absolute inset-x-0 bottom-0 z-[2] border-t border-white/10 bg-gradient-to-b from-transparent via-arsenal-night/60 to-arsenal-night/95 backdrop-blur-sm">
        <div class="shell-wide grid grid-cols-2 gap-y-5 py-7 md:grid-cols-4">
          <div v-for="(stat, i) in [
            { v: statLegends, l: t('legends.statLegends') },
            { v: statApps.toLocaleString(), l: t('legends.statApps') },
            { v: statGoals.toLocaleString(), l: t('legends.statGoals') },
            { v: 49, l: t('legends.statInvincibles') }
          ]" :key="i" class="text-center" :class="i > 0 ? 'md:border-l md:border-white/10' : ''">
            <b class="block font-score text-3xl font-bold leading-none text-white tabular-nums md:text-[42px]">{{ stat.v }}</b>
            <span class="mt-2 block text-xs tracking-[.22em] text-white/50">{{ stat.l }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 传奇主帅焦点 -->
    <section v-if="featured" class="relative overflow-hidden py-20 md:py-24">
      <div class="pointer-events-none absolute -left-56 -top-72 h-[620px] w-[620px] rounded-full border border-arsenal-gold/15"></div>
      <div class="relative z-[2] shell-wide">
        <div class="reveal mb-10 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded bg-arsenal-gold"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[32px]">{{ t('legends.managerTitle') }}</h2>
            <p class="mt-1 text-[13px] tracking-[.14em] text-white/50">{{ t('legends.managerSub') }}</p>
          </div>
        </div>

        <NuxtLink
          :to="localePath(`/legends/${featured.id}`)"
          class="reveal group grid grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night-soft transition-all duration-300 hover:border-arsenal-gold/40 hover:shadow-[0_30px_70px_rgba(0,0,0,.5)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <div class="relative min-h-[320px] overflow-hidden lg:min-h-[460px]">
            <img
              v-if="!failedArt.has(featured.id)"
              :src="artUrl(featured.id)"
              :alt="featured.name"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              loading="lazy"
              @error="failedArt.add(featured.id)"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-arsenal-night">
              <span class="font-score text-[120px] font-bold leading-none text-white/10">{{ initial(featured.name) }}</span>
            </div>
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.15)_0%,rgba(10,10,14,0)_45%,rgba(10,10,14,.55)_100%)] lg:bg-[linear-gradient(90deg,rgba(10,10,14,0)_55%,rgba(19,19,24,.9)_100%)]"></div>
          </div>

          <div class="flex flex-col justify-center p-7 md:p-12">
            <div class="inline-flex items-center gap-2 self-start rounded-full border border-arsenal-gold/40 bg-arsenal-gold/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.2em] text-arsenal-gold">
              {{ t('legends.managerBadge') }}
            </div>
            <h3 class="mt-5 font-score text-4xl font-bold uppercase tracking-[.03em] text-white md:text-5xl">{{ featured.name }}</h3>
            <div class="mt-2 text-sm font-medium uppercase tracking-[.16em] text-white/50">
              {{ featured.years }} · {{ featured.position }} · {{ featured.nationality }}
            </div>
            <p class="mt-5 text-[15px] leading-8 text-white/65">{{ desc(featured) }}</p>
            <div class="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
              <div>
                <b class="block font-score text-3xl font-bold leading-none text-white tabular-nums">1235</b>
                <span class="mt-1.5 block text-[11px] tracking-[.14em] text-white/45">{{ t('legends.fmMatches') }}</span>
              </div>
              <div>
                <b class="block font-score text-3xl font-bold leading-none text-white tabular-nums">22</b>
                <span class="mt-1.5 block text-[11px] tracking-[.14em] text-white/45">{{ t('legends.fmYears') }}</span>
              </div>
              <div>
                <b class="block font-score text-3xl font-bold leading-none text-arsenal-gold tabular-nums">3</b>
                <span class="mt-1.5 block text-[11px] tracking-[.14em] text-white/45">{{ t('legends.fmPl') }}</span>
              </div>
              <div>
                <b class="block font-score text-3xl font-bold leading-none text-arsenal-gold tabular-nums">7</b>
                <span class="mt-1.5 block text-[11px] tracking-[.14em] text-white/45">{{ t('legends.fmFa') }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 49 场不败金色横带 -->
    <section class="relative overflow-hidden border-y border-arsenal-gold/25 bg-[linear-gradient(100deg,rgba(201,162,75,.16)_0%,rgba(10,10,14,0)_45%,rgba(239,1,7,.12)_100%)]">
      <div class="shell-wide flex flex-col items-center gap-8 py-14 md:flex-row md:gap-14 md:py-16">
        <div class="reveal flex-none text-center md:text-right">
          <div class="font-score text-[110px] font-bold leading-none text-arsenal-gold tabular-nums md:text-[150px]">49</div>
        </div>
        <div class="reveal min-w-0 flex-1 border-t border-arsenal-gold/20 pt-6 text-center md:border-l md:border-t-0 md:pt-0 md:pl-14 md:text-left">
          <div class="text-[13px] font-bold uppercase tracking-[.35em] text-arsenal-gold">{{ t('legends.invLabel') }}</div>
          <h2 class="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-[30px]">{{ t('legends.invTitle') }}</h2>
          <p class="mt-3 max-w-xl text-[15px] leading-8 text-white/60">{{ t('legends.invSub') }}</p>
        </div>
      </div>
    </section>

    <!-- 不朽群星网格 -->
    <section class="bg-arsenal-night-soft py-20 md:py-24">
      <div class="shell-wide">
        <div class="reveal mb-10 flex items-end gap-3.5">
          <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[32px]">{{ t('legends.gridTitle') }}</h2>
            <p class="mt-1 text-[13px] tracking-[.14em] text-white/50">{{ t('legends.gridSub') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="l in playerLegends"
            :key="l.id"
            :to="localePath(`/legends/${l.id}`)"
            class="group overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night transition-all duration-300 hover:-translate-y-1.5 hover:border-arsenal-red/45 hover:shadow-[0_26px_60px_rgba(0,0,0,.5)]"
          >
            <div class="relative h-72 overflow-hidden">
              <img
                v-if="!failedArt.has(l.id)"
                :src="artUrl(l.id)"
                :alt="l.name"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                loading="lazy"
                @error="failedArt.add(l.id)"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-arsenal-night-soft">
                <span class="font-score text-[100px] font-bold leading-none text-white/10">{{ initial(l.name) }}</span>
              </div>
              <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.1)_0%,rgba(10,10,14,0)_40%,rgba(10,10,14,.72)_100%)]"></div>
              <div v-if="l.number" class="stroke-num pointer-events-none absolute right-4 top-2 font-score text-6xl font-bold leading-none">{{ l.number }}</div>
              <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div class="min-w-0">
                  <h3 class="truncate text-xl font-extrabold tracking-wide text-white">{{ l.name }}</h3>
                  <div class="mt-0.5 text-xs font-medium uppercase tracking-[.14em] text-white/55">{{ l.years }} · {{ l.position }}</div>
                </div>
                <span class="flex-none rounded-full border border-white/25 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">{{ l.nationality }}</span>
              </div>
            </div>
            <div class="p-6">
              <div class="flex gap-2.5">
                <span v-if="l.apps" class="rounded-md bg-white/[0.06] px-3 py-1.5 font-score text-sm font-bold text-white/80 tabular-nums">{{ l.apps }} <span class="ml-0.5 font-sans text-[10px] font-medium tracking-[.12em] text-white/45">{{ t('legends.apps') }}</span></span>
                <span v-if="l.goals" class="rounded-md bg-arsenal-red/10 px-3 py-1.5 font-score text-sm font-bold text-arsenal-gold tabular-nums">{{ l.goals }} <span class="ml-0.5 font-sans text-[10px] font-medium tracking-[.12em] text-white/45">{{ t('legends.goals') }}</span></span>
              </div>
              <p class="mt-4 text-sm leading-7 text-white/55">{{ desc(l) }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 传奇仍在继续 -->
    <section class="relative flex min-h-[380px] items-center bg-[url('/images/fans-stand.jpg')] bg-cover bg-center md:bg-fixed">
      <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,14,.9)_0%,rgba(10,10,14,.55)_55%,rgba(197,0,0,.35)_100%)]"></div>
      <div class="relative z-[2] w-full shell-wide px-6 py-16 md:py-20">
        <div class="reveal text-[13px] font-medium uppercase tracking-[.35em] text-arsenal-gold">{{ t('legends.nextKicker') }}</div>
        <h2 class="reveal mt-4 font-score text-[clamp(36px,6vw,72px)] font-bold uppercase leading-[1.05] tracking-[.02em] text-white">{{ t('legends.nextTitle') }}</h2>
        <p class="reveal mt-4 max-w-lg text-[15px] leading-8 text-white/70">{{ t('legends.nextSub') }}</p>
        <div class="reveal mt-8 flex flex-wrap gap-3.5">
          <NuxtLink :to="localePath('/squad')" class="btn-red">{{ t('legends.nextBtn') }}</NuxtLink>
        </div>
      </div>
    </section>
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
  -webkit-text-stroke: 1px rgba(255, 255, 255, .12);
}
.stroke-num {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, .5);
}
@media (prefers-reduced-motion: reduce) {
  .lg-hero-bg { animation: none; }
}
</style>
