<template>
  <div class="container mx-auto px-4 py-6">
    <UBreadcrumb :links="[{ label: 'Home', to: '/' }, { label: 'Profile' }]" class="mb-6" />
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Profile Overview Card -->
      <div class="md:col-span-1">
        <UCard class="mb-4">
          <template #header>
            <div class="flex items-center justify-center p-6">
              <UAvatar 
                :text="userInitials" 
                size="3xl" 
                :ui="{ 
                  base: 'bg-blue-500 text-white',
                  ring: 'ring-2 ring-white/20'
                }" 
              />
            </div>
            <div class="text-center pb-4">
              <h2 class="text-xl font-bold">{{ userData.firstName }} {{ userData.lastName }}</h2>
              <p class="text-gray-500 text-sm">{{ userData.email }}</p>
            </div>
          </template>
          
          <div class="text-sm space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-500">User ID:</span>
              <span class="font-mono text-xs">{{ userData.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Joined:</span>
              <span>{{ formatDate(userData.createdAt) }}</span>
            </div>
          </div>
        </UCard>
      </div>
      
      <!-- Profile Editing & Password Section -->
      <div class="md:col-span-2 space-y-8">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between p-4">
              <h3 class="text-lg font-semibold">Profile Information</h3>
              <UButton 
                v-if="!isEditing" 
                color="gray" 
                variant="ghost" 
                icon="i-heroicons-pencil-square" 
                size="sm"
                @click="startEditing"
              >
                Edit
              </UButton>
            </div>
          </template>
          
          <UForm 
            v-if="isEditing" 
            :schema="profileSchema" 
            :state="profileForm" 
            class="space-y-4"
            @submit="updateProfile"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="First Name" name="firstName">
                <UInput v-model="profileForm.firstName" />
              </UFormGroup>
              
              <UFormGroup label="Last Name" name="lastName">
                <UInput v-model="profileForm.lastName" />
              </UFormGroup>
            </div>
            
            <UFormGroup label="Email" name="email">
              <UInput v-model="profileForm.email" type="email" disabled />
              <template #description>
                <span class="text-xs text-gray-400">Email cannot be changed</span>
              </template>
            </UFormGroup>
            
            <div class="flex justify-end space-x-2 pt-4">
              <UButton 
                color="gray" 
                variant="ghost" 
                @click="cancelEditing"
              >
                Cancel
              </UButton>
              <UButton 
                type="submit"
                color="primary"
                :loading="isUpdating"
              >
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </UButton>
            </div>
          </UForm>
          
          <div v-else class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500">First Name</div>
                <div>{{ userData.firstName }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Last Name</div>
                <div>{{ userData.lastName }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm text-gray-500">Email</div>
                <div>{{ userData.email }}</div>
              </div>
            </div>
          </div>
        </UCard>
        
        <!-- Password Change Section -->
        <UCard>
          <template #header>
            <div class="p-4">
              <h3 class="text-lg font-semibold">Change Password</h3>
            </div>
          </template>
          
          <UForm 
            :schema="passwordSchema" 
            :state="passwordForm" 
            class="space-y-4"
            @submit="changePassword"
          >
            <UFormGroup label="Current Password" name="currentPassword">
              <UInput 
                v-model="passwordForm.currentPassword" 
                type="password"
                placeholder="Enter your current password" 
              />
            </UFormGroup>
            
            <UFormGroup label="New Password" name="newPassword">
              <UInput 
                v-model="passwordForm.newPassword" 
                type="password"
                placeholder="Enter your new password" 
              />
              <template #description>
                <p class="text-xs text-gray-500">
                  Password must be at least 8 characters and include uppercase, lowercase, and numbers
                </p>
              </template>
            </UFormGroup>
            
            <UFormGroup label="Confirm New Password" name="confirmPassword">
              <UInput 
                v-model="passwordForm.confirmPassword" 
                type="password"
                placeholder="Confirm your new password" 
              />
            </UFormGroup>
            
            <div class="flex justify-end pt-4">
              <UButton 
                type="submit"
                color="primary"
                :loading="isChangingPassword"
              >
                {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useAuth } from '~/composables/useAuth';
import { useUser } from '~/composables/useUser';
import { useSessionStore } from '~/store/session';
import { storeToRefs } from 'pinia';

definePageMeta({
  auth: true
});

const { $client } = useNuxtApp();
const router = useRouter();
const toast = useToast();

// Variables for loading states
const isLoading = ref(false);
const isEditing = ref(false);
const isUpdating = ref(false);
const isChangingPassword = ref(false);

// User data
const userData = reactive({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  createdAt: ''
});

// Calculate user initials for avatar
const userInitials = computed(() => {
  if (!userData.firstName && !userData.lastName) return '?';
  return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
});

// Form schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form states
const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Fetch user data on mount
onMounted(async () => {
  await fetchUserData();
});

// Start editing profile
const startEditing = () => {
  profileForm.firstName = userData.firstName;
  profileForm.lastName = userData.lastName;
  profileForm.email = userData.email;
  isEditing.value = true;
};

// Cancel editing profile
const cancelEditing = () => {
  isEditing.value = false;
};

// Fetch user data
const fetchUserData = async () => {
  isLoading.value = true;
  try {
    const response = await $client.v1.auth.getMe.query();
    if (response.user) {
      Object.assign(userData, response.user);
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to load profile data',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
};

// Update profile
const updateProfile = async () => {
  isUpdating.value = true;
  try {
    const response = await $client.v1.auth.updateProfile.mutate({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName
    });
    
    if (response.success) {
      // Update user data
      userData.firstName = profileForm.firstName;
      userData.lastName = profileForm.lastName;
      
      toast.add({
        title: 'Success',
        description: 'Profile updated successfully',
        color: 'green'
      });
      
      isEditing.value = false;
      
      // Refresh session store to update user name in UI
      const { fetchUserDetails } = useUser();
      await fetchUserDetails();
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update profile',
      color: 'red'
    });
  } finally {
    isUpdating.value = false;
  }
};

// Change password
const changePassword = async () => {
  isChangingPassword.value = true;
  try {
    const response = await $client.v1.auth.changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    });
    
    if (response.success) {
      // Reset password form
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      
      // Show success message
      toast.add({
        title: 'Password Changed',
        description: 'Your password has been updated successfully. Please log in again with your new password.',
        color: 'green',
        timeout: 5000
      });
      
      // Get session store to clear cookies
      const sessionStore = useSessionStore();
      
      // Clear all cookies and user data
      sessionStore.clearSession();
      
      router.replace('/auth/login');
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to change password',
      color: 'red'
    });
  } finally {
    isChangingPassword.value = false;
  }
};
</script>