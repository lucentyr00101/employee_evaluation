<script setup>
import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()
const supabase = createClient(config.public.SUPABASE_URL, config.public.SUPABASE_ANON_KEY)

const { data: countries, status } = useLazyAsyncData(async () => {
  try {
    const { data } = await supabase.from('countries').select()
    return data
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <h1 v-if="status === 'pending'">Loading...</h1>
  <ul>
    <li v-for="country in countries" :key="country.id">{{ country.name }}</li>
  </ul>
</template>