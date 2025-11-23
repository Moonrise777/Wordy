import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { logout } from '../../web_vitals/authService';
import { onUserDataChanged } from '../../web_vitals/authService'; 
import styles from './Navbar.module.scss';

import IconWordy from '../../assets/Icon_Wordy.png';
import Dog from '@profilepics/dog.png';
import Hiyoko from '@profilepics/hiyoko.png';
import Neko from '@profilepics/neko.png';
import Penguin from '@profilepics/penguin.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faTimes, faCaretDown, faCaretUp,
  faSignOutAlt, faSignInAlt, faLanguage,
  faSun, faMoon, faQuestionCircle,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const profilePics = { Dog, Hiyoko, Neko, Penguin };

// --- CONFIGURACIÓN DE CATEGORÍAS (SIN WORDLE) ---
const CATEGORIES = [
    { id: 'animals', label: { es: 'Animales', en: 'Animals' }, allowedInEs: true },
    { id: 'countries', label: { es: 'Países', en: 'Countries' }, allowedInEs: true },
    { id: 'sports', label: { es: 'Deportes', en: 'Sports' }, allowedInEs: true },
    { id: 'brainrot', label: { es: 'Pájaros', en: 'Brainrot' }, allowedInEs: false },
    { id: 'softwares', label: { es: 'Software', en: 'Software' }, allowedInEs: false }, // EN only
];

const Navbar = ({ isLoggedIn, user, language, setLanguage, isDark, toggleTheme, category, setCategory }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  
  const [profilePic, setProfilePic] = useState(Neko);
  const [username, setUsername] = useState('User');
  const navigate = useNavigate();

  const swalColors = {
    background: isDark ? '#1f1f1f' : '#ffffff', 
    color: isDark ? '#ffffff' : '#545454'       
  };

  useEffect(() => {
    if (!user?.uid) {
      setUsername('User');
      setProfilePic(Neko);
      return;
    };

    const unsubscribe = onUserDataChanged(user.uid, (data) => {
      if (!data) return;
      const storedPic = data.profilePic?.trim();
      const normalized = storedPic ? storedPic.charAt(0).toUpperCase() + storedPic.slice(1).toLowerCase() : '';
      if (normalized && profilePics[normalized]) {
        setProfilePic(profilePics[normalized]);
      } else {
        setProfilePic(Neko);
      }
      if (data.username) setUsername(data.username);
    });
    return () => unsubscribe();
  }, [user]);

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
      background: swalColors.background,
      color: swalColors.color,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await logout();
          Swal.fire({
            title: language === 'es' ? 'Sesión cerrada' : 'Logged out',
            text: language === 'es' ? 'Has cerrado tu sesión correctamente.' : 'You have successfully logged out.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: swalColors.background,
            color: swalColors.color,
          });
          navigate('/auth');
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: (language === 'es' ? 'No se pudo cerrar la sesión: ' : 'Could not log out: ') + error.message,
            icon: 'error',
            background: swalColors.background,
            color: swalColors.color,
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
    setCategoryMenuOpen(false);
  };

  // --- LÓGICA DE CAMBIO DE IDIOMA ---
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    
    // Si pasamos a español y la categoría actual no es válida (ej: software),
    // forzamos el cambio a 'animals' (la nueva por defecto).
    if (lang === 'es') {
        const currentCatObj = CATEGORIES.find(c => c.id === category);
        // Si no existe la categoría o no está permitida en español:
        if (!currentCatObj || !currentCatObj.allowedInEs) {
            if (setCategory) setCategory('animals'); 
        }
    }

    closeAllMenus();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: lang === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: swalColors.background,
      color: swalColors.color,
    });
  };

  const handleCategoryChange = (catId) => {
      if (setCategory) {
          setCategory(catId);
          closeAllMenus();
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'info',
            title: language === 'es' ? 'Categoría actualizada' : 'Category updated',
            showConfirmButton: false,
            timer: 1500,
            background: swalColors.background,
            color: swalColors.color,
          });
      }
  };

  const openHelp = () => {
      if (window.showWordyTutorial) {
        window.showWordyTutorial(isDark);
      }
      closeAllMenus();
  };

  // Filtrado visual del menú
  const visibleCategories = CATEGORIES.filter(cat => {
      if (language === 'en') return true;
      return cat.allowedInEs;
  });

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
        
        {/* --- Dropdown de Categorías --- */}
        <li
          className={styles.dropdown}
          onMouseEnter={() => setCategoryMenuOpen(true)}
          onMouseLeave={() => setCategoryMenuOpen(false)}
        >
          <div 
            className={styles.dropdownToggle}
            onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
          >
            <FontAwesomeIcon icon={faLayerGroup} className={styles.userIcon} style={{margin:0}} /> 
            <FontAwesomeIcon icon={categoryMenuOpen ? faCaretUp : faCaretDown} style={{marginLeft: '6px'}} />
          </div>

          {categoryMenuOpen && (
              <ul className={styles.dropdownMenu}>
                {visibleCategories.map((cat) => (
                    <li key={cat.id}>
                        <button
                            onClick={() => handleCategoryChange(cat.id)}
                            className={styles.dropdownItem}
                            style={{
                                fontWeight: category === cat.id ? 'bold' : 'normal',
                                color: category === cat.id ? '#6bb8ff' : 'inherit'
                            }}
                        >
                            {language === 'es' ? cat.label.es : cat.label.en}
                        </button>
                    </li>
                ))}
            </ul>
          )}
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
              <div className={styles.profileImageContainer}>
                <img 
                  src={profilePic} 
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <span style={{ 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                maxWidth: '100px' 
              }}>
                {username}
              </span>

              <FontAwesomeIcon icon={profileMenuOpen ? faCaretUp : faCaretDown} style={{ marginLeft: '8px' }}/>
            </div>

            {profileMenuOpen && (
              <ul className={styles.dropdownMenu}>
                <li><Link to="/profile" className={styles.dropdownItem} onClick={closeAllMenus}>{language === 'es' ? 'Mi Perfil' : 'My Profile'}</Link></li>
                
                <li>
                  <button onClick={openHelp} className={styles.dropdownItem}>
                    <FontAwesomeIcon icon={faQuestionCircle} style={{marginRight: '8px'}} />
                    {language === 'es' ? 'Ayuda' : 'Help'}
                  </button>
                </li>

                <li>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    <FontAwesomeIcon icon={faSignOutAlt} style={{marginRight: '8px'}} /> 
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
                  <button onClick={openHelp} className={styles.dropdownItem}>
                    <FontAwesomeIcon icon={faQuestionCircle} style={{marginRight: '8px'}} />
                    {language === 'es' ? 'Ayuda' : 'Help'}
                  </button>
                </li>

                <li>
                  <Link to="/auth" className={styles.dropdownItem} onClick={closeAllMenus}>
                    <FontAwesomeIcon icon={faSignInAlt} style={{marginRight: '8px'}} /> 
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