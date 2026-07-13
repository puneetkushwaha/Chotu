'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '✅', desc: 'We have received your order' },
  { key: 'accepted', label: 'Order Accepted', icon: '🤝', desc: 'The store has accepted your order' },
  { key: 'packed', label: 'Order Packed', icon: '📦', desc: 'Your order is being packed' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', desc: 'Your order is on the way!' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Order delivered successfully' },
];

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetch(`/api/orders?id=${id}`).then(r => r.json());
        
        if (data && data.id && data.delivery_status === 'placed') {
          const placedAt = new Date(data.created_at).getTime();
          if (Date.now() - placedAt > 90000) { // 90 seconds timeout
            try {
              await fetch('/api/orders/reroute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: id })
              });
              // Re-fetch after reroute attempt
              const reData = await fetch(`/api/orders?id=${id}`).then(r => r.json());
              setOrder(reData.id ? reData : null);
              setLoading(false);
              return;
            } catch (_) {}
          }
        }
        
        setOrder(data.id ? data : null);
      } catch (_) {}
      setLoading(false);
    };
    if (id) {
      load();
      const interval = setInterval(load, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, [id]);

  const currentIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.delivery_status) : -1;
  const isCancelled = order?.delivery_status === 'cancelled';

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="container" style={{ padding: '32px 20px 60px', maxWidth: 700 }}>
        <a href="/" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Back to Home
        </a>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
        ) : !order ? (
          <div className="empty-state">
            <div className="icon">❌</div>
            <h3>Order not found</h3>
            <p>This order may not exist or has been removed</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                {isCancelled ? '❌ Order Cancelled' : currentIdx === 4 ? '🎉 Order Delivered!' : '⏳ Order Tracking'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Order ID: <code style={{ background: 'var(--bg-page)', padding: '2px 8px', borderRadius: 6 }}>{id?.slice(0, 8).toUpperCase()}</code>
              </p>
            </div>

            {/* Live Tracker */}
            {!isCancelled && (
              <div className="order-tracker" style={{ marginBottom: 24 }}>
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx < currentIdx;
                  const active = idx === currentIdx;
                  return (
                    <div key={step.key} className={`tracker-step${done ? ' done' : active ? ' active' : ''}`}>
                      <div className="step-icon">{done ? '✓' : step.icon}</div>
                      <div>
                        <div className="step-label" style={{ color: done || active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {step.label}
                        </div>
                        {active && <div className="step-time" style={{ color: 'var(--brand-orange)' }}>{step.desc}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Summary */}
            <div className="cart-page-section">
              <div className="cart-page-section-header">🧾 Order Summary</div>
              <div className="price-breakdown">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="price-row">
                    <span>{item.product?.emoji || '📦'} {item.product?.name} × {item.quantity}</span>
                    <span>₹{(item.price_per_item * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="price-row"><span>Delivery Fee</span><span>₹{order.delivery_fee}</span></div>
                <div className="price-row total"><span>Grand Total</span><span>₹{order.grand_total}</span></div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="cart-page-section" style={{ marginTop: 16 }}>
              <div className="cart-page-section-header">📍 Delivery Address</div>
              <div style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{order.customer_name}</strong><br />
                📞 {order.customer_phone}<br />
                📍 {order.delivery_address}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
