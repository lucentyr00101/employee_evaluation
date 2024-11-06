import { serverSupabaseClient } from '#supabase/server'
import { middleware } from '~/server/trpc/trpc'

export const publicMiddleware = middleware(async opts => {
  const { ctx } = opts

  const client = await serverSupabaseClient(ctx.event)
  const { data } = await client.auth.getUser(ctx.authorization)

  return opts.next({
    ctx: {
      user: data.user,
    },
  })
})
