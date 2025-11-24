import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../../web_vitals/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faCrown } from '@fortawesome/free-solid-svg-icons';
import './Leaderboard.css'; 

// Importamos las imágenes
import Dog from '@profilepics/dog.png';
import Hiyoko from '@profilepics/hiyoko.png';
import Neko from '@profilepics/neko.png';
import Penguin from '@profilepics/penguin.png';

const profilePics = { Dog, Hiyoko, Neko, Penguin };

const Leaderboard = ({ language, isDark }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaderboard();
      setLeaders(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Función para obtener el ícono del rango
  const getRankIcon = (index) => {
    if (index === 0) return <FontAwesomeIcon icon={faCrown} className="icon-gold" />; 
    if (index === 1) return <FontAwesomeIcon icon={faMedal} className="icon-silver" />;   
    if (index === 2) return <FontAwesomeIcon icon={faMedal} className="icon-bronze" />; 
    return <span className="rank-text">#{index + 1}</span>;
  };

  // Función auxiliar para clase de borde según rango
  const getRankClass = (index) => {
    if (index === 0) return 'rank-1';
    if (index === 1) return 'rank-2';
    if (index === 2) return 'rank-3';
    return '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p style={{ color: isDark ? 'white' : '#4b5563' }}>
          {language === 'es' ? 'Cargando ranking...' : 'Loading leaderboard...'}
        </p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">
        <FontAwesomeIcon icon={faTrophy} />
        {language === 'es' ? 'Tabla de Clasificación' : 'Leaderboard'}
      </h1>

      <div className={`leaderboard-card ${isDark ? 'card-dark' : 'card-light'}`}>
        {leaders.length === 0 ? (
          <p className="empty-message">
            {language === 'es' ? 'Aún no hay jugadores con puntos.' : 'No players with points yet.'}
          </p>
        ) : (
          <ul className="leaderboard-list">
            {leaders.map((player, index) => {
              // Normalizar nombre de la foto
              const picName = player.profilePic 
                ? player.profilePic.charAt(0).toUpperCase() + player.profilePic.slice(1).toLowerCase() 
                : 'Neko';
              const imgSrc = profilePics[picName] || profilePics.Neko;

              return (
                <li 
                  key={player.id} 
                  className={`leaderboard-item ${isDark ? 'item-dark' : 'item-light'} ${getRankClass(index)}`}
                >
                  <div className="player-info-left">
                    <div className="rank-icon">{getRankIcon(index)}</div>
                    
                    <img 
                      src={imgSrc} 
                      alt="Profile" 
                      className="profile-img"
                    />
                    
                    <div className="player-details">
                      <span className="player-name">
                        {player.username || 'User'}
                      </span>
                      {index === 0 && (
                        <span className="leader-badge">
                          {language === 'es' ? '¡Líder!' : 'Leader!'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="player-score-right">
                    <span className="score-value">
                      {player.score || 0}
                    </span>
                    <span className="score-label">pts</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;