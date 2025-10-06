// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBt7Sqn7VaUu0d-CSUbKFD3BK1Q56_aJPM",
  authDomain: "wordy-5cb85.firebaseapp.com",
  projectId: "wordy-5cb85",
  storageBucket: "wordy-5cb85.firebasestorage.app",
  messagingSenderId: "86668626278",
  appId: "1:86668626278:web:585b238246a904cbb2a0a7",
  measurementId: "G-6TY1EZ47T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
// src/web_vitals/firebaseConfig.js (después de getAuth)
//console.log('Firebase auth inicializado:', !!auth);

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);