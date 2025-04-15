import { useSessionStore } from "~/store/session";

export const useUser = () => {
  const { $client } = useNuxtApp();
  const { setSession, clearSession } = useSessionStore();
  const toast = useToast();

  const fetchUserDetails = async () => {
    // Ensure client is available
    if (!$client) {
      console.warn("tRPC client not yet initialized");
      return null;
    }

    try {
      const { user } = await $client.v1.auth.getMe.query();
      if (user) {
        setSession({
          user,
        });
        return user;
      }
      clearSession();
      return null;
    } catch (error: any) {
      console.error("Failed to fetch user details:", error);
      clearSession();
      toast.add({
        title: "Session Error",
        description: "Your session has expired. Please log in again.",
        color: "red",
        icon: "i-heroicons-x-circle",
      });
      return null;
    }
  };

  onMounted(async () => {
    await fetchUserDetails();
  });

  return {
    fetchUserDetails,
  };
};
