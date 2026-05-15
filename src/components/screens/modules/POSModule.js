import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import db, { TABLES } from '../../../db/dexieDB';
import PinModal from '../../common/PinModal';
import EditProductModal from '../../modals/EditProductModal';
import './POSModule.css';

const POSModule = ({ cart, setCart, isAdmin, requestAdminPin }) => {
  const { products, paymentMethods, refreshData } = useAppContext();
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPinForEdit, setShowPinForEdit] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, change) => {
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.quantity + change);
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
      return newQty;
    });
  };

  const checkout = async (paymentMethodId) => {
    if (cart.length === 0) return;

    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Crear venta
      const saleId = await db.table(TABLES.SALES).add({
        date: new Date().toISOString(),
        total,
        itemsCount: cart.length,
        paymentMethodId
      });

      // Crear ítems de venta
      const saleItems = cart.map(item => ({
        saleId,
        productId: item.id,
        quantity: item.quantity,
        priceAtSale: item.price,
        costAtSale: item.cost
      }));

      await db.table(TABLES.SALE_ITEMS).bulkAdd(saleItems);

      // Actualizar stock
      const stockUpdates = cart.map(item => 
        db.table(TABLES.PRODUCTS).update(item.id, {
          stock: db.table(TABLES.PRODUCTS).get(item.id).then(p => p.stock - item.quantity)
        })
      );
      await Promise.all(stockUpdates);

      setCart([]);
      refreshData();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handleLongPress = (product) => {
    if (isAdmin) {
      setEditingProduct(product);
      setShowPinForEdit(true);
    } else {
      requestAdminPin(() => {
        setEditingProduct(product);
        setShowPinForEdit(true);
      });
    }
  };

  const handlePinSuccessForEdit = () => {
    setShowPinForEdit(false);
    setShowEditModal(true);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="pos-module">
      <div className="pos-left">
        <input
          className="search-input"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`product-card ${product.stock <= 5 ? 'low-stock' : ''}`}
              onClick={() => addToCart(product)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(product);
              }}
            >
              <div className="product-name">{product.name}</div>
              <div className="product-price">${product.price}</div>
              <div className="product-stock">
                Stock: {product.stock} {product.stock <= 5 && '⚠️'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-right">
        <div className="cart">
          <h3>Carrito ({cart.length})</h3>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <div className="cart-controls">
                <button onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <strong>TOTAL: ${total.toFixed(2)}</strong>
          </div>
          <div className="payment-methods">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                className="payment-btn"
                style={{ backgroundColor: method.colorHex }}
                onClick={() => checkout(method.id)}
                disabled={total === 0}
              >
                {method.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <PinModal
        isOpen={showPinForEdit}
        onSuccess={handlePinSuccessForEdit}
        onClose={() => setShowPinForEdit(false)}
      />

      {editingProduct && (
        <EditProductModal
          isOpen={showEditModal}
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSave={refreshData}
        />
      )}
    </div>
  );
};

export default POSModule;