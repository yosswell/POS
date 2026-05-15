
import Dexie from 'dexie';

const db = new Dexie('NexPOS_DB');

db.version(1).stores({
  businessConfig: '++id, businessName, category, adminPin',
  employees: '++id, name, role, pin, isActive',
  products: '++id, sku, name, categoryId, unitId, price, cost, stock',
  categories: '++id, name',
  units: '++id, name',
  paymentMethods: '++id, name, colorHex',
  sales: '++id, date, total, itemsCount, paymentMethodId',
  saleItems: '++id, saleId, productId, quantity, priceAtSale, costAtSale',
  expenses: '++id, date, amount, description, presetId, isPaid, scheduledDate',
  expensePresets: '++id, name, amount, emoji, color'
});

db.open().catch(err => console.error('DB Error:', err));

export default db;
export const TABLES = {
  BUSINESS_CONFIG: 'businessConfig',
  EMPLOYEES: 'employees',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  UNITS: 'units',
  PAYMENT_METHODS: 'paymentMethods',
  SALES: 'sales',
  SALE_ITEMS: 'saleItems',
  EXPENSES: 'expenses',
  EXPENSE_PRESETS: 'expensePresets'
};
