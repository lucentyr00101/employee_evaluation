import { useSessionStore } from "~/store/session";

export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchUserDetails } = useUser();
  const { isLoggedIn } = useSessionStore();
  const router = useRouter();

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  
  if (!isLoggedIn && !publicRoutes.includes(to.path)) {
    return router.push('/auth/login');
  }

  if (isLoggedIn) {
    if (publicRoutes.includes(to.path)) {
      return router.push('/');
    }
    // Fetch latest user details
    await fetchUserDetails();
  }
});