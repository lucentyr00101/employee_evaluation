<template>
  <div>
    <UBreadcrumb 
      :links="[
        { label: 'Home', to: '/' }, 
        { label: 'Evaluations', to: '/evaluations' },
        { label: 'New Evaluation' }
      ]" 
      class="mb-6"
    />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">New Evaluation</h1>
    </div>

    <!-- Loading state for dropdowns -->
    <div v-if="isInitialLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <div v-else>
      <UCard class="mb-6">
        <UForm
          :schema="validationSchema"
          :state="evaluationForm"
          class="space-y-4"
          @submit="submitEvaluation"
        >
          <!-- Step 1: Basic Info Section -->
          <div v-if="currentStep === 1">
            <h2 class="text-lg font-medium mb-4">Evaluation Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Employee -->
              <UFormGroup label="Employee" name="employeeId" required>
                <USelectMenu 
                  v-model="evaluationForm.employeeId" 
                  :options="employeeOptions" 
                  placeholder="Select an employee"
                  :disabled="!!employeeIdFromQuery"
                />
              </UFormGroup>
              
              <!-- Template -->
              <UFormGroup label="Evaluation Template" name="templateId" required>
                <USelectMenu 
                  v-model="evaluationForm.templateId" 
                  :options="templateOptions" 
                  placeholder="Select a template"
                  @update:modelValue="loadTemplateDetails"
                />
              </UFormGroup>
              
              <!-- Department -->
              <UFormGroup label="Department" name="departmentId">
                <USelectMenu 
                  v-model="evaluationForm.departmentId" 
                  :options="departmentOptions" 
                  placeholder="Select a department"
                />
              </UFormGroup>
              
              <!-- Evaluation Date -->
              <UFormGroup label="Evaluation Date" name="evaluationDate" required>
                <UInput 
                  v-model="evaluationForm.evaluationDate" 
                  type="date" 
                  :max="currentDate"
                />
              </UFormGroup>
            </div>
            
            <template v-if="selectedTemplate">
              <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 class="font-medium">{{ selectedTemplate.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ selectedTemplate.description }}</p>
              </div>
            </template>
          </div>
          
          <!-- Step 2: Criteria Scoring -->
          <div v-else-if="currentStep === 2">
            <h2 class="text-lg font-medium mb-4">Performance Criteria</h2>
            
            <div v-if="!selectedTemplate || !selectedTemplate.criteria || selectedTemplate.criteria.length === 0" class="text-center py-6">
              <p class="text-gray-500">No criteria found for this template. Please select a different template.</p>
              <UButton class="mt-4" @click="currentStep = 1" color="gray" variant="ghost">
                Back to Details
              </UButton>
            </div>
            
            <div v-else class="space-y-6">
              <div v-for="(criteria, index) in selectedTemplate.criteria" :key="criteria.id" class="border dark:border-gray-700 rounded-lg p-4">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div class="flex-1">
                    <h3 class="font-medium">{{ criteria.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ criteria.description }}</p>
                    <div class="text-xs text-gray-500 mt-1">Weight: {{ criteria.weight }}</div>
                  </div>
                  
                  <div class="mt-3 md:mt-0 md:ml-4 md:w-40">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Score (0-5)</label>
                    <UInput 
                      v-model.number="evaluationForm.scores[index].score" 
                      type="number" 
                      min="0" 
                      max="5"
                      step="0.5"
                      class="mt-1"
                    />
                  </div>
                </div>
                
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments</label>
                  <UTextarea
                    v-model="evaluationForm.scores[index].comments"
                    rows="2"
                    class="mt-1 w-full"
                    placeholder="Add specific comments about this criteria..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Step 3: Overall Feedback -->
          <div v-else-if="currentStep === 3">
            <h2 class="text-lg font-medium mb-4">Overall Feedback</h2>
            
            <div class="space-y-4">
              <!-- Overall Score -->
              <UFormGroup label="Overall Score" name="overallScore">
                <div class="flex items-center space-x-2">
                  <UInput 
                    v-model.number="evaluationForm.overallScore" 
                    type="number" 
                    min="0" 
                    max="5"
                    step="0.1"
                    class="w-24"
                  />
                  <UButton 
                    type="button" 
                    color="gray" 
                    variant="ghost" 
                    size="xs"
                    @click="calculateAverageScore"
                  >
                    Calculate Average
                  </UButton>
                </div>
              </UFormGroup>
              
              <!-- Strengths -->
              <UFormGroup label="Strengths" name="strengths">
                <UTextarea
                  v-model="evaluationForm.strengths"
                  rows="3"
                  placeholder="What are the employee's key strengths?"
                />
              </UFormGroup>
              
              <!-- Areas to Improve -->
              <UFormGroup label="Areas to Improve" name="areasToImprove">
                <UTextarea
                  v-model="evaluationForm.areasToImprove"
                  rows="3"
                  placeholder="What areas should the employee focus on improving?"
                />
              </UFormGroup>
              
              <!-- Additional Comments -->
              <UFormGroup label="Additional Comments" name="comments">
                <UTextarea
                  v-model="evaluationForm.comments"
                  rows="3"
                  placeholder="Any additional comments or feedback..."
                />
              </UFormGroup>
              
              <!-- Status -->
              <UFormGroup label="Status" name="status">
                <USelectMenu 
                  v-model="evaluationForm.status" 
                  :options="statusOptions" 
                />
              </UFormGroup>
            </div>
          </div>
          
          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-4 border-t dark:border-gray-700">
            <UButton
              v-if="currentStep > 1"
              type="button"
              color="gray"
              variant="ghost"
              @click="currentStep--"
            >
              Previous
            </UButton>
            <div v-else></div>
            
            <div>
              <UButton
                v-if="currentStep < 3"
                type="button"
                color="primary"
                @click="nextStep"
              >
                Next
              </UButton>
              <UButton
                v-else
                type="submit"
                color="primary"
                :loading="isSubmitting"
              >
                Create Evaluation
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useRoute, useRouter } from 'vue-router';

