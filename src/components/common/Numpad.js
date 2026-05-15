import React from 'react';
import './Numpad.css';

const Numpad = ({ onChange, value, maxLength = 4 }) => {
  const handleKey = (key) => {
    if (key === 'clear') {
      onChange('');
    } else if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (value.length < maxLength) {
      onChange(value + key);
    }
  };

  return (
    <div className="numpad">
      {[1,2,3,4,5,6,7,8,9,0].map(num => (
        <button key={num} className="numpad-key" onClick={() => handleKey(num.toString())}>
          {num}
        </button>
      ))}
      <button className="numpad-key clear" onClick={() => handleKey('clear')}>C</button>
    </div>
  );
};

export default Numpad;