import { serverSupabaseClient } from '#supabase/server'
import { middleware } from '~/server/trpc/trpc'

export const publicMiddleware = middleware(async opts => {
  const { ctx } = opts

  // If there's an authorization token, try to get the user
  if (ctx.authorization) {
    try {
      const client = await serverSupabaseClient(ctx.event)
      const { data } = await client.auth.getUser(ctx.authorization)
      
      // Add user to context if found
      if (data.user) {
        return opts.next({
          ctx: {
            user: data.user,
          },
        })
      }
    } catch (error) {
      // Silently handle errors for public routes
      console.error('Public middleware authentication error:', error)
    }
  }

  // Continue without user in context for unauthenticated requests
  return opts.next({
    ctx: {
      user: null,
    },
  })
})