// Define page metadata
definePageMeta({
  auth: true
});

// Access tRPC client and router
const { $client } = useNuxtApp();
const toast = useToast();
const route = useRoute();
const router = useRouter();

// Get current user
const { user } = useUser();

// Get employee ID from query parameter if any
const employeeIdFromQuery = computed(() => {
  return route.query.employeeId as string || null;
});

// Current date in YYYY-MM-DD format for date input
const currentDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Multi-step form state
const currentStep = ref(1);
const isInitialLoading = ref(true);
const isSubmitting = ref(false);
const selectedTemplate = ref<any>(null);

// Form data
const evaluationForm = reactive({
  employeeId: employeeIdFromQuery.value || '',
  evaluatorId: user.value?.id || '',
  templateId: '',
  departmentId: null as string | null,
  evaluationDate: currentDate.value,
  status: 'draft' as 'draft' | 'in_progress' | 'completed' | 'reviewed',
  overallScore: null as number | null,
  strengths: '',
  areasToImprove: '',
  comments: '',
  scores: [] as Array<{
    criteriaId: string;
    score: number;
    comments: string;
  }>
});

// Data for dropdowns
const employees = ref<any[]>([]);
const departments = ref<any[]>([]);
const templates = ref<any[]>([]);

// Options for select menus
const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    label: employee.name,
    value: employee.id
  }));
});

const departmentOptions = computed(() => {
  return [
    { label: 'None', value: null },
    ...departments.value.map(dept => ({
      label: dept.name,
      value: dept.id
    }))
  ];
});

const templateOptions = computed(() => {
  return templates.value.map(template => ({
    label: template.title,
    value: template.id
  }));
});

const statusOptions = computed(() => {
  return [
    { label: 'Draft', value: 'draft' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Reviewed', value: 'reviewed' }
  ];
});

// Define schema for form validation
const basicInfoSchema = z.object({
  employeeId: z.string().uuid('Please select an employee'),
  templateId: z.string().uuid('Please select a template'),
  departmentId: z.string().uuid('Invalid department ID').nullable(),
  evaluationDate: z.string().min(1, 'Evaluation date is required'),
});

const criteriaSchema = z.object({
  scores: z.array(z.object({
    criteriaId: z.string().uuid('Invalid criteria ID'),
    score: z.number().min(0).max(5, 'Score must be between 0 and 5'),
    comments: z.string().optional()
  })).optional()
});

const feedbackSchema = z.object({
  status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']),
  overallScore: z.number().min(0).max(5, 'Score must be between 0 and 5').nullable(),
  strengths: z.string().optional(),
  areasToImprove: z.string().optional(),
  comments: z.string().optional()
});

// We'll validate based on the current step
const validationSchema = computed(() => {
  switch (currentStep.value) {
    case 1:
      return basicInfoSchema;
    case 2:
      return criteriaSchema;
    case 3:
      return feedbackSchema;
    default:
      return z.object({});
  }
});

// Fetch initial data
onMounted(async () => {
  try {
    isInitialLoading.value = true;
    
    await Promise.all([
      fetchEmployees(),
      fetchDepartments(),
      fetchTemplates()
    ]);
    
    // If we have an employee ID from the query, populate department
    if (employeeIdFromQuery.value) {
      await loadEmployeeDepartment(employeeIdFromQuery.value);
    }
  } catch (error) {
    console.error('Error loading initial data:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load required data',
      color: 'red'
    });
  } finally {
    isInitialLoading.value = false;
  }
});

