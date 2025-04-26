// tests/login.test.ts
import { test, expect } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY!;

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

// Create a simplified version of the auth login functionality
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

async function loginUser(input: z.infer<typeof loginSchema>) {
  const { data, error } = await supabase.auth.signInWithPassword({
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

test("login with live Supabase", async () => {
  const email = "test-user@example.com";
  const password = "Password123";

  try {
    // Cleanup any existing test user first
    const { data: existingUser } = await adminClient.auth.admin.listUsers({
      filter: { email },
    });

    if (existingUser?.users?.length) {
      await adminClient.auth.admin.deleteUser(existingUser.users[0].id);
    }

    // Create a test user
    const { data: signUpData, error: signUpError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (signUpError) {
      throw signUpError;
    }

    // Login with the test user
    const result = await loginUser({ email, password });

    // Assert
    expect(result.user.email).toBe(email);
    expect(result.session).toBeDefined();
    expect(result.session.access_token).toBeDefined();
  } catch (error) {
    console.error("Test error:", error);
    throw error;
  } finally {
    // Cleanup - find and delete the test user
    const { data } = await adminClient.auth.admin.listUsers({
      filter: { email },
    });

    if (data?.users?.length) {
      await adminClient.auth.admin.deleteUser(data.users[0].id);
    }
  }
});
