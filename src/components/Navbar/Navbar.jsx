// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { logout } from '../../web_vitals/authService';
import { onUserDataChanged } from '../../web_vitals/authService'; 
import styles from './Navbar.module.scss';
import { saveProfile } from '../../web_vitals/authService';


import IconWordy from '../../assets/Icon_Wordy.png';

// Importa las imágenes 
import Dog from '@profilepics/dog.png';
import Hiyoko from '@profilepics/hiyoko.png';
import Neko from '@profilepics/neko.png';
import Penguin from '@profilepics/penguin.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faTimes, faCaretDown, faCaretUp,
  faSignOutAlt, faSignInAlt, faLanguage,
  faSun, faMoon, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

// Mapeo de nombres a imágenes
const profilePics = { Dog, Hiyoko, Neko, Penguin };

const Navbar = ({ isLoggedIn, user, language, setLanguage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [profilePic, setProfilePic] = useState(Neko);
  const [username, setUsername] = useState('User');
  const navigate = useNavigate();

  // Carga de datos del usuario
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onUserDataChanged(user.uid, (data) => {
      if (!data) return;

      const storedPic = data.profilePic?.trim();
      const normalized = storedPic
        ? storedPic.charAt(0).toUpperCase() + storedPic.slice(1).toLowerCase()
        : '';

      if (normalized && profilePics[normalized]) {
        setProfilePic(profilePics[normalized]);
      } else {
        setProfilePic(Neko);
      }

      if (data.username) setUsername(data.username);
    });

    return () => unsubscribe();
  }, [user]);

  // Cambiar fondo día/noche
  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark);

    if (user) { // Solo guardar si hay un usuario logueado
      const themeToSave = newDark ? 'dark' : 'light';
      try {
        await saveProfile(user.uid, { theme: themeToSave });
        console.log(`Tema '${themeToSave}' guardado en Firestore.`);
      } catch (error) {
        console.error("Error al guardar el tema:", error);
      }
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    Swal.fire({
      title: language === 'es' ? '¿Estás seguro?' : 'Are you sure?',
      text: language === 'es' ? '¿Realmente quieres cerrar tu sesión?' : 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a3b7b',
      cancelButtonColor: '#d33',
      confirmButtonText: language === 'es' ? 'Sí, cerrar sesión' : 'Yes, log out',
      cancelButtonText: language === 'es' ? 'Cancelar' : 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await logout();
          Swal.fire({
            title: language === 'es' ? 'Sesión cerrada' : 'Logged out',
            text: language === 'es' ? 'Has cerrado tu sesión correctamente.' : 'You have successfully logged out.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          navigate('/auth');
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: (language === 'es' ? 'No se pudo cerrar la sesión: ' : 'Could not log out: ') + error.message,
            icon: 'error'
          });
        }
      }
    });
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setAuthMenuOpen(false);
    setLanguageMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLanguageChange = (lang) => {
  setLanguage(lang);
  closeAllMenus();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: lang === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logoLink} onClick={closeAllMenus}>
          <img src={IconWordy} alt="Wordy Logo" className={styles.logo} />
          <span className={styles.brandName}>Wordy</span>
        </Link>
      </div>

      <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>

        <li><Link to="/main" className={styles.navItem} onClick={closeAllMenus}>{language === 'es' ? 'Inicio' : 'Home'}</Link></li>

        <li>
          <button onClick={toggleTheme} className={styles.navItem}>
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} style={{ marginRight: '8px' }} />

            {language === 'es' ? (isDark ? 'Claro' : 'Oscuro') : (isDark ? 'Light' : 'Dark')}
          </button>
        </li>
        
        {/* Botón de ayuda */}
        <li>
          <button 
            onClick={() => {
              if (window.showWordyTutorial) {
                window.showWordyTutorial();
              }
              closeAllMenus();
            }} 
            className={styles.navItem}
          >
            <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: '8px' }} />
            {language === 'es' ? 'Ayuda' : 'Help'}
          </button>
        </li>

        {/* Idioma */}
        <li
          className={styles.dropdown}
          onMouseEnter={() => setLanguageMenuOpen(true)}
          onMouseLeave={() => setLanguageMenuOpen(false)}
        >
          <div 
            className={styles.dropdownToggle}
            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
          >
            <FontAwesomeIcon icon={faLanguage} className={styles.userIcon} />
            {language === 'en' ? 'English' : 'Español'}
            <FontAwesomeIcon icon={languageMenuOpen ? faCaretUp : faCaretDown} />
          </div>

          {languageMenuOpen && (
              <ul className={styles.dropdownMenu}>
              <li>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={styles.dropdownItem}
                  style={{
                    fontWeight: language === 'es' ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@latest/flags/4x3/mx.svg"
                    alt="Bandera de México"
                    style={{ width: '20px', marginRight: '10px', borderRadius: '3px' }}
                  />
                  Español
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={styles.dropdownItem}
                  style={{
                    fontWeight: language === 'en' ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@latest/flags/4x3/us.svg"
                    alt="Bandera de Estados Unidos"
                    style={{ width: '20px', marginRight: '10px', borderRadius: '3px' }}
                  />
                  English
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* Perfil */}
        {isLoggedIn ? (
          <li
            className={styles.dropdown}
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <div 
              className={styles.dropdownToggle}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div style={{
                backgroundColor: '#6bb8ff',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                marginRight: '8px'
              }}>
                <img 
                  src={profilePic} 
                  alt="Profile"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%'
                  }}
                />
              </div>
              {username}
              <FontAwesomeIcon icon={profileMenuOpen ? faCaretUp : faCaretDown} />
            </div>

            {profileMenuOpen && (
              <ul className={styles.dropdownMenu}>

                <li><Link to="/profile" className={styles.dropdownItem} onClick={closeAllMenus}>{language === 'es' ? 'Mi Perfil' : 'My Profile'}</Link></li>
                <li>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> 
                    
                    {language === 'es' ? 'Cerrar Sesión' : 'Logout'}
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : (
          <li
            className={styles.dropdown}
            onMouseEnter={() => setAuthMenuOpen(true)}
            onMouseLeave={() => setAuthMenuOpen(false)}
          >
            <div className={styles.dropdownToggle} onClick={() => setAuthMenuOpen(!authMenuOpen)}>
              <FontAwesomeIcon icon={faSignInAlt} className={styles.userIcon} />
              {language === 'es' ? 'Opciones' : 'Options'} <FontAwesomeIcon icon={authMenuOpen ? faCaretUp : faCaretDown} />
            </div>
            {authMenuOpen && (
              <ul className={styles.dropdownMenu}>
                <li>
                  <Link to="/auth" className={styles.dropdownItem} onClick={closeAllMenus}>
                    <FontAwesomeIcon icon={faSignInAlt} /> 
                    {language === 'es' ? 'Iniciar Sesión' : 'Login'}
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;