import { z } from "zod";
import { router } from "@/server/trpc/trpc";
import { authorizedProcedure } from "~/server/trpc/procedures/authorized";
import {
  serverSupabaseClient,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { TRPCError } from "@trpc/server";

// Define database types
interface Database {
  public: {
    Tables: {
      employee_profiles: {
        Row: EmployeeProfile;
        Insert: {
          id: string;
          department_id?: string | null;
          job_title?: string | null;
          hire_date?: string | null;
          manager_id?: string | null;
          bio?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employee_details: {
        Row: EmployeeDetails;
      };
    };
    Views: {
      employee_details: {
        Row: EmployeeDetails;
      };
    };
  };
}

interface EmployeeProfile {
  id: string;
  department_id: string | null;
  job_title: string | null;
  hire_date: string | null;
  manager_id: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department_id: string | null;
  department_name: string | null;
  job_title: string | null;
  hire_date: string | null;
  manager_id: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

// Define validation schemas
const updateEmployeeProfileSchema = z.object({
  id: z.string().uuid("Invalid employee ID"),
  departmentId: z.string().uuid("Invalid department ID").optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  hireDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
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
  hireDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
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

      const { data, error } = await client
        .from("employee_details")
        .select("*")
        .order("last_name")
        .returns<EmployeeDetails[]>();

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

        const { data, error } = await client
          .from("employee_details")
          .select("*")
          .eq("id", input.id)
          .single()
          .returns<EmployeeDetails>();

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
        const client = await serverSupabaseClient<Database>(ctx.event);

        const { data: existingProfile } = await client
          .from("employee_profiles")
          .select("id")
          .eq("id", input.id)
          .maybeSingle()
          .returns<Pick<EmployeeProfile, "id">>();

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
            } satisfies Partial<Database["public"]["Tables"]["employee_profiles"]["Insert"]>)
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
            .insert({
              id: input.id,
              department_id: input.departmentId,
              job_title: input.jobTitle,
              hire_date: input.hireDate,
              manager_id: input.managerId,
              bio: input.bio,
              phone: input.phone,
              address: input.address,
            } satisfies Database["public"]["Tables"]["employee_profiles"]["Insert"])
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
        .order("last_name")
        .returns<
          Pick<EmployeeDetails, "id" | "first_name" | "last_name" | "email">[]
        >();

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
        const client = await serverSupabaseServiceRole<Database>(ctx.event);

        // Step 1: Create user in auth system with default password
        const { data: userData, error: userError } =
          await client.auth.admin.createUser({
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
          .insert({
            id: userId,
            department_id: input.departmentId,
            job_title: input.jobTitle,
            hire_date: input.hireDate,
            manager_id: input.managerId,
            bio: input.bio,
            phone: input.phone,
            address: input.address,
          } satisfies Database["public"]["Tables"]["employee_profiles"]["Insert"])
          .select()
          .single();

        if (profileError) {
          // If profile creation fails, attempt to delete the created user
          await client.auth.admin.deleteUser(userId);

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: profileError.message,
          });
        }

        // Step 3: Set user profile to require password change on first login
        await client.auth.admin.updateUserById(userId, {
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
