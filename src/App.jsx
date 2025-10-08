import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Login/Auth.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Main from './pages/Main/Main.jsx';
import Profile from './pages/Profile/Profile.jsx';
import NotFound from './pages/Error/NotFound.jsx';

import { onAuthStateChanged, onUserDataChanged, saveProfile } from './web_vitals/authService';
import Swal from 'sweetalert2';
import iconWordy from './assets/Icon_Wordy.png';

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


  // --- Componente tutorial ---
    const showTutorial = useCallback(() => {
      const tutorialText = language === 'es'
        ? `
          <div style="text-align: left;">
            <div style="text-align: center; margin-bottom: 5px;">
               <img src="${iconWordy}" alt="Wordy" style="display: block; margin: auto; width: 100px; height: 100px;" />
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-family: 'Bagel Fat One', cursive; font-size: 52px; color: #000; margin: 0; font-weight: normal; line-height: 1.2;">
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
              <p>🟩 <strong style="color: green;">Verde:</strong> Letra correcta en posición correcta</p>
              <p>🟨 <strong style="color: goldenrod;">Amarillo:</strong> Letra correcta en posición incorrecta</p>
              <p>🟥 <strong style="color: crimson;">Rojo:</strong> Letra no está en la palabra</p>
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
              <h1 style="font-family: 'Bagel Fat One', cursive; font-size: 52px; color: #000; margin: 0; font-weight: normal; line-height: 1.2;">
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
              <p>🟩 <strong style="color: green;">Green:</strong> Correct letter in correct position</p>
              <p>🟨 <strong style="color: goldenrod;">Yellow:</strong> Correct letter in wrong position</p>
              <p>🟥 <strong style="color: crimson;">Red:</strong> Letter not in the word</p>
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
      });
    }, [language]);
  
    useEffect(() => {
      const hasSeenTutorial = localStorage.getItem('wordyTutorialSeen');
      if (!hasSeenTutorial) {
        showTutorial();
        localStorage.setItem('wordyTutorialSeen', 'true');
      }
    }, [showTutorial]);
  
    useEffect(() => {
      window.showWordyTutorial = showTutorial;
      return () => {
        delete window.showWordyTutorial;
      };
    }, [language, showTutorial]);
  



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