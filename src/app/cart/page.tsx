'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';

export default function CartPage() {
  const { items, updateQty, clearCart, total } = useCart();
  const auth = useAuth();
  const router = useRouter();
  const DELIVERY_FEE = 25;
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // Auto-fill phone when logged in
  useEffect(() => {
    if (auth.phone) {
      setForm(f => ({ ...f, phone: auth.phone!.replace('+91', '') }));
    }
  }, [auth.phone]);

  const handleOrder = async () => {
    if (!auth.isLoggedIn) {
      setShowLogin(true);
      return;
    }
    if (!form.name || !form.phone || !form.address) {
      setError('Please fill all required fields');
      return;
    }
    if (items.length === 0) { setError('Your cart is empty'); return; }

    setLoading(true);
    setError('');

    const store_id = items[0].store_id;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id,
          customer_name: form.name,
          customer_phone: `+91${form.phone}`,
          customer_email: form.email,
          delivery_address: form.address,
          items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCart();
      router.push(`/order/${data.order_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Try again.');
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <CartDrawer />
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add items from a store to place an order</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 20, background: 'var(--brand-green)', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700 }}>
            Browse Stores
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="container" style={{ padding: '32px 20px 60px' }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Checkout</h1>
        <div className="cart-page-grid">
          {/* Left: Items + Delivery Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Cart Items */}
            <div className="cart-page-section">
              <div className="cart-page-section-header">🛒 Your Items</div>
              {items.map(item => (
                <div key={item.product_id} className="cart-page-item">
                  <div style={{ fontSize: 32, background: 'var(--bg-page)', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, flexShrink: 0 }}>
                    {item.emoji || '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.weight}</div>
                  </div>
                  <div className="qty-control" style={{ transform: 'scale(0.9)', transformOrigin: 'right' }}>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, minWidth: 60, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(0)}</div>
                </div>
              ))}
            </div>

            {/* Delivery Details */}
            <div className="cart-page-section">
              <div className="cart-page-section-header">📍 Delivery Details</div>
              {!auth.isLoggedIn && (
                <div style={{
                  background: '#FFF7ED', border: '1.5px solid #F97316',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <span style={{ fontSize: 20 }}>🔐</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#C2410C' }}>Login required to place order</div>
                    <div style={{ fontSize: 13, color: '#78350F', marginTop: 2 }}>Login with your phone number to continue</div>
                  </div>
                  <button
                    onClick={() => setShowLogin(true)}
                    style={{ background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    Login
                  </button>
                </div>
              )}
              <div className="checkout-form">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Enter your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" placeholder="10-digit mobile number" type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                    readOnly={auth.isLoggedIn}
                    style={{ background: auth.isLoggedIn ? 'var(--bg-page)' : undefined }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (for invoice)</label>
                  <input className="form-input" placeholder="your@email.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  <textarea className="form-input" placeholder="House/Flat no., Street, Area, City" rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ resize: 'none' }} />
                </div>
                {error && <p style={{ color: '#DC2626', fontSize: 14, fontWeight: 500 }}>{error}</p>}
              </div>
            </div>
          </div>

          {/* Right: Price Summary */}
          <div>
            <div className="cart-page-section" style={{ position: 'sticky', top: 80 }}>
              <div className="cart-page-section-header">💰 Price Summary</div>
              <div className="price-breakdown">
                <div className="price-row"><span>Items Total ({items.length} items)</span><span>₹{total.toFixed(0)}</span></div>
                <div className="price-row"><span>Delivery Fee</span><span>₹{DELIVERY_FEE}</span></div>
                <div className="price-row"><span>Platform Fee</span><span style={{ color: 'var(--brand-green)' }}>FREE</span></div>
                <div className="price-row total"><span>Grand Total</span><span>₹{(total + DELIVERY_FEE).toFixed(0)}</span></div>
              </div>
              <button className="btn-place-order" onClick={handleOrder} disabled={loading}>
                {loading ? 'Placing Order...' : `Place Order · ₹${(total + DELIVERY_FEE).toFixed(0)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={(ph) => { auth.login(ph); setShowLogin(false); }}
        />
      )}
    </>
  );
}
