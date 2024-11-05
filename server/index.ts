import { router } from './trpc';
import v1 from './v1/index'

const appRouter = router({
  v1
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;