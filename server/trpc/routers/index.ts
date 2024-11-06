import { router } from '../trpc'
import v1 from './v1'

export const appRouter = router({
  v1
})

// export type definition of API
export type AppRouter = typeof appRouter