import { middleware } from '~/server/trpc/trpc'
import { TRPCError } from '@trpc/server'

export const guestMiddleware = middleware(async (opts) => {
  const { ctx } = opts

  if (ctx.authorization) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Already signed-in'
    })
  }

  return opts.next()
})
