// src/web_vitals/authService.js
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';

import { auth, googleProvider, db } from './firebaseConfig';

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  increment,
  collection,
  query,      
  where,      
  orderBy,    
  limit,      
  getDocs     
} from "firebase/firestore";

// Helper
function ensureAuth() {
  if (!auth) {
    console.error('Firebase auth no está inicializado (auth is undefined). Revisa firebaseConfig.js');
    return false;
  }
  return true;
}

// Autenticación
export const signInWithGoogle = async () => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Error al iniciar sesión con correo:', error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  if (!ensureAuth()) throw new Error('auth not initialized');
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
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

// Estado de autenticación
export const onAuthStateChanged = (callback) => {
  if (!ensureAuth()) return () => {};
  return firebaseOnAuthStateChanged(auth, callback);
};

// Perfil de usuario (Firestore)
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

// Puntuación del usuario
/**
 * Suma puntos al puntaje total del usuario.
 * @param {string} uid - ID del usuario.
 * @param {number} points - Cantidad de puntos a sumar.
 */
export const updateUserScore = async (uid, points) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Usamos 'increment' para sumar de forma atómica y segura
    await updateDoc(userRef, {
      score: increment(points)
    });
  } catch (error) {
    console.error("Error al actualizar el puntaje:", error);
  }
};

// Función para obtener el Leaderboard
export const getLeaderboard = async () => {
  try {
    const usersRef = collection(db, "users");
    
    // Consulta: Puntuación mayor a 0, ordenado descendente, máximo 20 usuarios
    const q = query(
      usersRef, 
      where("score", ">", 0), 
      orderBy("score", "desc"), 
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    
    const leaders = [];
    querySnapshot.forEach((doc) => {
      leaders.push({ id: doc.id, ...doc.data() });
    });

    return leaders;
  } catch (error) {
    console.error("Error obteniendo leaderboard:", error);
    return [];
  }
};

export { auth };