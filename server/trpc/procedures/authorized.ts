import { authMiddleware } from '~/server/trpc/middleware/auth'
import { publicMiddleware } from '~/server/trpc/middleware/public'
import { guestMiddleware } from '~/server/trpc/middleware/guest'
import { publicProcedure as baseProcedure } from '~/server/trpc/trpc'

/**
 * Procedures for different authentication states
 * 
 * - authorizedProcedure: Requires an authenticated user
 * - publicProcedure: Accessible to both authenticated and unauthenticated users
 * - guestProcedure: Only accessible to unauthenticated users
 */

// Requires authentication - Use for protected routes
export const authorizedProcedure = baseProcedure.use(authMiddleware)

// Accepts both authenticated and unauthenticated users - Use for public data
export const publicProcedure = baseProcedure.use(publicMiddleware)

// Only for non-authenticated users - Use for login/register
export const guestProcedure = baseProcedure.use(guestMiddleware)
