import React, { useState, useEffect } from 'react';
import { auth, db } from '../../web_vitals/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { saveProfile } from '../../web_vitals/authService';
import Dog from '@profilepics/dog.png';
import Hiyoko from '@profilepics/hiyoko.png';
import Neko from '@profilepics/neko.png';
import Penguin from '@profilepics/penguin.png';
import Swal from 'sweetalert2';

// Recibimos 'isDark' como prop
const Profile = ({ language, isDark }) => {
  const [selectedPic, setSelectedPic] = useState('Neko');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const pics = { Dog, Hiyoko, Neko, Penguin };

  // Definimos los colores para las alertas (Igual que en Navbar)
  const swalColors = {
    background: isDark ? '#1f1f1f' : '#ffffff',
    color: isDark ? '#ffffff' : '#545454'
  };

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setSelectedPic(data.profilePic || 'Neko');
        setUsername(data.username || 'User');
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await saveProfile(user.uid, {
        profilePic: selectedPic,
        username: username.trim() || 'User',
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: language === 'es' ? 'Perfil actualizado' : 'Profile updated',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        // Aplicamos los colores dinámicos
        background: swalColors.background,
        color: swalColors.color,
      });
    } catch (error) {
      console.error('Error al guardar perfil:', error);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: (language === 'es' ? 'Error al guardar: ' : 'Error saving: ') + error.message,
        showConfirmButton: true,
        // Aplicamos los colores dinámicos también en el error
        background: swalColors.background,
        color: swalColors.color,
      });
    }
  };

  if (loading) {
    return (
      <p style={{ textAlign: 'center', marginTop: '50px', color: isDark ? '#fff' : '#555' }}>
        {language === 'es' ? 'Cargando perfil...' : 'Loading profile...'}
      </p>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-extrabold mb-8 text-pink-400 drop-shadow-md">
        {language === 'es' ? '♡ Mi Perfil ♡' : '♡ My Profile ♡'}
      </h1>

      <div className={`${isDark ? 'bg-black/60' : 'bg-white/60'} rounded-2xl p-8 max-w-lg mx-auto shadow-lg transition-colors duration-300`}>
        <div className="mb-6">
          <label
            htmlFor="username"
            // Cambiamos el color del texto según el tema
            className={`block mb-2 font-semibold text-lg ${isDark ? 'text-blue-200' : 'text-blue-900'}`}
          >
            {language === 'es' ? 'Nombre de usuario:' : 'Username:'}
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            className={`px-4 py-2 rounded-xl border-2 w-3/4 text-center outline-none transition-colors
              ${isDark 
                ? 'bg-gray-700 border-gray-500 text-white focus:border-pink-300' 
                : 'bg-white border-gray-300 text-gray-800 focus:border-pink-300'
              }`}
          />
        </div>

        <p className={`font-semibold mb-2 text-base ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>
          {language === 'es' ? 'Selecciona tu foto de perfil:' : 'Select your profile picture:'}
        </p>
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          {Object.keys(pics).map((key) => (
            <img
              key={key}
              src={pics[key]}
              alt={key}
              onClick={() => setSelectedPic(key)}
              className={`w-24 h-24 rounded-full cursor-pointer transition-all transform
                ${selectedPic === key
                  ? 'border-4 border-pink-300 bg-pink-100 scale-105 shadow-lg'
                  : `border-2 border-blue-300 hover:scale-105 hover:shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}`}
            />
          ))}
        </div>

        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-xl font-semibold text-white
        bg-pink-400 shadow-md transition-all transform
        hover:bg-pink-500 hover:scale-105 hover:shadow-lg"
        >
          {language === 'es' ? 'Guardar' : 'Save'}
        </button>
      </div>
    </main>
  );
};

export default Profile;