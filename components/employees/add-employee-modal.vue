<template>
  <UModal v-model="isOpen" :ui="{ width: 'md:max-w-2xl' }">
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Add New Employee
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="-my-1"
            aria-label="Close"
            @click="close"
          />
        </div>
      </template>

      <UForm :schema="schema" :state="form" @submit="submitForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- First Name -->
          <UFormGroup label="First Name" name="firstName" required>
            <UInput v-model="form.firstName" placeholder="Enter first name" />
          </UFormGroup>

          <!-- Last Name -->
          <UFormGroup label="Last Name" name="lastName" required>
            <UInput v-model="form.lastName" placeholder="Enter last name" />
          </UFormGroup>

          <!-- Email -->
          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="Enter email address"
            />
          </UFormGroup>

          <!-- Department -->
          <UFormGroup label="Department" name="departmentId">
            <USelectMenu
              v-model="form.departmentId as any"
              valueAttribute="value"
              :options="departmentOptions"
              placeholder="Select a department"
            />
          </UFormGroup>

          <!-- Job Title -->
          <UFormGroup label="Job Title" name="jobTitle">
            <UInput v-model="form.jobTitle" placeholder="Enter job title" />
          </UFormGroup>

          <!-- Hire Date -->
          <UFormGroup label="Hire Date" name="hireDate">
            <UInput v-model="form.hireDate" type="date" />
          </UFormGroup>

          <!-- Manager -->
          <UFormGroup label="Manager" name="managerId">
            <USelectMenu
              v-model="form.managerId as any"
              :options="managerOptions"
              valueAttribute="value"
              placeholder="Select a manager"
            />
          </UFormGroup>

          <!-- Phone -->
          <UFormGroup label="Phone" name="phone">
            <UInput v-model="form.phone" placeholder="Enter phone number" />
          </UFormGroup>

          <!-- Address -->
          <UFormGroup label="Address" name="address">
            <UInput v-model="form.address" placeholder="Enter address" />
          </UFormGroup>
        </div>

        <!-- Bio -->
        <UFormGroup label="Bio" name="bio">
          <UTextarea
            v-model="form.bio"
            placeholder="Enter employee bio"
            :rows="3"
          />
        </UFormGroup>

        <div class="mt-4 text-sm text-gray-500">
          <p>
            A default password of "Password123" will be set. The employee will
            be prompted to change it on first login.
          </p>
        </div>

        <div class="flex justify-end space-x-2 mt-6">
          <UButton type="button" color="gray" variant="ghost" @click="close">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="isSubmitting">
            Create Employee
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";

const props = defineProps<{
  departments: any[];
  managers: any[];
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", employee: any): void;
}>();

// Add watch to reset form when modal closes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      resetForm();
    }
  }
);

// Define schema for form validation
const schema = z.object({
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

// Form state
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  departmentId: null as string | null,
  jobTitle: "",
  hireDate: "",
  managerId: null as string | null,
  bio: "",
  phone: "",
  address: "",
});

const isSubmitting = ref(false);

// Computed properties for select menus
const departmentOptions = computed(() => {
  return [
    { label: "None", value: null },
    ...props.departments.map((dept) => ({
      label: dept.name,
      value: dept.id,
    })),
  ];
});

const managerOptions = computed(() => {
  return [
    { label: "None", value: null },
    ...props.managers.map((manager) => ({
      label: manager.name,
      value: manager.id,
    })),
  ];
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Methods
function resetForm() {
  Object.assign(form, {
    firstName: "",
    lastName: "",
    email: "",
    departmentId: null,
    jobTitle: "",
    hireDate: "",
    managerId: null,
    bio: "",
    phone: "",
    address: "",
  });
}

function close() {
  resetForm();
  isOpen.value = false;
}

function submitForm() {
  isSubmitting.value = true;
  try {
    emit("submit", { ...form });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
