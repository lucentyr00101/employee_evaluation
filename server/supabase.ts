import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig();

const supabase = createClient(config.public.SUPABASE_URL, config.public.SUPABASE_ANON_KEY)

export default supabase