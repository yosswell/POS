import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportPDF = (stats) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Reporte NexPOS', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // KPIs
  const kpis = [
    ['Hoy', `$${stats.todaySales.toFixed(2)}`],
    ['Semana', `$${stats.weekSales.toFixed(2)}`],
    ['Mes', `$${stats.monthSales.toFixed(2)}`],
    ['Beneficio Neto', `$${stats.netProfit.toFixed(2)}`]
  ];
  
  doc.autoTable({
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: kpis,
    theme: 'grid'
  });
  
  doc.save('nexpos-reporte.pdf');
};
