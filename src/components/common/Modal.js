import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, className = '', confirmAction }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={`modal-overlay ${className}`} onClick={handleBackdropClick}>
      <div className="modal-content">
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          {confirmAction && (
            <button className="btn btn-primary" onClick={confirmAction}>
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;