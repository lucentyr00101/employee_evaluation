<template>
  <div class="w-full max-w-md">
    <UCard
      :ui="{
        base: 'backdrop-blur-md bg-white/10 border border-gray-200/20 shadow-xl rounded-xl'
      }"
    >
      <div class="p-8">
        <div class="mb-8 text-center">
          <h2 class="text-2xl font-semibold text-white mb-2">Create Account</h2>
          <p class="text-gray-400">Fill in your details to get started</p>
        </div>

        <UForm :schema="schema" :state="form" class="space-y-6" @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup 
              label="First Name" 
              name="firstName"
              :ui="{ 
                label: 'text-gray-300 font-medium',
                description: 'text-gray-400',
                error: 'text-red-400'
              }"
            >
              <UInput 
                v-model="form.firstName" 
                placeholder="John"
                :ui="{
                  base: 'bg-white/5 border-gray-200/20 text-white placeholder-gray-400',
                  focus: 'ring-2 ring-blue-500 border-transparent'
                }"
              />
            </UFormGroup>

            <UFormGroup 
              label="Last Name" 
              name="lastName"
              :ui="{ 
                label: 'text-gray-300 font-medium',
                description: 'text-gray-400',
                error: 'text-red-400'
              }"
            >
              <UInput 
                v-model="form.lastName" 
                placeholder="Doe"
                :ui="{
                  base: 'bg-white/5 border-gray-200/20 text-white placeholder-gray-400',
                  focus: 'ring-2 ring-blue-500 border-transparent'
                }"
              />
            </UFormGroup>
          </div>

          <UFormGroup 
            label="Email" 
            name="email"
            :ui="{ 
              label: 'text-gray-300 font-medium',
              description: 'text-gray-400',
              error: 'text-red-400'
            }"
          >
            <UInput 
              v-model="form.email" 
              type="email"
              placeholder="john.doe@example.com"
              :ui="{
                base: 'bg-white/5 border-gray-200/20 text-white placeholder-gray-400',
                focus: 'ring-2 ring-blue-500 border-transparent'
              }"
            />
          </UFormGroup>

          <UFormGroup 
            label="Password" 
            name="password"
            :ui="{ 
              label: 'text-gray-300 font-medium',
              description: 'text-gray-400',
              error: 'text-red-400'
            }"
          >
            <UInput 
              v-model="form.password" 
              type="password"
              placeholder="Enter your password"
              :ui="{
                base: 'bg-white/5 border-gray-200/20 text-white placeholder-gray-400',
                focus: 'ring-2 ring-blue-500 border-transparent'
              }"
            />
          </UFormGroup>

          <UFormGroup 
            label="Confirm Password" 
            name="confirmPassword"
            :ui="{ 
              label: 'text-gray-300 font-medium',
              description: 'text-gray-400',
              error: 'text-red-400'
            }"
          >
            <UInput 
              v-model="form.confirmPassword" 
              type="password"
              placeholder="Confirm your password"
              :ui="{
                base: 'bg-white/5 border-gray-200/20 text-white placeholder-gray-400',
                focus: 'ring-2 ring-blue-500 border-transparent'
              }"
            />
          </UFormGroup>

          <UButton 
            type="submit" 
            block
            :ui="{
              base: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200',
              loading: 'opacity-80'
            }"
            :loading="loading"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </UButton>
        </UForm>

        <div class="mt-6 text-center">
          <p class="text-gray-400">
            Already have an account? 
            <NuxtLink to="/auth/login" class="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { useAuth } from "~/composables/useAuth";

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const { register } = useAuth();

const form = reactive({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'TestPass123',
  confirmPassword: 'TestPass123'
});

const loading = ref(false);

const onSubmit = async (event: FormSubmitEvent<typeof schema>) => {
  loading.value = true;
  try {
    await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    });
  } finally {
    loading.value = false;
  }
};
</script>