import { useEffect, useRef, useState } from 'react';

function AcronymSelector({ options, selectedOption, setSelectedOption }) {
  const [sliderStyle, setSliderStyle] = useState({});
  const buttonsRef = useRef([]);

  const handleClick = (option) => (event) => {
    event.stopPropagation();
    setSelectedOption(option);
  }

  useEffect(() => {
    const selectedIndex = options.indexOf(selectedOption);
    if (buttonsRef.current[selectedIndex]) {
      const button = buttonsRef.current[selectedIndex];
      setSliderStyle({
        width: `${button.offsetWidth}px`,
        transform: `translateX(${button.offsetLeft}px)`,
      });
    }
  }, [selectedOption, options]);

  return (
    <div>
      <hr className="my-3" />
      <div className="flex flex-row justify-start items-center my-2">
        <p className='text-sm'>¿Hay error causado por acrónimos o abreviaciones?</p>
        <div className="relative inline-flex items-center border border-gray-300 rounded-lg overflow-hidden ml-5">
          <div
            className="absolute h-full bg-blue-500 transition-all duration-300 ease-in-out rounded-md"
            style={sliderStyle}
          ></div>
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              ref={(el) => (buttonsRef.current[index] = el)}
              onClick={handleClick(option)}
              className={`relative z-10 px-2 py-1 font-medium transition-colors bg-transparent text-sm ${
                selectedOption === option ? 'text-white' : 'text-gray-700'
              }`}
            >
              <p className='text-sm'>
                {option}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AcronymSelector;
