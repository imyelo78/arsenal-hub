<script setup lang="ts">
const { t, locale } = useI18n()

const isZh = computed(() => locale.value === 'zh')

const watchChannels = computed(() => {
  if (isZh.value) {
    return {
      free: [
        {
          name: t('watch.cctv'),
          desc: t('watch.cctvDesc'),
          url: 'https://www.yangshipin.cn/',
          icon: 'CCTV'
        }
      ],
      paid: [
        {
          name: t('watch.migu'),
          desc: t('watch.miguDesc'),
          url: 'https://www.miguvideo.com/',
          icon: 'MG'
        }
      ],
      highlights: [
        {
          name: t('watch.bilibili'),
          desc: t('watch.bilibiliDesc'),
          url: 'https://www.bilibili.com/',
          icon: 'B'
        },
        {
          name: t('watch.youtube'),
          desc: t('watch.youtubeDesc'),
          url: 'https://www.youtube.com/@premierleague',
          icon: 'YT'
        }
      ]
    }
  }
  return {
    free: [
      {
        name: t('watch.bbcHighlights'),
        desc: t('watch.bbcDesc'),
        url: 'https://www.bbc.co.uk/programmes/b007ttnb',
        icon: 'BBC'
      }
    ],
    paid: [
      {
        name: t('watch.skySports'),
        desc: t('watch.skySportsDesc'),
        url: 'https://www.skysports.com/',
        icon: 'SS'
      },
      {
        name: t('watch.tntSports'),
        desc: t('watch.tntSportsDesc'),
        url: 'https://www.tntsports.co.uk/',
        icon: 'TNT'
      }
    ],
    highlights: [
      {
        name: t('watch.youtube'),
        desc: t('watch.youtubeDesc'),
        url: 'https://www.youtube.com/@premierleague',
        icon: 'YT'
      }
    ]
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('watch.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('watch.subtitle') }}</p>
    </div>

    <!-- Free Watch -->
    <section>
      <h2 class="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <span class="tag tag-free">{{ t('watch.freeWatch') }}</span>
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <a
          v-for="channel in watchChannels.free"
          :key="channel.name"
          :href="channel.url"
          target="_blank"
          rel="noopener noreferrer"
          class="card flex items-center gap-4 hover:border-arsenal-red transition-colors"
        >
          <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-arsenal-red to-arsenal-red-darker text-white flex items-center justify-center font-bold text-sm">
            {{ channel.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900">{{ channel.name }}</div>
            <div class="text-sm text-gray-500 mt-0.5">{{ channel.desc }}</div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Paid Watch -->
    <section>
      <h2 class="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <span class="tag tag-paid">{{ t('watch.paidWatch') }}</span>
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <a
          v-for="channel in watchChannels.paid"
          :key="channel.name"
          :href="channel.url"
          target="_blank"
          rel="noopener noreferrer"
          class="card flex items-center gap-4 hover:border-arsenal-red transition-colors"
        >
          <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-sm">
            {{ channel.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900">{{ channel.name }}</div>
            <div class="text-sm text-gray-500 mt-0.5">{{ channel.desc }}</div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Highlights -->
    <section>
      <h2 class="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <span class="tag tag-home">{{ t('watch.highlights') }}</span>
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <a
          v-for="channel in watchChannels.highlights"
          :key="channel.name"
          :href="channel.url"
          target="_blank"
          rel="noopener noreferrer"
          class="card flex items-center gap-4 hover:border-arsenal-red transition-colors"
        >
          <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-arsenal-blue to-blue-800 text-white flex items-center justify-center font-bold text-sm">
            {{ channel.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900">{{ channel.name }}</div>
            <div class="text-sm text-gray-500 mt-0.5">{{ channel.desc }}</div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Disclaimer -->
    <div class="card bg-gray-50 border-gray-300">
      <p class="text-sm text-gray-500 leading-relaxed">{{ t('watch.disclaimer') }}</p>
    </div>
  </div>
</template>
