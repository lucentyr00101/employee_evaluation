import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = (event: H3Event) => {
  const headers = getRequestHeaders(event)
  // const cookies = parseStringToObject(headers.cookie ?? '')
  const cookies = headers.cookie ?? ''

  // const authorization: string | undefined = cookies.session
  // const refreshToken: string | undefined = cookies['console-fresh']
  const authorization: string | undefined = ''
  const refreshToken: string | undefined = ''
  console.log({event})

  return {
    authorization,
    refreshToken,
    event,
    user: null as Record<string, any> | null,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;