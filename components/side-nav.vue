<template>
  <div class="h-screen fixed top-0 left-0 z-30 w-64">
    <UCard
      class="h-full flex flex-col !rounded-none bg-gray-900 text-white"
      :ui="{ background: 'bg-gray-900', divide: 'divide-gray-700' }"
    >
      <!-- Logo Section -->
      <div class="flex items-center p-4 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <UAvatar
            src=""
            :text="'E'"
            size="sm"
            class="bg-primary-500 text-white"
          />
          <span class="font-semibold truncate">Eval System</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto py-4">
        <UVerticalNavigation
          :links="navigationLinks"
          :ui="{
            wrapper: 'space-y-1',
            base: 'flex items-center gap-2 px-4 py-2 rounded-none',
            active:
              'text-white bg-gray-800 font-medium border-l-2 border-primary-500',
            inactive: 'text-gray-300 hover:text-white hover:bg-gray-800',
          }"
        />
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-gray-700">
        <div class="flex items-center gap-3">
          <AvatarDropdown />
          <div class="min-w-0">
            <template v-if="user">
              <p class="text-sm font-medium truncate">{{ userFullName }}</p>
            </template>
            <template v-else>
              <div class="flex items-center">
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="animate-spin text-gray-400 mr-2"
                />
                <span class="text-sm text-gray-400">Loading...</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSessionStore } from "~/store/session";

// Get user info from session store
const sessionStore = useSessionStore();
const { userFullName, user } = storeToRefs(sessionStore);

// Navigation links configuration
const navigationLinks = computed(() => [
  {
    label: "Dashboard",
    icon: "i-heroicons-home",
    to: "/",
    exact: true,
  },
  {
    label: "Employees",
    icon: "i-heroicons-users",
    to: "/employees",
  },
  {
    label: "Departments",
    icon: "i-heroicons-building-office-2",
    to: "/departments",
  },
  {
    label: "Evaluations",
    icon: "i-heroicons-clipboard-document-check",
    to: "/evaluations",
  },
  {
    label: "Templates",
    icon: "i-heroicons-document-duplicate",
    to: "/templates",
  },
  {
    label: "Goals",
    icon: "i-heroicons-flag",
    to: "/goals",
  },
  {
    label: "Settings",
    icon: "i-heroicons-cog-6-tooth",
    to: "/settings",
  },
]);
</script>
