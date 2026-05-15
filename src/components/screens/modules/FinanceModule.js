import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import db, { TABLES } from '../../../db/dexieDB';
import './FinanceModule.css';

const FinanceModule = ({ isAdmin, requestAdminPin }) => {
  const { expensePresets, refreshData } = useAppContext();
  const [cartExpenses, setCartExpenses] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledExpense, setScheduledExpense] = useState(null);

  const addExpensePreset = (preset) => {
    setCartExpenses(prev => {
      const existing = prev.find(item => item.id === preset.id);
      if (existing) {
        return prev.map(item =>
          item.id === preset.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...preset, quantity: 1 }];
    });
  };

  const payExpenses = async () => {
    if (cartExpenses.length === 0) return;

    try {
      const expensesData = cartExpenses.map(expense => ({
        date: new Date().toISOString(),
        amount: expense.amount * expense.quantity,
        description: `${expense.name} x${expense.quantity}`,
        presetId: expense.id,
        isPaid: 1,
        scheduledDate: null
      }));

      await db.table(TABLES.EXPENSES).bulkAdd(expensesData);
      setCartExpenses([]);
      refreshData();
    } catch (error) {
      console.error('Pay expenses error:', error);
    }
  };

  const scheduleExpense = (expense) => {
    setScheduledExpense(expense);
    setShowScheduleModal(true);
  };

  const confirmSchedule = async (date) => {
    try {
      await db.table(TABLES.EXPENSES).add({
        date: new Date().toISOString(),
        amount: scheduledExpense.amount,
        description: scheduledExpense.name,
        presetId: scheduledExpense.id,
        isPaid: 0,
        scheduledDate: date
      });
      setShowScheduleModal(false);
      setScheduledExpense(null);
      refreshData();
    } catch (error) {
      console.error('Schedule expense error:', error);
    }
  };

  const totalExpenses = cartExpenses.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

  return (
    <div className="finance-module">
      <div className="pos-left">
        <h3>Presets de Gastos</h3>
        <div className="presets-grid">
          {expensePresets.map(preset => (
            <div
              key={preset.id}
              className="preset-card"
              onClick={() => addExpensePreset(preset)}
            >
              <span className="preset-emoji">{preset.emoji}</span>
              <div>{preset.name}</div>
              <div className="preset-amount">${preset.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-right">
        <div className="expenses-cart">
          <h3>Gastos ({cartExpenses.length})</h3>
          {cartExpenses.map((item, index) => (
            <div key={index} className="expense-item">
              <span>{item.emoji} {item.name}</span>
              <div>
                <button onClick={() => {/* decrement */ }}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => {/* increment */ }}>+</button>
                <span>${(item.amount * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <strong>TOTAL: ${totalExpenses.toFixed(2)}</strong>
          </div>
          <div className="expense-actions">
            <button className="btn btn-success" onClick={payExpenses}>
              💰 Pagar Ahora
            </button>
            <button className="btn btn-secondary" onClick={() => scheduleExpense(cartExpenses[0])}>
              📅 Programar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Programar Gasto */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Programar Gasto</h3>
            <input
              type="date"
              onChange={(e) => confirmSchedule(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceModule;