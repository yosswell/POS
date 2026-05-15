import React, { useState } from 'react';
import Numpad from './Numpad';
import { useAppContext } from '../../context/AppContext';
import db, { TABLES } from '../../db/dexieDB';
import Modal from './Modal';

const PinModal = ({ isOpen, onSuccess, onClose, title = 'Verificar PIN Admin' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { employees } = useAppContext();

  const validatePin = async () => {
    if (pin.length !== 4) return;

    try {
      const admin = await db.table(TABLES.EMPLOYEES)
        .filter(emp => emp.role === 'admin' && emp.pin === pin && emp.isActive)
        .first();

      if (admin) {
        onSuccess(admin);
        setPin('');
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    } catch (err) {
      setError('Error de validación');
    }
  };

  const onPinChange = (newPin) => {
    setPin(newPin);
    setError('');
    if (newPin.length === 4) {
      validatePin();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="pin-modal">
      <div className="pin-input">
        <div className="pin-dots">
          {Array(4).fill().map((_, i) => (
            <span key={i} className={`pin-dot ${pin[i] ? 'filled' : ''}`} />
          ))}
        </div>
        {error && <p className="pin-error">{error}</p>}
        <Numpad onChange={onPinChange} value={pin} maxLength={4} />
      </div>
    </Modal>
  );
};

export default PinModal;