import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "./Main.css";
import IconWordy from "../../assets/Icon_Wordy.png";

const API_URL = "https://random-words-api.kushcreates.com/api";

const Main = ({ language }) => {
  const [word, setWord] = useState("");
  const [loadingWord, setLoadingWord] = useState(true);
  const [grid, setGrid] = useState(Array(5).fill(Array(5).fill("")));
  const [currentRow, setCurrentRow] = useState(0);
  const previousWords = useRef(new Set());
  const maxAttempts = 5;
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('wordyTutorialSeen');
    if (!hasSeenTutorial) {
      showTutorial();
      localStorage.setItem('wordyTutorialSeen', 'true');
    }
  }, []);

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
    window.showWordyTutorial = showTutorial;
    return () => {
      delete window.showWordyTutorial;
    };
  }, [language]);

  const fetchWord = async (lang) => {
    setLoadingWord(true);
    try {
      const apiLang = lang === "es" ? "es" : "en";
      const url = `${API_URL}?language=${apiLang}&length=5&type=uppercase&words=1`;
      const resp = await fetch(url);
      const data = await resp.json();

      let candidate =
        Array.isArray(data) && data.length > 0 && data[0].word
          ? data[0].word
          : null;
      let newWord = candidate ? candidate.toUpperCase() : null;

      let attempts = 0;
      while (
        (!newWord || previousWords.current.has(newWord)) &&
        attempts < 5
      ) {
        const retry = await fetch(url);
        const retryData = await retry.json();
        const w =
          Array.isArray(retryData) &&
          retryData.length > 0 &&
          retryData[0].word
            ? retryData[0].word
            : null;
        newWord = w ? w.toUpperCase() : null;
        attempts++;
      }

      if (!newWord) newWord = lang === "es" ? "CASAS" : "APPLE";

      previousWords.current.add(newWord);
      setWord(newWord);
      setGrid(Array(5).fill(null).map(() => Array(5).fill("")));
      setCurrentRow(0);
    } catch (err) {
      console.error("Error al obtener palabra:", err);
      setWord(lang === "es" ? "MASAS" : "APPLE");
      setGrid(Array(5).fill(null).map(() => Array(5).fill("")));
      setCurrentRow(0);
    } finally {
      setLoadingWord(false);
    }
  };

  useEffect(() => {
    fetchWord(language);
  }, [language]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loadingWord) return;

      if (e.key === "Enter") {
        handleSubmit();
      } else if (/^[a-zA-ZñÑ]$/.test(e.key)) {
        addLetter(e.key.toUpperCase());
      } else if (e.key === "Backspace") {
        removeLetter();
      }
    };
    
    const inputElement = hiddenInputRef.current;
    if (inputElement) {
        inputElement.addEventListener("keydown", handleKeyDown);
    }

    return () => {
        if (inputElement) {
            inputElement.removeEventListener("keydown", handleKeyDown);
        }
    };
  });

  const focusInput = () => {
    hiddenInputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, [loadingWord]);

  const addLetter = (letter) => {
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      const idx = newGrid[currentRow].findIndex((l) => l === "");
      if (idx !== -1) newGrid[currentRow][idx] = letter;
      return newGrid;
    });
  };

  const removeLetter = () => {
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      const idx = newGrid[currentRow].findLastIndex((l) => l !== "");
      if (idx !== -1) newGrid[currentRow][idx] = "";
      return newGrid;
    });
  };

  const handleSubmit = () => {
    if (loadingWord) return;

    const guessWord = grid[currentRow].join("");
    if (guessWord.length < 5) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: language === 'es' ? "La palabra debe tener 5 letras" : "Word must have 5 letters",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (guessWord === word) {
      Swal.fire({
        title: language === 'es' ? "¡Ganaste!" : "You won!",
        text: language === 'es' ? `La palabra era ${word}` : `The word was ${word}`,
        icon: "success",
        allowOutsideClick: true,
        allowEscapeKey: false, 
        allowEnterKey: false,
        confirmButtonColor: '#f9a8d4',
      }).then(() => fetchWord(language));
      return;
    }

    if (currentRow + 1 === maxAttempts) {
      Swal.fire({
        title: language === 'es' ? "Perdiste" : "You lost",
        text: language === 'es' ? `La palabra era ${word}` : `The word was ${word}`,
        icon: "error",
        allowOutsideClick: true,
        allowEscapeKey: false, 
        allowEnterKey: false,
        confirmButtonColor: '#f9a8d4',
      }).then(() => fetchWord(language));
      return;
    }

    setCurrentRow((r) => r + 1);
  };

  const getLetterColor = (letter, index, rowIndex) => {
    if (rowIndex >= currentRow) return "transparent";
    if (word[index] === letter) return "green";
    if (word.includes(letter)) return "goldenrod";
    return "crimson";
  };
  
  return (
    <div className="wordle-container" onClick={focusInput}>
      <input
        ref={hiddenInputRef}
        type="text"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          opacity: 0,
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

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
                    className={`guess-cell ${
                      rowIndex === currentRow ? "active" : "inactive"
                    }`}
                    style={{
                      backgroundColor: getLetterColor(letter, colIndex, rowIndex),
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} className="submit-btn">
            {language === 'es' ? 'Enviar' : 'Submit'}
          </button>
        </>
      )}
    </div>
  );
};

export default Main;