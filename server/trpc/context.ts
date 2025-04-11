import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import { getCookie } from 'h3'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = (event: H3Event) => {
  // Get access token from cookie
  const accessToken = getCookie(event, 'accessToken')

  return {
    authorization: accessToken,
    event,
    user: null as Record<string, any> | null,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;