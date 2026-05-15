import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import db, { TABLES } from '../../../db/dexieDB';
import { exportPDF } from '../../../utils/pdfExport';
import './ReportsModule.css';

const ReportsModule = () => {
  const { refreshData } = useAppContext();
  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    netProfit: 0,
    avgTicket: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    calculateStats();
  }, [refreshData]);

  const calculateStats = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    try {
      const [todaySales, weekSales, monthSales, saleItems, expenses, products] = await Promise.all([
        db.table(TABLES.SALES).where('date').above(today.toISOString()).sum('total'),
        db.table(TABLES.SALES).where('date').above(weekAgo.toISOString()).sum('total'),
        db.table(TABLES.SALES).where('date').above(monthAgo.toISOString()).sum('total'),
        db.table(TABLES.SALE_ITEMS).toArray(),
        db.table(TABLES.EXPENSES).where('isPaid').equals(1).sum('amount'),
        db.table(TABLES.PRODUCTS).toArray()
      ]);

      const totalSales = todaySales || 0;
      const salesCount = await db.table(TABLES.SALES).where('date').above(today.toISOString()).count();
      const totalExpenses = expenses || 0;
      const totalCOGS = saleItems.reduce((sum, item) => sum + (item.costAtSale * item.quantity), 0);
      const lowStock = products.filter(p => p.stock <= 5).length;

      setStats({
        todaySales: totalSales,
        weekSales: weekSales || 0,
        monthSales: monthSales || 0,
        netProfit: totalSales - totalCOGS - totalExpenses,
        avgTicket: salesCount > 0 ? totalSales / salesCount : 0,
        lowStockProducts: lowStock
      });
    } catch (error) {
      console.error('Stats calculation error:', error);
    }
  };

  return (
    <div className="reports-module">
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Hoy</h3>
          <div className="kpi-value">${stats.todaySales.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <h3>Semana</h3>
          <div className="kpi-value">${stats.weekSales.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <h3>Mes</h3>
          <div className="kpi-value">${stats.monthSales.toFixed(2)}</div>
        </div>
        <div className="kpi-card profit">
          <h3>Beneficio Neto</h3>
          <div className="kpi-value">${stats.netProfit.toFixed(2)}</div>
        </div>
      </div>

      <div className="reports-actions">
        <button className="btn btn-primary" onClick={() => exportPDF(stats)}>
          📄 Exportar PDF
        </button>
      </div>

      <div className="alerts">
        {stats.lowStockProducts > 0 && (
          <div className="alert warning">
            ⚠️ {stats.lowStockProducts} productos con stock bajo
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsModule;
