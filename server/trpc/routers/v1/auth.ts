import { z } from "zod";
import { router } from '@/server/trpc/trpc'
import { guestProcedure } from "~/server/trpc/procedures/authorized";
import { serverSupabaseClient } from "#supabase/server";
import { TRPCError } from '@trpc/server';

export default router({
  login: guestProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(8, 'Must be at least 8 characters')
      }),
    )
    .mutation(async ({ input, ctx }): Promise<any> => {
      const client = await serverSupabaseClient(ctx.event)
      const { data, error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message
        });
      }

      return {
        session: data.session,
        user: data.user
      }
    }),

  register: guestProcedure
    .input(
      z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email'),
        password: z.string()
          .min(8, 'Must be at least 8 characters')
          .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Must contain at least one number')
      }),
    )
    .mutation(async ({ input, ctx }): Promise<any> => {
      try {
        const client = await serverSupabaseClient(ctx.event)
        const { data: authData, error } = await client.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              first_name: input.firstName,
              last_name: input.lastName,
            }
          }
        })

        if (error) {
          console.error('Supabase Auth Error:', error);
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }

        if (!authData.user) {
          return {
            session: null,
            user: null,
            message: 'Please check your email to confirm your registration'
          }
        }

        return {
          session: authData.session,
          user: authData.user
        }
      } catch (error: any) {
        console.error('Registration Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'An error occurred during registration'
        });
      }
    }),

  getMe: guestProcedure
    .query(async ({ ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        const { data: { user }, error } = await client.auth.getUser();

        if (error) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: error.message
          });
        }

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not found'
          });
        }

        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.first_name,
            lastName: user.user_metadata?.last_name,
            createdAt: user.created_at
          }
        };
      } catch (error: any) {
        console.error('Get User Error:', error);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Failed to fetch user details'
        });
      }
    }),

  logout: guestProcedure
    .mutation(async ({ ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        const { error } = await client.auth.signOut();

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          });
        }

        return { success: true };
      } catch (error: any) {
        console.error('Logout Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to logout'
        });
      }
    }),
})