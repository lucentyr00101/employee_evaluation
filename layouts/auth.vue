<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md mb-8 text-center">
      <h1 class="text-3xl font-bold text-white mb-2">Employee Evaluation</h1>
      <p class="text-gray-400">Manage and track employee performance</p>
    </div>
    <NuxtPage />
    <footer class="mt-8 text-center text-gray-500 text-sm">
      © {{ new Date().getFullYear() }} Employee Evaluation System
    </footer>
  </div>
</template>

<style>
.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>