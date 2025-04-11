<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Employees -->
      <UCard class="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm font-medium opacity-80">Employees</div>
            <div class="text-3xl font-bold">{{ stats.employees }}</div>
          </div>
          <div class="bg-white/20 p-3 rounded-lg">
            <UIcon name="i-heroicons-users" class="w-6 h-6" />
          </div>
        </div>
      </UCard>

      <!-- Departments -->
      <UCard class="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm font-medium opacity-80">Departments</div>
            <div class="text-3xl font-bold">{{ stats.departments }}</div>
          </div>
          <div class="bg-white/20 p-3 rounded-lg">
            <UIcon name="i-heroicons-building-office-2" class="w-6 h-6" />
          </div>
        </div>
      </UCard>

      <!-- Evaluations -->
      <UCard class="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm font-medium opacity-80">Evaluations</div>
            <div class="text-3xl font-bold">{{ stats.evaluations }}</div>
          </div>
          <div class="bg-white/20 p-3 rounded-lg">
            <UIcon name="i-heroicons-clipboard-document-check" class="w-6 h-6" />
          </div>
        </div>
      </UCard>

      <!-- Goals -->
      <UCard class="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm font-medium opacity-80">Goals</div>
            <div class="text-3xl font-bold">{{ stats.goals }}</div>
          </div>
          <div class="bg-white/20 p-3 rounded-lg">
            <UIcon name="i-heroicons-flag" class="w-6 h-6" />
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Evaluations -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Recent Evaluations</h3>
            <UButton
              to="/evaluations"
              color="primary"
              variant="ghost"
              size="xs"
              trailing-icon="i-heroicons-arrow-right"
            >
              View All
            </UButton>
          </div>
        </template>

        <div v-if="recentEvaluations.length === 0" class="py-8 text-center text-gray-500">
          No evaluations found
        </div>
        <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="evaluation in recentEvaluations" :key="evaluation.id" class="py-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium">{{ evaluation.employeeName }}</div>
                <div class="text-sm text-gray-500">
                  Evaluated by {{ evaluation.evaluatorName }} on {{ formatDate(evaluation.evaluationDate) }}
                </div>
              </div>
              <UBadge :color="getStatusColor(evaluation.status)">
                {{ formatStatus(evaluation.status) }}
              </UBadge>
            </div>
          </li>
        </ul>
      </UCard>

      <!-- Upcoming Goals -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Upcoming Goals</h3>
            <UButton
              to="/goals"
              color="primary"
              variant="ghost"
              size="xs"
              trailing-icon="i-heroicons-arrow-right"
            >
              View All
            </UButton>
          </div>
        </template>

        <div v-if="upcomingGoals.length === 0" class="py-8 text-center text-gray-500">
          No upcoming goals found
        </div>
        <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="goal in upcomingGoals" :key="goal.id" class="py-3">
            <div>
              <div class="font-medium">{{ goal.title }}</div>
              <div class="text-sm text-gray-500 flex justify-between">
                <span>{{ goal.employeeName }}</span>
                <span>Due {{ formatDate(goal.endDate) }}</span>
              </div>
            </div>
            <div class="mt-2">
              <UProgress :value="goal.progress" color="primary" size="xs" />
            </div>
          </li>
        </ul>
      </UCard>
    </div>

    <!-- Department Distribution -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Department Distribution</h3>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div v-for="dept in departmentStats" :key="dept.id" class="border rounded-lg p-4 text-center">
          <div class="font-medium">{{ dept.name }}</div>
          <div class="text-2xl font-bold my-2">{{ dept.count }}</div>
          <div class="text-sm text-gray-500">employees</div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Define page metadata
definePageMeta({
  auth: true
});

// Access tRPC client
const { $client } = useNuxtApp();
const toast = useToast();

// Reactive state
const stats = reactive({
  employees: 0,
  departments: 0,
  evaluations: 0,
  goals: 0
});

const recentEvaluations = ref([]);
const upcomingGoals = ref([]);
const departmentStats = ref([]);

// Fetch data on page load
onMounted(async () => {
  await fetchStats();
  await fetchRecentEvaluations();
  await fetchUpcomingGoals();
  await fetchDepartmentStats();
});

// Fetch dashboard stats
async function fetchStats() {
  try {
    // For now, we'll just get departments count from the API and mock other stats
    const departments = await $client.v1.departments.list.query();
    stats.departments = departments.length;
    
    // Mock data for the remaining stats until we implement those APIs
    stats.employees = 15;
    stats.evaluations = 32;
    stats.goals = 24;
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load dashboard statistics',
      color: 'red'
    });
  }
}

// Format date
function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

// Get status color
function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'gray';
    case 'in_progress': return 'blue';
    case 'completed': return 'green';
    case 'reviewed': return 'purple';
    default: return 'gray';
  }
}

// Format status
function formatStatus(status: string) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Mock functions for the data we'll implement later
async function fetchRecentEvaluations() {
  // This will be replaced with actual API calls once implemented
  recentEvaluations.value = [
    { id: 1, employeeName: 'John Doe', evaluatorName: 'Alice Smith', evaluationDate: '2025-04-01', status: 'completed' },
    { id: 2, employeeName: 'Sarah Lee', evaluatorName: 'Bob Johnson', evaluationDate: '2025-03-28', status: 'reviewed' },
    { id: 3, employeeName: 'Mike Brown', evaluatorName: 'Carol White', evaluationDate: '2025-03-15', status: 'in_progress' },
    { id: 4, employeeName: 'Emma Wilson', evaluatorName: 'David Green', evaluationDate: '2025-03-10', status: 'draft' }
  ];
}

async function fetchUpcomingGoals() {
  // This will be replaced with actual API calls once implemented
  upcomingGoals.value = [
    { id: 1, title: 'Complete project documentation', employeeName: 'John Doe', endDate: '2025-04-30', progress: 75 },
    { id: 2, title: 'Finalize Q2 marketing strategy', employeeName: 'Sarah Lee', endDate: '2025-05-15', progress: 50 },
    { id: 3, title: 'Launch new product feature', employeeName: 'Mike Brown', endDate: '2025-06-01', progress: 25 },
    { id: 4, title: 'Customer satisfaction survey', employeeName: 'Emma Wilson', endDate: '2025-04-20', progress: 90 }
  ];
}

async function fetchDepartmentStats() {
  // Get departments and mock employee counts
  try {
    const departments = await $client.v1.departments.list.query();
    
    // Mock employee counts for each department
    departmentStats.value = departments.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      count: Math.floor(Math.random() * 10) + 1 // Random count between 1-10
    }));
  } catch (error: any) {
    console.error('Error fetching department stats:', error);
  }
}
</script>