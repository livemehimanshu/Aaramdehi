import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration for Aaramdehi
// Best practice: Store these in your f:\Aramdehi\.env.local file using VITE_ prefix
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredFirebaseKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const isFirebaseConfigured = requiredFirebaseKeys.every(key => Boolean(firebaseConfig[key]));

Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value && key !== 'measurementId') {
    console.warn(`⚠️ Firebase Config missing: ${key}. Check your .env.local file or production env vars.`);
  }
});

// Initialize Firebase App as singleton (prevents duplicate-app error)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;

if (isFirebaseConfigured) {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getDatabase(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
} else {
  console.warn('⚠️ Firebase initialization skipped because required config is missing.');
}

// Initialize and Export Firebase Services for use in your components
export const auth = firebaseAuth;
export const db = firebaseDb;
export const storage = firebaseStorage;

// ✅ Graceful Analytics Initialization: Prevent 'config-fetch-failed' from blocking UI
let firebaseAnalytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD && app) {
  try {
    firebaseAnalytics = getAnalytics(app);
  } catch (err) {
    console.warn("Firebase Analytics disabled or blocked. App will continue to work.");
  }
}
export const analytics = firebaseAnalytics;

export default firebaseApp;