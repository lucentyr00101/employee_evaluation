<template>
  <UDropdown v-if="isLoggedIn" :items="menuItems" :ui="dropdownUI">
    <UAvatar
      :text="userInitials"
      size="sm"
      :ui="{
        base: 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition-colors',
        ring: 'ring-2 ring-white/20'
      }"
    />
    <template #item="{ item }">
      <div class="flex items-center gap-2 w-full" @click="item.click">
        <UIcon :name="item.icon" class="w-4 h-4" />
        {{ item.label }}
      </div>
    </template>
  </UDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from "~/store/session";

const router = useRouter();
const { $client } = useNuxtApp();
const { isLoggedIn, userFullName, clearSession } = useSessionStore();
const toast = useToast();

const userInitials = computed(() => {
  const name = userFullName.value;
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part?.[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const handleLogout = async () => {
  try {
    await $client.v1.auth.logout.mutate();
    clearSession();
    toast.add({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    });
    await router.push('/auth/login');
  } catch (error: any) {
    console.error('Logout error:', error);
    toast.add({
      title: 'Logout Failed',
      description: error.message || 'Failed to logout. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    });
  }
};

const menuItems = [
  {
    label: 'Profile',
    icon: 'i-heroicons-user',
    click: () => router.push('/profile')
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => router.push('/profile/settings')
  },
  {
    label: 'Logout',
    icon: 'i-heroicons-arrow-left-on-rectangle',
    click: handleLogout
  }
];

const dropdownUI = {
  container: 'w-48',
  item: {
    base: 'flex items-center gap-2 w-full cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  },
  width: 'w-48',
  background: 'bg-white dark:bg-gray-900',
  ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
  rounded: 'rounded-lg',
  shadow: 'shadow-lg'
};
</script>