// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['trpc-nuxt']
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL ?? '',
      SUPABASE_KEY: process.env.SUPABASE_KEY ?? '',
      SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD ?? '',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ?? '',
    }
  },

  supabase: {
    redirect: false,
    clientOptions: {
      auth: {
        detectSessionInUrl: false,
        autoRefreshToken: true,
        flowType: 'implicit',
      },
    },
  },

  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@pinia/nuxt']
})