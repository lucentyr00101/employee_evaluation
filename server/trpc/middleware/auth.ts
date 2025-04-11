import { serverSupabaseClient } from '#supabase/server'
import { TRPCError } from '@trpc/server'
import { middleware } from '~/server/trpc/trpc'

export const authMiddleware = middleware(async opts => {
  const { ctx } = opts

  if (!ctx.authorization) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in.',
    })
  }

  const client = await serverSupabaseClient(ctx.event)
  const { data, error } = await client.auth.getUser(ctx.authorization)

  if (error || !data.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired session. Please log in again.',
    })
  }

  return opts.next({
    ctx: {
      user: data.user,
    },
  })
})
