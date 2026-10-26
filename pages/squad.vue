<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const { data, pending } = await useFetch('/api/squad')
const players = computed<any[]>(() => data.value?.response || [])

const s = (p: any, k: string) => p?.stats?.[k] ?? 0

/* ---------- Hero 统计 ---------- */
const statPlayers = computed(() => players.value.length)
const statNations = computed(() => new Set(players.value.map((p) => p.nationality).filter(Boolean)).size)
const statAvgAge = computed(() => {
  const arr = players.value.filter((p) => p.age)
  if (!arr.length) return '--'
  return (arr.reduce((sum: number, p) => sum + Number(p.age || 0), 0) / arr.length).toFixed(1)
})
const statGoals = computed(() => players.value.reduce((sum: number, p) => sum + s(p, 'goals'), 0))

/* ---------- 核心焦点（按位置选最强） ---------- */
const posArt: Record<string, string> = {
  GK: '/images/kp-gk.jpg',
  DEF: '/images/kp-def.jpg',
  MID: '/images/kp-mid.jpg',
  FWD: '/images/kp-forward.jpg'
}

const best = (pos: string, score: (p: any) => number) => {
  const group = players.value.filter((p) => p.position === pos)
  if (!group.length) return null
  return [...group].sort((a, b) => score(b) - score(a))[0]
}

interface KeyStat { label: string; value: string | number }
interface KeyPlayer { player: any; art: string; stats: KeyStat[] }

const keyPlayers = computed<KeyPlayer[]>(() => {
  const list: KeyPlayer[] = []
  const fwd = best('FWD', (p) => s(p, 'goals') * 100 + s(p, 'assists'))
  const mid = best('MID', (p) => s(p, 'assists') * 100 + s(p, 'goals'))
  const def = best('DEF', (p) => s(p, 'totalPoints'))
  const gk = best('GK', (p) => s(p, 'cleanSheets') * 1000 + s(p, 'saves'))

  if (fwd) list.push({ player: fwd, art: posArt.FWD, stats: [
    { label: t('squad.goals'), value: s(fwd, 'goals') },
    { label: t('squad.assists'), value: s(fwd, 'assists') },
    { label: t('squad.totalPoints'), value: s(fwd, 'totalPoints') }
  ] })
  if (mid) list.push({ player: mid, art: posArt.MID, stats: [
    { label: t('squad.assists'), value: s(mid, 'assists') },
    { label: t('squad.goals'), value: s(mid, 'goals') },
    { label: t('squad.totalPoints'), value: s(mid, 'totalPoints') }
  ] })
  if (def) list.push({ player: def, art: posArt.DEF, stats: [
    { label: t('squad.appearances'), value: s(def, 'appearances') },
    { label: t('squad.cleanSheets'), value: s(def, 'cleanSheets') },
    { label: t('squad.totalPoints'), value: s(def, 'totalPoints') }
  ] })
  if (gk) list.push({ player: gk, art: posArt.GK, stats: [
    { label: t('squad.saves'), value: s(gk, 'saves') },
    { label: t('squad.cleanSheets'), value: s(gk, 'cleanSheets') },
    { label: t('squad.appearances'), value: s(gk, 'appearances') }
  ] })
  return list
})

const posLabel = (p: any) => t(`squad.pos${p.position || ''}`, p.position || '')

/* ---------- 队内数据榜 ---------- */
const boardTop = (score: (p: any) => number) =>
  [...players.value].sort((a, b) => score(b) - score(a)).slice(0, 5)

const topScorers = computed(() => boardTop((p) => s(p, 'goals') * 10 + s(p, 'assists')))
const topAssists = computed(() => boardTop((p) => s(p, 'assists') * 10 + s(p, 'goals')))
const topFpl = computed(() => boardTop((p) => s(p, 'totalPoints')))

const rankClass = (i: number) =>
  i === 0
    ? 'bg-arsenal-red border-arsenal-red text-white'
    : i === 1
      ? 'bg-arsenal-gold border-arsenal-gold text-white'
      : 'bg-arsenal-surface border-arsenal-line text-arsenal-muted'

/* ---------- 完整阵容（位置筛选） ---------- */
const posFilter = ref('ALL')
const filterDefs = [
  { key: 'ALL', label: () => t('squad.filterAll') },
  { key: 'GK', label: () => t('squad.filterGK') },
  { key: 'DEF', label: () => t('squad.filterDEF') },
  { key: 'MID', label: () => t('squad.filterMID') },
  { key: 'FWD', label: () => t('squad.filterFWD') }
]
const posOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 }
const rosterPlayers = computed(() => {
  const list = posFilter.value === 'ALL'
    ? players.value
    : players.value.filter((p) => p.position === posFilter.value)
  return [...list].sort((a, b) =>
    ((posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9)) ||
    ((a.number ?? 999) - (b.number ?? 999))
  )
})

