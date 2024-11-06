interface SetSessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const useSessionStore = defineStore('sessionStore', () => {
  const accessToken = useCookie('accessToken');
  const refreshToken = useCookie('refreshToken');
  const isLoggedIn = computed(() => !!accessToken.value);

  const setSession = (payload: SetSessionPayload) => {
    const {
      accessToken: _token,
      refreshToken: _refresh,
      expiresAt
    } = payload
    accessToken.value = _token
    refreshToken.value = _refresh
  }

  return {
    accessToken,
    refreshToken,
    isLoggedIn,
    setSession
  }
})