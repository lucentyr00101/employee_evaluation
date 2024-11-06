import { useSessionStore } from "~/store/session";

export default defineNuxtRouteMiddleware(async to => {
  const { isLoggedIn } = useSessionStore();

  if (to.meta.auth && !isLoggedIn) {
    return navigateTo('/auth/login')
  }

  if (to.fullPath === '/auth/login' && isLoggedIn) {
    return navigateTo('/')
  }
})