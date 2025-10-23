// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZVVqA4M3MpsvGl0RD-Pjb7gTTtTIChHA",
  authDomain: "crafthub-c9b25.firebaseapp.com",
  projectId: "crafthub-c9b25",
  storageBucket: "crafthub-c9b25.firebasestorage.app",
  messagingSenderId: "756031093927",
  appId: "1:756031093927:web:207582870ab554a404ef82",
  measurementId: "G-9YJDV3XRGC"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Firestore-Datenbank exportieren
export const db = getFirestore(app);
