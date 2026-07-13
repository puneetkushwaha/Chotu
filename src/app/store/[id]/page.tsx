'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';

import { supabase } from '@/lib/supabase';

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const [storeRes, productsRes] = await Promise.all([
          fetch('/api/stores').then(r => r.json()).then((s: any[]) => s.find(s => s.id === id)),
          fetch(`/api/products?store_id=${id}`).then(r => r.json()),
        ]);
        setStore(storeRes || null);
        setProducts(Array.isArray(productsRes) ? productsRes : []);
      } catch (_) {}
      setLoading(false);
    };
    if (id) {
      load();

      // Listen to product inventory changes
      const productsChannel = supabase
        .channel(`store-inventory-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_products', filter: `store_id=eq.${id}` },
          () => {
            load();
          }
        )
        .subscribe();

      // Listen to store status changes (online/offline toggle)
      const storeChannel = supabase
        .channel(`store-status-${id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'stores', filter: `id=eq.${id}` },
          () => {
            load();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(storeChannel);
      };
    }
  }, [id]);

  const CATEGORY_IMAGES: Record<string, string> = {
    'Grocery & Staples': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80',
    'Dairy & Bakery': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=120&q=80',
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=120&q=80',
    'Meat & Fish': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=120&q=80',
    'Pharmacy': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=120&q=80',
    'Snacks & Beverages': 'https://images.unsplash.com/photo-1599490659213-e2b9527b0f76?auto=format&fit=crop&w=120&q=80',
    'Personal Care': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=120&q=80',
    'Home & Kitchen': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=120&q=80',
  };

  const tabs = ['All', ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))];
  const filtered = activeTab === 'All' ? products : products.filter((p: any) => p.category === activeTab);

  const headerImageUrl = CATEGORY_IMAGES[store?.category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';

  return (
    <>
      <Navbar />
      <CartDrawer />
      {loading ? (
        <div className="container" style={{ padding: '40px 20px' }}>
          <div className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 16 }} />
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      ) : !store ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="icon">🏪</div>
          <h3>Store not found</h3>
          <p>This store may no longer be available</p>
          <a href="/" style={{ color: 'var(--brand-green)', fontWeight: 600, marginTop: 16, display: 'block' }}>← Back to Home</a>
        </div>
      ) : (
        <>
          {/* Store Header */}
          <div className="store-header">
            <div className="container">
              <div className="store-header-inner">
                <a href="/" style={{ fontSize: 24, color: 'var(--text-muted)', marginRight: 4 }}>←</a>
                <div className="store-header-icon" style={{ overflow: 'hidden', padding: 0 }}>
                  <img src={headerImageUrl} alt={store.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="store-header-name">{store.name}</div>
                  <div className="store-header-meta">
                    <span className="meta-pill">⭐ {store.rating?.toFixed(1) || '5.0'} Rating</span>
                    <span className="meta-pill">🚚 {store.delivery_radius_km || 3} km delivery</span>
                    <span className="meta-pill">⏱️ 20-30 min</span>
                    <span className={`store-badge-online${!store.is_online ? ' store-badge-offline' : ''}`}>
                      {store.is_online ? '🟢 Open Now' : '🔴 Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
            {/* Category Tabs */}
            {tabs.length > 1 && (
              <div className="category-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`cat-tab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {!store.is_online ? (
              <div className="empty-state">
                <div className="icon">🔴</div>
                <h3>Store is currently closed</h3>
                <p>Check back during opening hours to place an order</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📦</div>
                <h3>No products available</h3>
                <p>This store hasn't added products yet</p>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <h2>{activeTab === 'All' ? 'All Products' : activeTab}</h2>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{filtered.length} items</span>
                </div>
                <div className="products-grid">
                  {filtered.map((p: any) => (
                    <ProductCard key={p.id} product={{ ...p, store_id: id! }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
