// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-21',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n'
  ],

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: [
      { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh-CN.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en-US.json' }
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'arsenal_lang',
      redirectOn: 'root'
    },
    bundle: {
      optimizeTranslationDirective: false
    }
  },

  nitro: {
    preset: process.env.NITRO_PRESET || 'cloudflare-pages',
    // Better-sqlite3 is a native module, must be externalized
    externals: {
      inline: [],
      external: ['better-sqlite3']
    },
    // Compress assets
    compressPublicAssets: true,
    // Route rules for caching
    // Note: Data is already cached in DB with proper sync intervals.
    // In dev mode, disable Nitro route cache to avoid stale pages.
    // In production, edge cache provides fast response.
    routeRules: process.env.NODE_ENV === 'development' ? {} : {
      // Static pages cached at edge
      '/': { cache: { maxAge: 600 } },
      '/fixtures': { cache: { maxAge: 600 } },
      '/standings': { cache: { maxAge: 300 } },
      '/squad': { cache: { maxAge: 600 } },
      '/scorers': { cache: { maxAge: 300 } },
      '/legends': { cache: { maxAge: 86400 } },
      '/club': { cache: { maxAge: 86400 } },
      '/stadium': { cache: { maxAge: 86400 } },
      '/women': { cache: { maxAge: 86400 } },
      '/watch': { cache: { maxAge: 600 } },
      // API routes - DB handles caching, so edge cache is short
      '/api/fixtures': { cache: { maxAge: 60 } },
      '/api/standings': { cache: { maxAge: 60 } },
      '/api/next-match': { cache: { maxAge: 60 } },
      '/api/last-results': { cache: { maxAge: 60 } },
      '/api/squad': { cache: { maxAge: 300 } },
      '/api/scorers': { cache: { maxAge: 300 } },
      '/api/player/**': { cache: { maxAge: 300 } }
    }
  },

  // Build optimizations
  experimental: {
    payloadExtraction: true,
    componentIslands: false
  },

  // Image optimization (Nuxt built-in)
  image: {
    format: ['webp'],
    quality: 80,
    densities: [1, 2]
  },

  runtimeConfig: {
    apiFootballKey: process.env.NUXT_API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY || '',
    footballDataKey: process.env.NUXT_FOOTBALL_DATA_KEY || process.env.FOOTBALL_DATA_KEY || '',
    public: {
      apiFootballBaseUrl: process.env.NUXT_PUBLIC_API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
      footballDataBaseUrl: process.env.NUXT_PUBLIC_FOOTBALL_DATA_BASE_URL || 'https://api.football-data.org/v4'
    }
  },

  app: {
    head: {
      title: 'Arsenal Hub - 阿森纳比赛中心',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '阿森纳比赛中心 - 赛程、比分、积分榜、正版观赛导航' },
        { name: 'theme-color', content: '#EF0107' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fantasy.premierleague.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://api.football-data.org' },
        { rel: 'dns-prefetch', href: 'https://resources.premierleague.com' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // Tailwind viewer in dev
  tailwindcss: {
    viewer: false
  }
})
