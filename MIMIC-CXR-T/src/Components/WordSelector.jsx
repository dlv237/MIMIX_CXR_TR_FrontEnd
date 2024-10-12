import { useState, useEffect, useRef } from 'react';
import './wordSelector.css';

function WordSelector({ sentence, disabled, variant, initialSelectedWords, onOptionClick }) {
  const [selectedWords, setSelectedWords] = useState([]);
  const highlightColor = 'rgba(255, 255, 0, 0.5)';
  const onOptionClickRef = useRef(onOptionClick);
  const sentenceRef = useRef(null);

  useEffect(() => {
    onOptionClickRef.current = onOptionClick;
  }, [onOptionClick]);

  useEffect(() => {
    setSelectedWords(initialSelectedWords);
    highlightInitialSelectedWords(initialSelectedWords);
  }, [initialSelectedWords]);

  useEffect(() => {
    const updatedOptions = selectedWords.map((w) => ({
      word: { text: w.word, index: w.index },
      type: w.type,
    }));
    onOptionClickRef.current(updatedOptions);
  }, [selectedWords]);

  const highlightInitialSelectedWords = (words) => {
    words.forEach(({ word, index, type }) => {
      if (type === mapVariantToType(variant)) {
        const wordElements = sentenceRef.current.childNodes;
        const wordElement = wordElements[index]; // Obtener el elemento correspondiente a la palabra
        if (wordElement) {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = highlightColor;
          mark.textContent = wordElement.textContent; // Agregar el texto
          wordElement.replaceWith(mark); // Reemplazar el elemento original
        }
      }
    });
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      if (selectedText) {
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        const findWordBoundary = (node, offset, direction) => {
          const text = node.textContent;
          if (direction === 'start') {
            while (offset > 0 && text[offset - 1] !== ' ') {
              offset--;
            }
          } else {
            while (offset < text.length && text[offset] !== ' ') {
              offset++;
            }
          }
          return offset;
        };

        // Ajustar startContainer y endContainer
        let startOffset = findWordBoundary(startContainer, range.startOffset, 'start');
        let endOffset = findWordBoundary(endContainer, range.endOffset, 'end');

        // Crear un nuevo rango que abarque desde startContainer hasta endContainer
        const newRange = document.createRange();
        newRange.setStart(startContainer, startOffset);
        newRange.setEnd(endContainer, endOffset);

        // Resaltar el contenido del nuevo rango
        const wordsInRange = newRange.cloneContents();
        const mark = document.createElement('mark');
        mark.style.backgroundColor = highlightColor;
        mark.appendChild(wordsInRange);
        newRange.deleteContents();
        newRange.insertNode(mark);

        // Actualizar las palabras seleccionadas, excluyendo los espacios
        updateSelectedWords();
      }
      selection.removeAllRanges();
    }
  };

  const updateSelectedWords = () => {
    const marks = sentenceRef.current.querySelectorAll('mark');
    const updatedSelectedWords = [];

    // Obtener todas las palabras de la oración
    const allWords = sentence.split(/\s+/);

    marks.forEach((mark) => {
      const markedText = mark.textContent;
      const words = markedText.split(/\s+/);

      let currentIndex = 0; // Para rastrear el índice en allWords
      words.forEach((word) => {
        if (word) {
          // Encontrar el índice global de la palabra
          while (currentIndex < allWords.length && allWords[currentIndex] !== word) {
            currentIndex++;
          }
          
          updatedSelectedWords.push({
            word,
            index: currentIndex, // Usar el índice correcto
            type: mapVariantToType(variant),
          });
        }
      });
    });

    setSelectedWords(updatedSelectedWords);
    console.log(updatedSelectedWords);
  };

  return (
    <div>
      <p ref={sentenceRef} onMouseUp={handleMouseUp}>
        {sentence.split(/\s+/).map((word, index) => (
          <span key={index} className="word-selector-word">
            {word}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

const mapVariantToType = (variant) => {
  switch (variant) {
    case 'primary':
      return 'terminological';
    case 'secondary':
      return 'grammatical';
    case 'success':
      return 'grammatical';
    case 'warning':
      return 'functional';
    case 'danger':
      return 'other';
    default:
      return 'other';
  }
};

export default WordSelector;
