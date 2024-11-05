import { router } from '@/server/trpc/trpc'
import { publicProcedure } from "~/server/trpc";
import supabase from "~/server/supabase";

export default router({
  countryList: publicProcedure
    .query(async () => {
      return supabase.from('countries').select()
    }),
})