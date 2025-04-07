import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  const firebaseConfig = {
    apiKey: "AIzaSyCcsg3cF_uvZO7IGQ9lHZWRZbRzy0sxiow",
    authDomain: "feierabendbierchen-14824.firebaseapp.com",
    projectId: "feierabendbierchen-14824",
    storageBucket: "feierabendbierchen-14824.firebasestorage.app",
    messagingSenderId: "903834040298",
    appId: "1:903834040298:web:12a14530b34e83250b2493",
    measurementId: "G-9NJV270CRZ"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user && to.path !== '/login' && to.path !== '/') {
        return resolve(navigateTo('/login'));
      }
      resolve();
    });
  });
});
