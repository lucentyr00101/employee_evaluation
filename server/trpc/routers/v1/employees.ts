import { z } from "zod";
import { router } from "@/server/trpc/trpc";
import { authorizedProcedure } from "~/server/trpc/procedures/authorized";
import { serverSupabaseClient } from "#supabase/server";
import { TRPCError } from "@trpc/server";

// Define validation schemas
const updateEmployeeProfileSchema = z.object({
  id: z.string().uuid("Invalid employee ID"),
  departmentId: z.string().uuid("Invalid department ID").optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  managerId: z.string().uuid("Invalid manager ID").optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  departmentId: z.string().uuid("Invalid department ID").optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  managerId: z.string().uuid("Invalid manager ID").optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export default router({
  // List all employees with their profile information
  list: authorizedProcedure.query(async ({ ctx }) => {
    try {
      const client = await serverSupabaseClient(ctx.event);

      // Query the employee_details view which joins auth.users with employee_profiles
      const { data, error } = await client
        .from("employee_details")
        .select("*")
        .order("last_name");

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data || [];
    } catch (error: any) {
      console.error("Employee List Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to fetch employees",
      });
    }
  }),

  // Get a single employee by ID with profile information
  get: authorizedProcedure
    .input(z.object({ id: z.string().uuid("Invalid employee ID") }))
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);

        // Query the employee_details view
        const { data, error } = await client
          .from("employee_details")
          .select("*")
          .eq("id", input.id)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee not found",
          });
        }

        return data;
      } catch (error: any) {
        console.error("Employee Get Error:", error);
        throw new TRPCError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch employee",
        });
      }
    }),

  // Update an employee profile
  updateProfile: authorizedProcedure
    .input(updateEmployeeProfileSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);

        // Check if profile exists first
        const { data: existingProfile } = await client
          .from("employee_profiles")
          .select("id")
          .eq("id", input.id)
          .maybeSingle();

        let result;

        if (existingProfile) {
          // Update existing profile
          const { data, error } = await client
            .from("employee_profiles")
            .update({
              department_id: input.departmentId,
              job_title: input.jobTitle,
              hire_date: input.hireDate,
              manager_id: input.managerId,
              bio: input.bio,
              phone: input.phone,
              address: input.address,
              updated_at: new Date().toISOString(),
            })
            .eq("id", input.id)
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          result = data;
        } else {
          // Create new profile
          const { data, error } = await client
            .from("employee_profiles")
            .insert([
              {
                id: input.id,
                department_id: input.departmentId,
                job_title: input.jobTitle,
                hire_date: input.hireDate,
                manager_id: input.managerId,
                bio: input.bio,
                phone: input.phone,
                address: input.address,
              },
            ])
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          result = data;
        }

        return result;
      } catch (error: any) {
        console.error("Employee Update Error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to update employee profile",
        });
      }
    }),

  // List all employees with minimal info for dropdown selectors
  listForSelect: authorizedProcedure.query(async ({ ctx }) => {
    try {
      const client = await serverSupabaseClient(ctx.event);

      const { data, error } = await client
        .from("employee_details")
        .select("id, first_name, last_name, email")
        .order("last_name");

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return (
        data?.map((employee) => ({
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
        })) || []
      );
    } catch (error: any) {
      console.error("Employee List For Select Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to fetch employees for selection",
      });
    }
  }),

  // Create a new employee with default password
  create: authorizedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        const adminClient = client.auth.admin;

        if (!adminClient) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to create users",
          });
        }

        // Step 1: Create user in auth system with default password
        const { data: userData, error: userError } =
          await adminClient.createUser({
            email: input.email,
            password: "Password123", // Default password
            email_confirm: true, // Auto-confirm email
            user_metadata: {
              first_name: input.firstName,
              last_name: input.lastName,
              full_name: `${input.firstName} ${input.lastName}`,
            },
          });

        if (userError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: userError.message,
          });
        }

        if (!userData?.user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user account",
          });
        }

        // Get the new user ID
        const userId = userData.user.id;

        // Step 2: Create employee profile
        const { data: profileData, error: profileError } = await client
          .from("employee_profiles")
          .insert([
            {
              id: userId,
              department_id: input.departmentId,
              job_title: input.jobTitle,
              hire_date: input.hireDate,
              manager_id: input.managerId,
              bio: input.bio,
              phone: input.phone,
              address: input.address,
            },
          ])
          .select()
          .single();

        if (profileError) {
          // If profile creation fails, attempt to delete the created user
          await adminClient.deleteUser(userId);

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: profileError.message,
          });
        }

        // Step 3: Set user profile to require password change on first login
        await adminClient.updateUserById(userId, {
          user_metadata: {
            ...userData.user.user_metadata,
            require_password_change: true,
          },
        });

        return {
          id: userId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          profile: profileData,
        };
      } catch (error: any) {
        console.error("Create Employee Error:", error);
        throw new TRPCError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create employee",
        });
      }
    }),
});
