'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, total, itemCount } = useCart();
  const DELIVERY_FEE = total > 0 ? 25 : 0;

  return (
    <>
      <div className={`cart-overlay${isOpen ? ' open' : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`cart-drawer${isOpen ? ' open' : ''}`}>
        <div className="cart-header">
          <h3>🛒 My Cart {itemCount > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 16 }}>({itemCount} items)</span>}</h3>
          <button className="cart-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add items from a store to get started</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-emoji">{item.emoji || '📦'}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-weight">{item.weight}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div className="qty-control" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-price">₹{(item.price * item.quantity).toFixed(0)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Items Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <div className="cart-total-row">
              <span>Delivery Fee</span>
              <span>₹{DELIVERY_FEE}</span>
            </div>
            <div className="cart-total-row grand">
              <span>Grand Total</span>
              <span>₹{(total + DELIVERY_FEE).toFixed(0)}</span>
            </div>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              <button className="btn-checkout">Proceed to Checkout →</button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
