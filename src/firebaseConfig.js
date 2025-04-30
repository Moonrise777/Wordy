// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkRYwKsm_JwwB1KfCPn1tDfmUFLu6ef5E",
  authDomain: "wordy-4cc1d.firebaseapp.com",
  projectId: "wordy-4cc1d",
  storageBucket: "wordy-4cc1d.firebasestorage.app",
  messagingSenderId: "808195801429",
  appId: "1:808195801429:web:3077c814256b64e7d7afdc",
  measurementId: "G-PXDXBNV4GS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Servicios de Firebase
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);