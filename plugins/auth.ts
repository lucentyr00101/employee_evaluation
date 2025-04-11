import { useUser } from '~/composables/useUser';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Wait for the client to be ready
  await nuxtApp.runWithContext(async () => {
    const { fetchUserDetails } = useUser();
    
    // Fetch user details on initial load
    await fetchUserDetails();
    
    // Add event listener for page visibility changes to handle tab switches
    if (process.client) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          fetchUserDetails();
        }
      });
    }
  });
});