import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Login/Auth.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Main from './pages/Main/Main.jsx';
import Profile from './pages/Profile/Profile.jsx';
import NotFound from './pages/Error/NotFound.jsx';
import { onAuthStateChanged, onUserDataChanged } from './web_vitals/authService';




export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
      setLoadingAuth(false);
      //console.log('Auth state changed:', !!currentUser, currentUser?.email);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe(); //Limpieza
    };
  }, []);

useEffect(() => {
  let unsubscribeUserData;

  if (user) {
    unsubscribeUserData = onUserDataChanged(user.uid, (userData) => {
      
      if (userData && userData.theme) {
        document.body.className = '';
        document.body.classList.add(userData.theme === 'dark' ? 'dark-theme' : 'light-theme');
      } else {        
        document.body.className = '';
        document.body.classList.add('light-theme');
      }
    });
  } else {
    console.log("No hay usuario, aplicando tema por defecto.");
    document.body.className = '';
    document.body.classList.add('light-theme');
  }

  return () => {
    if (unsubscribeUserData) {
      unsubscribeUserData();
    }
  };
}, [user]);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando autenticación... 
      </div>
    );
  }

  return (
    <div className='app'>
      <Navbar isLoggedIn={isLoggedIn} user={user} language={language} setLanguage={setLanguage} />
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
