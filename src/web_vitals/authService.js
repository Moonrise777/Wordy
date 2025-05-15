import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";

// Iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Usuario autenticado con Google:", result.user);
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
  }
};

// Iniciar sesión con correo y contraseña
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Usuario autenticado con correo:", result.user);
  } catch (error) {
    console.error("Error al iniciar sesión con correo:", error);
  }
};

// Registrar un nuevo usuario con correo y contraseña
export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Usuario registrado:", result.user);
  } catch (error) {
    console.error("Error al registrar usuario:", error);
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Sesión cerrada");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};