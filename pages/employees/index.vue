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

    <EmployeesEditEmployeeModal
      v-model="isModalOpen"
      :employee="selectedEmployee"
      :departments="departments"
      :managers="managers"
      @submit="fetchEmployees"
    />

    <EmployeesAddEmployeeModal
      v-model="isAddModalOpen"
      :departments="departments"
      :managers="managers"
      @submit="handleNewEmployee"
    />
  </div>
</template>

<script setup lang="ts">
// Define page metadata
definePageMeta({
  auth: true,
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
const selectedEmployee = ref<any>(null);

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
  isModalOpen.value = true;
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
    isAddModalOpen.value = false;
  } catch (error: any) {
    console.error("Error creating new employee:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to create new employee",
      color: "red",
    });
    throw error;
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
</script>
