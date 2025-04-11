import { middleware } from '~/server/trpc/trpc'
import { TRPCError } from '@trpc/server'

export const guestMiddleware = middleware(async (opts) => {
  const { ctx } = opts

  // If authorization token exists, user is already logged in
  if (ctx.authorization) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This endpoint is only accessible to guests. Please log out first.'
    })
  }

  return opts.next()
})
