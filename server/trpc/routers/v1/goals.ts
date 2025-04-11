import { z } from "zod";
import { router } from '@/server/trpc/trpc'
import { authorizedProcedure } from "~/server/trpc/procedures/authorized";
import { serverSupabaseClient } from "#supabase/server";
import { TRPCError } from '@trpc/server';

// Define validation schemas
const createGoalSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).default('not_started'),
  progress: z.number().min(0).max(100).default(0),
});

const updateGoalSchema = z.object({
  id: z.string().uuid('Invalid goal ID'),
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']),
  progress: z.number().min(0).max(100),
});

export default router({
  // List all goals (with optional employee filter)
  list: authorizedProcedure
    .input(z.object({
      employeeId: z.string().uuid('Invalid employee ID').optional(),
      status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        let query = client
          .from('goals')
          .select(`
            *,
            employee:employee_id(
              id,
              email,
              raw_user_meta_data->first_name,
              raw_user_meta_data->last_name
            )
          `)
          .order('end_date');
        
        // Apply filters if provided
        if (input?.employeeId) {
          query = query.eq('employee_id', input.employeeId);
        }
        
        if (input?.status) {
          query = query.eq('status', input.status);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          });
        }
        
        // Format the response to make it easier to use
        const formattedData = data?.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          startDate: goal.start_date,
          endDate: goal.end_date,
          status: goal.status,
          progress: goal.progress,
          employeeId: goal.employee_id,
          employeeName: goal.employee ? 
            `${goal.employee.first_name || ''} ${goal.employee.last_name || ''}`.trim() : 
            'Unknown',
          employeeEmail: goal.employee?.email,
          createdAt: goal.created_at,
          updatedAt: goal.updated_at
        }));
        
        return formattedData || [];
      } catch (error: any) {
        console.error('Goals List Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals'
        });
      }
    }),

  // Get a single goal by ID
  get: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid goal ID') }))
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('goals')
          .select(`
            *,
            employee:employee_id(
              id,
              email,
              raw_user_meta_data->first_name,
              raw_user_meta_data->last_name
            )
          `)
          .eq('id', input.id)
          .single();
        
        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found'
          });
        }
        
        // Format the response
        const formattedData = {
          id: data.id,
          title: data.title,
          description: data.description,
          startDate: data.start_date,
          endDate: data.end_date,
          status: data.status,
          progress: data.progress,
          employeeId: data.employee_id,
          employeeName: data.employee ? 
            `${data.employee.first_name || ''} ${data.employee.last_name || ''}`.trim() : 
            'Unknown',
          employeeEmail: data.employee?.email,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        
        return formattedData;
      } catch (error: any) {
        console.error('Goal Get Error:', error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goal'
        });
      }
    }),

  // Create a new goal
  create: authorizedProcedure
    .input(createGoalSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('goals')
          .insert([{
            employee_id: input.employeeId,
            title: input.title,
            description: input.description,
            start_date: input.startDate,
            end_date: input.endDate,
            status: input.status,
            progress: input.progress
          }])
          .select()
          .single();
        
        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }
        
        return data;
      } catch (error: any) {
        console.error('Goal Create Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create goal'
        });
      }
    }),

  // Update an existing goal
  update: authorizedProcedure
    .input(updateGoalSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('goals')
          .update({
            title: input.title,
            description: input.description,
            start_date: input.startDate,
            end_date: input.endDate,
            status: input.status,
            progress: input.progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', input.id)
          .select()
          .single();
        
        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }
        
        return data;
      } catch (error: any) {
        console.error('Goal Update Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update goal'
        });
      }
    }),

  // Delete a goal
  delete: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid goal ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { error } = await client
          .from('goals')
          .delete()
          .eq('id', input.id);
        
        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }
        
        return { success: true };
      } catch (error: any) {
        console.error('Goal Delete Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to delete goal'
        });
      }
    }),
});