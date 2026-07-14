'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push('/');
      return;
    }
    // Load customer name from Supabase
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile?phone=${encodeURIComponent(auth.phone!)}`);
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
        }
      } catch (_) {}
    };
    // Load recent orders
    const loadOrders = async () => {
      try {
        const res = await fetch(`/api/orders/history?phone=${encodeURIComponent(auth.phone!)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (_) {}
      setOrdersLoading(false);
    };
    loadProfile();
    loadOrders();
  }, [auth.isLoggedIn, auth.phone]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setSaved(false);
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: auth.phone, name, email }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (_) {}
    setLoading(false);
  };

  const statusColor: Record<string, string> = {
    placed: '#6366F1', accepted: '#F59E0B', packed: '#F97316',
    out_for_delivery: '#10B981', delivered: '#10B981', cancelled: '#DC2626',
  };
  const statusLabel: Record<string, string> = {
    placed: 'Order Placed', accepted: 'Accepted', packed: 'Packed',
    out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
  };

  if (!auth.isLoggedIn) return null;

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 70 }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0A5C36, #10B981)',
          padding: '40px 24px 80px',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 36,
          }}>
            👤
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: 'white', margin: '0 0 6px' }}>
            {name || 'My Profile'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0 }}>
            📞 {auth.phone?.replace('+91', '+91 ')}
          </p>
        </div>

        <div style={{ maxWidth: 680, margin: '-48px auto 0', padding: '0 16px 60px', position: 'relative' }}>
          {/* Edit Profile Card */}
          <div style={cardStyle}>
            <div style={sectionTitle}>✏️ Edit Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  value={auth.phone?.replace('+91', '') || ''}
                  readOnly
                  style={{ ...inputStyle, background: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email (optional)</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  style={inputStyle}
                />
              </div>
              <button onClick={handleSave} disabled={loading} style={{
                background: 'var(--brand-green)', color: 'white',
                border: 'none', borderRadius: 12, padding: '14px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div style={cardStyle}>
            <div style={sectionTitle}>⚡ Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: '📦', label: 'My Orders', href: '#orders' },
                { icon: '📍', label: 'Saved Addresses', href: '/address' },
                { icon: '🆘', label: 'Need Help', href: 'tel:7380663685' },
                { icon: '🏪', label: 'Sell on Chotu', href: '/sell' },
                { icon: 'ℹ️', label: 'About Us', href: '/about' },
                { icon: '🔒', label: 'Privacy Policy', href: '/privacy' },
              ].map(item => (
                <a key={item.label} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 4px', textDecoration: 'none',
                  borderBottom: '1px solid #F1F5F9', color: 'var(--text-primary)',
                  transition: 'background 0.15s', borderRadius: 8,
                }}>
                  <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{item.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div style={cardStyle} id="orders">
            <div style={sectionTitle}>📦 Recent Orders</div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: 14 }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ fontWeight: 700, color: '#374151' }}>No orders yet</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Your order history will appear here</div>
                <a href="/" style={{
                  display: 'inline-block', marginTop: 16, background: 'var(--brand-green)',
                  color: 'white', padding: '10px 24px', borderRadius: 10, fontWeight: 700,
                  textDecoration: 'none', fontSize: 14,
                }}>Order Now</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map((order: any) => (
                  <a key={order.id} href={`/order/${order.id}`} style={{
                    display: 'block', textDecoration: 'none',
                    padding: '14px', background: '#F8FAFC',
                    borderRadius: 12, border: '1px solid #E2E8F0',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                          background: `${statusColor[order.delivery_status] || '#94A3B8'}18`,
                          color: statusColor[order.delivery_status] || '#94A3B8',
                        }}>
                          {statusLabel[order.delivery_status] || order.delivery_status}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                          ₹{order.grand_total}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => { auth.logout(); router.push('/'); }}
            style={{
              width: '100%', padding: '16px', background: 'white',
              border: '1.5px solid #FEE2E2', borderRadius: 14,
              color: '#DC2626', fontFamily: 'Outfit', fontWeight: 800,
              fontSize: 15, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: 20, padding: '20px 20px',
  marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
};
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Outfit', fontSize: 17, fontWeight: 800,
  color: '#0F172A', marginBottom: 16,
};
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#374151',
  marginBottom: 6, display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', fontSize: 15,
  fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box',
  background: 'white', color: '#0F172A',
};
