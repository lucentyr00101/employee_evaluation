import { z } from "zod";
import { router } from "@/server/trpc/trpc";
import {
  authorizedProcedure,
  guestProcedure,
  publicProcedure,
} from "~/server/trpc/procedures/authorized";
import {
  serverSupabaseClient,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { TRPCError } from "@trpc/server";
import { Context } from "~/server/trpc/context";
import type { inferProcedureInput } from "@trpc/server";

// Define database types for TypeScript
interface Database {
  public: {
    Tables: {
      employee_profiles: {
        Row: {
          id: string;
          department_id: string | null;
          job_title: string | null;
          hire_date: string | null;
          manager_id: string | null;
          bio: string | null;
          phone: string | null;
          address: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          department_id?: string | null;
          job_title?: string | null;
          hire_date?: string | null;
          manager_id?: string | null;
          bio?: string | null;
          phone?: string | null;
          address?: string | null;
          is_admin: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Define input types
type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Define validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default router({
  // Login endpoint - accessible only to guests (non-authenticated users)
  login: guestProcedure
    .input(loginSchema)
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: LoginInput;
        ctx: Context;
      }): Promise<any> => {
        const client = await serverSupabaseClient(ctx.event);
        const { data, error } = await client.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error.message,
          });
        }

        return {
          session: data.session,
          user: data.user,
        };
      }
    ),

  // Register endpoint - accessible only to guests (non-authenticated users)
  register: guestProcedure
    .input(registerSchema)
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: RegisterInput;
        ctx: Context;
      }): Promise<any> => {
        try {
          const client = await serverSupabaseServiceRole<Database>(ctx.event);

          // Create user in auth system
          const { data: authData, error } = await client.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true,
            user_metadata: {
              first_name: input.firstName,
              last_name: input.lastName,
            },
          });

          if (error) {
            console.error("Supabase Auth Error:", error);
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          if (!authData?.user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user account",
            });
          }

          // Create employee profile with is_admin=false by default
          const { error: profileError } = await client
            .from("employee_profiles")
            .insert({
              id: authData.user.id,
              is_admin: false,
            } satisfies Database["public"]["Tables"]["employee_profiles"]["Insert"]);

          if (profileError) {
            // If profile creation fails, attempt to delete the created user
            await client.auth.admin.deleteUser(authData.user.id);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: profileError.message,
            });
          }

          return {
            user: authData.user,
            message: "Registration successful",
          };
        } catch (error: any) {
          console.error("Registration Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "An error occurred during registration",
          });
        }
      }
    ),

  // GetMe endpoint - accessible only to authenticated users
  getMe: authorizedProcedure.query(
    async ({ ctx }: { ctx: Context & { user: any } }) => {
      try {
        // User is already authenticated via middleware
        const user = ctx.user;

        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.first_name,
            lastName: user.user_metadata?.last_name,
            createdAt: user.created_at,
          },
        };
      } catch (error: any) {
        console.error("Get User Error:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message || "Failed to fetch user details",
        });
      }
    }
  ),

  // Logout endpoint - accessible only to authenticated users
  logout: authorizedProcedure.mutation(
    async ({ ctx }: { ctx: Context & { user: any } }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        const { error } = await client.auth.signOut();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return { success: true };
      } catch (error: any) {
        console.error("Logout Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to logout",
        });
      }
    }
  ),

  // Update profile endpoint - accessible only to authenticated users
  updateProfile: authorizedProcedure
    .input(updateProfileSchema)
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: UpdateProfileInput;
        ctx: Context & { user: any };
      }) => {
        try {
          const client = await serverSupabaseClient(ctx.event);

          // Update user metadata
          const { error } = await client.auth.updateUser({
            data: {
              first_name: input.firstName,
              last_name: input.lastName,
            },
          });

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          return {
            success: true,
            message: "Profile updated successfully",
          };
        } catch (error: any) {
          console.error("Update Profile Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "Failed to update profile",
          });
        }
      }
    ),

  // Change password endpoint - accessible only to authenticated users
  changePassword: authorizedProcedure
    .input(changePasswordSchema)
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: ChangePasswordInput;
        ctx: Context & { user: any };
      }) => {
        try {
          const client = await serverSupabaseClient(ctx.event);

          // First verify current password by trying to sign in
          const { error: signInError } = await client.auth.signInWithPassword({
            email: ctx.user.email,
            password: input.currentPassword,
          });

          if (signInError) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Current password is incorrect",
            });
          }

          // Update the password
          const { error } = await client.auth.updateUser({
            password: input.newPassword,
          });

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          return {
            success: true,
            message: "Password changed successfully",
          };
        } catch (error: any) {
          console.error("Change Password Error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "Failed to change password",
          });
        }
      }
    ),

  // Remove password change requirement flag after first login
  removePasswordChangeRequirement: authorizedProcedure.mutation(
    async ({ ctx }: { ctx: Context & { user: any } }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        const adminClient = client.auth.admin;

        if (!adminClient) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Admin API not available",
          });
        }

        // Get current user metadata
        const currentUser = ctx.user;
        const currentMetadata = currentUser.user_metadata || {};

        // Create a new metadata object without the require_password_change flag
        const { require_password_change, ...cleanedMetadata } = currentMetadata;

        // Update user metadata to remove the flag
        const { error } = await adminClient.updateUserById(currentUser.id, {
          user_metadata: cleanedMetadata,
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return {
          success: true,
          message: "Password change requirement removed",
        };
      } catch (error: any) {
        console.error("Remove Password Change Requirement Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update user metadata",
        });
      }
    }
  ),
});
