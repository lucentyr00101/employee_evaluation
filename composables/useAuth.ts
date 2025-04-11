import { useRouter } from "vue-router";
import { useNuxtApp } from "#app";
import { useSessionStore } from "~/store/session";
import { useUser } from "~/composables/useUser";

export const useAuth = () => {
  const { $client } = useNuxtApp();
  const router = useRouter();
  const { setSession, clearSession } = useSessionStore();
  const { fetchUserDetails } = useUser();
  const toast = useToast();

  const login = async (email: string, password: string) => {
    try {
      const res = await $client.v1.auth.login.mutate({ email, password });
      
      setSession({
        accessToken: res.session.access_token,
        refreshToken: res.session.refresh_token,
        expiresAt: res.session.expires_at
      });

      await fetchUserDetails();
      await router.replace('/');
      
      return { success: true };
    } catch (error: any) {
      toast.add({
        title: 'Login Failed',
        description: error.message || 'An error occurred during login. Please try again.',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      });
      return { success: false, error };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      const res = await $client.v1.auth.register.mutate(userData);
      
      if (res.message) {
        toast.add({
          title: 'Registration Successful',
          description: res.message,
          icon: 'i-heroicons-envelope',
          color: 'blue'
        });
        await router.push('/auth/login');
        return { success: true, requiresConfirmation: true };
      }

      if (res.session && res.user) {
        setSession({
          accessToken: res.session.access_token,
          refreshToken: res.session.refresh_token,
          expiresAt: res.session.expires_at
        });

        await fetchUserDetails();
        
        toast.add({
          title: 'Welcome!',
          description: 'Your account has been created successfully.',
          icon: 'i-heroicons-check-circle',
          color: 'green'
        });
        await router.replace('/');
        return { success: true };
      }
    } catch (error: any) {
      toast.add({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration. Please try again.',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      });
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await $client.v1.auth.logout.mutate();
      clearSession();
      toast.add({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        icon: 'i-heroicons-check-circle',
        color: 'green'
      });
      await router.push('/auth/login');
      return { success: true };
    } catch (error: any) {
      toast.add({
        title: 'Logout Failed',
        description: error.message || 'Failed to logout. Please try again.',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      });
      return { success: false, error };
    }
  };

  return {
    login,
    register,
    logout
  };
};