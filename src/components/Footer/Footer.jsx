import React from 'react';
import styles from './Footer.module.scss'; // Importa los estilos modulares

const Footer = ({ language }) => {
  const currentYear = new Date().getFullYear();
  const portfolioURL = 'https://github.com/Moonrise777/ArelyPortfolio.git';

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>
          &copy; {currentYear} Wordy. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>
        <div className={styles.links}>
          <a 
            href={portfolioURL} 
            className={styles.link} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {language === 'es' ? 'Contacto' : 'Contact'}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

