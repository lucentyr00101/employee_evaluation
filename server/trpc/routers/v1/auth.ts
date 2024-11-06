import { z } from "zod";
import { router } from '@/server/trpc/trpc'
import { guestProcedure } from "~/server/trpc/procedures/authorized";
import { serverSupabaseClient } from "#supabase/server";

export default router({
  login: guestProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(8, 'Must be at least 8 characters')
      }),
    )
    .mutation(async ({ input, ctx }): Promise<any> => {
      const client = await serverSupabaseClient(ctx.event)
      const { data } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })
      return data
    }),
})