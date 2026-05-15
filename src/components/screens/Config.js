import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import db, { TABLES } from '../../db/dexieDB';
import Modal from '../common/Modal';
import Numpad from '../common/Numpad';

const Config = ({ onComplete }) => {
  const { setConfig, refreshData } = useAppContext();
  const [form, setForm] = useState({ businessName: '', category: '', pin: '' });
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [pinConfirm, setPinConfirm] = useState('');

  const handleSave = async () => {
    if (!form.businessName || !form.category || form.pin.length !== 4) return;

    try {
      // Crear config
      const configId = await db.table(TABLES.BUSINESS_CONFIG).add({
        businessName: form.businessName,
        category: form.category,
        adminPin: form.pin
      });

      // Crear primer admin
      await db.table(TABLES.EMPLOYEES).add({
        name: 'Admin',
        role: 'admin',
        pin: form.pin,
        isActive: true
      });

      // Crear datos por defecto
      await Promise.all([
        db.table(TABLES.CATEGORIES).bulkAdd([{ id: 1, name: 'General' }]),
        db.table(TABLES.UNITS).bulkAdd([{ id: 1, name: 'Unidad' }]),
        db.table(TABLES.PAYMENT_METHODS).bulkAdd([
          { id: 1, name: 'Efectivo', colorHex: '#4CAF50' },
          { id: 2, name: 'Tarjeta', colorHex: '#2196F3' }
        ])
      ]);

      setConfig({ id: configId, ...form });
      await refreshData();
      onComplete();
    } catch (error) {
      console.error('Config save error:', error);
    }
  };

  return (
    <div className="config-screen">
      <div className="config-form">
        <h1>Configuración Inicial</h1>
        <div className="form-group">
          <label>Nombre del Negocio</label>
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            placeholder="Mi Tienda"
          />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Tienda de ropa"
          />
        </div>
        <div className="form-group">
          <label>PIN Admin (4 dígitos)</label>
          <input
            type="password"
            maxLength={4}
            value={form.pin}
            onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowPinConfirm(true)}>
          Guardar Configuración
        </button>
      </div>

      <Modal isOpen={showPinConfirm} onClose={() => setShowPinConfirm(false)}>
        <h3>Confirmar PIN</h3>
        <Numpad 
          onChange={setPinConfirm}
          value={pinConfirm}
          maxLength={4}
        />
        {pinConfirm === form.pin && (
          <button className="btn btn-success w-full" onClick={handleSave}>
            ¡Confirmado! Guardando...
          </button>
        )}
      </Modal>
    </div>
  );
};

export default Config;