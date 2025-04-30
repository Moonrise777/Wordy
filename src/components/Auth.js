// src/components/Auth.js
import React, { useState } from "react";
import { signInWithGoogle, signInWithEmail, registerWithEmail, logout } from "../authService";
import "./Login.css";
const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
  
    const toggleForm = () => {
      setIsLogin(!isLogin);
    };
  
    return (
      <div className="wrapper">
        {isLogin ? (
          <div className="form-box login">
            <h2>Login</h2>
            <form>
              <div className="input-box">
                <span className="icon">
                  <ion-icon name="mail"></ion-icon>
                </span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-box">
                <span className="icon">
                  <ion-icon name="lock-closed"></ion-icon>
                </span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="button" onClick={() => signInWithEmail(email, password)}>
                Iniciar sesión
              </button>
              <button type="button" onClick={signInWithGoogle}>
                Iniciar sesión con Google
              </button>
              <p>
                ¿No tienes una cuenta?{" "}
                <a href="#" onClick={toggleForm}>
                  Regístrate
                </a>
              </p>
            </form>
          </div>
        ) : (
          <div className="form-box register">
            <h2>Register</h2>
            <form>
              <div className="input-box">
                <span className="icon">
                  <ion-icon name="mail"></ion-icon>
                </span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-box">
                <span className="icon">
                  <ion-icon name="lock-closed"></ion-icon>
                </span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="button" onClick={() => registerWithEmail(email, password)}>
                Registrarse
              </button>
              <p>
                ¿Ya tienes una cuenta?{" "}
                <a href="#" onClick={toggleForm}>
                  Inicia sesión
                </a>
              </p>
            </form>
          </div>
        )}
        <button type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    );
  };
  
  export default Auth;