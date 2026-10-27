<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const playerId = computed(() => route.params.id as string)
const { data } = await useFetch(() => `/api/player/${playerId.value}`)
const player = computed(() => data.value?.response || null)

/* 阵容顺序（上/下一位导航，与阵容页排序一致） */
const { data: squadData } = await useFetch('/api/squad')
const squadList = computed<any[]>(() => squadData.value?.response || [])
const posOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 }
const sortedSquad = computed(() => [...squadList.value].sort((a: any, b: any) =>
  ((posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9)) ||
  ((a.number ?? 999) - (b.number ?? 999))
))
const myIdx = computed(() => sortedSquad.value.findIndex((p: any) => String(p.id) === playerId.value))
const prevPlayer = computed(() => myIdx.value >= 0 ? sortedSquad.value[(myIdx.value - 1 + sortedSquad.value.length) % sortedSquad.value.length] : null)
const nextPlayer = computed(() => myIdx.value >= 0 ? sortedSquad.value[(myIdx.value + 1) % sortedSquad.value.length] : null)

const positionLabels: Record<string, { zh: string; en: string }> = {
  GK: { zh: '门将', en: 'Goalkeeper' },
  DEF: { zh: '后卫', en: 'Defender' },
  MID: { zh: '中场', en: 'Midfielder' },
  FWD: { zh: '前锋', en: 'Forward' }
}
const getPositionLabel = (key: string) => {
  const labels = positionLabels[key]
  if (!labels) return key
  return locale.value === 'zh-CN' ? labels.zh : labels.en
}

/* Hero 背景图：优先球员专属图 /images/players/detail/{id}.jpg，缺失时回退位置示意图 */
const artFailed = ref(false)
watch(() => route.params.id, () => { artFailed.value = false })
const posArt: Record<string, string> = {
  GK: '/images/kp-gk.jpg',
  DEF: '/images/kp-def.jpg',
  MID: '/images/kp-mid.jpg',
  FWD: '/images/kp-forward.jpg'
}
const heroArt = computed(() =>
  artFailed.value
    ? posArt[player.value?.position] || '/images/kp-forward.jpg'
    : `/images/players/detail/${playerId.value}.jpg`
)

/* 描边大字：号码，缺号码时用位置 */
const strokeWord = computed(() => String(player.value?.number ?? player.value?.positionShort ?? ''))

/* Hero 统计 5 格（按位置调整） */
const s = (k: string) => (player.value?.stats as any)?.[k] ?? 0
const heroStats = computed(() => {
  if (!player.value) return []
  const pos = player.value.position
  if (pos === 'GK') {
    return [
      { v: s('appearances'), l: t('squad.appearances'), gold: false },
      { v: s('saves'), l: t('squad.saves'), gold: true },
      { v: s('cleanSheets'), l: t('squad.cleanSheets'), gold: false },
      { v: s('form'), l: t('squad.form'), gold: false },
      { v: s('totalPoints'), l: t('squad.totalPoints'), gold: true }
    ]
  }
  if (pos === 'DEF') {
    return [
      { v: s('appearances'), l: t('squad.appearances'), gold: false },
      { v: s('goals'), l: t('squad.goals'), gold: true },
      { v: s('assists'), l: t('squad.assists'), gold: false },
      { v: s('cleanSheets'), l: t('squad.cleanSheets'), gold: false },
      { v: s('totalPoints'), l: t('squad.totalPoints'), gold: true }
    ]
  }
  return [
    { v: s('appearances'), l: t('squad.appearances'), gold: false },
    { v: s('goals'), l: t('squad.goals'), gold: true },
    { v: s('assists'), l: t('squad.assists'), gold: true },
    { v: s('form'), l: t('squad.form'), gold: false },
    { v: s('totalPoints'), l: t('squad.totalPoints'), gold: false }
  ]
})

