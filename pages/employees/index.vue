<template>
  <div>
    <UBreadcrumb
      :links="[{ label: 'Home', to: '/' }, { label: 'Employees' }]"
      class="mb-6"
    />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Employees</h1>
      <UButton
        color="primary"
        icon="i-heroicons-user-plus"
        @click="openAddEmployeeModal"
      >
        Add Employee
      </UButton>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-gray-400"
      />
    </div>

    <!-- Empty state -->
    <UCard
      v-else-if="employees.length === 0"
      class="p-12 flex flex-col items-center justify-center"
    >
      <UIcon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mb-4" />
      <h3 class="text-lg font-medium mb-2">No employees found</h3>
      <p class="text-gray-500 mb-6 text-center">
        Get started by adding your first employee.
      </p>
      <UButton color="primary" @click="openAddEmployeeModal"
        >Add Employee</UButton
      >
    </UCard>

    <!-- Data table -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Employee
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Department
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Job Title
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Hire Date
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="employee in employees"
              :key="employee.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UAvatar
                    :text="getInitials(employee.first_name, employee.last_name)"
                    size="sm"
                    :ui="{
                      base: 'bg-blue-500 text-white',
                      ring: 'ring-2 ring-white/20',
                    }"
                  />
                  <div class="ml-3">
                    <div class="font-medium">
                      {{ employee.first_name }} {{ employee.last_name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ employee.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  v-if="employee.department_name"
                  color="blue"
                  variant="soft"
                >
                  {{ employee.department_name }}
                </UBadge>
                <span v-else class="text-gray-500 text-sm">Not assigned</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">
                  {{ employee.job_title || "Not specified" }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">{{ formatDate(employee.hire_date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div class="flex justify-end space-x-2">
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                    size="xs"
                    @click="editEmployeeProfile(employee)"
                  />
                  <UButton
                    color="blue"
                    variant="ghost"
                    icon="i-heroicons-eye"
                    size="xs"
                    :to="`/employees/${employee.id}`"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Edit Employee Profile Modal -->
    <UModal v-model="isModalOpen" :ui="{ width: 'md:max-w-2xl' }">
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
              @click="isModalOpen = false"
            />
          </div>
        </template>

        <UForm :schema="schema" :state="form" @submit="submitForm">
          <!-- Basic Info Section -->
          <div class="flex items-center mb-6">
            <UAvatar
              :text="
                getInitials(
                  selectedEmployee?.first_name,
                  selectedEmployee?.last_name
                )
              "
              size="lg"
              :ui="{
                base: 'bg-blue-500 text-white',
                ring: 'ring-2 ring-white/20',
              }"
            />
            <div class="ml-4">
              <div class="text-lg font-medium">
                {{ selectedEmployee?.first_name }}
                {{ selectedEmployee?.last_name }}
              </div>
              <div class="text-sm text-gray-500">
                {{ selectedEmployee?.email }}
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
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              @click="isModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton type="submit" color="primary" :loading="isSubmitting">
              Save Changes
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <EmployeesAddEmployeeModal
      v-model="isAddModalOpen"
      :departments="departments"
      :managers="managers"
      @submit="handleNewEmployee"
    />
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";

// Define page metadata
definePageMeta({
  auth: true,
});

// Define schema for form validation
const schema = z.object({
  departmentId: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

// Access tRPC client
const { $client } = useNuxtApp();
const toast = useToast();

// Reactive state
const employees = ref<any[]>([]);
const departments = ref<any[]>([]);
const managers = ref<any[]>([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isAddModalOpen = ref(false);
const isSubmitting = ref(false);
const selectedEmployee = ref<any>(null);

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

// Computed properties for select menus
const departmentOptions = computed(() => {
  return [
    { label: "None", value: null },
    ...departments.value.map((dept) => ({
      label: dept.name,
      value: dept.id,
    })),
  ];
});

const managerOptions = computed(() => {
  return [
    { label: "None", value: null },
    ...managers.value.map((manager) => ({
      label: manager.name,
      value: manager.id,
    })),
  ];
});

// Fetch data on page load
onMounted(async () => {
  await Promise.all([fetchEmployees(), fetchDepartments(), fetchManagers()]);
});

// Method to fetch employees
async function fetchEmployees() {
  try {
    isLoading.value = true;
    employees.value = await $client.v1.employees.list.query();
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to load employees",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
}

// Method to fetch departments
async function fetchDepartments() {
  try {
    departments.value = await $client.v1.departments.list.query();
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    toast.add({
      title: "Error",
      description: "Failed to load departments",
      color: "red",
    });
  }
}

// Method to fetch potential managers
async function fetchManagers() {
  try {
    managers.value = await $client.v1.employees.listForSelect.query();
  } catch (error: any) {
    console.error("Error fetching managers:", error);
    toast.add({
      title: "Error",
      description: "Failed to load managers list",
      color: "red",
    });
  }
}

// Open add employee modal
function openAddEmployeeModal() {
  isAddModalOpen.value = true;
}

// Open edit modal with employee data
function editEmployeeProfile(employee: any) {
  selectedEmployee.value = employee;

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

  isModalOpen.value = true;
}

// Submit form to update employee profile
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

    // Close modal and refresh data
    isModalOpen.value = false;
    await fetchEmployees();
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

// Handle new employee submission
async function handleNewEmployee(employeeData: any) {
  try {
    await $client.v1.employees.create.mutate(employeeData);

    toast.add({
      title: "Success",
      description: "New employee created successfully",
      color: "green",
    });

    await fetchEmployees();
    isAddModalOpen.value = false; // Only close on success
  } catch (error: any) {
    console.error("Error creating new employee:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to create new employee",
      color: "red",
    });
    throw error; // Re-throw the error to prevent the modal from closing
  }
}

// Helper functions
function getInitials(firstName: string, lastName: string) {
  return `${(firstName || "")[0] || ""}${
    (lastName || "")[0] || ""
  }`.toUpperCase();
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString();
}

function formatDateForInput(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Format as YYYY-MM-DD for input[type="date"]
  return date.toISOString().split("T")[0];
}
</script>
