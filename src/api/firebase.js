import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration for Aaramdehi
// Best practice: Store these in your f:\Aramdehi\.env.local file using VITE_ prefix
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBFIkyRnPTIdHQId7lJv4XhrZyxTrBSEs8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aaramdehi-91f82.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://aaramdehi-91f82-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aaramdehi-91f82",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aaramdehi-91f82.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "381894174207",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:381894174207:web:95e6c6d322976cb61033ca",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RRVM9RK0W3"
};

// Initialize Firebase App as singleton (prevents duplicate-app error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize and Export Firebase Services for use in your components
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;