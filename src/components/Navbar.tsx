import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginModal from './LoginModal';

export default function Navbar() {
  const router = useRouter();
  const { itemCount, setIsOpen, addItem, items, updateQty } = useCart();
  const { location, deliveryTime } = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const placeholders = ["atta, dal, rice...", "milk, bread, butter...", "chips, cold drinks...", "fresh vegetables...", "maggi, noodles..."];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentString = placeholders[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setPlaceholderText(currentString.substring(0, placeholderText.length - 1));
        if (placeholderText.length <= 1) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setPlaceholderText(currentString.substring(0, placeholderText.length + 1));
        if (placeholderText.length === currentString.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, placeholderIndex]);

  useEffect(() => {
    if (searchVal.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchVal)}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (_) {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const getDeliveryTimeText = () => {
    if (!location || location === 'Select Location') return 'Select Location';
    return `Delivery in ${deliveryTime}`;
  };

  const getItemQty = (productId: string) => {
    return items.find(i => i.product_id === productId)?.quantity || 0;
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--brand-green)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
              <img src="/mascot.jpg" alt="Chotu Mascot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="navbar-logo" style={{ margin: 0, display: 'inline-block' }}>
              chotu<span>.</span>
            </div>
          </Link>

          {/* Delivery Location */}
          <div className="navbar-location" onClick={() => router.push('/address')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <div className="navbar-location-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#111827', marginBottom: '2px' }}>{getDeliveryTimeText()}</span>
              {(() => {
                const displayAddress = location || 'Select location';
                let addressLabel = displayAddress;
                let addressDetails = '';
                if (displayAddress.includes(' - ')) {
                  const parts = displayAddress.split(' - ');
                  addressLabel = parts[0];
                  addressDetails = ' - ' + parts.slice(1).join(' - ');
                }
                return (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                    <span style={{ fontWeight: '800', color: '#111827' }}>{addressLabel}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{addressDetails}</span>
                  </div>
                );
              })()}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b', marginLeft: '2px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '750px', marginLeft: '10px' }}>
            <div className="navbar-search" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder={`Search "${placeholderText}"`}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                id="navbar-search-input"
                autoComplete="off"
                style={{ width: '100%', border: 'none', background: 'transparent' }}
              />
              {searchVal.trim().length > 0 && (
                <button onClick={() => setSearchVal('')} style={{ fontSize: '16px', color: '#64748b', fontWeight: 'bold' }}>×</button>
              )}
            </div>

            {/* Suggestions Overlay */}
            {searchVal.trim().length >= 2 && (searchResults.length > 0 || searching) && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                marginTop: '8px',
                zIndex: 1000,
                maxHeight: '320px',
                overflowY: 'auto'
              }}>
                {searching ? (
                  <div style={{ padding: '16px', fontSize: '13px', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>
                    Searching items... 🔍
                  </div>
                ) : (
                  searchResults.map(p => {
                    const qty = getItemQty(p.product_id || p.id);
                    const imageUrl = p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            {p.weight} · ₹{p.price || p.standard_mrp}
                          </div>
                        </div>

                        {/* Action */}
                        {qty > 0 ? (
                          <div className="qty-control" style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}>
                            <button className="qty-btn" onClick={() => updateQty(p.product_id || p.id, qty - 1)}>−</button>
                            <span className="qty-value">{qty}</span>
                            <button className="qty-btn" onClick={() => updateQty(p.product_id || p.id, qty + 1)}>+</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              addItem({
                                id: p.id,
                                product_id: p.product_id || p.id,
                                store_id: p.store_id || 'unified',
                                name: p.name,
                                emoji: p.emoji || '📦',
                                weight: p.weight,
                                price: p.price || p.standard_mrp
                              });
                            }}
                            style={{
                              background: 'white',
                              border: '1.5px solid var(--brand-green)',
                              color: 'var(--brand-green)',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <button className="btn-login" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button className="btn-cart" onClick={() => setIsOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              My Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
