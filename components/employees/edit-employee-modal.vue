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
            Edit Employee Profile
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
        <!-- Basic Info Section -->
        <div class="flex items-center mb-6">
          <UAvatar
            :text="getInitials(employee?.first_name, employee?.last_name)"
            size="lg"
            :ui="{
              base: 'bg-blue-500 text-white',
              ring: 'ring-2 ring-white/20',
            }"
          />
          <div class="ml-4">
            <div class="text-lg font-medium">
              {{ employee?.first_name }}
              {{ employee?.last_name }}
            </div>
            <div class="text-sm text-gray-500">
              {{ employee?.email }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Department -->
          <UFormGroup label="Department" name="departmentId">
            <USelectMenu
              v-model="form.departmentId as any"
              :options="departmentOptions"
              placeholder="Select a department"
              value-attribute="value"
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
              placeholder="Select a manager"
              value-attribute="value"
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

        <div class="flex justify-end space-x-2 mt-6">
          <UButton type="button" color="gray" variant="ghost" @click="close">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="isSubmitting">
            Save Changes
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";

const props = defineProps<{
  modelValue: boolean;
  employee: any;
  departments: any[];
  managers: any[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", data: any): void;
}>();

// Schema for form validation
const schema = z.object({
  departmentId: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const { $client } = useNuxtApp();
const toast = useToast();

// Form state
const form = reactive({
  id: "",
  departmentId: null as string | null,
  jobTitle: "",
  hireDate: "",
  managerId: null as string | null,
  bio: "",
  phone: "",
  address: "",
});

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const isSubmitting = ref(false);

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

// Methods
function close() {
  isOpen.value = false;
}

async function submitForm() {
  isSubmitting.value = true;

  try {
    await $client.v1.employees.updateProfile.mutate({
      id: form.id,
      departmentId: form.departmentId,
      jobTitle: form.jobTitle,
      hireDate: form.hireDate,
      managerId: form.managerId,
      bio: form.bio,
      phone: form.phone,
      address: form.address,
    });

    toast.add({
      title: "Success",
      description: "Employee profile updated successfully",
      color: "green",
    });

    emit("submit", form);
    close();
  } catch (error: any) {
    console.error("Error updating employee profile:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to update employee profile",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Helper functions
function getInitials(firstName: string, lastName: string) {
  return `${(firstName || "")[0] || ""}${
    (lastName || "")[0] || ""
  }`.toUpperCase();
}

function formatDateForInput(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// Watch for employee changes to update form
watch(
  () => props.employee,
  (employee) => {
    if (employee) {
      form.id = employee.id;
      form.departmentId = employee.department_id;
      form.jobTitle = employee.job_title || "";
      form.hireDate = employee.hire_date
        ? formatDateForInput(employee.hire_date)
        : "";
      form.managerId = employee.manager_id;
      form.bio = employee.bio || "";
      form.phone = employee.phone || "";
      form.address = employee.address || "";
    }
  },
  { immediate: true }
);
</script>
