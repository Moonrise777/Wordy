import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Login/Auth.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Main from './pages/Main/Main.jsx';
import Profile from './pages/Profile/Profile.jsx';
import NotFound from './pages/Error/NotFound.jsx';
import Leaderboard from './pages/Leaderboard/Leaderboard.jsx';

import { onAuthStateChanged, onUserDataChanged, saveProfile } from './web_vitals/authService';
import Swal from 'sweetalert2';
import iconWordy from './assets/Icon_Wordy.png';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [language, setLanguage] = useState('es');
  const [isDark, setIsDark] = useState(false); 
  const [category, setCategory] = useState('animals');
  const [isGameActive, setIsGameActive] = useState(false);
  

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    if (user && user.uid) {
      saveProfile(user.uid, { language: language })
        .catch(err => console.error(err));
    }
  }, [language, user]);

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

  useEffect(() => {
    let unsubscribeUserData;
    if (user) {
      unsubscribeUserData = onUserDataChanged(user.uid, (userData) => {
        const themeIsDark = userData?.theme === 'dark';
        setIsDark(themeIsDark); 

        // Cargar Idioma desde la base de datos
        if (userData?.language) {
          setLanguage(userData.language);
        }
      });
    } else {
      setIsDark(false);
    }
    return () => { if (unsubscribeUserData) unsubscribeUserData(); };
  }, [user]);

  useEffect(() => {
    document.body.className = ''; 
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark); 
    if (user) { 
      try {
        await saveProfile(user.uid, { theme: newDark ? 'dark' : 'light' });
      } catch (error) {
        console.error("Error al guardar el tema:", error);
      }
    }
  };


  // Tutorial
  const showTutorial = useCallback((passedIsDark) => {
    const currentThemeIsDark = typeof passedIsDark === 'boolean' ? passedIsDark : isDark;

    const bgColor = currentThemeIsDark ? '#1f1f1f' : '#ffffff'; 
    const textColor = currentThemeIsDark ? '#ffffff' : '#545454'; 
    const titleColor = currentThemeIsDark ? '#ffffff' : '#000000'; 

    const tutorialText = language === 'es'
      ? `
          <div style="text-align: left;">
            <div style="text-align: center; margin-bottom: 5px;">
               <img src="${iconWordy}" alt="Wordy" style="display: block; margin: auto; width: 100px; height: 100px;" />
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-family: 'Bagel Fat One', cursive; font-size: 52px; color: ${titleColor}; margin: 0; font-weight: normal; line-height: 1.2;">
                Wordy
              </h1>
            </div>
            <h3 style="color: #f9a8d4; margin-bottom: 15px;">¿Cómo jugar Wordy?</h3>
            <p><strong>🎯 Objetivo:</strong> Adivina la palabra secreta de 5 letras en 5 intentos</p>
            <br>
            <p><strong>📝 Cómo jugar:</strong></p>
            <ul style="margin-left: 20px;">
              <li>Escribe una palabra de 5 letras</li>
              <li>Presiona ENTER para enviar</li>
              <li>Los colores te darán pistas:</li>
            </ul>
            <br>
            <div style="margin-left: 20px;">
              <p>🟩 <strong style="color: #4ade80;">Verde:</strong> Letra correcta en posición correcta</p>
              <p>🟨 <strong style="color: #facc15;">Amarillo:</strong> Letra correcta en posición incorrecta</p>
              <p>🟥 <strong style="color: #f87171;">Rojo:</strong> Letra no está en la palabra</p>
            </div>
            <br>
            <p>💡 <strong>Consejo:</strong> Usa el teclado para escribir y BACKSPACE para borrar</p>
          </div>
        `
      : `
          <div style="text-align: left;">
            <div style="text-align: center; margin-bottom: 5px;">
               <img src="${iconWordy}" alt="Wordy" style="display: block; margin: auto; width: 100px; height: 100px;" />
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-family: 'Bagel Fat One', cursive; font-size: 52px; color: ${titleColor}; margin: 0; font-weight: normal; line-height: 1.2;">
                Wordy
              </h1>
            </div>
            <h3 style="color: #f9a8d4; margin-bottom: 15px;">How to play Wordy?</h3>
            <p><strong>🎯 Goal:</strong> Guess the secret 5-letter word in 5 attempts</p>
            <br>
            <p><strong>📝 How to play:</strong></p>
            <ul style="margin-left: 20px;">
              <li>Type a 5-letter word</li>
              <li>Press ENTER to submit</li>
              <li>Colors will give you hints:</li>
            </ul>
            <br>
            <div style="margin-left: 20px;">
              <p>🟩 <strong style="color: #4ade80;">Green:</strong> Correct letter in correct position</p>
              <p>🟨 <strong style="color: #facc15;">Yellow:</strong> Correct letter in wrong position</p>
              <p>🟥 <strong style="color: #f87171;">Red:</strong> Letter not in the word</p>
            </div>
            <br>
            <p>💡 <strong>Tip:</strong> Use your keyboard to type and BACKSPACE to delete</p>
          </div>
        `;

    Swal.fire({
      html: tutorialText,
      confirmButtonText: language === 'es' ? '¡Entendido!' : 'Got it!',
      confirmButtonColor: '#f9a8d4',
      width: '600px',
      allowOutsideClick: true,
      background: bgColor,
      color: textColor,
    });
  }, [language, isDark]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('wordyTutorialSeen');
    if (!hasSeenTutorial) {
      showTutorial();
    }
  }, [showTutorial]);

  useEffect(() => {
    window.showWordyTutorial = showTutorial;
    return () => {
      delete window.showWordyTutorial;
    };
  }, [language, showTutorial]);


// Loading mientras se verifica el estado de autenticación
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
        category={category}
        setCategory={setCategory}
        isGameActive={isGameActive}
        setIsGameActive={setIsGameActive}
      />
      <Routes>
        <Route path="/" 
        element={
          <Main 
          user={user} 
          language={language} 
          category={category} 
          setIsGameActive={setIsGameActive} 
          isLoggedIn={isLoggedIn} 
          />} />
        <Route path="/main" 
        element={
          <Main user={user} 
          language={language} 
          category={category} 
          setIsGameActive={setIsGameActive}
          isLoggedIn={isLoggedIn}
          />} />
        <Route path="/Profile" element={<Profile user={user} language={language} isDark={isDark} />} />
        <Route path="/leaderboard" element={<Leaderboard language={language} isDark={isDark} />} />
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