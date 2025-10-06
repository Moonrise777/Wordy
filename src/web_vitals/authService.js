// src/web_vitals/authService.js
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';

import { auth, googleProvider, db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

// ==========================
// Helper
// ==========================
function ensureAuth() {
  if (!auth) {
    console.error('Firebase auth no está inicializado (auth is undefined). Revisa firebaseConfig.js');
    return false;
  }
  return true;
}

// ==========================
// Autenticación
// ==========================
export const signInWithGoogle = async () => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Usuario autenticado con Google:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario autenticado con correo:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesión con correo:', error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuario registrado:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

export const logout = async () => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    await signOut(auth);
    console.log('Sesión cerrada');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

// ==========================
// Estado de autenticación
// ==========================
export const onAuthStateChanged = (callback) => {
  if (!ensureAuth()) return () => {};
  return firebaseOnAuthStateChanged(auth, callback);
};

// ==========================
// Perfil de usuario (Firestore)
// ==========================

export const saveProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    await updateDoc(userRef, data);
  } else {
    await setDoc(userRef, data, { merge: true });
  }
};

// Suscripción en tiempo real al documento del usuario
export const onUserDataChanged = (userId, callback) => {
  if (!userId) {
    console.warn('onUserDataChanged llamado sin userId');
    return () => {};
  }
  
  const userRef = doc(db, "users", userId);
  const unsubscribe = onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error en onUserDataChanged:', error);
    }
  );

  return unsubscribe;
};

export { auth };
