<template>
  <div class="w-full max-w-md">
    <UCard
      :ui="{
        base: 'backdrop-blur-md bg-white/10 border border-gray-200/20 shadow-xl rounded-xl'
      }"
    >
      <div class="p-8">
        <div class="mb-8 text-center">
          <h2 class="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
          <p class="text-gray-400">Please sign in to continue</p>
        </div>

        <UForm :schema="schema" :state="form" class="space-y-6" @submit="onSubmit">
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
              placeholder="Enter your email" 
              autofocus
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

          <div class="flex items-center justify-between mb-2">
            <label class="flex items-center">
              <input type="checkbox" class="form-checkbox bg-white/5 border-gray-200/20 text-blue-500 rounded">
              <span class="ml-2 text-sm text-gray-300">Remember me</span>
            </label>
            <a href="#" class="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
          </div>

          <UButton 
            type="submit" 
            block
            :ui="{
              base: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200',
              loading: 'opacity-80'
            }"
            :loading="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </UButton>
        </UForm>

        <div class="mt-6 text-center">
          <p class="text-gray-400">
            Don't have an account? 
            <NuxtLink to="/auth/register" class="text-blue-400 hover:text-blue-300 font-medium">
              Create account
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
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const { login } = useAuth();

const form = reactive({
  email: '',
  password: ''
});

const loading = ref(false);

const onSubmit = async (event: FormSubmitEvent<typeof schema>) => {
  loading.value = true;
  try {
    await login(form.email, form.password);
  } finally {
    loading.value = false;
  }
};
</script>