<template>
  <nav
    class="fixed top-0 left-0 right-0 z-20 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700"
  >
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-end h-16">
        <div class="flex items-center space-x-4">
          <div v-if="isLoggedIn" class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-bell"
              class="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSessionStore } from "~/store/session";

const sessionStore = useSessionStore();
const { isLoggedIn } = storeToRefs(sessionStore);
</script>
