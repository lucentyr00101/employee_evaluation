import { useUser } from "~/composables/useUser";
import { useSessionStore } from "~/store/session";

export default defineNuxtPlugin(async (nuxtApp) => {
  // Wait for the client to be ready
  await nuxtApp.runWithContext(async () => {
    const { fetchUserDetails } = useUser();
    const sessionStore = useSessionStore();
    const router = useRouter();

    // Fetch user details on initial load
    await fetchUserDetails();

    // Check if user needs to change password on first login
    if (process.client && sessionStore.user) {
      const userMetadata = sessionStore.user.user_metadata || {};

      if (userMetadata.require_password_change) {
        // If not already on the change password page, redirect there
        if (router.currentRoute.value.path !== "/profile/change-password") {
          router.push("/profile/change-password");
        }
      }
    }

    // Add event listener for page visibility changes to handle tab switches
    if (process.client) {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          fetchUserDetails();
        }
      });
    }
  });
});
