import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import "./Main.css";
import IconWordy from "../../assets/Icon_Wordy.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';

const API_URL = "https://random-words-api.kushcreates.com/api";

// Componente del Teclado Virtual
const Keyboard = ({ layout, onKeyPress, keyColors }) => (
  <div className="keyboard">
    {layout.map((row, rowIndex) => (
      <div key={rowIndex} className="keyboard-row">
        {row.map((key) => {
          const keyState = keyColors[key] || '';
          const keyClass = `key ${keyState} ${key.length > 1 ? 'wide' : ''}`;
          return (
            <button key={key} className={keyClass} onClick={() => onKeyPress(key)}>
              {key === 'BACKSPACE' ? <FontAwesomeIcon icon={faDeleteLeft} /> : key}
            </button>
          );
        })}
      </div>
    ))}
  </div>
);

const Main = ({ language }) => {
  const [word, setWord] = useState("");
  const [loadingWord, setLoadingWord] = useState(true);
  const [grid, setGrid] = useState(Array(5).fill(Array(5).fill("")));
  const [colors, setColors] = useState(Array(5).fill(Array(5).fill("transparent")));
  const [currentRow, setCurrentRow] = useState(0);
  const [keyColors, setKeyColors] = useState({});
  const previousWords = useRef(new Set());
  const maxAttempts = 5;

  const keyboardLayouts = {
    es: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ],
    en: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ]
  };
  
  const showTutorial = () => {
    const tutorialText = language === 'es'
      ? `
        <div style="text-align: left;">
          <div style="text-align: center; margin-bottom: 5px;">
             <img src="${IconWordy}" alt="Wordy" style="display: block; margin: auto; width: 100px; height: 100px;" />
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
             <img src="${IconWordy}" alt="Wordy" style="display: block; margin: auto; width: 100px; height: 100px;" />
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
  };

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('wordyTutorialSeen');
    if (!hasSeenTutorial) {
      showTutorial();
      localStorage.setItem('wordyTutorialSeen', 'true');
    }
  }, [language]);

  useEffect(() => {
    window.showWordyTutorial = showTutorial;
    return () => {
      delete window.showWordyTutorial;
    };
  }, [language]);

  const fetchWord = useCallback(async (lang) => {
    setLoadingWord(true);
    try {
      const apiLang = lang === "es" ? "es" : "en";
      const url = `${API_URL}?language=${apiLang}&length=5&type=uppercase&words=1`;
      const resp = await fetch(url);
      const data = await resp.json();
      let newWord = data?.[0]?.word?.toUpperCase();

      let attempts = 0;
      while ((!newWord || previousWords.current.has(newWord)) && attempts < 5) {
        const retryResp = await fetch(url);
        const retryData = await retryResp.json();
        newWord = retryData?.[0]?.word?.toUpperCase();
        attempts++;
      }
      if (!newWord) newWord = lang === "es" ? "CASAS" : "APPLE";
      
      previousWords.current.add(newWord);
      setWord(newWord);
      setGrid(Array(5).fill(Array(5).fill("")));
      setColors(Array(5).fill(Array(5).fill("transparent")));
      setCurrentRow(0);
      setKeyColors({});
    } catch (err) {
      console.error("Error al obtener palabra:", err);
      setWord(lang === "es" ? "MASAS" : "APPLE");
    } finally {
      setLoadingWord(false);
    }
  }, []);

  useEffect(() => {
    fetchWord(language);
  }, [language, fetchWord]);

  const handleSubmit = useCallback(() => {
    if (loadingWord || currentRow >= maxAttempts) return;
    const guessWord = grid[currentRow].join("");

    if (guessWord.length < 5) {
      Swal.fire({ toast: true, position: "top-end", icon: "warning", title: language === 'es' ? "La palabra debe tener 5 letras" : "Word must have 5 letters", showConfirmButton: false, timer: 2000 });
      return;
    }

    const rowColors = Array(5).fill('transparent');
    const guessLetters = guessWord.split('');
    const wordLetters = word.split('');
    const letterStatus = {};

    guessLetters.forEach((letter, index) => {
      if (wordLetters[index] === letter) {
        rowColors[index] = '#6aaa64';
        letterStatus[letter] = 'correct';
        wordLetters[index] = null;
      }
    });

    guessLetters.forEach((letter, index) => {
      if (rowColors[index] === 'transparent' && wordLetters.includes(letter)) {
        rowColors[index] = '#c9b458';
        if (letterStatus[letter] !== 'correct') letterStatus[letter] = 'present';
        wordLetters[wordLetters.indexOf(letter)] = null;
      }
    });
    
    guessLetters.forEach((letter, index) => {
      if (rowColors[index] === 'transparent') {
        rowColors[index] = '#787c7e';
        if (!letterStatus[letter]) letterStatus[letter] = 'absent';
      }
    });

    setColors(prevColors => {
      const newColorsState = [...prevColors];
      newColorsState[currentRow] = rowColors;
      return newColorsState;
    });

    setKeyColors(prevKeyColors => {
      const updatedKeyColors = { ...prevKeyColors };
      Object.keys(letterStatus).forEach(letter => {
        if (updatedKeyColors[letter] !== 'correct') {
          updatedKeyColors[letter] = letterStatus[letter];
        }
      });
      return updatedKeyColors;
    });

    const isWin = guessWord === word;
    if (isWin || currentRow + 1 === maxAttempts) {
      setTimeout(() => {
        Swal.fire({
          title: isWin ? (language === 'es' ? "¡Ganaste!" : "You won!") : (language === 'es' ? "Perdiste" : "You lost"),
          text: language === 'es' ? `La palabra era ${word}` : `The word was ${word}`,
          icon: isWin ? "success" : "error",
          allowOutsideClick: true,
          allowEscapeKey: false,
          confirmButtonText: language === 'es' ? 'Jugar de nuevo' : 'Play Again',
          confirmButtonColor: '#f9a8d4'
        }).then((result) => {
          if (result.isConfirmed) {
            fetchWord(language);
          }
        });
      }, 500); // Pequeño delay para que la alerta no se sienta abrupta
      return;
    }
    setCurrentRow((r) => r + 1);
  }, [currentRow, grid, language, word, loadingWord, maxAttempts, fetchWord, keyColors]);

  const handleKeyPress = useCallback((key) => {
    if (currentRow >= maxAttempts || loadingWord) return;

    if (key === 'ENTER') {
      handleSubmit();
    } else if (key === 'BACKSPACE') {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => [...r]);
        const row = newGrid[currentRow];
        const lastFilledIndex = row.findLastIndex(l => l !== '');
        if (lastFilledIndex !== -1) {
          row[lastFilledIndex] = '';
        }
        return newGrid;
      });
    } else if (/^[A-ZÑ]$/.test(key)) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => [...r]);
        const row = newGrid[currentRow];
        const firstEmptyIndex = row.findIndex(l => l === '');
        if (firstEmptyIndex !== -1) {
          row[firstEmptyIndex] = key;
        }
        return newGrid;
      });
    }
  }, [currentRow, maxAttempts, loadingWord, handleSubmit, grid]);

  useEffect(() => {
    const handlePhysicalKeyboard = (e) => {
      let key = e.key.toUpperCase();
      if (key === 'BACKSPACE' || key === 'ENTER' || (/^[A-ZÑ]$/.test(key) && key.length === 1)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handlePhysicalKeyboard);
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard);
  }, [handleKeyPress]);
  
  return (
    <div className="wordle-container">
      {loadingWord ? (
        <p>{language === 'es' ? 'Cargando palabra...' : 'Loading word...'}</p>
      ) : (
        <>
          <div className="board">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="guess-row">
                {row.map((letter, colIndex) => (
                  <div
                    key={colIndex}
                    className={`guess-cell ${rowIndex === currentRow ? 'active-row' : ''}`}
                    style={{ 
                      backgroundColor: colors[rowIndex][colIndex],
                      borderColor: colors[rowIndex][colIndex] !== 'transparent' ? 'transparent' : ''
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Keyboard 
            layout={keyboardLayouts[language]} 
            onKeyPress={handleKeyPress} 
            keyColors={keyColors} 
          />
        </>
      )}
    </div>
  );
};

export default Main;