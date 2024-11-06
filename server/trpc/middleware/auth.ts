import { serverSupabaseClient } from '#supabase/server'
import { TRPCError } from '@trpc/server'
import { middleware } from '~/server/trpc/trpc'

export const authMiddleware = middleware(async opts => {
  const { ctx } = opts

  if (ctx.authorization === undefined) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'NO_AUTH',
    })
  }

  const client = await serverSupabaseClient(ctx.event)
  const { data } = await client.auth.getUser(ctx.authorization)

  if (data.user === null) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid access, please login.',
    })
  }

  return opts.next({
    ctx: {
      user: data.user,
    },
  })
})
