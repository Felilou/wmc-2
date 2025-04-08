<script setup lang="ts">
import { watch, ref, inject } from 'vue';
import type { NavigationMenuItem } from "@nuxt/ui";
import { onAuthStateChanged, type Auth } from "firebase/auth";
import type { Axios } from 'axios';

const auth = inject("auth") as Auth;
const user = ref(auth.currentUser);

onAuthStateChanged(auth, (newUser) => {
  user.value = newUser;
})

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
</script>

<template>
  <div class="flex flex-row items-center w-full px-md-2">
    
    <Logo class="relative left-0"/>

    <div class="flex-grow justify-center hidden md:flex">
      <UNavigationMenu
        :items="items"
        content-orientation="vertical"
      ></UNavigationMenu>
    </div>
    
    
      <UButton v-if="!user" to="/login" icon="i-lucide-user" variant="soft" color="neutral" class="right-0 relative">
        Login
      </UButton>
    <UPopover v-if="user" mode="hover" class="absolute">
        <UButton icon="i-lucide-user" variant="soft" color="neutral" class="relative right-0">
          <span v-if="user.displayName" class="font-medium">{{ user.displayName }}</span>
        </UButton>
      <template #content>
        <div class="p-2 rounded flex flex-col">
          <p class="text-sm font-medium">Logged in as:</p>
          <p class="text-lg font-bold">{{ user?.email }}</p>
          <USeparator class="my-1"/>
          <UButton label="Logout" @click="auth.signOut()" color="error" class="mt-1 ms-auto w-full" />
        </div>
      </template>
    </UPopover>


  </div>
</template>
