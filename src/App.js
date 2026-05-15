import React, { useState, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import Splash from './components/screens/Splash';
import Config from './components/screens/Config';
import Auth from './components/screens/Auth';
import Dashboard from './components/screens/Dashboard';
import db, { TABLES } from './db/dexieDB';

function App() {
  const { config, isLoading, setLoading } = useAppContext();
  const [screen, setScreen] = useState('splash');

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Splash 2s
      
      const hasConfig = await db.table(TABLES.BUSINESS_CONFIG).count() > 0;
      
      if (!hasConfig) {
        setScreen('config');
      } else {
        setScreen('auth');
      }
      
      setLoading(false);
    };

    initApp();
  }, []);

  if (isLoading) return <Splash />;

  const renderScreen = () => {
    switch (screen) {
      case 'config': return <Config onComplete={() => setScreen('auth')} />;
      case 'auth': return <Auth onSuccess={() => setScreen('dashboard')} />;
      case 'dashboard': return <Dashboard onLogout={() => setScreen('auth')} />;
      default: return <Splash />;
    }
  };

  return <div className="app">{renderScreen()}</div>;
}

export default App;