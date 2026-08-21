import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  Auth
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Firestore
} from "firebase/firestore";

import firebaseAppletConfig from "../firebase-applet-config.json";

const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};

// Production-targeted Named Firestore Database ID
export const FIRESTORE_DATABASE_ID =
  metaEnv.VITE_FIREBASE_DATABASE_ID ||
  firebaseAppletConfig.firestoreDatabaseId ||
  "ai-studio-avanyxstore-083c830c-ab08-4b8b-aaa3-6b723506e575";

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey || "AIzaSyAzRaf1gLjE1_XPwh8c7Hvc1Xoq325TByU",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain || "avanyx-store.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId || "avanyx-store",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket || "avanyx-store.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId || "754931220482",
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId || "1:754931220482:web:a1ad176e10d9d3561b671b",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId || ""
};

// Initialize Firebase (guards against duplicate initialization across reloads)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with standard web configuration
export const auth: Auth = getAuth(app);

// Configure Firestore instance with auto-detect long polling and robust offline caching
let dbInstance: Firestore;
try {
  let cacheSettings;
  try {
    cacheSettings = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
  } catch {
    cacheSettings = memoryLocalCache();
  }

  dbInstance = initializeFirestore(
    app,
    {
      localCache: cacheSettings,
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true
    },
    FIRESTORE_DATABASE_ID
  );
} catch {
  try {
    dbInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  } catch (err2) {
    console.error("[AVANYX Firestore Initialization Failure]", err2);
    throw new Error(`Failed to initialize Firestore with named database "${FIRESTORE_DATABASE_ID}".`);
  }
}

export const db: Firestore = dbInstance;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
};

export default app;
