<template>
  <UCard
    :ui="{
      base: 'w-[400px]'
    }"
  >
    <UForm :schema="schema" :state="form" class="space-y-4" @submit="onSubmit">
      <UFormGroup label="Email" name="email">
        <UInput v-model="form.email" autofocus />
      </UFormGroup>

      <UFormGroup label="Password" name="password">
        <UInput v-model="form.password" type="password" />
      </UFormGroup>

      <UButton type="submit" block>
        Login
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

type Schema = z.output<typeof schema>

const form = reactive({
  email: '',
  password: ''
})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  console.log(event, form.email, form.password)
}

</script>