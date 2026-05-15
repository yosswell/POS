import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import db, { TABLES } from '../../db/dexieDB';
import Numpad from '../common/Numpad';
import Modal from '../common/Modal';
import './Auth.css';

const Auth = ({ onSuccess }) => {
  const { setUser } = useAppContext();
  const [role, setRole] = useState('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  const validatePin = async () => {
    if (pin.length !== 4) return;

    try {
      const user = await db.table(TABLES.EMPLOYEES)
        .filter(emp => emp.role === role && emp.pin === pin && emp.isActive)
        .first();

      if (user) {
        setWelcomeUser(user);
        setShowWelcome(true);
        setTimeout(() => {
          setUser(user);
          setShowWelcome(false);
          onSuccess();
        }, 2000);
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    } catch (err) {
      setError('Error de autenticación');
      setPin('');
    }
  };

  const onPinChange = (newPin) => {
    setPin(newPin);
    setError('');
    if (newPin.length === 4) validatePin();
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1>Bienvenido</h1>
        
        <div className="role-tabs">
          <button 
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
          <button 
            className={`role-tab ${role === 'empleado' ? 'active' : ''}`}
            onClick={() => setRole('empleado')}
          >
            Empleado
          </button>
        </div>

        <div className="pin-section">
          <div className="pin-dots">
            {Array(4).fill().map((_, i) => (
              <span key={i} className={`pin-dot ${pin[i] ? 'filled' : ''}`} />
            ))}
          </div>
          {error && <p className="error-message">{error}</p>}
          <Numpad onChange={onPinChange} value={pin} />
        </div>
      </div>

      <Modal isOpen={showWelcome} className="welcome-modal">
        <div className="welcome-content">
          <h2>¡Bienvenido!</h2>
          <p>{welcomeUser?.name}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Auth;