const posBadgeClass: Record<string, string> = {
  GK: 'text-arsenal-gold border-arsenal-gold/50 bg-arsenal-gold/10',
  DEF: 'text-[#6AA9E9] border-[#6AA9E9]/45 bg-[#6AA9E9]/10',
  MID: 'text-[#F87171] border-[#F87171]/45 bg-[#F87171]/10',
  FWD: 'text-[#4ADE80] border-[#4ADE80]/45 bg-[#4ADE80]/10'
}
const formClass = (v: any) => {
  const n = Number(v) || 0
  if (n >= 6) return 'bg-[#22C55E]/15 text-[#4ADE80]'
  if (n >= 4.5) return 'bg-arsenal-gold/15 text-arsenal-gold'
  return 'bg-white/10 text-white/50'
}

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
      <div class="sq-hero-bg absolute inset-0 bg-[url('/images/squad-hero.jpg')] bg-cover bg-[center_22%]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.66)_0%,rgba(10,10,14,.28)_40%,rgba(10,10,14,.62)_72%,#0A0A0E_100%)]"></div>
      <div class="stroke-word pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-score text-[clamp(110px,22vw,340px)] font-bold leading-none tracking-[.06em] select-none">SQUAD</div>

      <div class="relative z-[2] w-full shell-wide px-6 pt-36 pb-48 text-center">
        <div class="inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[.12em] text-white/85">
          <i class="h-2 w-2 animate-pulse rounded-full bg-arsenal-red"></i>
          {{ t('squad.heroKicker') }}
        </div>
        <h1 class="mt-6 font-score text-[clamp(44px,8vw,104px)] font-bold uppercase leading-[1.05] tracking-[.04em] text-white drop-shadow-[0_14px_60px_rgba(0,0,0,.55)]">
          {{ t('squad.heroTitle') }}
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-base leading-8 text-white/70">{{ t('squad.heroSub') }}</p>
      </div>

      <!-- 底部统计条 -->
      <div class="absolute inset-x-0 bottom-0 z-[2] border-t border-white/10 bg-gradient-to-b from-transparent via-arsenal-night/60 to-arsenal-night/95 backdrop-blur-sm">
        <div class="shell-wide grid grid-cols-2 gap-y-5 py-7 md:grid-cols-4">
          <div v-for="(stat, i) in [
            { v: statPlayers, l: t('squad.statPlayers') },
            { v: statNations, l: t('squad.statNations') },
            { v: statAvgAge, l: t('squad.statAvgAge') },
            { v: statGoals, l: t('squad.statGoals') }
          ]" :key="i" class="text-center" :class="i > 0 ? 'md:border-l md:border-white/10' : ''">
            <b class="block font-score text-3xl font-bold leading-none text-white tabular-nums md:text-[42px]">{{ stat.v }}</b>
            <span class="mt-2 block text-xs tracking-[.22em] text-white/50">{{ stat.l }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 加载 / 空态 -->
    <div v-if="pending" class="shell-wide py-32 text-center text-sm text-white/50">{{ t('common.loading') }}</div>
    <div v-else-if="!players.length" class="shell-wide py-32 text-center text-sm text-white/50">{{ t('common.noData') }}</div>

    <template v-else>
      <!-- 核心焦点 -->
      <section class="relative overflow-hidden py-20 md:py-24">
        <div class="pointer-events-none absolute -right-48 -top-72 h-[620px] w-[620px] rounded-full border border-arsenal-gold/15"></div>
        <div class="relative z-[2] shell-wide">
          <div class="reveal mb-10 flex items-end justify-between gap-6">
            <div class="flex items-center gap-3.5">
              <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
              <div>
                <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[32px]">{{ t('squad.keyTitle') }}</h2>
                <p class="mt-1 text-[13px] tracking-[.14em] text-white/50">{{ t('squad.keySub') }}</p>
              </div>
            </div>
            <span class="hidden whitespace-nowrap text-sm font-medium text-white/55 sm:block">{{ t('squad.keyMore') }}</span>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NuxtLink
              v-for="kp in keyPlayers"
              :key="kp.player.id"
              :to="localePath(`/player/${kp.player.id}`)"
              class="group relative block aspect-[3/4.1] overflow-hidden rounded-2xl border border-white/10 bg-arsenal-night-soft transition-all duration-300 hover:-translate-y-2 hover:border-arsenal-red/50 hover:shadow-[0_30px_60px_rgba(0,0,0,.5)]"
            >
              <img :src="kp.art" :alt="kp.player.webName" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" loading="lazy" />
              <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.35)_0%,rgba(10,10,14,.05)_35%,rgba(10,10,14,.3)_62%,rgba(10,10,14,.94)_100%)]"></div>
              <div v-if="kp.player.number" class="stroke-num pointer-events-none absolute right-4 top-2 font-score text-6xl font-bold leading-none md:text-7xl">{{ kp.player.number }}</div>
              <div class="absolute inset-x-0 bottom-0 p-6">
                <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-arsenal-gold">
                  <i class="h-1.5 w-1.5 rounded-full bg-arsenal-red"></i>
                  {{ posLabel(kp.player) }} · {{ kp.player.position }}
                </div>
                <div class="mt-2 text-[22px] font-extrabold tracking-wide text-white md:text-2xl">{{ kp.player.webName }}</div>
                <div class="mt-0.5 text-xs font-medium uppercase tracking-[.12em] text-white/55">{{ kp.player.fullName }}<template v-if="kp.player.nationality"> · {{ kp.player.nationality }}</template></div>
                <div class="mt-4 grid grid-cols-3 border-t border-white/15 pt-3.5">
                  <div v-for="(st, i) in kp.stats" :key="i" class="text-center" :class="i > 0 ? 'border-l border-white/15' : ''">
                    <b class="block font-score text-2xl font-bold leading-none text-white tabular-nums">{{ st.value }}</b>
                    <span class="mt-1.5 block text-[11px] tracking-[.12em] text-white/50">{{ st.label }}</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- 队内数据榜 -->
      <section class="bg-white py-20 md:py-24">
        <div class="shell-wide">
          <div class="reveal mb-10 flex items-end justify-between gap-6">
            <div class="flex items-center gap-3.5">
              <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
              <div>
                <h2 class="text-2xl font-extrabold tracking-tight text-arsenal-ink md:text-[32px]">{{ t('squad.boardTitle') }}</h2>
                <p class="mt-1 text-[13px] tracking-[.14em] text-arsenal-muted">{{ t('squad.boardSub') }}</p>
              </div>
            </div>
            <NuxtLink :to="localePath('/scorers')" class="hidden whitespace-nowrap text-sm font-medium text-arsenal-muted transition-colors hover:text-arsenal-red sm:block">{{ t('squad.boardMore') }}</NuxtLink>
          </div>

          <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <!-- 射手榜 -->
            <div class="reveal overflow-hidden rounded-2xl border border-arsenal-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-arsenal-red/30 hover:shadow-[0_18px_40px_rgba(0,0,0,.08)]">
              <div class="flex items-center justify-between border-b border-arsenal-line px-6 py-5">
                <div>
                  <h3 class="text-[17px] font-extrabold">{{ t('squad.lbScorers') }}</h3>
                  <p class="mt-0.5 text-[11px] tracking-[.14em] text-arsenal-muted">{{ t('squad.lbScorersSub') }}</p>
                </div>
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-arsenal-red text-white shadow-[0_6px_16px_rgba(239,1,7,.3)]">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"/></svg>
                </div>
              </div>
              <div v-for="(p, i) in topScorers" :key="p.id" class="flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-arsenal-surface" :class="i > 0 ? 'border-t border-arsenal-line/60' : ''">
                <div class="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border font-score text-[15px] font-bold" :class="rankClass(i)">{{ i + 1 }}</div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[15px] font-bold">{{ p.webName }}</div>
                  <div class="mt-0.5 text-xs text-arsenal-muted">{{ posLabel(p) }} · {{ t('squad.appearances') }} {{ s(p, 'appearances') }}</div>
                </div>
                <div class="font-score text-2xl font-bold tabular-nums" :class="i === 0 ? 'text-arsenal-red' : 'text-arsenal-ink'">{{ s(p, 'goals') }}</div>
              </div>
            </div>

            <!-- 助攻榜 -->
            <div class="reveal overflow-hidden rounded-2xl border border-arsenal-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-arsenal-red/30 hover:shadow-[0_18px_40px_rgba(0,0,0,.08)]">
              <div class="flex items-center justify-between border-b border-arsenal-line px-6 py-5">
                <div>
                  <h3 class="text-[17px] font-extrabold">{{ t('squad.lbAssists') }}</h3>
                  <p class="mt-0.5 text-[11px] tracking-[.14em] text-arsenal-muted">{{ t('squad.lbAssistsSub') }}</p>
                </div>
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-arsenal-gold text-white shadow-[0_6px_16px_rgba(201,162,75,.35)]">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4zM7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5"/></svg>
                </div>
              </div>
              <div v-for="(p, i) in topAssists" :key="p.id" class="flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-arsenal-surface" :class="i > 0 ? 'border-t border-arsenal-line/60' : ''">
                <div class="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border font-score text-[15px] font-bold" :class="rankClass(i)">{{ i + 1 }}</div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[15px] font-bold">{{ p.webName }}</div>
                  <div class="mt-0.5 text-xs text-arsenal-muted">{{ posLabel(p) }} · {{ t('squad.appearances') }} {{ s(p, 'appearances') }}</div>
                </div>
                <div class="font-score text-2xl font-bold tabular-nums" :class="i === 0 ? 'text-arsenal-red' : 'text-arsenal-ink'">{{ s(p, 'assists') }}</div>
              </div>
            </div>

            <!-- FPL 积分榜 -->
            <div class="reveal overflow-hidden rounded-2xl border border-arsenal-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-arsenal-red/30 hover:shadow-[0_18px_40px_rgba(0,0,0,.08)]">
              <div class="flex items-center justify-between border-b border-arsenal-line px-6 py-5">
                <div>
                  <h3 class="text-[17px] font-extrabold">{{ t('squad.lbFpl') }}</h3>
                  <p class="mt-0.5 text-[11px] tracking-[.14em] text-arsenal-muted">{{ t('squad.lbFplSub') }}</p>
                </div>
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-arsenal-ink text-white shadow-[0_6px_16px_rgba(0,0,0,.2)]">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="1.6" fill="currentColor" stroke="none"/></svg>
                </div>
              </div>
              <div v-for="(p, i) in topFpl" :key="p.id" class="flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-arsenal-surface" :class="i > 0 ? 'border-t border-arsenal-line/60' : ''">
                <div class="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border font-score text-[15px] font-bold" :class="rankClass(i)">{{ i + 1 }}</div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[15px] font-bold">{{ p.webName }}</div>
                  <div class="mt-0.5 text-xs text-arsenal-muted">£{{ p.stats?.nowCost || '0' }}m · {{ t('squad.selectedBy') }} {{ p.stats?.selectedBy || '0' }}%</div>
                </div>
                <div class="font-score text-2xl font-bold tabular-nums" :class="i === 0 ? 'text-arsenal-red' : 'text-arsenal-ink'">{{ s(p, 'totalPoints') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 完整阵容 -->
      <section class="bg-arsenal-night-soft py-20 md:py-24">
        <div class="shell-wide">
          <div class="reveal mb-8 flex items-end gap-3.5">
            <span class="h-7 w-[5px] flex-none rounded bg-arsenal-red"></span>
            <div>
              <h2 class="text-2xl font-extrabold tracking-tight text-white md:text-[32px]">{{ t('squad.rosterTitle') }}</h2>
              <p class="mt-1 text-[13px] tracking-[.14em] text-white/50">{{ t('squad.rosterSub') }}</p>
            </div>
          </div>

          <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="f in filterDefs"
                :key="f.key"
                class="rounded-full border px-5 py-2 text-[13px] font-semibold transition-all duration-200"
                :class="posFilter === f.key
                  ? 'border-arsenal-red bg-arsenal-red text-white shadow-[0_6px_20px_rgba(239,1,7,.35)]'
                  : 'border-white/15 bg-transparent text-white/60 hover:border-white/40 hover:text-white'"
                @click="posFilter = f.key"
              >{{ f.label() }}</button>
            </div>
            <div class="text-[13px] tracking-wide text-white/45">
              {{ t('squad.showing', { n: rosterPlayers.length }) }}
            </div>
          </div>

          <!-- 表头（桌面端） -->
          <div class="hidden grid-cols-[64px_minmax(0,1.6fr)_84px_repeat(4,minmax(0,.62fr))_104px] items-center gap-3.5 px-6 pb-3 text-[11px] uppercase tracking-[.18em] text-white/40 md:grid">
            <div class="text-center">{{ t('squad.number') }}</div>
            <div>{{ t('squad.playerCol') }}</div>
            <div>{{ t('squad.posCol') }}</div>
            <div class="text-center">{{ t('squad.appearances') }}</div>
            <div class="text-center">{{ t('squad.goals') }}</div>
            <div class="text-center">{{ t('squad.assists') }}</div>
            <div class="text-center">FPL</div>
            <div class="text-right">{{ t('squad.form') }}</div>
          </div>

          <NuxtLink
            v-for="p in rosterPlayers"
            :key="p.id"
            :to="localePath(`/player/${p.id}`)"
            class="group mb-2.5 grid grid-cols-[44px_minmax(0,1fr)_56px_36px_36px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-all duration-200 hover:translate-x-1 hover:border-arsenal-red/40 hover:bg-white/[0.06] md:grid-cols-[64px_minmax(0,1.6fr)_84px_repeat(4,minmax(0,.62fr))_104px] md:gap-3.5 md:px-6 md:py-4"
          >
            <div class="text-center font-score text-[22px] font-bold text-white/30 transition-colors group-hover:text-arsenal-red md:text-2xl">{{ p.number ?? '–' }}</div>
            <div class="min-w-0">
              <div class="truncate text-[15px] font-bold text-white">{{ p.webName }}</div>
              <div class="mt-0.5 truncate text-xs text-white/40">{{ p.nationality || '' }}<template v-if="p.age"> · {{ p.age }} {{ t('squad.yearsOld') }}</template></div>
            </div>
            <div class="justify-self-start rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wider md:px-3" :class="posBadgeClass[p.position] || 'border-white/20 text-white/60'">{{ p.position }}</div>
            <div class="text-center">
              <b class="block font-score text-lg font-bold text-white tabular-nums md:text-xl">{{ s(p, 'appearances') }}</b>
              <span class="mt-0.5 hidden text-[10px] tracking-[.12em] text-white/35 md:block">{{ t('squad.appearances') }}</span>
            </div>
            <div class="text-center">
              <b class="block font-score text-lg font-bold text-white tabular-nums md:text-xl">{{ s(p, 'goals') }}</b>
              <span class="mt-0.5 hidden text-[10px] tracking-[.12em] text-white/35 md:block">{{ t('squad.goals') }}</span>
            </div>
            <div class="hidden text-center md:block">
              <b class="block font-score text-lg font-bold text-white tabular-nums md:text-xl">{{ s(p, 'assists') }}</b>
              <span class="mt-0.5 block text-[10px] tracking-[.12em] text-white/35">{{ t('squad.assists') }}</span>
            </div>
            <div class="hidden text-center md:block">
              <b class="block font-score text-lg font-bold text-arsenal-gold tabular-nums md:text-xl">{{ s(p, 'totalPoints') }}</b>
              <span class="mt-0.5 block text-[10px] tracking-[.12em] text-white/35">FPL</span>
            </div>
            <div class="hidden justify-end md:flex">
              <span class="inline-flex h-6 min-w-[34px] items-center justify-center rounded-md px-2 font-score text-[11px] font-bold" :class="formClass(p.stats?.form)" :title="t('squad.form')">{{ p.stats?.form || '0' }}</span>
            </div>
          </NuxtLink>

          <p class="mt-5 text-center text-[12.5px] text-white/35">{{ t('squad.rosterNote') }}</p>
        </div>
      </section>

      <!-- 传奇殿堂横幅 -->
      <section class="relative flex min-h-[380px] items-center bg-[url('/images/fans-stand.jpg')] bg-cover bg-center md:bg-fixed">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,14,.9)_0%,rgba(10,10,14,.55)_55%,rgba(197,0,0,.35)_100%)]"></div>
        <div class="relative z-[2] w-full shell-wide px-6 py-16 md:py-20">
          <div class="reveal text-[13px] font-medium uppercase tracking-[.35em] text-arsenal-gold">{{ t('squad.ctaKicker') }}</div>
          <h2 class="reveal mt-4 font-score text-[clamp(36px,6vw,72px)] font-bold uppercase leading-[1.05] tracking-[.02em] text-white">{{ t('squad.ctaTitle') }}</h2>
          <p class="reveal mt-4 max-w-lg text-[15px] leading-8 text-white/70">{{ t('squad.ctaSub') }}</p>
          <div class="reveal mt-8 flex flex-wrap gap-3.5">
            <NuxtLink :to="localePath('/legends')" class="btn-red">{{ t('squad.ctaLegends') }}</NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.sq-hero-bg {
  animation: sqHeroZoom 18s ease-out forwards;
}
@keyframes sqHeroZoom {
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
  .sq-hero-bg { animation: none; }
}
</style>
