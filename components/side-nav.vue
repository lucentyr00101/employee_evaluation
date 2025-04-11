<template>
  <div
    class="h-screen fixed top-0 left-0 z-30 flex"
    :class="[isCollapsed ? 'w-16' : 'w-64']"
  >
    <!-- Sidebar -->
    <div
      class="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col"
      :class="[isCollapsed ? 'w-16' : 'w-64']"
    >
      <!-- Logo Section -->
      <div
        class="p-4 flex items-center justify-between border-b border-gray-700"
      >
        <div class="flex items-center gap-3" v-if="!isCollapsed">
          <div
            class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-xl">E</span>
          </div>
          <span class="text-white font-semibold text-lg">Eval System</span>
        </div>
        <div
          class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
          v-else
        >
          <span class="text-white font-bold text-xl">E</span>
        </div>
        <button
          @click="toggleCollapse"
          class="text-gray-300 hover:text-white"
          :class="[isCollapsed ? 'ml-auto' : '']"
        >
          <UIcon
            v-if="isCollapsed"
            name="i-heroicons-chevron-right"
            class="w-5 h-5"
          />
          <UIcon v-else name="i-heroicons-chevron-left" class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="py-4 flex-1 overflow-y-auto">
        <nav>
          <ul class="space-y-1">
            <!-- Dashboard -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Dashboard' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                  exact
                >
                  <UIcon name="i-heroicons-home" class="w-5 h-5" />
                  <span v-if="!isCollapsed" class="ml-3">Dashboard</span>
                </NuxtLink>
              </UTooltip>
            </li>

            <!-- Employees -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Employees' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/employees"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                >
                  <UIcon name="i-heroicons-users" class="w-5 h-5" />
                  <span v-if="!isCollapsed" class="ml-3">Employees</span>
                </NuxtLink>
              </UTooltip>
            </li>

            <!-- Departments -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Departments' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/departments"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                >
                  <UIcon name="i-heroicons-building-office-2" class="w-5 h-5" />
                  <span v-if="!isCollapsed" class="ml-3">Departments</span>
                </NuxtLink>
              </UTooltip>
            </li>

            <!-- Evaluations -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Evaluations' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/evaluations"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                >
                  <UIcon
                    name="i-heroicons-clipboard-document-check"
                    class="w-5 h-5"
                  />
                  <span v-if="!isCollapsed" class="ml-3">Evaluations</span>
                </NuxtLink>
              </UTooltip>
            </li>

            <!-- Templates -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Templates' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/templates"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                >
                  <UIcon
                    name="i-heroicons-document-duplicate"
                    class="w-5 h-5"
                  />
                  <span v-if="!isCollapsed" class="ml-3">Templates</span>
                </NuxtLink>
              </UTooltip>
            </li>

            <!-- Goals -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Goals' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/goals"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                >
                  <UIcon name="i-heroicons-flag" class="w-5 h-5" />
                  <span v-if="!isCollapsed" class="ml-3">Goals</span>
                </NuxtLink>
              </UTooltip>
            </li>

            <!-- Settings -->
            <li>
              <UTooltip
                :text="isCollapsed ? 'Settings' : ''"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  to="/settings"
                  class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  :class="{ 'justify-center': isCollapsed }"
                  active-class="bg-gray-700 text-white border-l-4 border-blue-500"
                >
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
                  <span v-if="!isCollapsed" class="ml-3">Settings</span>
                </NuxtLink>
              </UTooltip>
            </li>
          </ul>
        </nav>
      </div>

      <!-- User Profile Link -->
      <div class="p-4 border-t border-gray-700">
        <div
          class="flex items-center text-gray-300 hover:text-white transition-colors gap-2"
        >
          <UTooltip
            :text="isCollapsed ? 'Profile' : ''"
            :popper="{ placement: 'right' }"
          >
            <div class="flex items-center">
              <AvatarDropdown />
              <div v-if="!isCollapsed" class="ml-3">
                <div class="text-sm font-medium">{{ userFullName }}</div>
              </div>
            </div>
          </UTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSessionStore } from "~/store/session";
import { onMounted } from "vue";

// Get user info from session store
const sessionStore = useSessionStore();
const { userFullName } = storeToRefs(sessionStore);

// State for collapsing/expanding the sidebar
const isCollapsed = ref(false);

// Toggle collapse state
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;

  // Emit a custom event to notify the layout about sidebar state changes
  window.dispatchEvent(
    new CustomEvent("sidebar:toggle", {
      detail: { collapsed: isCollapsed.value },
    })
  );
};

// Initialize sidebar state on mount
onMounted(() => {
  // Emit initial state
  window.dispatchEvent(
    new CustomEvent("sidebar:toggle", {
      detail: { collapsed: isCollapsed.value },
    })
  );
});
</script>
