<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button type="submit">{{ isLogin ? 'Login' : 'Register' }}</button>
      <button type="button" @click="toggleAuthMode">
        {{ isLogin ? 'Switch to Register' : 'Switch to Login' }}
      </button>
      <button type="button" @click="signInWithGoogle">Sign in with Google</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const error = ref('')

const auth = getAuth();

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      alert("Login successful!");
      navigateTo('/')
    } else {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
      alert("Registration successful!");
      navigateTo('/')
    }
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
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="button"] {
  background-color: #6c757d;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}
</style>
