<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">Change Your Password</h1>

    <UCard>
      <div
        v-if="firstTimeLogin"
        class="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md"
      >
        <h3 class="font-semibold">Welcome to Employee Evaluation!</h3>
        <p>
          You are using a temporary password. Please change your password now to
          continue using the system.
        </p>
      </div>

      <UForm :schema="schema" :state="form" @submit="handleSubmit">
        <!-- Current Password -->
        <UFormGroup label="Current Password" name="currentPassword" required>
          <UInput
            v-model="form.currentPassword"
            type="password"
            placeholder="Enter your current password"
          />
        </UFormGroup>

        <!-- New Password -->
        <UFormGroup label="New Password" name="newPassword" required>
          <UInput
            v-model="form.newPassword"
            type="password"
            placeholder="Enter your new password"
          />
          <template #hint>
            <p class="text-xs text-gray-500">
              Password must be at least 8 characters and include a mix of
              uppercase, lowercase, numbers, and special characters
            </p>
          </template>
        </UFormGroup>

        <!-- Confirm New Password -->
        <UFormGroup
          label="Confirm New Password"
          name="confirmPassword"
          required
        >
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your new password"
          />
        </UFormGroup>

        <div class="flex justify-end mt-6">
          <UButton type="submit" color="primary" :loading="isLoading">
            Change Password
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { useSessionStore } from "~/store/session";

definePageMeta({
  auth: true,
});

// Initialize form schema
const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Reactive state
const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isLoading = ref(false);
const sessionStore = useSessionStore();
const toast = useToast();
const router = useRouter();

// Check if this is first time login
const firstTimeLogin = computed(() => {
  return sessionStore.user?.user_metadata?.require_password_change === true;
});

// Handle form submission
async function handleSubmit() {
  isLoading.value = true;

  try {
    const { $client } = useNuxtApp();
    const client = useSupabaseClient();

    // Update password in Supabase
    const { error } = await client.auth.updateUser({
      password: form.newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    // If this was a first-time login, update the user metadata
    if (firstTimeLogin.value) {
      await $client.v1.auth.removePasswordChangeRequirement.mutate();
    }

    // Show success message
    toast.add({
      title: "Success",
      description: "Your password has been updated successfully",
      color: "green",
    });

    // Redirect to home page
    router.push("/");
  } catch (error: any) {
    console.error("Password change error:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to update password",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
