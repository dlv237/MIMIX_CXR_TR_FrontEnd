import { useState, useEffect, useRef } from 'react';
import './wordSelector.css';

function WordSelector({ sentence, variant, initialSelectedWords, onOptionClick }) {
  const [selectedWords, setSelectedWords] = useState([]);
  const highlightColor = mapVariantToColor(variant);
  const onOptionClickRef = useRef(onOptionClick);
  const sentenceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    onOptionClickRef.current = onOptionClick;
  }, [onOptionClick]);

  useEffect(() => {
    // Estilo para resaltar palabras seleccionadas
    const style = document.createElement('style');
    style.innerHTML = `
      ${containerRef.current ? `#${containerRef.current.id} ::selection` : '::selection'} {
        background-color: ${highlightColor};
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [highlightColor]);

  useEffect(() => {
    const filteredWords = initialSelectedWords.filter(
      (word) => word.type === mapVariantToType(variant)
    );
    setSelectedWords(filteredWords);
    highlightInitialSelectedWords(filteredWords);
  }, [initialSelectedWords]);

  useEffect(() => {
    const updatedOptions = selectedWords.map((w) => ({
      word: { text: w.word, index: w.index },
      type: w.type,
    }));
    onOptionClickRef.current(updatedOptions);
  }, [selectedWords]);

  const highlightInitialSelectedWords = (words) => {
    words.forEach(({ index, type }) => {
      if (type === mapVariantToType(variant)) {
        const wordElements = sentenceRef.current.childNodes;
        const wordElement = wordElements[index];
        if (wordElement) {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = highlightColor;
          mark.textContent = wordElement.textContent;
          wordElement.replaceWith(mark);
        }
      }
    });
  };

  const unhighlightWords = () => {
    const marks = sentenceRef.current.querySelectorAll('mark');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });
  };

  const isTextNode = (node) => node && node.nodeType === Node.TEXT_NODE;

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = sentenceRef.current;

      if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText && isTextNode(selection.focusNode)) {
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        const adjustOffset = (node, offset, direction) => {
          const text = node.textContent || '';
          if (direction === 'start') {
            while (offset > 0 && text[offset - 1] !== ' ') offset--;
          } else if (direction === 'end') {
            while (offset < text.length && text[offset] !== ' ') offset++;
          }
          return offset;
        };

        const startOffset = adjustOffset(startContainer, range.startOffset, 'start');
        const endOffset = adjustOffset(endContainer, range.endOffset, 'end');

        const newRange = document.createRange();
        newRange.setStart(startContainer, startOffset);
        newRange.setEnd(endContainer, endOffset);

        const wordsInRange = newRange.cloneContents();
        const mark = document.createElement('mark');
        mark.style.backgroundColor = highlightColor;
        mark.appendChild(wordsInRange);
        newRange.deleteContents();
        newRange.insertNode(mark);

        updateSelectedWords();
      }
      selection.removeAllRanges();
    }
  };

  const updateSelectedWords = () => {
    const marks = sentenceRef.current.querySelectorAll('mark');
    const updatedSelectedWords = [];

    const allWords = sentence.split(/\s+/);
    const seenWords = new Set();

    marks.forEach((mark) => {
      const markedText = mark.textContent;
      const words = markedText.split(/\s+/);

      let startIndex = 0;

      words.forEach((word) => {
        if (word) {
          for (let currentIndex = startIndex; currentIndex < allWords.length; currentIndex++) {
            if (allWords[currentIndex] === word && !seenWords.has(`${word}-${currentIndex}`)) {
              updatedSelectedWords.push({
                word,
                index: currentIndex,
                type: mapVariantToType(variant),
              });
              seenWords.add(`${word}-${currentIndex}`);
              startIndex = currentIndex + 1;
              break;
            }
          }
        }
      });
    });

    setSelectedWords(updatedSelectedWords);
  };

  const handleUndoSelection = () => {
    setSelectedWords([]);
  };

  useEffect(() => {
    if (selectedWords.length === 0) {
      unhighlightWords();
    }
  }, [selectedWords]);

  return (
    <div ref={containerRef} id={`word-selector-${variant}`} className='flex flex-row justify-between'>
      <p ref={sentenceRef} onMouseUp={handleMouseUp}>
        {sentence.split(/\s+/).map((word, index) => (
          <span key={index} className="word-selector-word">
            {word}{' '}
          </span>
        ))}
      </p>
      <button 
        className='bg-white cursor-auto hover: none focus:outline-none focus:ring-0' 
        disabled={selectedWords.length === 0}
        onClick={handleUndoSelection}
      >
        <svg 
          className={`w-6 h-6 ${selectedWords.length === 0 ? 'text-gray-300' : 'text-gray-800'}`} 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4"
          />
        </svg>
      </button>
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

const mapVariantToColor = (variant) => {
  switch (variant) {
    case 'primary':
      return 'lightblue';
    case 'secondary':
      return 'lightgreen';
    case 'success':
      return 'lightgreen';
    case 'warning':
      return 'gold';
    case 'danger':
      return 'lightred';
    default:
      return 'lightgrey';
  }
};

export default WordSelector;