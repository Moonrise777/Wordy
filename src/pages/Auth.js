// src/components/Auth.js
import React, { useState } from "react";
import { signInWithGoogle, signInWithEmail, registerWithEmail, logout } from "../authService";
import "./Login.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isWrapperActive, setIsWrapperActive] = useState(false); // Nuevo estado para la clase 'active' del wrapper

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsWrapperActive(!isWrapperActive); // Cambia el estado del wrapper
  };

  return (
    <div className={`wrapper ${isWrapperActive ? 'active' : ''}`}> {/* Aplica la clase 'active' condicionalmente */}
      {isLogin ? (
        <div className="form-box login">
          <h2>Iniciar Sesión</h2>
          <form>
            <div className="input-box">
              <span className="icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <span className="icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="button" onClick={() => signInWithEmail(email, password)}>
              Iniciar sesión
            </button>
            <div className="auth-options">
              <button type="button" className="google-btn" onClick={signInWithGoogle}>
                <img src="/google-logo.webp" alt="Google" className="google-icon" />
                Iniciar sesión con Google
              </button>
            </div>
            <div className="link">
              ¿No tienes una cuenta? <a href="#" onClick={toggleForm}>Regístrate</a>
            </div>
          </form>
        </div>
      ) : (
        <div className="form-box register">
          <h2>Regístrate</h2>
          <form>
            <div className="input-box">
              <span className="icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <span className="icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="button" onClick={() => registerWithEmail(email, password)}>
              Registrarse
            </button>
            <div className="auth-options">
              <button type="button" className="google-btn" onClick={signInWithGoogle}>
                <img src="/google-logo.webp" alt="Google" className="google-icon" />
                Registrarse con Google
              </button>
            </div>
            <div className="link">
              ¿Ya tienes una cuenta? <a href="#" onClick={toggleForm}>Inicia sesión</a>
            </div>
          </form>
        </div>
      )}
      {/* <button type="button" onClick={logout}>
        Cerrar sesión
      </button> */}
    </div>
  );
};

export default Auth;