/* 赛季数据 6 格 */
const seasonCells = computed(() => {
  if (!player.value) return []
  return [
    { v: s('starts'), l: t('squad.starts') },
    { v: s('minutes'), l: t('squad.minutes') },
    { v: s('yellowCards'), l: t('squad.yellowCards') },
    { v: s('redCards'), l: t('squad.redCards') },
    { v: s('bonusPoints'), l: t('squad.bonus') },
    { v: s('pointsPerGame'), l: t('squad.ppg') }
  ]
})

/* FPL 三项指数进度条 */
const ictRows = computed(() => {
  const i = Number(s('influence')) || 0
  const c = Number(s('creativity')) || 0
  const th = Number(s('threat')) || 0
  const sum = i + c + th || 1
  const fmt = (v: number) => (Number.isInteger(v) ? v : v.toFixed(1))
  return [
    { label: t('squad.influence'), v: fmt(i), pct: (i / sum) * 100, gold: false },
    { label: t('squad.creativity'), v: fmt(c), pct: (c / sum) * 100, gold: false },
    { label: t('squad.threat'), v: fmt(th), pct: (th / sum) * 100, gold: false },
    { label: t('squad.form'), v: Number(s('form')) || 0, pct: (Number(s('form')) || 0) * 10, gold: true }
  ]
})

/* 近 5 场状态点：按 FPL 积分分级 */
const dotClass = (pts: number) =>
  pts >= 8 ? 'bg-[#2FBF71]' : pts >= 5 ? 'bg-arsenal-gold' : 'bg-arsenal-red'

const fplCells = computed(() => {
  if (!player.value) return []
  return [
    { v: `£${s('nowCost')}m`, l: t('squad.price') },
    { v: `${s('selectedBy')}%`, l: t('squad.selectedBy') },
    { v: s('form'), l: t('squad.form') },
    { v: s('totalPoints'), l: t('squad.totalPoints') }
  ]
})