// Methods to fetch data
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

async function fetchTemplates() {
  try {
    templates.value = await $client.v1.evaluations.listTemplates.query();
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load evaluation templates',
      color: 'red'
    });
  }
}

// Load employee's department
async function loadEmployeeDepartment(employeeId: string) {
  try {
    const employee = await $client.v1.employees.get.query({ id: employeeId });
    if (employee && employee.department_id) {
      evaluationForm.departmentId = employee.department_id;
    }
  } catch (error) {
    console.error('Error loading employee department:', error);
  }
}

// Load template details with criteria
async function loadTemplateDetails() {
  if (!evaluationForm.templateId) {
    selectedTemplate.value = null;
    evaluationForm.scores = [];
    return;
  }
  
  try {
    selectedTemplate.value = await $client.v1.evaluations.getTemplate.query({
      id: evaluationForm.templateId
    });
    
    // Initialize scores array with criteria from the template
    if (selectedTemplate.value && selectedTemplate.value.criteria) {
      evaluationForm.scores = selectedTemplate.value.criteria.map((criteria: any) => ({
        criteriaId: criteria.id,
        score: 0,
        comments: ''
      }));
    } else {
      evaluationForm.scores = [];
    }
  } catch (error: any) {
    console.error('Error loading template details:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load template details',
      color: 'red'
    });
    selectedTemplate.value = null;
    evaluationForm.scores = [];
  }
}

// Calculate average score from criteria scores
function calculateAverageScore() {
  if (!evaluationForm.scores.length) return;
  
  // Get total of scores weighted by criteria weight
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  evaluationForm.scores.forEach((scoreItem, index) => {
    const criteria = selectedTemplate.value?.criteria[index];
    if (criteria && typeof scoreItem.score === 'number') {
      const weight = criteria.weight || 1;
      totalWeightedScore += scoreItem.score * weight;
      totalWeight += weight;
    }
  });
  
  // Calculate weighted average
  if (totalWeight > 0) {
    evaluationForm.overallScore = Number((totalWeightedScore / totalWeight).toFixed(1));
  }
}

// Validate current step and proceed to next
function nextStep() {
  // For step 1 (basic info), validate template selection
  if (currentStep.value === 1) {
    try {
      basicInfoSchema.parse(evaluationForm);
      
      if (!selectedTemplate.value && evaluationForm.templateId) {
        // Load template details if not already loaded
        loadTemplateDetails();
      }
      
      currentStep.value++;
    } catch (error: any) {
      if (error.errors) {
        // Display validation errors
        error.errors.forEach((err: any) => {
          toast.add({
            title: 'Validation Error',
            description: err.message,
            color: 'red'
          });
        });
      }
    }
  }
  // For step 2 (criteria scoring), just move to next step
  else if (currentStep.value === 2) {
    currentStep.value++;
  }
}

// Submit the evaluation
async function submitEvaluation() {
  try {
    isSubmitting.value = true;
    
    // Create the evaluation
    const result = await $client.v1.evaluations.create.mutate({
      employeeId: evaluationForm.employeeId,
      evaluatorId: evaluationForm.evaluatorId,
      templateId: evaluationForm.templateId,
      departmentId: evaluationForm.departmentId,
      evaluationDate: evaluationForm.evaluationDate,
      status: evaluationForm.status,
      overallScore: evaluationForm.overallScore,
      strengths: evaluationForm.strengths,
      areasToImprove: evaluationForm.areasToImprove,
      comments: evaluationForm.comments,
      scores: evaluationForm.scores
    });
    
    // Show success message
    toast.add({
      title: 'Success',
      description: 'Evaluation created successfully',
      color: 'green'
    });
    
    // Navigate to the evaluation details page
    router.push(`/evaluations/${result.id}`);
    
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to create evaluation',
      color: 'red'
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>