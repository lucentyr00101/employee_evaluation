<template>
  <div>
    <UBreadcrumb :links="[{ label: 'Home', to: '/' }, { label: 'Evaluations' }]" class="mb-6" />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Evaluations</h1>
      <UButton 
        color="primary" 
        icon="i-heroicons-plus" 
        @click="navigateToNewEvaluation"
      >
        New Evaluation
      </UButton>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UFormGroup label="Employee">
          <USelectMenu 
            v-model="filters.employeeId" 
            :options="employeeOptions" 
            placeholder="All employees"
            @update:model-value="loadEvaluations"
          />
        </UFormGroup>
        
        <UFormGroup label="Department">
          <USelectMenu 
            v-model="filters.departmentId" 
            :options="departmentOptions" 
            placeholder="All departments"
            @update:model-value="loadEvaluations"
          />
        </UFormGroup>
        
        <UFormGroup label="Status">
          <USelectMenu 
            v-model="filters.status" 
            :options="statusOptions" 
            placeholder="All statuses"
            @update:model-value="loadEvaluations"
          />
        </UFormGroup>
        
        <div class="flex items-end space-x-2">
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            @click="clearFilters"
          >
            Clear Filters
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Empty state -->
    <UCard v-else-if="evaluations.length === 0" class="p-12 flex flex-col items-center justify-center">
      <UIcon name="i-heroicons-clipboard-document-check" class="w-12 h-12 text-gray-400 mb-4" />
      <h3 class="text-lg font-medium mb-2">No evaluations found</h3>
      <p class="text-gray-500 mb-6 text-center">Get started by creating your first employee evaluation.</p>
      <UButton color="primary" @click="navigateToNewEvaluation">New Evaluation</UButton>
    </UCard>

    <!-- Data table -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="evaluation in evaluations" :key="evaluation.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium">{{ evaluation.employeeName }}</div>
                <div v-if="evaluation.evaluatorName" class="text-xs text-gray-500">
                  by {{ evaluation.evaluatorName }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge v-if="evaluation.departmentName" color="blue" variant="soft">
                  {{ evaluation.departmentName }}
                </UBadge>
                <span v-else class="text-gray-500 text-sm">Not specified</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">{{ evaluation.templateTitle }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">{{ formatDate(evaluation.evaluationDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="getStatusColor(evaluation.status)">
                  {{ formatStatus(evaluation.status) }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div 
                  v-if="evaluation.overallScore !== null" 
                  class="font-bold"
                  :class="getScoreColorClass(evaluation.overallScore)"
                >
                  {{ evaluation.overallScore.toFixed(1) }}
                </div>
                <div v-else class="text-gray-500 text-sm">N/A</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div class="flex justify-end space-x-2">
                  <UButton 
                    color="blue" 
                    variant="ghost" 
                    icon="i-heroicons-eye" 
                    size="xs" 
                    :to="`/evaluations/${evaluation.id}`"
                  />
                  <UButton 
                    v-if="canEdit(evaluation)" 
                    color="gray" 
                    variant="ghost" 
                    icon="i-heroicons-pencil-square" 
                    size="xs"
                    :to="`/evaluations/${evaluation.id}/edit`"
                  />
                  <UButton 
                    v-if="canDelete(evaluation)" 
                    color="red" 
                    variant="ghost" 
                    icon="i-heroicons-trash" 
                    size="xs"
                    @click="confirmDelete(evaluation)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 mx-auto sm:mx-0 text-red-500" />
          <div class="mt-3 sm:mt-0 sm:ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Delete Evaluation</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete the evaluation for <strong>{{ evaluationToDelete?.employeeName }}</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <UButton color="gray" variant="ghost" @click="isDeleteModalOpen = false">
            Cancel
          </UButton>
          <UButton color="red" :loading="isDeleting" @click="deleteEvaluation">
            Delete
          </UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

// Define page metadata
definePageMeta({
  auth: true
});

// Access tRPC client
const { $client } = useNuxtApp();
const toast = useToast();
const router = useRouter();

// Reactive state
const evaluations = ref<any[]>([]);
const employees = ref<any[]>([]);
const departments = ref<any[]>([]);
const isLoading = ref(true);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const evaluationToDelete = ref<any>(null);

// Filters
const filters = reactive({
  employeeId: null as string | null,
  departmentId: null as string | null,
  status: null as string | null
});

// Computed properties for select menus
const employeeOptions = computed(() => {
  return [
    { label: 'All employees', value: null },
    ...employees.value.map(employee => ({
      label: employee.name,
      value: employee.id
    }))
  ];
});

const departmentOptions = computed(() => {
  return [
    { label: 'All departments', value: null },
    ...departments.value.map(dept => ({
      label: dept.name,
      value: dept.id
    }))
  ];
});

const statusOptions = computed(() => {
  return [
    { label: 'All statuses', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Reviewed', value: 'reviewed' }
  ];
});

// Get current user
const { user } = useUser();

// Fetch data on page load
onMounted(async () => {
  await Promise.all([
    fetchEmployees(),
    fetchDepartments()
  ]);
  
  await loadEvaluations();
});

// Method to fetch evaluations with filters
async function loadEvaluations() {
  try {
    isLoading.value = true;
    
    // Build filter object, removing null values
    const queryFilters: Record<string, any> = {};
    if (filters.employeeId) queryFilters.employeeId = filters.employeeId;
    if (filters.departmentId) queryFilters.departmentId = filters.departmentId;
    if (filters.status) queryFilters.status = filters.status;
    
    // Fetch evaluations with filters
    evaluations.value = await $client.v1.evaluations.list.query(
      Object.keys(queryFilters).length > 0 ? queryFilters : undefined
    );
  } catch (error: any) {
    console.error('Error fetching evaluations:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to load evaluations',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
}

// Method to fetch employees
async function fetchEmployees() {
  try {
    employees.value = await $client.v1.employees.listForSelect.query();
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load employees',
      color: 'red'
    });
  }
}

// Method to fetch departments
async function fetchDepartments() {
  try {
    departments.value = await $client.v1.departments.list.query();
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load departments',
      color: 'red'
    });
  }
}

// Helper functions
function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'gray';
    case 'in_progress': return 'blue';
    case 'completed': return 'green';
    case 'reviewed': return 'purple';
    default: return 'gray';
  }
}

function getScoreColorClass(score: number) {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-blue-600';
  if (score >= 2) return 'text-amber-600';
  return 'text-red-600';
}

// Navigation functions
function navigateToNewEvaluation() {
  router.push('/evaluations/new');
}

// Clear all filters
function clearFilters() {
  filters.employeeId = null;
  filters.departmentId = null;
  filters.status = null;
  loadEvaluations();
}

// Check if user can edit an evaluation
function canEdit(evaluation: any) {
  // Only allow editing if the evaluation is in draft or in_progress state
  // or if the current user is the evaluator
  return (
    ['draft', 'in_progress'].includes(evaluation.status) &&
    user.value?.id === evaluation.evaluatorId
  );
}

// Check if user can delete an evaluation
function canDelete(evaluation: any) {
  // Only allow deletion if the evaluation is in draft state
  // and the current user is the evaluator
  return (
    evaluation.status === 'draft' &&
    user.value?.id === evaluation.evaluatorId
  );
}

// Open delete confirmation modal
function confirmDelete(evaluation: any) {
  evaluationToDelete.value = evaluation;
  isDeleteModalOpen.value = true;
}

// Delete an evaluation
async function deleteEvaluation() {
  if (!evaluationToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    await $client.v1.evaluations.delete.mutate({
      id: evaluationToDelete.value.id
    });
    
    toast.add({
      title: 'Success',
      description: 'Evaluation deleted successfully',
      color: 'green'
    });
    
    isDeleteModalOpen.value = false;
    await loadEvaluations();
    
  } catch (error: any) {
    console.error('Error deleting evaluation:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete evaluation',
      color: 'red'
    });
  } finally {
    isDeleting.value = false;
  }
}
</script>