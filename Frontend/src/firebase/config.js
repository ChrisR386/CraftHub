// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZVVqA4M3MpsvGl0RD-Pjb7gTTtTIChHA",
  authDomain: "crafthub-c9b25.firebaseapp.com",
  projectId: "crafthub-c9b25",
  storageBucket: "crafthub-c9b25.firebasestorage.app",
  messagingSenderId: "756031093927",
  appId: "1:756031093927:web:207582870ab554a404ef82",
  measurementId: "G-9YJDV3XRGC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
