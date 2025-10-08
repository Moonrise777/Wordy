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
  


const fetchWord = useCallback(async (lang) => {
    setLoadingWord(true);
    try {
      const apiLang = lang === "es" ? "es" : "en";
      const url = `${API_URL}?language=${apiLang}&length=5&type=uppercase&words=1`;
      let newWord = null;
      let attempts = 0;

      while ((!newWord || previousWords.current.has(newWord) || (lang === "es" && /[ÁÉÍÓÚ]/.test(newWord))) && attempts < 10) {
        const retryResp = await fetch(url);
        const retryData = await retryResp.json();
        newWord = retryData?.[0]?.word?.toUpperCase();
        attempts++;
      }
      
      if (!newWord || (lang === "es" && /[ÁÉÍÓÚ]/.test(newWord))) {
        newWord = lang === "es" ? "CASAS" : "APPLE";
      }
      
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

    const rowColors = Array(5).fill('crimson'); // ✅ Letras incorrectas son rojas por defecto
    const guessLetters = guessWord.split('');
    const wordLetters = word.split('');
    const letterStatus = {};

    guessLetters.forEach((letter, index) => {
      if (wordLetters[index] === letter) {
        rowColors[index] = '#6aaa64'; // Verde
        letterStatus[letter] = 'correct';
        wordLetters[index] = null;
      }
    });

    guessLetters.forEach((letter, index) => {
      if (rowColors[index] !== '#6aaa64' && wordLetters.includes(letter)) {
        rowColors[index] = '#c9b458'; // Amarillo
        if (letterStatus[letter] !== 'correct') letterStatus[letter] = 'present';
        wordLetters[wordLetters.indexOf(letter)] = null;
      }
    });
    
    setColors(prevColors => {
      const newColorsState = [...prevColors];
      newColorsState[currentRow] = rowColors;
      return newColorsState;
    });

    setKeyColors(prevKeyColors => {
      const updatedKeyColors = { ...prevKeyColors };
      guessLetters.forEach(letter => {
        if (!word.includes(letter) && !updatedKeyColors[letter]) {
          updatedKeyColors[letter] = 'absent'; // Gris para el teclado
        }
      });
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
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: language === 'es' ? 'Jugar de nuevo' : 'Play Again',
          confirmButtonColor: '#f9a8d4'
        }).then((result) => {
          if (result.isConfirmed) {
            fetchWord(language);
          }
        });
      }, 500);
      return;
    }
    setCurrentRow((r) => r + 1);
  }, [currentRow, grid, language, word, loadingWord, maxAttempts, fetchWord]);

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
  }, [currentRow, maxAttempts, loadingWord, handleSubmit]);

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
              <div key={rowIndex} className={`guess-row ${rowIndex === currentRow ? 'active-row' : ''}`}>
                {row.map((letter, colIndex) => (
                  <div
                    key={colIndex}
                    className="guess-cell"
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