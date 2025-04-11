import { router } from '@/server/trpc/trpc'
import auth from './auth'
import departments from './departments'
import employees from './employees'
import goals from './goals'
import evaluations from './evaluations'

export default router({
  auth,
  departments,
  employees,
  goals,
  evaluations
})