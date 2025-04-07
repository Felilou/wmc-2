<script setup lang="ts">
import { watch, ref, inject } from 'vue';
import type { NavigationMenuItem } from "@nuxt/ui";
import type { Auth } from "firebase/auth";

const auth = inject("auth") as Auth;

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: "Beer",
      icon: "mdi:glass-mug-variant",
      to: "/beer",
      children: [
        {
          label: "add",
          icon: "i-lucide-file-text",
          to: "/beer/add",
        },
        {
          label: "all",
          icon: "i-lucide-file-text",
          to: "/beer",
        },
      ],
    },
    {
      label: "Brewery",
      icon: "mdi:glass-mug-variant",
      to: "/brewery",
      children: [
        {
          label: "add",
          icon: "i-lucide-file-text",
          to: "/brewery/add",
        },
        {
          label: "all",
          icon: "i-lucide-file-text",
          to: "/brewery",
        },
      ],
    },
  ],
]);

const isAuthenticated = ref(!!auth.currentUser);

// Watch for changes in the authentication state
watch(
  () => auth.currentUser,
  (newUser) => {
    console.log(newUser)
    isAuthenticated.value = !!newUser;
  }
);
</script>

<template>
  <div class="flex flex-row items-center w-full relative px-2">
    <Logo class="absolute left-0"/>
    <div class="flex-grow flex justify-center">
      <UNavigationMenu
        :items="items"
        content-orientation="vertical"
      ></UNavigationMenu>
    </div>
    
    <div class="absolute right-0">
      <UButton v-if="!isAuthenticated" to="/login" icon="i-lucide-user" variant="soft"
      color="neutral"
      class="absolute right-0"
    >
      Login
    </UButton>
    <UPopover v-if="isAuthenticated" mode="hover">
        <UButton icon="i-lucide-user" variant="soft" color="neutral" class="absolute right-0">
          <span class="font-medium">Profile</span>
        </UButton>
      <template #content>
        <UButton label="Logout" @click="auth.signOut()" />
      </template>

    </UPopover>

    </div>
  </div>
</template>
