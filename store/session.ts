interface SetSessionPayload {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
  };
}

export const useSessionStore = defineStore('sessionStore', () => {
  const accessToken = useCookie('accessToken');
  const refreshToken = useCookie('refreshToken');
  const user = ref<SetSessionPayload['user']>(undefined);
  const isLoggedIn = computed(() => !!accessToken.value);
  
  const userFullName = computed(() => {
    if (!user.value) return '';
    const { firstName, lastName } = user.value;
    if (!firstName && !lastName) return user.value.email;
    return `${firstName || ''} ${lastName || ''}`.trim();
  });

  const setSession = (payload: SetSessionPayload) => {
    if (payload.accessToken) accessToken.value = payload.accessToken;
    if (payload.refreshToken) refreshToken.value = payload.refreshToken;
    if (payload.user) user.value = payload.user;
  }

  const clearSession = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = undefined;
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    userFullName,
    setSession,
    clearSession
  }
})