<template>
  <div>
    <UBreadcrumb
      :links="[
        { label: 'Home', to: '/' },
        { label: 'Employees', to: '/employees' },
        {
          label: employee
            ? `${employee.first_name} ${employee.last_name}`
            : 'Employee Details',
        },
      ]"
      class="mb-6"
    />

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-gray-400"
      />
    </div>

    <!-- Employee not found -->
    <UCard
      v-else-if="!employee"
      class="p-12 flex flex-col items-center justify-center"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-12 h-12 text-amber-400 mb-4"
      />
      <h3 class="text-lg font-medium mb-2">Employee Not Found</h3>
      <p class="text-gray-500 mb-6 text-center">
        The employee you're looking for doesn't exist or you don't have
        permission to view it.
      </p>
      <UButton color="primary" to="/employees">Back to Employees</UButton>
    </UCard>

    <!-- Employee profile -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile sidebar -->
      <div class="lg:col-span-1">
        <UCard>
          <div class="flex flex-col items-center text-center mb-4">
            <UAvatar
              :text="getInitials(employee.first_name, employee.last_name)"
              size="xl"
              :ui="{
                base: 'bg-blue-500 text-white',
                ring: 'ring-2 ring-white/20',
              }"
              class="mb-4"
            />
            <h2 class="text-xl font-bold">
              {{ employee.first_name }} {{ employee.last_name }}
            </h2>
            <p class="text-gray-500">
              {{ employee.job_title || "No job title" }}
            </p>

            <UBadge v-if="employee.department_name" color="blue" class="mt-2">
              {{ employee.department_name }}
            </UBadge>
          </div>

          <div class="border-t pt-4 mt-4">
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500">Email</span>
                <span class="font-medium">{{ employee.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Phone</span>
                <span class="font-medium">{{
                  employee.phone || "Not provided"
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Hire Date</span>
                <span class="font-medium">{{
                  formatDate(employee.hire_date)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Manager</span>
                <span class="font-medium">{{
                  managerName || "Not assigned"
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Joined</span>
                <span class="font-medium">{{
                  formatDate(employee.created_at)
                }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 border-t pt-4">
            <h3 class="font-medium mb-2">Bio</h3>
            <p class="text-gray-600 text-sm">
              {{ employee.bio || "No bio available" }}
            </p>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil-square"
                @click="editEmployee"
              >
                Edit Profile
              </UButton>
              <UButton
                color="blue"
                icon="i-heroicons-clipboard-document-check"
                @click="startEvaluation"
              >
                Evaluate
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Main content area -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Recent evaluations -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Recent Evaluations</h3>
              <UButton
                color="primary"
                variant="ghost"
                size="xs"
                trailing-icon="i-heroicons-arrow-right"
                @click="viewAllEvaluations"
              >
                View All
              </UButton>
            </div>
          </template>

          <div
            v-if="recentEvaluations.length === 0"
            class="py-6 text-center text-gray-500"
          >
            No evaluations found for this employee
          </div>

          <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <li
              v-for="evaluation in recentEvaluations"
              :key="evaluation.id"
              class="py-4"
            >
              <div class="flex justify-between">
                <div>
                  <div class="font-medium">
                    {{ formatDate(evaluation.evaluation_date) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    Evaluated by {{ evaluation.evaluator_name }}
                  </div>
                </div>
                <div class="flex flex-col items-end">
                  <UBadge :color="getStatusColor(evaluation.status)">
                    {{ formatStatus(evaluation.status) }}
                  </UBadge>
                  <div class="text-lg font-bold mt-1">
                    {{
                      evaluation.overall_score
                        ? evaluation.overall_score.toFixed(1)
                        : "N/A"
                    }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </UCard>

        <!-- Goals -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Current Goals</h3>
              <UButton
                color="primary"
                variant="ghost"
                size="xs"
                trailing-icon="i-heroicons-arrow-right"
                @click="viewAllGoals"
              >
                View All
              </UButton>
            </div>
          </template>

          <div v-if="goals.length === 0" class="py-6 text-center text-gray-500">
            No goals found for this employee
          </div>

          <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <li v-for="goal in goals" :key="goal.id" class="py-4">
              <div>
                <div class="font-medium">{{ goal.title }}</div>
                <div class="text-sm text-gray-500 flex justify-between">
                  <span>Due {{ formatDate(goal.end_date) }}</span>
                  <UBadge :color="getGoalStatusColor(goal.status)">
                    {{ formatStatus(goal.status) }}
                  </UBadge>
                </div>
                <div class="mt-2">
                  <div class="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{{ goal.progress }}%</span>
                  </div>
                  <UProgress :value="goal.progress" color="primary" size="xs" />
                </div>
              </div>
            </li>
          </ul>
        </UCard>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <UModal v-model="isEditModalOpen" :ui="{ width: 'md:max-w-2xl' }">
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
              @click="isEditModalOpen = false"
            />
          </div>
        </template>

        <UForm :schema="schema" :state="form" @submit="submitForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Department -->
            <UFormGroup label="Department" name="departmentId">
              <USelectMenu
                v-model="form.departmentId"
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
                v-model="form.managerId"
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
          <UFormGroup label="Bio" name="bio" class="mt-4">
            <UTextarea
              v-model="form.bio"
              placeholder="Enter employee bio"
              rows="3"
            />
          </UFormGroup>

          <div class="flex justify-end space-x-2 mt-6">
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              @click="isEditModalOpen = false"
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
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { useRoute, useRouter } from "vue-router";

// Define page metadata
definePageMeta({
  auth: true,
});

// Router and route to get employee ID
const route = useRoute();
const router = useRouter();
const employeeId = computed(() => route.params.id as string);

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
const isLoading = ref(true);
const isEditModalOpen = ref(false);
const isSubmitting = ref(false);
const employee = ref<any>(null);
const departments = ref<any[]>([]);
const managers = ref<any[]>([]);
const recentEvaluations = ref<any[]>([]);
const goals = ref<any[]>([]);
const managerName = ref<string>("");

// Form state for editing
const form = reactive({
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
    ...managers.value
      .filter((manager) => manager.id !== employeeId.value) // Can't be their own manager
      .map((manager) => ({
        label: manager.name,
        value: manager.id,
      })),
  ];
});

// Fetch data on page load
onMounted(async () => {
  await Promise.all([fetchEmployee(), fetchDepartments(), fetchManagers()]);

  // Only fetch related data if we found the employee
  if (employee.value) {
    await Promise.all([fetchRecentEvaluations(), fetchGoals()]);

    // Find manager name if there's a manager ID
    if (employee.value.manager_id) {
      const manager = managers.value.find(
        (m) => m.id === employee.value.manager_id
      );
      if (manager) {
        managerName.value = manager.name;
      }
    }
  }
});

// Fetch employee details
async function fetchEmployee() {
  try {
    isLoading.value = true;
    employee.value = await $client.v1.employees.get.query({
      id: employeeId.value,
    });
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to load employee details",
      color: "red",
    });
    employee.value = null;
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

// For now, we'll mock this data since we haven't implemented these endpoints yet
async function fetchRecentEvaluations() {
  // This will be replaced with actual API calls once implemented
  recentEvaluations.value = [
    {
      id: 1,
      evaluation_date: "2025-03-15",
      status: "completed",
      evaluator_name: "Jane Smith",
      overall_score: 4.5,
    },
    {
      id: 2,
      evaluation_date: "2024-09-20",
      status: "reviewed",
      evaluator_name: "Robert Johnson",
      overall_score: 4.2,
    },
    {
      id: 3,
      evaluation_date: "2024-03-10",
      status: "completed",
      evaluator_name: "Sarah Williams",
      overall_score: 3.8,
    },
  ];
}

async function fetchGoals() {
  // This will be replaced with actual API calls once implemented
  goals.value = [
    {
      id: 1,
      title: "Complete leadership training program",
      end_date: "2025-06-30",
      status: "in_progress",
      progress: 60,
    },
    {
      id: 2,
      title: "Improve team communication processes",
      end_date: "2025-05-15",
      status: "in_progress",
      progress: 45,
    },
    {
      id: 3,
      title: "Achieve Q2 sales targets",
      end_date: "2025-06-30",
      status: "not_started",
      progress: 0,
    },
  ];
}

// Open edit modal with employee data
function editEmployee() {
  form.departmentId = employee.value.department_id;
  form.jobTitle = employee.value.job_title || "";
  form.hireDate = employee.value.hire_date
    ? formatDateForInput(employee.value.hire_date)
    : "";
  form.managerId = employee.value.manager_id;
  form.bio = employee.value.bio || "";
  form.phone = employee.value.phone || "";
  form.address = employee.value.address || "";

  isEditModalOpen.value = true;
}

// Start a new evaluation for this employee
function startEvaluation() {
  toast.add({
    title: "Feature Coming Soon",
    description: "The evaluation feature will be available in a future update",
    color: "blue",
  });

  // When implemented, this will navigate to a new evaluation form
  // router.push(`/evaluations/new?employeeId=${employeeId.value}`);
}

// View all evaluations for this employee
function viewAllEvaluations() {
  toast.add({
    title: "Feature Coming Soon",
    description: "The evaluations history will be available in a future update",
    color: "blue",
  });

  // When implemented, this will navigate to the evaluations list filtered for this employee
  // router.push(`/evaluations?employeeId=${employeeId.value}`);
}

// View all goals for this employee
function viewAllGoals() {
  toast.add({
    title: "Feature Coming Soon",
    description: "The goals history will be available in a future update",
    color: "blue",
  });

  // When implemented, this will navigate to the goals list filtered for this employee
  // router.push(`/goals?employeeId=${employeeId.value}`);
}

// Submit form to update employee profile
async function submitForm() {
  isSubmitting.value = true;

  try {
    await $client.v1.employees.updateProfile.mutate({
      id: employeeId.value,
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
    isEditModalOpen.value = false;
    await fetchEmployee();

    // Update manager name if changed
    if (employee.value.manager_id) {
      const manager = managers.value.find(
        (m) => m.id === employee.value.manager_id
      );
      if (manager) {
        managerName.value = manager.name;
      } else {
        managerName.value = "";
      }
    } else {
      managerName.value = "";
    }
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

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getStatusColor(status: string) {
  switch (status) {
    case "draft":
      return "gray";
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    case "reviewed":
      return "purple";
    default:
      return "gray";
  }
}

function getGoalStatusColor(status: string) {
  switch (status) {
    case "not_started":
      return "gray";
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}
</script>
