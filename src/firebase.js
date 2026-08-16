import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_jQTYq-qplqXEWqZyDRDHraa8gIPa_mc",
  authDomain: "styleyourself-store.firebaseapp.com",
  projectId: "styleyourself-store",
  storageBucket: "styleyourself-store.firebasestorage.app",
  messagingSenderId: "692444806423",
  appId: "1:692444806423:web:e5e4a0e3329afbc146cb52",
  measurementId: "G-2E8JVPQNMQ",
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;