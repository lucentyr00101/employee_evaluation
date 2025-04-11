import { z } from "zod";
import { router } from '@/server/trpc/trpc'
import { authorizedProcedure } from "~/server/trpc/procedures/authorized";
import { serverSupabaseClient } from "#supabase/server";
import { TRPCError } from '@trpc/server';

// Define validation schemas
const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

const updateDepartmentSchema = z.object({
  id: z.string().uuid('Invalid department ID'),
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

export default router({
  // List all departments
  list: authorizedProcedure
    .query(async ({ ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('departments')
          .select('*')
          .order('name');
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          });
        }
        
        return data;
      } catch (error: any) {
        console.error('Department List Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch departments'
        });
      }
    }),

  // Get a single department by ID
  get: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid department ID') }))
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('departments')
          .select('*')
          .eq('id', input.id)
          .single();
        
        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Department not found'
          });
        }
        
        return data;
      } catch (error: any) {
        console.error('Department Get Error:', error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch department'
        });
      }
    }),

  // Create a new department
  create: authorizedProcedure
    .input(createDepartmentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('departments')
          .insert([{
            name: input.name,
            description: input.description,
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
        console.error('Department Create Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create department'
        });
      }
    }),

  // Update an existing department
  update: authorizedProcedure
    .input(updateDepartmentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('departments')
          .update({
            name: input.name,
            description: input.description,
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
        console.error('Department Update Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update department'
        });
      }
    }),

  // Delete a department
  delete: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid department ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { error } = await client
          .from('departments')
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
        console.error('Department Delete Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to delete department'
        });
      }
    }),
});