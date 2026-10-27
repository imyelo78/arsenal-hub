<script setup lang="ts">
import { ARSENAL_IDS } from '~/utils/constants'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

/* ---------- Tab 状态（?tab= 同步 URL） ---------- */
const VALID_TABS = ['fixtures', 'pl', 'cl', 'scorers']
const initialTab = VALID_TABS.includes(route.query.tab as string) ? (route.query.tab as string) : 'fixtures'
const activeTab = ref<string>(initialTab)

/* ---------- 数据：fixtures SSR 常驻；standings/scorers 首次激活才请求 ---------- */
const { data: fxData, pending: fxPending } = await useFetch('/api/fixtures')
const fixtures = computed<any[]>(() => fxData.value?.response || [])

const plQ = useFetch('/api/standings?comp=pl', { immediate: false })
const clQ = useFetch('/api/standings?comp=cl', { immediate: false })
const scQ = useFetch('/api/scorers', { immediate: false })

watch(activeTab, (v) => {
  router.replace({ query: v === 'fixtures' ? {} : { tab: v } })
  if (v === 'pl') plQ.execute()
  else if (v === 'cl') clQ.execute()
  else if (v === 'scorers') scQ.execute()
}, { immediate: true })

const plRows = computed<any[]>(() => {
  const raw = plQ.data.value?.response
  return Array.isArray(raw) ? raw : []
})
const clRows = computed<any[]>(() => {
  const raw = clQ.data.value?.response
  return Array.isArray(raw) ? raw : []
})
const scorers = computed<any[]>(() => scQ.data.value?.response || [])

const isArsenalTeam = (id: number) => ARSENAL_IDS.includes(id)

/* ---------- 赛程：筛选 + 按日期分组 ---------- */
const leagueFilter = ref('all')
const statusFilter = ref<'all' | 'upcoming' | 'finished'>('all')
const monthFilter = ref('all')

const leagueDisplay = (name: string) => {
  const map: Record<string, string> = {
    'Premier League': t('fixtures.premierLeague'),
    'Champions League': t('fixtures.championsLeague')
  }
  return map[name] || name
}

const leagues = computed(() => {
  const set = new Set<string>()
  fixtures.value.forEach((f: any) => {
    const name = f.league?.name || f.fixture?.league
    if (name) set.add(name)
  })
  return Array.from(set)
})

const monthOptions = computed(() => {
  const set = new Set<string>()
  fixtures.value.forEach((f: any) => {
    if (f.fixture?.date) set.add(String(f.fixture.date).slice(0, 7))
  })
  return Array.from(set).sort()
})

const monthLabel = (ym: string) => {
  const d = new Date(ym + '-01T00:00:00')
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' })
}

const getMatchStatus = (f: any) => {
  const status = typeof f.fixture?.status === 'object' ? f.fixture.status.short : f.status
  return status
}
const isFinished = (f: any) => {
  const s = getMatchStatus(f)
  return s === 'FT' || s === 'AET' || s === 'PEN' || (f.goals?.home !== null && f.goals?.home !== undefined)
}