useHead({ title: () => `${player.value?.webName || player.value?.fullName || ''} · Arsenal Hub` })

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
    <EmptyState v-if="!player" icon="🧤" :message="t('common.noData')" />

    <template v-if="player">
      <!-- Hero -->
      <section class="relative overflow-hidden">
        <img
          :src="heroArt"
          :alt="player.fullName"
          class="absolute inset-0 h-full w-full object-cover object-[center_25%]"
          @error="artFailed = true"
        />
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.72)_0%,rgba(10,10,14,.28)_38%,rgba(10,10,14,.55)_68%,#0A0A0E_100%)]"></div>
        <div class="stroke-word pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-score text-[clamp(140px,22vw,340px)] font-bold leading-none tracking-[.04em] select-none">{{ strokeWord }}</div>

        <div class="relative z-[2] shell-wide px-6 pt-36 pb-52">
          <div class="inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[.32em] text-white/70">
            <i class="h-[2px] w-[26px] bg-arsenal-red"></i>
            {{ t('squad.profileKicker') }}
          </div>
          <h1 class="mt-4 font-score text-[clamp(42px,6.5vw,84px)] font-bold uppercase leading-[1.06] tracking-[.02em] text-white drop-shadow-[0_14px_60px_rgba(0,0,0,.55)]">{{ player.webName || player.fullName }}</h1>
          <div class="mt-5 flex flex-wrap gap-2.5">
            <span v-if="player.number" class="rounded-full border border-arsenal-gold/45 bg-arsenal-gold/10 px-3.5 py-1.5 text-xs font-bold tracking-[.08em] text-arsenal-gold">#{{ player.number }}</span>
            <span class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ getPositionLabel(player.position) }}</span>
            <span v-if="player.nationality" class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ player.nationality }}</span>
            <span v-if="player.age" class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ player.age }} {{ t('squad.yearsOld') }}</span>
            <span v-if="player.news" class="max-w-[340px] truncate rounded-full border border-arsenal-red/40 bg-arsenal-red/10 px-3.5 py-1.5 text-xs tracking-[.04em] text-[#ff9b9d]">📣 {{ player.news }}</span>
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

      <!-- 赛季数据 + FPL 三项指数 -->
      <section class="pb-10 pt-20 md:pt-24">
        <div class="shell-wide grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div class="reveal">
            <div class="mb-8 flex items-end gap-3.5">
              <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
              <div>
                <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('squad.seasonStats') }}</h2>
                <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">SEASON STATS</p>
              </div>
            </div>
            <div class="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night-soft sm:grid-cols-3">
              <div v-for="(cell, i) in seasonCells" :key="i" class="scell py-6 text-center">
                <b class="block font-score text-[26px] font-bold leading-none text-white tabular-nums">{{ cell.v }}</b>
                <span class="mt-2 block text-[11px] tracking-[.14em] text-white/40">{{ cell.l }}</span>
              </div>
            </div>
          </div>

          <div class="reveal">
            <div class="mb-8 flex items-end gap-3.5">
              <span class="h-7 w-[5px] flex-none rounded bg-arsenal-gold"></span>
              <div>
                <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('squad.ictTitle') }}</h2>
                <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">INFLUENCE / CREATIVITY / THREAT</p>
              </div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-arsenal-night-soft p-7 md:p-8">
              <div class="grid gap-6">
                <div v-for="(row, i) in ictRows" :key="i">
                  <div class="flex items-baseline justify-between text-xs tracking-[.12em] text-white/60">
                    <span>{{ row.label }}</span>
                    <b class="font-score text-[19px] tracking-normal text-white tabular-nums">{{ row.v }}</b>
                  </div>
                  <div class="mt-2 h-[7px] overflow-hidden rounded-full bg-white/[0.08]">
                    <div class="h-full rounded-full" :class="row.gold ? 'bg-[linear-gradient(90deg,#7d6325,#C9A24B)]' : 'bg-[linear-gradient(90deg,#7a0004,#EF0107)]'" :style="{ width: Math.min(100, row.pct) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 近 5 场 + FPL 档案 -->
      <section class="pb-4 pt-10">
        <div class="shell-wide grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div class="reveal">
            <div class="mb-8 flex items-end gap-3.5">
              <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
              <div>
                <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('squad.lastFive') }}</h2>
                <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">LAST 5 MATCHES</p>
              </div>
            </div>
            <div v-if="player.lastFive && player.lastFive.length" class="overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night-soft">
              <div v-for="(m, i) in player.lastFive" :key="m.gameweek" class="flex items-center gap-4 px-5 py-4 md:px-7" :class="i > 0 ? 'border-t border-white/10' : ''">
                <span class="h-[9px] w-[9px] flex-none rounded-full" :class="dotClass(m.totalPoints)"></span>
                <span class="w-12 flex-none font-score text-[13px] text-white/40">GW{{ m.gameweek }}</span>
                <span class="min-w-0 flex-1 truncate text-sm text-white/85">
                  <small class="mr-2 text-[11.5px] tracking-[.08em] text-white/40">{{ m.isHome ? t('common.home') : t('common.away') }}</small>{{ m.opponent }}
                </span>
                <span class="hidden flex-none gap-1.5 sm:flex">
                  <span v-if="m.goals > 0" class="rounded-md bg-[#2FBF71]/15 px-2 py-0.5 text-[11px] font-bold text-[#5AD698]">{{ m.goals }}G</span>
                  <span v-if="m.assists > 0" class="rounded-md bg-[#5A8CFF]/15 px-2 py-0.5 text-[11px] font-bold text-[#8FB0FF]">{{ m.assists }}A</span>
                  <span v-if="m.cleanSheets > 0" class="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] font-bold text-white/60">CS</span>
                  <span v-if="m.minutes > 0" class="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] font-bold text-white/60">{{ m.minutes }}'</span>
                </span>
                <span class="w-14 flex-none text-right font-score text-base font-bold text-white tabular-nums">{{ m.totalPoints }}<small class="ml-0.5 text-[10px] font-normal text-white/35">pts</small></span>
              </div>
            </div>
            <div v-else class="rounded-2xl border border-white/10 bg-arsenal-night-soft px-6 py-8 text-center text-sm text-white/45">{{ t('common.noData') }}</div>
          </div>

          <div class="reveal">
            <div class="mb-8 flex items-end gap-3.5">
              <span class="h-7 w-[5px] flex-none rounded bg-arsenal-gold"></span>
              <div>
                <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[26px]">{{ t('squad.fplTitle') }}</h2>
                <p class="mt-1 text-[12.5px] tracking-[.16em] text-white/40">FANTASY PROFILE</p>
              </div>
            </div>
            <div class="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night-soft">
              <div v-for="(cell, i) in fplCells" :key="i" class="fcell px-4 py-6 text-center">
                <b class="block font-score text-3xl font-bold leading-none text-arsenal-gold tabular-nums">{{ cell.v }}</b>
                <span class="mt-2 block text-[11px] tracking-[.18em] text-white/40">{{ cell.l }}</span>
              </div>
            </div>
            <NuxtLink :to="localePath('/squad')" class="mt-7 inline-flex items-center gap-2 text-[13.5px] text-white/60 transition-colors hover:text-white">← {{ t('squad.backToList') }}</NuxtLink>
          </div>
        </div>
      </section>

      <!-- 上/下一位 -->
      <div class="shell-wide">
        <div class="flex flex-col gap-4 py-14 sm:flex-row sm:justify-between md:py-16">
          <NuxtLink v-if="prevPlayer" :to="localePath(`/player/${prevPlayer.id}`)" class="flex min-w-[220px] flex-col gap-1.5 rounded-2xl border border-white/10 bg-arsenal-night-soft px-6 py-[18px] transition-all hover:-translate-y-0.5 hover:border-arsenal-red/50">
            <small class="text-[11px] tracking-[.2em] text-white/40">← {{ t('squad.prev') }}</small>
            <b class="text-[15.5px] text-white">#{{ prevPlayer.number ?? '?' }} {{ prevPlayer.webName || prevPlayer.fullName }}</b>
          </NuxtLink>
          <NuxtLink v-if="nextPlayer" :to="localePath(`/player/${nextPlayer.id}`)" class="flex min-w-[220px] flex-col gap-1.5 rounded-2xl border border-white/10 bg-arsenal-night-soft px-6 py-[18px] text-right transition-all hover:-translate-y-0.5 hover:border-arsenal-red/50 sm:ml-auto">
            <small class="text-[11px] tracking-[.2em] text-white/40">{{ t('squad.next') }} →</small>
            <b class="text-[15.5px] text-white">#{{ nextPlayer.number ?? '?' }} {{ nextPlayer.webName || nextPlayer.fullName }}</b>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stroke-word {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, .13);
}
/* 赛季数据网格分隔线（2 列移动端 / 3 列桌面端） */
.scell:nth-child(2n) { border-left: 1px solid rgba(255,255,255,.1); }
.scell:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,.1); }
@media (min-width: 640px) {
  .scell:nth-child(2n) { border-left: none; }
  .scell:nth-child(3n+2), .scell:nth-child(3n) { border-left: 1px solid rgba(255,255,255,.1); }
  .scell:nth-child(n+3) { border-top: none; }
  .scell:nth-child(n+4) { border-top: 1px solid rgba(255,255,255,.1); }
}
/* FPL 档案分隔线（2 列移动端 / 4 列桌面端） */
.fcell:nth-child(2n) { border-left: 1px solid rgba(255,255,255,.1); }
.fcell:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,.1); }
@media (min-width: 640px) {
  .fcell:nth-child(n+3) { border-top: none; }
  .fcell:nth-child(2n+1) { border-left: none; }
  .fcell + .fcell { border-left: 1px solid rgba(255,255,255,.1); }
}
</style>
