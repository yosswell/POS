import React from 'react';
import { useAppContext } from '../../context/AppContext';
import db from '../../db/dexieDB';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose, onLogout, isAdmin }) => {
  const { refreshData } = useAppContext();

  const createBackup = async () => {
    try {
      const data = await Promise.all([
        db.table('businessConfig').toArray(),
        db.table('employees').toArray(),
        db.table('products').toArray(),
        // ... todas las tablas
      ]);

      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          businessConfig: data[0],
          employees: data[1],
          // ...
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup error:', error);
    }
  };

  return (
    <div className={`side-menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-header">
        <h3>Menú</h3>
        <button onClick={onClose}>✕</button>
      </div>
      
      {isAdmin && (
        <>
          <button className="menu-item">👥 Gestionar Empleados</button>
          <button className="menu-item">🔐 Cambiar PIN Admin</button>
        </>
      )}
      
      <button className="menu-item" onClick={createBackup}>
        💾 Copia de Seguridad
      </button>
      <button className="menu-item danger" onClick={onLogout}>
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};

export default SideMenu;