const filteredFixtures = computed(() => {
  return fixtures.value.filter((f: any) => {
    const leagueName = f.league?.name || f.fixture?.league
    const leagueOk = leagueFilter.value === 'all' || leagueName === leagueFilter.value
    const monthOk = monthFilter.value === 'all' || String(f.fixture?.date || '').startsWith(monthFilter.value)
    const finished = isFinished(f)
    const statusOk = statusFilter.value === 'all'
      || (statusFilter.value === 'finished' && finished)
      || (statusFilter.value === 'upcoming' && !finished)
    return leagueOk && monthOk && statusOk
  })
})

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr)
  const zh = locale.value === 'zh'
  const day = d.toLocaleDateString(zh ? 'zh-CN' : 'en-US', zh ? { month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' })
  const wd = d.toLocaleDateString(zh ? 'zh-CN' : 'en-US', { weekday: 'short' })
  return `${day} · ${wd}`
}
const timeLabel = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

const roundText = (f: any) => {
  const round = f.league?.round || f.fixture?.round || ''
  if (typeof round === 'string' && round.startsWith('Regular Season - ')) {
    const n = round.replace('Regular Season - ', '')
    return locale.value === 'zh' ? `第${n}轮` : `GW ${n}`
  }
  if (typeof round === 'string' && round.startsWith('Gameweek ')) {
    const n = round.replace('Gameweek ', '')
    return locale.value === 'zh' ? `第${n}轮` : `GW ${n}`
  }
  return round
}

const groupedFixtures = computed(() => {
  const groups: Array<{ key: string; label: string; comp: string; items: any[] }> = []
  const map = new Map<string, any[]>()
  filteredFixtures.value.forEach((f: any) => {
    const key = String(f.fixture?.date || '').slice(0, 10)
    if (!key) return
    if (!map.has(key)) {
      map.set(key, [])
      groups.push({ key, label: dayLabel(key), comp: '', items: map.get(key)! })
    }
    map.get(key)!.push(f)
  })
  groups.forEach((g) => {
    const comps = new Set<string>()
    g.items.forEach((f: any) => comps.add(leagueDisplay(f.league?.name || f.fixture?.league || '')))
    g.comp = Array.from(comps).join(' / ')
  })
  return groups
})

/* ---------- Tab 计数徽章 ---------- */
const tabCounts = computed(() => ({
  fixtures: fixtures.value.length,
  pl: plRows.value.length,
  cl: clRows.value.length,
  scorers: scorers.value.length
}))

const tabs = computed(() => [
  { id: 'fixtures', label: t('mc.tabFixtures') },
  { id: 'pl', label: t('mc.tabPl') },
  { id: 'cl', label: t('mc.tabCl') },
  { id: 'scorers', label: t('mc.tabScorers') }
])

const isArsenalRow = (f: any) =>
  isArsenalTeam(f.teams?.home?.id) || isArsenalTeam(f.teams?.away?.id)

useHead({ title: () => `${t('mc.title')} · Arsenal Hub` })
</script>

<template>
  <div class="min-h-screen bg-arsenal-night text-white">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/images/fans-stand.jpg')] bg-cover bg-[center_30%] opacity-[0.13]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,14,.30)_0%,rgba(10,10,14,.72)_60%,#0A0A0E_100%)]"></div>
      <div class="relative z-[1] shell-wide px-6 pt-28 pb-12">
        <div class="inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[.32em] text-white/70">
          <i class="h-[2px] w-[26px] bg-arsenal-gold"></i>
          {{ t('mc.kicker') }}
        </div>
        <h1 class="mt-3.5 font-score text-[clamp(34px,4.5vw,56px)] font-bold uppercase leading-[1.08] tracking-[.02em]">{{ t('mc.title') }}</h1>
        <p class="mt-2.5 max-w-[620px] text-[14.5px] leading-[1.85] text-white/60">{{ t('mc.sub') }}</p>
        <div class="mt-4 flex flex-wrap gap-2.5">
          <span class="rounded-full border border-arsenal-red/45 bg-arsenal-red/10 px-3.5 py-1.5 text-xs tracking-[.08em] text-[#ff9b9d]">{{ t('mc.chipFixtures') }}</span>
          <span class="rounded-full border border-arsenal-gold/45 bg-arsenal-gold/10 px-3.5 py-1.5 text-xs tracking-[.08em] text-arsenal-gold">{{ t('mc.chipTables') }}</span>
          <span class="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs tracking-[.08em] text-white/60">{{ t('mc.chipLive') }}</span>
        </div>
      </div>
    </section>

    <!-- Tab 条 -->
    <nav class="sticky top-[72px] z-40 border-y border-white/10 bg-arsenal-night/90 backdrop-blur-md">
      <div class="shell-wide flex gap-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="relative flex flex-none items-center gap-2 whitespace-nowrap px-[22px] py-[15px] text-sm font-semibold tracking-[.04em] transition-colors"
          :class="activeTab === tab.id ? 'text-white' : 'text-white/55 hover:text-white'"
        >
          {{ tab.label }}
          <span
            v-if="tabCounts[tab.id as keyof typeof tabCounts]"
            class="rounded-full px-[7px] py-px font-score text-[11px] font-semibold leading-[1.5]"
            :class="activeTab === tab.id ? 'bg-arsenal-red/[0.22] text-[#ff9b9d]' : 'bg-white/[0.08] text-white/40'"
          >{{ tabCounts[tab.id as keyof typeof tabCounts] }}</span>
          <span v-if="activeTab === tab.id" class="absolute inset-x-[18px] bottom-0 h-[2.5px] rounded bg-arsenal-red"></span>
        </button>
      </div>
    </nav>

    <main class="shell-wide px-6 pb-24">
      <!-- ================= 赛程赛果 ================= -->
      <section v-show="activeTab === 'fixtures'">
        <div class="mb-5 mt-9 flex items-end gap-3.5">
          <span class="h-[26px] w-[5px] flex-none rounded bg-arsenal-red"></span>
          <div>
            <h2 class="text-[21px] font-extrabold tracking-tight">{{ t('mc.fxTitle') }}</h2>
            <p class="mt-0.5 text-[12px] tracking-[.16em] text-white/40">{{ t('mc.fxSub') }}</p>
          </div>
        </div>

        <!-- 筛选 -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex rounded-xl border border-white/10 bg-white/[0.06] p-[3px]">
            <button
              v-for="opt in ['all', 'upcoming', 'finished'] as const"
              :key="opt"
              @click="statusFilter = opt"
              class="rounded-lg px-4 py-[7px] text-[12.5px] font-medium transition-all"
              :class="statusFilter === opt ? 'bg-white font-semibold text-[#111]' : 'text-white/55 hover:text-white'"
            >{{ t(`fixtures.${opt}`) }}</button>
          </div>
          <select v-model="leagueFilter" class="mc-sel">
            <option value="all">{{ t('fixtures.all') }}</option>
            <option v-for="lg in leagues" :key="lg" :value="lg">{{ leagueDisplay(lg) }}</option>
          </select>
          <select v-model="monthFilter" class="mc-sel">
            <option value="all">{{ t('mc.allMonths') }}</option>
            <option v-for="ym in monthOptions" :key="ym" :value="ym">{{ monthLabel(ym) }}</option>
          </select>
        </div>

        <!-- 列表 -->
        <div v-if="fxPending" class="mt-5 space-y-2">
          <div v-for="i in 5" :key="i" class="h-[76px] animate-pulse rounded-xl bg-white/[0.05]"></div>
        </div>
        <template v-else>
          <p v-if="groupedFixtures.length === 0" class="mt-10 text-center text-sm text-white/40">{{ t('common.noFixtures') }}</p>

          <template v-for="g in groupedFixtures" :key="g.key">
            <div class="mb-2.5 mt-7 flex items-center gap-2.5 first:mt-5">
              <b class="font-score text-base font-semibold tracking-[.06em] text-arsenal-gold">{{ g.label }}</b>
              <span class="text-xs text-white/40">{{ g.comp }}</span>
              <i class="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,.1),transparent)]"></i>
            </div>

            <NuxtLink
              v-for="f in g.items"
              :key="f.fixture.id"
              :to="localePath(`/fixture/${f.fixture.id}`)"
              class="fcard"
              :class="isArsenalRow(f) ? 'fcard-arsenal' : ''"
            >
              <div class="fc-lg">
                {{ leagueDisplay(f.league?.name || f.fixture?.league || '') }}
                <em v-if="roundText(f)">{{ roundText(f) }}</em>
              </div>
              <div class="fc-team fc-home">
                <b>{{ f.teams?.home?.name }}</b>
                <img v-if="f.teams?.home?.logo" :src="f.teams.home.logo" :alt="f.teams.home.name" class="bc-img" loading="lazy" />
              </div>
              <div class="fc-mid">
                <template v-if="f.goals?.home !== null && f.goals?.home !== undefined">
                  <div class="score">
                    <b :class="isArsenalTeam(f.teams?.home?.id) ? '' : 'text-white/70'">{{ f.goals.home }}</b>
                    <span class="mx-1.5 text-white/30">:</span>
                    <b :class="isArsenalTeam(f.teams?.away?.id) ? '' : 'text-white/70'">{{ f.goals.away }}</b>
                  </div>
                  <small>{{ t('fixture.finished') }}</small>
                </template>
                <template v-else>
                  <div class="ko">{{ timeLabel(f.fixture?.date) }}</div>
                  <small>{{ isArsenalTeam(f.teams?.home?.id) ? t('common.home') : (isArsenalTeam(f.teams?.away?.id) ? t('common.away') : t('fixtures.kickoff')) }}</small>
                </template>
              </div>
              <div class="fc-team">
                <img v-if="f.teams?.away?.logo" :src="f.teams.away.logo" :alt="f.teams.away.name" class="bc-img" loading="lazy" />
                <b>{{ f.teams?.away?.name }}</b>
              </div>
              <div class="fc-st">
                <span
                  class="pill"
                  :class="isFinished(f) ? 'pill-fin' : (getMatchStatus(f) === 'LIVE' ? 'pill-live' : 'pill-up')"
                >{{ isFinished(f) ? t('fixture.finished') : (getMatchStatus(f) === 'LIVE' ? t('fixture.live') : t('fixture.upcoming')) }}</span>
              </div>
            </NuxtLink>
          </template>
        </template>
      </section>

      <!-- ================= 英超积分榜 ================= -->
      <section v-show="activeTab === 'pl'">
        <div class="mb-5 mt-9 flex items-end gap-3.5">
          <span class="h-[26px] w-[5px] flex-none rounded bg-arsenal-gold"></span>
          <div>
            <h2 class="text-[21px] font-extrabold tracking-tight">{{ t('mc.plTitle') }}</h2>
            <p class="mt-0.5 text-[12px] tracking-[.16em] text-white/40">{{ t('mc.plSub') }}</p>
          </div>
        </div>

        <div v-if="plQ.pending.value" class="mc-tw animate-pulse">
          <div v-for="i in 10" :key="i" class="h-12 border-b border-white/[0.06] last:border-0"></div>
        </div>

        <div v-else class="mc-tw">
          <table class="mc-st">
            <thead>
              <tr>
                <th class="c" style="width:52px">#</th>
                <th class="l">{{ t('standings.team') }}</th>
                <th class="c">{{ t('common.played') }}</th>
                <th class="c hide-sm">W</th>
                <th class="c hide-sm">D</th>
                <th class="c hide-sm">L</th>
                <th class="c">{{ t('common.goalDifference') }}</th>
                <th class="c">{{ t('common.points') }}</th>
                <th class="c hide-sm">{{ t('common.form') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in plRows" :key="row.team.id" :class="isArsenalTeam(row.team.id) ? 'ars-row' : ''">
                <td class="c">
                  <span class="rk" :class="row.rank <= 4 ? 'rk-ucl' : (row.rank <= 6 ? 'rk-uel' : (row.rank >= 18 ? 'rk-rel' : ''))">{{ row.rank }}</span>
                </td>
                <td class="l">
                  <div class="tm">
                    <img v-if="row.team.logo" :src="row.team.logo" :alt="row.team.name" class="tm-logo" loading="lazy" />
                    <b>{{ row.team.name }}</b>
                  </div>
                </td>
                <td class="c">{{ row.all.played }}</td>
                <td class="c hide-sm">{{ row.all.win }}</td>
                <td class="c hide-sm">{{ row.all.draw }}</td>
                <td class="c hide-sm">{{ row.all.lose }}</td>
                <td class="c" :class="row.goalsDiff > 0 ? 'gd-plus' : (row.goalsDiff < 0 ? 'gd-minus' : '')">{{ row.goalsDiff > 0 ? '+' : '' }}{{ row.goalsDiff }}</td>
                <td class="c pts">{{ row.points }}</td>
                <td class="c hide-sm">
                  <span class="fm">
                    <i v-for="(fc, i) in (row.form || '').split('')" :key="i" :class="fc === 'W' ? 'w' : (fc === 'D' ? 'd' : 'l')">{{ fc }}</i>
                    <span v-if="!row.form" class="text-white/30">–</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="legend">
          <span><i class="bg-[rgba(47,191,113,.8)]"></i>{{ t('standings.championsLeague') }}</span>
          <span><i class="bg-arsenal-gold"></i>{{ t('standings.europaLeague') }}</span>
          <span><i class="bg-[rgba(239,1,7,.8)]"></i>{{ t('standings.relegation') }}</span>
          <span><i class="bg-arsenal-red"></i>{{ t('mc.legendArsenal') }}</span>
        </div>
      </section>

      <!-- ================= 欧冠积分榜 ================= -->
      <section v-show="activeTab === 'cl'">
        <div class="mb-5 mt-9 flex items-end gap-3.5">
          <span class="h-[26px] w-[5px] flex-none rounded bg-arsenal-gold"></span>
          <div>
            <h2 class="text-[21px] font-extrabold tracking-tight">{{ t('mc.clTitle') }}</h2>
            <p class="mt-0.5 text-[12px] tracking-[.16em] text-white/40">{{ t('mc.clSub') }}</p>
          </div>
        </div>

        <div v-if="clQ.pending.value" class="mc-tw animate-pulse">
          <div v-for="i in 10" :key="i" class="h-12 border-b border-white/[0.06] last:border-0"></div>
        </div>

        <div v-else class="mc-tw">
          <table class="mc-st">
            <thead>
              <tr>
                <th class="c" style="width:52px">#</th>
                <th class="l">{{ t('standings.team') }}</th>
                <th class="c">{{ t('common.played') }}</th>
                <th class="c hide-sm">W</th>
                <th class="c hide-sm">D</th>
                <th class="c hide-sm">L</th>
                <th class="c">{{ t('common.goalDifference') }}</th>
                <th class="c">{{ t('common.points') }}</th>
                <th class="c hide-sm">{{ t('common.form') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in clRows" :key="row.team.id" :class="isArsenalTeam(row.team.id) ? 'ars-row' : ''">
                <td class="c">
                  <span class="rk" :class="row.rank <= 8 ? 'rk-qual' : ''">{{ row.rank }}</span>
                </td>
                <td class="l">
                  <div class="tm">
                    <img v-if="row.team.logo" :src="row.team.logo" :alt="row.team.name" class="tm-logo" loading="lazy" />
                    <b>{{ row.team.name }}</b>
                  </div>
                </td>
                <td class="c">{{ row.all.played }}</td>
                <td class="c hide-sm">{{ row.all.win }}</td>
                <td class="c hide-sm">{{ row.all.draw }}</td>
                <td class="c hide-sm">{{ row.all.lose }}</td>
                <td class="c" :class="row.goalsDiff > 0 ? 'gd-plus' : (row.goalsDiff < 0 ? 'gd-minus' : '')">{{ row.goalsDiff > 0 ? '+' : '' }}{{ row.goalsDiff }}</td>
                <td class="c pts">{{ row.points }}</td>
                <td class="c hide-sm">
                  <span class="fm">
                    <i v-for="(fc, i) in (row.form || '').split('')" :key="i" :class="fc === 'W' ? 'w' : (fc === 'D' ? 'd' : 'l')">{{ fc }}</i>
                    <span v-if="!row.form" class="text-white/30">–</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="cl-note">◆ {{ t('mc.clNote') }}</p>
        <div class="legend">
          <span><i class="bg-arsenal-gold"></i>{{ t('mc.clLegendQual') }}</span>
          <span><i class="bg-arsenal-red"></i>{{ t('mc.legendArsenal') }}</span>
        </div>
      </section>

      <!-- ================= 射手榜 ================= -->
      <section v-show="activeTab === 'scorers'">
        <div class="mb-5 mt-9 flex items-end gap-3.5">
          <span class="h-[26px] w-[5px] flex-none rounded bg-arsenal-gold"></span>
          <div>
            <h2 class="text-[21px] font-extrabold tracking-tight">{{ t('mc.scTitle') }}</h2>
            <p class="mt-0.5 text-[12px] tracking-[.16em] text-white/40">{{ t('mc.scSub') }}</p>
          </div>
        </div>

        <div v-if="scQ.pending.value" class="mc-tw animate-pulse">
          <div v-for="i in 8" :key="i" class="h-11 border-b border-white/[0.06] last:border-0"></div>
        </div>

        <p v-else-if="scorers.length === 0" class="mt-10 text-center text-sm text-white/40">{{ t('common.noData') }}</p>

        <div v-else class="mc-tw">
          <table class="mc-st">
            <thead>
              <tr>
                <th class="c" style="width:52px">#</th>
                <th class="l">{{ t('scorers.player') }}</th>
                <th class="l">{{ t('scorers.team') }}</th>
                <th class="c">{{ t('scorers.goals') }}</th>
                <th class="c hide-sm">{{ t('scorers.assists') }}</th>
                <th class="c hide-sm">{{ t('scorers.penalties') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in scorers" :key="s.player.id" :class="isArsenalTeam(s.team.id) ? 'ars-row' : ''">
                <td class="c"><span class="rk">{{ s.rank }}</span></td>
                <td class="l">
                  <b class="font-semibold">{{ s.player.name }}</b>
                  <em class="block text-[11.5px] not-italic text-white/35">{{ s.player.nationality }}</em>
                </td>
                <td class="l">
                  <div class="tm">
                    <img v-if="s.team.logo" :src="s.team.logo" :alt="s.team.name" class="tm-logo" loading="lazy" />
                    <b>{{ s.team.name }}</b>
                  </div>
                </td>
                <td class="c pts">{{ s.goals }}</td>
                <td class="c hide-sm text-white/60">{{ s.assists }}</td>
                <td class="c hide-sm text-white/60">{{ s.penalties }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ---------- 下拉筛选 ---------- */
:deep(.mc-sel) {
  appearance: none;
  -webkit-appearance: none;
  padding: 8px 34px 8px 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,.5)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  cursor: pointer;
  transition: border-color 0.2s;
}
:deep(.mc-sel:hover) { border-color: rgba(255, 255, 255, 0.25); }
:deep(.mc-sel option) { background: #16161D; color: #eee; }

/* ---------- 赛程卡 ---------- */
.fcard {
  position: relative;
  display: grid;
  grid-template-columns: 86px 1fr 128px 1fr 118px;
  align-items: center;
  gap: 12px;
  background: #131318;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 9px;
  cursor: pointer;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.fcard:hover {
  transform: translateY(-2px);
  border-color: rgba(239, 1, 7, 0.5);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.4);
}
.fcard-arsenal { border-color: rgba(201, 162, 75, 0.28); }
.fcard-arsenal::before {
  content: "";
  position: absolute;
  left: -1px;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, #EF0107, #C9A24B);
}
@media (max-width: 860px) {
  .fcard {
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas: "lg home mid away" "st st st st";
    row-gap: 10px;
  }
  .fc-lg { grid-area: lg; }
  .fc-home { grid-area: home; }
  .fc-mid { grid-area: mid; }
  .fc-team:nth-of-type(3) { grid-area: away; }
  .fc-st { grid-area: st; justify-self: start; }
}
.fc-lg { font-size: 11px; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.38); }
.fc-lg em { display: block; font-style: normal; font-size: 10.5px; margin-top: 2px; color: rgba(255, 255, 255, 0.28); }
.fc-team { display: flex; align-items: center; gap: 11px; min-width: 0; }
.fc-home { justify-content: flex-end; text-align: right; }
.fc-team b { font-size: 14.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: rgba(255, 255, 255, 0.92); }
.bc-img { width: 28px; height: 28px; object-fit: contain; flex: none; filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5)); }
.fc-mid { text-align: center; }
.fc-mid .score { font-family: Oswald, "Arial Narrow", sans-serif; font-size: 24px; font-weight: 600; letter-spacing: 0.12em; line-height: 1; white-space: nowrap; }
.fc-mid small { display: block; margin-top: 3px; font-size: 10px; letter-spacing: 0.14em; color: rgba(255, 255, 255, 0.38); }
.fc-mid .ko { font-family: Oswald, "Arial Narrow", sans-serif; font-size: 21px; font-weight: 600; letter-spacing: 0.14em; color: rgba(255, 255, 255, 0.85); }
.fc-st { display: flex; justify-content: flex-end; }
.pill { font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; padding: 4.5px 12px; border-radius: 999px; white-space: nowrap; }
.pill-fin { background: rgba(47, 191, 113, 0.13); color: #5fd895; border: 1px solid rgba(47, 191, 113, 0.3); }
.pill-up { background: rgba(201, 162, 75, 0.12); color: #C9A24B; border: 1px solid rgba(201, 162, 75, 0.35); }
.pill-live { background: rgba(239, 1, 7, 0.16); color: #ff8b8d; border: 1px solid rgba(239, 1, 7, 0.45); }

/* ---------- 积分表 ---------- */
.mc-tw { background: #131318; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; overflow-x: auto; }
table.mc-st { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.mc-st thead th {
  padding: 13px 10px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}
.mc-st thead th.c, .mc-st td.c { text-align: center; }
.mc-st thead th.l, .mc-st td.l { text-align: left; }
.mc-st tbody tr { border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.15s; }
.mc-st tbody tr:last-child { border-bottom: 0; }
.mc-st tbody tr:hover { background: rgba(255, 255, 255, 0.035); }
.mc-st td { padding: 12px 10px; color: rgba(255, 255, 255, 0.85); white-space: nowrap; }
.mc-st td.pts { font-family: Oswald, "Arial Narrow", sans-serif; font-size: 16px; font-weight: 600; color: #fff; }
.rk {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: Oswald, "Arial Narrow", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.05);
}
.rk-ucl { background: rgba(47, 191, 113, 0.16); color: #5fd895; }
.rk-uel { background: rgba(201, 162, 75, 0.16); color: #C9A24B; }
.rk-rel { background: rgba(239, 1, 7, 0.14); color: #ff8b8d; }
.rk-qual { background: rgba(201, 162, 75, 0.16); color: #C9A24B; }
.tm { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tm-logo { width: 22px; height: 22px; object-fit: contain; flex: none; }
.tm b { font-weight: 600; color: rgba(255, 255, 255, 0.92); }
tr.ars-row { background: linear-gradient(90deg, rgba(239, 1, 7, 0.12), rgba(239, 1, 7, 0.03)); }
tr.ars-row:hover { background: linear-gradient(90deg, rgba(239, 1, 7, 0.16), rgba(239, 1, 7, 0.05)); }
tr.ars-row .tm b { color: #fff; font-weight: 700; }
tr.ars-row td:first-child { position: relative; }
tr.ars-row td:first-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: #EF0107;
}
.gd-plus { color: #5fd895; }
.gd-minus { color: #ff8b8d; }
.fm { display: inline-flex; gap: 3px; }
.fm i {
  width: 17px;
  height: 17px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  font-style: normal;
  color: #fff;
}
.fm i.w { background: rgba(47, 191, 113, 0.85); }
.fm i.d { background: rgba(201, 162, 75, 0.85); color: #0A0A0E; }
.fm i.l { background: rgba(239, 1, 7, 0.85); }
@media (max-width: 640px) {
  .hide-sm { display: none; }
}
.legend { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 14px; font-size: 12px; color: rgba(255, 255, 255, 0.55); }
.legend span { display: inline-flex; align-items: center; gap: 7px; }
.legend i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.cl-note { margin-top: 14px; font-size: 12px; letter-spacing: 0.04em; color: #C9A24B; }
</style>
