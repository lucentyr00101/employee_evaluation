<template>
  <nav class="w-full bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">E</span>
            </div>
            <span class="text-white font-semibold text-lg hidden sm:block">
              Employee Evaluation
            </span>
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-4">
          <span v-if="isLoggedIn" class="text-gray-300 text-sm hidden sm:block">
            {{ userFullName }}
          </span>
          <AvatarDropdown />
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useSessionStore } from "~/store/session";
import { useUser } from "~/composables/useUser";

const sessionStore = useSessionStore();
const { isLoggedIn, userFullName } = storeToRefs(sessionStore);
const { fetchUserDetails } = useUser();

// Ensure user data is loaded when the component is mounted
onMounted(async () => {
  await fetchUserDetails();
});

// Keep userFullName updated
watch(
  isLoggedIn,
  async (newValue) => {
    if (newValue) {
      await fetchUserDetails();
    }
  }
);
</script>