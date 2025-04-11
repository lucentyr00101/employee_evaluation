<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <SideNav />
    <TopNav />
    <div 
      class="transition-all duration-300 ease-in-out" 
      :class="{ 'pl-64': !isSidebarCollapsed, 'pl-16': isSidebarCollapsed }"
    >
      <div class="p-4 md:p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a simple reactive state to track sidebar collapse state
// In a real app, you might want to store this in a store
const isSidebarCollapsed = ref(false);

// We're using a custom event to listen for sidebar collapse/expand
onMounted(() => {
  window.addEventListener('sidebar:toggle', (e: CustomEvent) => {
    isSidebarCollapsed.value = e.detail.collapsed;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('sidebar:toggle', (e: CustomEvent) => {
    isSidebarCollapsed.value = e.detail.collapsed;
  });
});
</script>