import { useState, useEffect, useRef } from 'react';
import './wordSelector.css';

function WordSelector({ sentence, disabled, variant, initialSelectedWords, onOptionClick }) {
  const [selectedWords, setSelectedWords] = useState([]);
  const highlightColor = mapVariantToColor(variant);
  const onOptionClickRef = useRef(onOptionClick);
  const sentenceRef = useRef(null);

  useEffect(() => {
    onOptionClickRef.current = onOptionClick;
  }, [onOptionClick]);

  useEffect(() => {
    const filteredInitialSelectedWords = initialSelectedWords.filter(word => word.type === mapVariantToType(variant));
    setSelectedWords(filteredInitialSelectedWords);
    highlightInitialSelectedWords(filteredInitialSelectedWords);
    console.log("inicial", filteredInitialSelectedWords);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          mark.style.padding = '0';
          mark.style.margin = '0';
          mark.style.display = 'inline';
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

        let startOffset = findWordBoundary(startContainer, range.startOffset, 'start');
        let endOffset = findWordBoundary(endContainer, range.endOffset, 'end');

        const newRange = document.createRange();
        newRange.setStart(startContainer, startOffset);
        newRange.setEnd(endContainer, endOffset);


        const wordsInRange = newRange.cloneContents();
        const mark = document.createElement('mark');
        mark.style.backgroundColor = highlightColor;
        mark.style.padding = '0';
        mark.style.margin = '0';
        mark.style.display = 'inline';
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
  
      let currentIndex = 0;
      words.forEach((word) => {
        if (word) {
          while (currentIndex < allWords.length && allWords[currentIndex] !== word) {
            currentIndex++;
          }
  
          const wordKey = `${word}-${currentIndex}`;
          if (!seenWords.has(wordKey)) {
            updatedSelectedWords.push({
              word,
              index: currentIndex,
              type: mapVariantToType(variant),
            });
            seenWords.add(wordKey);
          }
        }
      });
    });
  
    setSelectedWords(updatedSelectedWords);
    console.log(updatedSelectedWords);
  };

  const handleUndoSelection = () => {
    setSelectedWords([]);
  };

  useEffect(() => {
    if (selectedWords.length === 0) {
      unhighlightWords();
      console.log(selectedWords);
    }
  }, [selectedWords]);

  return (
    <div className='flex flex-row justify-between'>
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
        onClick={() => handleUndoSelection()}
        style={{ pointerEvents: 'auto' }}
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
