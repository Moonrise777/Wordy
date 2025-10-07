import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { signInWithGoogle, signInWithEmail, onAuthStateChanged, registerWithEmail } from "../../web_vitals/authService";
import "../../pages/Login/Login.css";
import googleLogo from '@assets/google-logo.webp';

const Auth = ({ onLoginSuccess, language }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      if (currentUser) {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(true, currentUser);
        }
        navigate("/main");
      } else {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(false, null);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, onLoginSuccess]);

  const handleSwitch = (e) => {
    e.preventDefault();
    setIsSignup(!isSignup);
    setEmail("");
    setPassword("");
  };

  const handleError = (errorMessage) => {
    Swal.fire({
      icon: 'error',
      title: language === 'es' ? 'Vaya...' : 'Oops...',
      text: errorMessage,
      confirmButtonText: language === 'es' ? 'Entendido' : 'Got it'
    });
  };

  const handleSuccess = (successMessage) => {
    Swal.fire({
      icon: 'success',
      title: language === 'es' ? '¡Éxito!' : 'Success!',
      text: successMessage,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      navigate("/main");
      handleSuccess(language === 'es' ? "¡Inicio de sesión exitoso!" : "Login successful!");
    } catch (err) {
      let errorMessage;
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = language === 'es' ? "Usuario no encontrado. Por favor, verifica tu email." : "User not found. Please check your email.";
          break;
        case 'auth/wrong-password':
          errorMessage = language === 'es' ? "Contraseña incorrecta. Inténtalo de nuevo." : "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = language === 'es' ? "El formato del email no es válido." : "The email format is invalid.";
          break;
        case 'auth/too-many-requests':
          errorMessage = language === 'es' ? "Demasiados intentos fallidos. Por favor, inténtalo más tarde." : "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = err.message;
      }
      handleError(errorMessage);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await registerWithEmail(email, password);
      handleSuccess(language === 'es' ? "¡Registro exitoso! Ahora puedes iniciar sesión." : "Registration successful! You can now log in.");
      setIsSignup(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      let errorMessage;
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = language === 'es' ? "Este email ya está registrado. Por favor, inicia sesión o usa otro email." : "This email is already registered. Please log in or use another email.";
          break;
        case 'auth/invalid-email':
          errorMessage = language === 'es' ? "El formato del email no es válido." : "The email format is invalid.";
          break;
        case 'auth/weak-password':
          errorMessage = language === 'es' ? "La contraseña debe tener al menos 6 caracteres." : "The password must be at least 6 characters long.";
          break;
        default:
          errorMessage = err.message;
      }
      handleError(errorMessage);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate("/main");
      handleSuccess(language === 'es' ? "¡Inicio de sesión con Google exitoso!" : "Successful login with Google!");
    } catch (err) {
      let errorMessage;
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = language === 'es' ? "Ventana de inicio de sesión de Google cerrada." : "Google login window closed.";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = language === 'es' ? "Ya hay una ventana de inicio de sesión abierta." : "A login window is already open.";
          break;
        default:
          errorMessage = err.message;
      }
      handleError(errorMessage);
    }
  };

  return (
    <main>
      <div className="login-box">
        <div className="lb-header">
          <a href="#" className={!isSignup ? "active" : ""} onClick={handleSwitch} id="login-box-link">{language === 'es' ? 'Iniciar Sesión' : 'Login'}</a>
          <a href="#" className={isSignup ? "active" : ""} onClick={handleSwitch} id="signup-box-link">{language === 'es' ? 'Registrarse' : 'Sign Up'}</a>
        </div>
        <div className="social-login">
          <a href="#" onClick={handleGoogle}>
            <img
              src={googleLogo}
              alt="Google"
              style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}
            />
            {isSignup
              ? (language === 'es' ? "Registrarse con Google" : "Sign up with Google")
              : (language === 'es' ? "Iniciar sesión con Google" : "Sign in with Google")}
          </a>
        </div>

        {!isSignup && (
          <form className="email-login" onSubmit={handleLogin}>
            <div className="u-form-group">
              <input type="email" placeholder={language === 'es' ? 'Correo electrónico' : 'Email'} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="u-form-group">
              <input type="password" placeholder={language === 'es' ? 'Contraseña' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="u-form-group">
              <button type="submit">{language === 'es' ? 'Iniciar sesión' : 'Sign in'}</button>
            </div>
            <div className="u-form-group">
              <a href="#" className="forgot-password">{language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}</a>
            </div>
          </form>
        )}

        {isSignup && (
          <form className="email-signup" onSubmit={handleSignup}>
            <div className="u-form-group">
              <input type="email" placeholder={language === 'es' ? 'Correo electrónico' : 'Email'} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="u-form-group">
              <input type="password" placeholder={language === 'es' ? 'Contraseña' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="u-form-group">
              <input type="password" placeholder={language === 'es' ? 'Confirmar contraseña' : 'Confirm password'} />
            </div>
            <div className="u-form-group">
              <button type="submit">{language === 'es' ? 'Registrarse' : 'Sign up'}</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default Auth;
