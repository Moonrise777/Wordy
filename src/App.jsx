import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Login/Auth.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Main from './pages/Main/Main.jsx';
import Profile from './pages/Profile/Profile.jsx';
import NotFound from './pages/Error/NotFound.jsx';

import { onAuthStateChanged, onUserDataChanged, saveProfile } from './web_vitals/authService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [language, setLanguage] = useState('es');
  const [isDark, setIsDark] = useState(false); 

  // --- Lógica de Idioma ---
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // --- Lógica de Autenticación ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // --- Lógica del Tema (Carga) ---
  useEffect(() => {
    let unsubscribeUserData;
    if (user) {
      unsubscribeUserData = onUserDataChanged(user.uid, (userData) => {
        const themeIsDark = userData?.theme === 'dark';
        setIsDark(themeIsDark); // Actualizamos el estado de React
      });
    } else {
      // Si no hay usuario, resetea al tema claro
      setIsDark(false);
    }
    return () => { if (unsubscribeUserData) unsubscribeUserData(); };
  }, [user]);

  // ✅ APLICA el tema a la página CADA VEZ que 'isDark' cambia
  useEffect(() => {
    document.body.className = ''; // Limpia clases previas
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  // ✅ La función para cambiar el tema 
  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark); // Actualiza la UI instantáneamente
    if (user) { // Guarda la preferencia si el usuario está logueado
      try {
        await saveProfile(user.uid, { theme: newDark ? 'dark' : 'light' });
      } catch (error) {
        console.error("Error al guardar el tema:", error);
      }
    }
  };

  if (loadingAuth) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className='app'>
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      <Routes>
        <Route path="/" element={<Main user={user} language={language} />} />
        <Route path="/main" element={<Main user={user} language={language} />} />
        <Route path="/Profile" element={<Profile user={user} language={language} />} />
        <Route
          path="/auth"
          element={
            isLoggedIn ? (
              <Navigate to="/main" replace />
            ) : (
              <Auth
                onLoginSuccess={(status, currentUser) => {
                  setIsLoggedIn(status);
                  setUser(currentUser);
                }}
                language={language}
              />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer language={language} />
    </div>
  );
}