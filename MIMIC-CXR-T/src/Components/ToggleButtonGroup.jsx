import { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

function ToggleButtonGroup({ acrSelected, onToggleChange }) {
  const [radioValue, setRadioValue] = useState(acrSelected);

  const radios = [
    { name: 'No', value: '1' },
    { name: 'Si', value: '3' },
  ];

  const handleToggleChange = (value) => {
    setRadioValue(value);
    onToggleChange(value);
  };

  return (
    <>
      <ButtonGroup>
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            id={`radio-${idx}`}
            type="radio"
            variant={idx % 2 ? 'outline-success' : 'outline-danger'}
            name="radio"
            value={radio.value}
            checked={radioValue === radio.value}
            onChange={(e) => handleToggleChange(e.currentTarget.value)}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </>
  );
}

export default ToggleButtonGroup;
