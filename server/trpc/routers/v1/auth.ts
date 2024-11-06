import { publicProcedure } from "~/server/trpc/trpc";
import { z } from "zod";
import { router } from '@/server/trpc/trpc'

export default router({
  login: publicProcedure
  .input(
    z.object({
      email: z.string().email('Invalid email'),
      password: z.string().min(8, 'Must be at least 8 characters')
    }),
  )
  .query(({ input }) => {
    console.log({input})
    return input
  }),
})