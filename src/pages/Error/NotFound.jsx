import React from 'react';
import Neko from '../../assets/Neko.png';
import Dango from '../../assets/Dango.png';
import MilkS from '../../assets/SB_milkshake.png';
import './NotFound.css';

const NotFound = () => {
  return (
    <div>
      <h1 className="not-found-heading">Página No encontrada :c </h1>
      <div className="main-container">
        <img src={Neko} alt="Gato Triste" className="neko"></img> {/* Clase específica para el gato */}
        <div className="right-container"> {/* Contenedor para el dango y la malteada */}
          <img src={Dango} alt="Dango"></img>
          <img src={MilkS} alt="Batido de Fresa"></img>
        </div>
      </div>
    </div>
  );
};

export default NotFound;