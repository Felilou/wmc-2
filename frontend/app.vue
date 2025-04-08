<template>
  <UContainer class="min-h-screen flex flex-col">
    <header class="sticky top-0 grow-0 shrink-0 w-full z-10">
      <Navbar />
    </header>

    <main class="flex-grow">
      <nuxtPage/>
    </main>

    <footer class="sticky bottom-0 grow-0 shrink-0">
      <footerc />
    </footer>
  </UContainer>
</template>

<script setup lang="ts">
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { ref, provide } from "vue";
import axios from "axios";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCcsg3cF_uvZO7IGQ9lHZWRZbRzy0sxiow",
  authDomain: "feierabendbierchen-14824.firebaseapp.com",
  projectId: "feierabendbierchen-14824",
  storageBucket: "feierabendbierchen-14824.firebasestorage.app",
  messagingSenderId: "903834040298",
  appId: "1:903834040298:web:12a14530b34e83250b2493",
  measurementId: "G-9NJV270CRZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

provide('auth', auth)

const instance = axios.create({
  baseURL: 'http://localhost:3300/api',
  headers: {'Authorization': `Bearer ${auth.currentUser?.getIdToken()}`}
});

provide('axios', instance)
</script>
