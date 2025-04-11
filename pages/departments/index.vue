<template>
  <div>
    <UBreadcrumb :links="[{ label: 'Home', to: '/' }, { label: 'Departments' }]" class="mb-6" />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Departments</h1>
      <UButton 
        color="primary" 
        icon="i-heroicons-plus" 
        @click="openCreateModal"
      >
        Add Department
      </UButton>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Empty state -->
    <UCard v-else-if="departments.length === 0" class="p-12 flex flex-col items-center justify-center">
      <UIcon name="i-heroicons-building-office-2" class="w-12 h-12 text-gray-400 mb-4" />
      <h3 class="text-lg font-medium mb-2">No departments found</h3>
      <p class="text-gray-500 mb-6 text-center">Get started by creating your first department.</p>
      <UButton color="primary" @click="openCreateModal">Add Department</UButton>
    </UCard>

    <!-- Data table -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="department in departments" :key="department.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium">{{ department.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ department.description || 'No description' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div class="flex justify-end space-x-2">
                  <UButton 
                    color="gray" 
                    variant="ghost" 
                    icon="i-heroicons-pencil-square" 
                    size="xs"
                    @click="editDepartment(department)"
                  />
                  <UButton 
                    color="red" 
                    variant="ghost" 
                    icon="i-heroicons-trash" 
                    size="xs"
                    @click="confirmDelete(department)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model="isModalOpen" :ui="{ width: 'md:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ isEditing ? 'Edit Department' : 'Create Department' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" class="-my-1" aria-label="Close" @click="isModalOpen = false" />
          </div>
        </template>

        <UForm :schema="schema" :state="form" @submit="submitForm">
          <UFormGroup label="Department Name" name="name">
            <UInput v-model="form.name" placeholder="Enter department name" />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea v-model="form.description" placeholder="Enter department description" rows="3" />
          </UFormGroup>

          <div class="flex justify-end space-x-2 mt-6">
            <UButton type="button" color="gray" variant="ghost" @click="isModalOpen = false">
              Cancel
            </UButton>
            <UButton type="submit" color="primary" :loading="isSubmitting">
              {{ isEditing ? 'Update' : 'Create' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 mx-auto sm:mx-0 text-red-500" />
          <div class="mt-3 sm:mt-0 sm:ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Delete Department</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete the department <strong>{{ departmentToDelete?.name }}</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <UButton color="gray" variant="ghost" @click="isDeleteModalOpen = false">
            Cancel
          </UButton>
          <UButton color="red" :loading="isDeleting" @click="deleteDepartment">
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

// Define schema for form validation
const schema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional()
});

// Access tRPC client
const { $client } = useNuxtApp();
const toast = useToast();

// Reactive state
const departments = ref<any[]>([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const isEditing = ref(false);
const departmentToDelete = ref<any>(null);

// Form state
const form = reactive({
  id: '',
  name: '',
  description: ''
});

// Fetch departments on page load
onMounted(async () => {
  await fetchDepartments();
});

// Method to fetch departments
async function fetchDepartments() {
  try {
    isLoading.value = true;
    departments.value = await $client.v1.departments.list.query();
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to load departments',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
}

// Open create modal
function openCreateModal() {
  isEditing.value = false;
  form.id = '';
  form.name = '';
  form.description = '';
  isModalOpen.value = true;
}

// Open edit modal with department data
function editDepartment(department: any) {
  isEditing.value = true;
  form.id = department.id;
  form.name = department.name || '';
  form.description = department.description || '';
  isModalOpen.value = true;
}

// Open delete confirmation modal
function confirmDelete(department: any) {
  departmentToDelete.value = department;
  isDeleteModalOpen.value = true;
}

// Submit form (create or update)
async function submitForm() {
  isSubmitting.value = true;
  
  try {
    if (isEditing.value) {
      // Update existing department
      await $client.v1.departments.update.mutate({
        id: form.id,
        name: form.name,
        description: form.description
      });
      
      toast.add({
        title: 'Success',
        description: 'Department updated successfully',
        color: 'green'
      });
    } else {
      // Create new department
      await $client.v1.departments.create.mutate({
        name: form.name,
        description: form.description
      });
      
      toast.add({
        title: 'Success',
        description: 'Department created successfully',
        color: 'green'
      });
    }
    
    // Close modal and refresh data
    isModalOpen.value = false;
    await fetchDepartments();
    
  } catch (error: any) {
    console.error('Error submitting department:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to save department',
      color: 'red'
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Delete department
async function deleteDepartment() {
  if (!departmentToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    await $client.v1.departments.delete.mutate({
      id: departmentToDelete.value.id
    });
    
    toast.add({
      title: 'Success',
      description: 'Department deleted successfully',
      color: 'green'
    });
    
    isDeleteModalOpen.value = false;
    await fetchDepartments();
    
  } catch (error: any) {
    console.error('Error deleting department:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete department',
      color: 'red'
    });
  } finally {
    isDeleting.value = false;
  }
}
</script>