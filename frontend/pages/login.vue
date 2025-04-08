<template>
  <UContainer class="flex justify-center items-center my-5 flex-col">
    <div class="gap-2 flex flex-col">
      <UForm :schema="schema" :state="state" class="space-y-4 shadow rounded p-4">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormField>

        <UButton @click="handleLogin" class="me-2">
          Login
        </UButton>

        <UButton @click="handleSignup" color="secondary">
          Signup
        </UButton>
      </UForm>
      <USeparator> or </USeparator>
      <UButton @click="signInWithGoogle" block>
        Sign in with Google
      </UButton>
      <UButton @click="signInWithGitHub" block :disabled="true">
        Sign in with GitHub
      </UButton>
      
    </div>
  </UContainer>
  <Span>{{ error }}</Span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters'))
})

type Schema = v.InferOutput<typeof schema>

const state = reactive({
  email: '',
  password: ''
})
const isLogin = ref(true)
const error = ref('')

const auth = getAuth();

const handleSignup = async () => {
  try {
      await createUserWithEmailAndPassword(auth, state.email, state.password);
      alert("Registration successful!");
      navigateTo('/')
    
    error.value = '';
  } catch (err) {
    error.value = err as string;
  }
};

const handleLogin = async () => {
  try {
      await signInWithEmailAndPassword(auth, state.email, state.password);
      alert("Login successful!");
      navigateTo('/')
    error.value = '';
  } catch (err) {
    error.value = err as string;
  }
};

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
};

const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    error.value = '';
    navigateTo('/')
  } catch (err) {
    error.value = err as string;
  }
};

const signInWithGitHub = async () => {
  try {
    await signInWithPopup(auth, new GithubAuthProvider());
    error.value = '';
    navigateTo('/')
  } catch (err) {
    error.value = err as string;
  }
};
</script>
