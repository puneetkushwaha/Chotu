'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

const STATUS_STEPS = [
  { key: 'placed',           label: 'Order Placed',      icon: '📋', desc: 'We have received your order', color: '#6366F1' },
  { key: 'accepted',         label: 'Order Accepted',    icon: '🤝', desc: 'The store has accepted your order', color: '#F59E0B' },
  { key: 'packed',           label: 'Order Packed',      icon: '📦', desc: 'Your order is packed and ready', color: '#F97316' },
  { key: 'out_for_delivery', label: 'Out for Delivery',  icon: '🛵', desc: 'Delivery partner is on the way!', color: '#10B981' },
  { key: 'delivered',        label: 'Delivered',         icon: '🎉', desc: 'Order delivered successfully!', color: '#10B981' },
];

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dotAnim, setDotAnim] = useState(0);

  // Animate dots for "in-progress" feel
  useEffect(() => {
    const t = setInterval(() => setDotAnim(d => (d + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetch(`/api/orders?id=${id}`).then(r => r.json());
        if (data?.id && data.delivery_status === 'placed') {
          const placedAt = new Date(data.created_at).getTime();
          if (Date.now() - placedAt > 90000) {
            try {
              await fetch('/api/orders/reroute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: id })
              });
              const reData = await fetch(`/api/orders?id=${id}`).then(r => r.json());
              setOrder(reData.id ? reData : null);
              setLoading(false);
              return;
            } catch (_) {}
          }
        }
        setOrder(data?.id ? data : null);
      } catch (_) {}
      setLoading(false);
    };
    if (id) {
      load();
      const interval = setInterval(load, 15000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const currentIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.delivery_status) : -1;
  const isCancelled = order?.delivery_status === 'cancelled';
  const isDelivered = order?.delivery_status === 'delivered';
  const currentStep = currentIdx >= 0 ? STATUS_STEPS[currentIdx] : null;
  const dots = '.'.repeat(dotAnim);

  return (
    <>
      <Navbar />
      <CartDrawer />

      {/* Hero Status Banner */}
      {!loading && order && (
        <div style={{
          background: isCancelled
            ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
            : isDelivered
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : 'linear-gradient(135deg, #0A5C36, #10B981)',
          color: 'white',
          padding: '48px 24px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ fontSize: 56, marginBottom: 12, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
            {isCancelled ? '❌' : isDelivered ? '🎉' : currentStep?.icon || '⏳'}
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            {isCancelled
              ? 'Order Cancelled'
              : isDelivered
              ? 'Order Delivered!'
              : `${currentStep?.label || 'Processing'}${dots}`}
          </h1>
          <p style={{ opacity: 0.85, fontSize: 15, margin: 0 }}>
            {isCancelled
              ? 'Your order has been cancelled'
              : currentStep?.desc || 'Hang tight!'}
          </p>
          <div style={{
            marginTop: 16,
            display: 'inline-block',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: 50,
            padding: '6px 18px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.5
          }}>
            Order #{id?.slice(0, 8).toUpperCase()}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 60px', marginTop: -40, position: 'relative' }}>
        {loading ? (
          <>
            <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
          </>
        ) : !order ? (
          <div className="empty-state" style={{ background: 'white', borderRadius: 20, padding: 48, boxShadow: 'var(--shadow-md)' }}>
            <div className="icon">❌</div>
            <h3>Order not found</h3>
            <p>This order may not exist or has been removed</p>
            <a href="/" style={{ display: 'inline-block', marginTop: 20, background: 'var(--brand-green)', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700 }}>
              Back to Home
            </a>
          </div>
        ) : (
          <>
            {/* Progress Tracker Card */}
            {!isCancelled && (
              <div style={{
                background: 'white', borderRadius: 20,
                boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                padding: '24px 28px', marginBottom: 16
              }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#0F172A' }}>
                  📍 Order Progress
                </div>
                <div style={{ position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute', left: 19, top: 24, bottom: 24,
                    width: 2, background: '#E2E8F0', zIndex: 0
                  }} />
                  {/* Progress fill */}
                  <div style={{
                    position: 'absolute', left: 19, top: 24,
                    width: 2, zIndex: 0, background: 'var(--brand-green)',
                    height: `${Math.max(0, (currentIdx / (STATUS_STEPS.length - 1)) * 100)}%`,
                    transition: 'height 0.8s ease'
                  }} />
                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    return (
                      <div key={step.key} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 16,
                        marginBottom: idx < STATUS_STEPS.length - 1 ? 28 : 0,
                        position: 'relative', zIndex: 1
                      }}>
                        {/* Step dot */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: done ? 16 : 20,
                          background: done ? 'var(--brand-green)' : active ? step.color : '#F1F5F9',
                          border: active ? `3px solid ${step.color}` : done ? '3px solid var(--brand-green)' : '2px solid #E2E8F0',
                          boxShadow: active ? `0 0 0 4px ${step.color}22` : 'none',
                          transition: 'all 0.4s ease',
                          animation: active ? 'pulse 2s infinite' : 'none',
                        }}>
                          {done ? '✓' : step.icon}
                        </div>
                        <div style={{ paddingTop: 8 }}>
                          <div style={{
                            fontWeight: active || done ? 700 : 500,
                            fontSize: 15,
                            color: active ? '#0F172A' : done ? '#374151' : '#94A3B8',
                          }}>
                            {step.label}
                          </div>
                          {active && (
                            <div style={{
                              fontSize: 13, color: step.color, fontWeight: 600,
                              marginTop: 3, display: 'flex', alignItems: 'center', gap: 6
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: step.color, display: 'inline-block', animation: 'pulse 1s infinite' }} />
                              {step.desc}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Summary Card */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '24px 28px', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#0F172A' }}>
                🧾 Order Summary
              </div>
              {order.order_items?.map((item: any) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid #F1F5F9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, background: '#F8FAFC', borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                    }}>
                      {item.product?.emoji || '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>{item.product?.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>₹{(item.price_per_item * item.quantity).toFixed(0)}</div>
                </div>
              ))}
              <div style={{ marginTop: 16, borderTop: '2px solid #F1F5F9', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#64748B', fontSize: 14 }}>
                  <span>Delivery Fee</span><span>₹{order.delivery_fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, color: '#0F172A' }}>
                  <span>Grand Total</span><span>₹{order.grand_total}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '24px 28px', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>
                📍 Delivery Address
              </div>
              <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
                <strong style={{ color: '#0F172A', fontSize: 16 }}>{order.customer_name}</strong><br />
                <span style={{ color: '#64748B' }}>📞 {order.customer_phone}</span><br />
                <span>{order.delivery_address}</span>
              </div>
            </div>

            {/* Back to Home */}
            <a href="/" style={{
              display: 'block', textAlign: 'center',
              background: 'var(--brand-green)', color: 'white',
              padding: '16px', borderRadius: 14, fontWeight: 800,
              fontSize: 16, textDecoration: 'none', marginTop: 8
            }}>
              🏠 Back to Home
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </>
  );
}
