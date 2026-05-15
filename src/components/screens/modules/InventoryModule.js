import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import db, { TABLES } from '../../../db/dexieDB';
import './InventoryModule.css';

const InventoryModule = ({ isAdmin, requestAdminPin }) => {
  const { products, categories, units, refreshData } = useAppContext();
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    categoryId: 1,
    unitId: 1,
    price: 0,
    cost: 0,
    stock: 0
  });

  const handleSaveProduct = async () => {
    try {
      await db.table(TABLES.PRODUCTS).add(newProduct);
      setShowNewProduct(false);
      setNewProduct({ sku: '', name: '', categoryId: 1, unitId: 1, price: 0, cost: 0, stock: 0 });
      refreshData();
    } catch (error) {
      console.error('Save product error:', error);
    }
  };

  const updateProductStock = async (productId, newStock) => {
    try {
      await db.table(TABLES.PRODUCTS).update(productId, { stock: newStock });
      refreshData();
    } catch (error) {
      console.error('Update stock error:', error);
    }
  };

  return (
    <div className="inventory-module">
      <div className="inventory-header">
        <h2>Inventario</h2>
        <button className="btn btn-primary" onClick={() => setShowNewProduct(true)}>
          + Nuevo Producto
        </button>
      </div>

      <div className="inventory-table">
        <div className="table-header">
          <span>SKU</span>
          <span>Producto</span>
          <span>Stock</span>
          <span>Precio</span>
          <span>Costo</span>
          <span>Acciones</span>
        </div>
        {products.map(product => (
          <div key={product.id} className={`table-row ${product.stock <= 5 ? 'low-stock' : ''}`}>
            <span>{product.sku || '-'}</span>
            <span>{product.name}</span>
            <span className={product.stock <= 5 ? 'low-stock-text' : ''}>
              {product.stock}
            </span>
            <span>${product.price}</span>
            <span>${product.cost}</span>
            <span>
              <input
                type="number"
                min="0"
                value={product.stock}
                onChange={(e) => updateProductStock(product.id, parseInt(e.target.value) || 0)}
                className="stock-input"
              />
            </span>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Producto */}
      {showNewProduct && (
        <div className="modal-overlay" onClick={() => setShowNewProduct(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Nuevo Producto</h3>
            <div className="form-grid">
              <input
                placeholder="SKU"
                value={newProduct.sku}
                onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
              />
              <input
                placeholder="Nombre"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <select
                value={newProduct.categoryId}
                onChange={e => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={newProduct.unitId}
                onChange={e => setNewProduct({...newProduct, unitId: parseInt(e.target.value)})}
              >
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Precio"
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
              />
              <input
                type="number"
                placeholder="Costo"
                value={newProduct.cost}
                onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})}
              />
              <input
                type="number"
                placeholder="Stock inicial"
                value={newProduct.stock}
                onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewProduct(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveProduct}>
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;