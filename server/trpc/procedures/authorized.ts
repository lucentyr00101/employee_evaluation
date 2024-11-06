import { authMiddleware } from '~/server/trpc/middleware/auth'
import { publicProcedure as trpcProcedure } from '~/server/trpc/trpc'
import { publicMiddleware } from '~/server/trpc/middleware/public'
import { guestMiddleware } from '~/server/trpc/middleware/guest'

export const authorizedProcedure = trpcProcedure.use(authMiddleware)
export const publicProcedure = trpcProcedure.use(publicMiddleware)
export const guestProcedure = trpcProcedure.use(guestMiddleware)
