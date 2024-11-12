<template>
  <UPopover
    :popper="{
      placement: 'bottom-end'
    }"
  >
    <UAvatar
      alt="Anonymous"
    />

    <template #panel>
      <UVerticalNavigation
        :links="links"
        :ui="{
          wrapper: 'min-w-40',
          base: 'leading-6'
        }"
      />
    </template>
  </UPopover>
</template>

<script setup lang="ts">

import { useSessionStore } from "~/store/session";

const sessionStore = useSessionStore();
const { accessToken, refreshToken } = storeToRefs(sessionStore)

const links = [
  {
    label: 'Profile',
    avatar: {
      src: '',
      alt: 'Anonymous'
    },
  },
  {
    label: 'Settings',
    icon: 'i-material-symbols:settings-rounded',
    to: '/profile/settings'
  },
  {
    label: 'Logout',
    icon: 'i-material-symbols:power-settings-new-rounded',
    click: async () => {
      accessToken!.value = null
      refreshToken!.value = null
      await navigateTo('/auth/login')
    }
  }
]
</script>