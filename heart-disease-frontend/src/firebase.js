import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAGv4AWlZbnP8DZAUxwds2uWOUSPMX1esM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "heart-disease-prediction-8b246.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "heart-disease-prediction-8b246",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "heart-disease-prediction-8b246.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1075988265487",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1075988265487:web:dbc7fcc04b2f514be8817a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NKE44PR7JG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
