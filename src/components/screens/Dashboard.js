import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import POSModule from './modules/POSModule';
import InventoryModule from './modules/InventoryModule';
import FinanceModule from './modules/FinanceModule';
import ReportsModule from './modules/ReportsModule';
import UserModule from './modules/UserModule';
import Header from '../common/Header';
import SideMenu from './SideMenu';
import PinModal from '../common/PinModal';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const { user, config, products, paymentMethods } = useAppContext();
  const [activeTab, setActiveTab] = useState('ventas');
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState(null);

  const isAdmin = user?.role === 'admin';

  const tabs = [
    { id: 'ventas', label: 'Ventas', component: POSModule, allowed: true },
    { id: 'inventario', label: 'Inventario', component: InventoryModule, allowed: isAdmin },
    { id: 'gastos', label: 'Gastos', component: FinanceModule, allowed: true },
    { id: 'reportes', label: 'Reportes', component: ReportsModule, allowed: isAdmin },
    { id: 'usuario', label: 'Usuario', component: UserModule, allowed: true }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
  const TabComponent = currentTab.component;

  const handleTabChange = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab.allowed) setActiveTab(tabId);
  };

  const requestAdminPin = (action) => {
    setPinAction(action);
    setShowPinModal(true);
  };

  const handlePinSuccess = (adminUser) => {
    setShowPinModal(false);
    if (pinAction) pinAction(adminUser);
  };

  return (
    <div className="dashboard">
      <Header 
        config={config}
        user={user}
        onMenuToggle={() => setIsMenuOpen(true)}
      />
      
      <div className="dashboard-content">
        <TabComponent 
          cart={cart}
          setCart={setCart}
          isAdmin={isAdmin}
          requestAdminPin={requestAdminPin}
        />
      </div>

      <div className="bottom-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${!tab.allowed ? 'disabled' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            disabled={!tab.allowed}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLogout={onLogout}
        isAdmin={isAdmin}
      />

      <PinModal
        isOpen={showPinModal}
        onSuccess={handlePinSuccess}
        onClose={() => {
          setShowPinModal(false);
          setPinAction(null);
        }}
      />
    </div>
  );
};

export default Dashboard;