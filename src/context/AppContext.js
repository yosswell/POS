import React, { createContext, useContext, useState, useEffect, useReducer } from 'react';
import db, { TABLES } from '../db/dexieDB';

const AppContext = createContext();

const initialState = {
  user: null,
  config: null,
  refreshTrigger: 0,
  isLoading: true,
  products: [],
  categories: [],
  units: [],
  paymentMethods: [],
  employees: [],
  sales: [],
  expenses: [],
  expensePresets: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'REFRESH_DATA':
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };
    case 'SET_DATA':
      return { ...state, [action.key]: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshData = async () => {
    try {
      const [config, user, products, categories, units, paymentMethods, employees] = await Promise.all([
        db.table(TABLES.BUSINESS_CONFIG).first(),
        state.user,
        db.table(TABLES.PRODUCTS).toArray(),
        db.table(TABLES.CATEGORIES).toArray(),
        db.table(TABLES.UNITS).toArray(),
        db.table(TABLES.PAYMENT_METHODS).toArray(),
        db.table(TABLES.EMPLOYEES).toArray()
      ]);
      
      dispatch({ type: 'SET_CONFIG', payload: config });
      dispatch({ type: 'SET_DATA', key: 'products', payload: products });
      dispatch({ type: 'SET_DATA', key: 'categories', payload: categories });
      dispatch({ type: 'SET_DATA', key: 'units', payload: units });
      dispatch({ type: 'SET_DATA', key: 'paymentMethods', payload: paymentMethods });
      dispatch({ type: 'SET_DATA', key: 'employees', payload: employees });
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const value = {
    ...state,
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setConfig: (config) => dispatch({ type: 'SET_CONFIG', payload: config }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    refreshData,
    refreshTrigger: state.refreshTrigger
  };

  useEffect(() => {
    refreshData().finally(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, [state.refreshTrigger]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
