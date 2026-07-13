'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import CategoryBanners from '@/components/CategoryBanners';
import CategoryGrid from '@/components/CategoryGrid';
import OrderAgain from '@/components/OrderAgain';
import StoreCard from '@/components/StoreCard';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [storesRes, catsRes, bannersRes] = await Promise.all([
          fetch('/api/stores').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/banners').then(r => r.json()),
        ]);
        setStores(Array.isArray(storesRes) ? storesRes : []);
        setCategories(Array.isArray(catsRes) ? catsRes : []);
        const allBanners = Array.isArray(bannersRes) ? bannersRes : [];
        setHeroBanners(allBanners.filter((b: any) => b.type === 'hero'));
        setPromoBanners(allBanners.filter((b: any) => b.type === 'promo'));
      } catch (_) {}
      setLoading(false);
    };
    load();

    // Enable realtime stores listener
    const channel = supabase
      .channel('public-stores-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stores' },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="main-content">
        <div className="container">
          {/* Hero Banner */}
          <div className="home-section">
            <HeroBanner banners={heroBanners} />
          </div>

          {/* Promo Cards */}
          <div className="home-section" style={{ paddingTop: 0 }}>
            <CategoryBanners banners={promoBanners} />
          </div>

          {/* Category Grid */}
          {(loading || categories.length > 0) && (
            <div className="home-section" id="categories">
              <div className="section-header">
                <h2>Shop by Category</h2>
              </div>
              {loading ? (
                <div className="category-grid">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
                  ))}
                </div>
              ) : (
                <CategoryGrid categories={categories} />
              )}
            </div>
          )}

          {/* Nearby Stores */}
          <div className="home-section" id="stores">
            <div className="section-header">
              <h2>🏪 Shops Near You</h2>
              <span className="see-all">{stores.length} stores</span>
            </div>
            {loading ? (
              <div className="stores-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />
                ))}
              </div>
            ) : stores.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🏪</div>
                <h3>No stores available yet</h3>
                <p>We are currently onboarding shops in your area.</p>
              </div>
            ) : (
              <div className="stores-grid">
                {stores.map(store => <StoreCard key={store.id} store={store} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer categories={categories} />
    </>
  );
}
