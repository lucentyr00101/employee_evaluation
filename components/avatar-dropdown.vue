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
  </UDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from "~/store/session";
import { useAuth } from "~/composables/useAuth";

const router = useRouter();
const sessionStore = useSessionStore();
const { isLoggedIn } = sessionStore;
const { logout } = useAuth();

const userInitials = computed(() => {
  if (!sessionStore.userFullName) return '?';
  return sessionStore.userFullName
    .split(' ')
    .map((part: string) => part?.[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const menuItems = [
  [
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
      click: () => logout()
    }
  ]
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
  shadow: 'shadow-lg',
  popper: {
    strategy: 'fixed'
  }
};
</script>