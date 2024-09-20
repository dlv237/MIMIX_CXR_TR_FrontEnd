import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import './wordSelector.css';
import { useRef } from 'react';

function WordSelector({ sentence, disabled, variant, initialSelectedWords, onOptionClick }) {
  const [selectedWords, setSelectedWords] = useState([]);
  const onOptionClickRef = useRef(onOptionClick);

  useEffect(() => {
    onOptionClickRef.current = onOptionClick;
  }, [onOptionClick ]);

  const handleClick = (word, index, variant) => {
    const type = mapVariantToType(variant);
    const isWordSelected = selectedWords.some(
      (w) => w.word === word && w.index === index && w.type === type
    );
   
    const updatedSelectedWords = isWordSelected
      ? selectedWords.filter(
          (w) => !(w.word === word && w.index === index && w.type === type)
        )
      : [...selectedWords, { word, index, type }];
    if (!areArraysEqual(selectedWords, updatedSelectedWords)) {
      setSelectedWords(updatedSelectedWords);
    }
  };

  useEffect(() => {
    setSelectedWords(initialSelectedWords);
  }, [initialSelectedWords]);
  
  useEffect(() => {
    const updatedOptions = selectedWords.map((w) => ({
      word: { text: w.word, index: w.index },
      type: w.type,
    }));
    onOptionClickRef.current(updatedOptions);
  }, [selectedWords]);

  return (
    <div>
      <p>
        {sentence.split(/\s+/).map((word, index) => (
          <Button
            key={index}
            className={`word-selector-button ${variantClass(variant)} ${
              selectedWords.some(w => w.word === word && w.index === index && w.type === mapVariantToType(variant)) ? 'word-selector-button-selected' : ''
            }`}
            onClick={() => handleClick(word, index, variant)}
            disabled={disabled}
          >
            {word}{' '}
          </Button>
        ))}
      </p>
    </div>
  );
}

const areArraysEqual = (arr1, arr2) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

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

const variantClass = (variant) => {
  switch (variant) {
    case 'primary':
      return 'primary';
    case 'secondary':
      return 'secondary';
    case 'success':
      return 'success';
    case 'danger':
      return 'danger';
    case 'warning':
      return 'warning';
    default:
      return 'ligth';
  }
};

export default WordSelector;
