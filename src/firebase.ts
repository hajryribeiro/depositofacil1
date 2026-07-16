import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "deposito-facil-app",
  appId: "1:172388415060:web:3e514a1464a252a3129fc1",
  apiKey: "AIzaSyBAc-0iCK0Bz_rtq7KHqsVPqKZ2uIyaxU4",
  authDomain: "deposito-facil-app.firebaseapp.com",
  storageBucket: "deposito-facil-app.firebasestorage.app",
  messagingSenderId: "172388415060"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from config
export const dbFirestore = getFirestore(app, "ai-studio-depsitofcil-b61c05ec-6ef2-41ca-8fd4-0775ace0bf7b");
export const auth = getAuth(app);
