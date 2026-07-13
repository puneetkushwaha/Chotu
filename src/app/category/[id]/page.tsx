'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function CategoryProductsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items, updateQty } = useCart();
  
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        // 1. Fetch category name
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        
        if (catData) setCategory(catData);

        // 2. Fetch all products matching this category_id that are actually available in at least one store
        const { data: storeProdData } = await supabase
          .from('store_products')
          .select(`
            product_id,
            products!inner(*)
          `)
          .eq('products.category_id', id)
          .eq('is_in_stock', true);
        
        if (storeProdData) {
          // Extract products and remove duplicates (if multiple stores have the same product)
          const uniqueProductsMap = new Map();
          storeProdData.forEach((sp: any) => {
            if (sp.products && !uniqueProductsMap.has(sp.product_id)) {
              uniqueProductsMap.set(sp.product_id, sp.products);
            }
          });
          const uniqueProducts = Array.from(uniqueProductsMap.values());
          // Sort alphabetically by name
          uniqueProducts.sort((a, b) => a.name.localeCompare(b.name));
          setProducts(uniqueProducts);
        }
      } catch (_) {}
      setLoading(false);
    };
    loadData();
  }, [id]);

  const getItemQty = (productId: string) => {
    return items.find(i => i.product_id === productId)?.quantity || 0;
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="main-content" style={{ minHeight: '80vh', paddingBottom: '80px' }}>
        <div className="container" style={{ paddingTop: '32px' }}>
          {/* Back button & Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <button 
              onClick={() => router.back()} 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#f1f4f9', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '18px', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              ←
            </button>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                {category?.name || 'Category'}
              </h1>
              <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
                {loading ? 'Loading items...' : `${products.length} items found`}
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
              <h3>No items available</h3>
              <p>We are mapping products to this category.</p>
            </div>
          ) : (
            /* Products Grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {products.map(p => {
                const qty = getItemQty(p.id);
                const imageUrl = p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                return (
                  <div 
                    key={p.id} 
                    style={{ 
                      background: 'white', 
                      border: '1.5px solid #f1f4f9', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Clickable Area for Product Details */}
                    <div 
                      onClick={() => router.push('/product/' + p.id)}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      {/* Image Area */}
                      <div style={{ 
                        height: '130px', 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <img src={imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <span style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          {p.weight}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.4' }}>
                          {p.name}
                        </h4>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>₹{p.standard_mrp}</span>
                      </div>

                      {qty > 0 ? (
                        <div className="qty-control" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>
                          <button className="qty-btn" onClick={() => updateQty(p.id, qty - 1)}>−</button>
                          <span className="qty-value">{qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(p.id, qty + 1)}>+</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addItem({
                            id: p.id,
                            product_id: p.id,
                            store_id: 'unified', // mapped automatically on backend checkout
                            name: p.name,
                            emoji: p.emoji || '📦',
                            weight: p.weight,
                            price: p.standard_mrp
                          })}
                          style={{
                            background: 'white',
                            border: '1.5px solid var(--brand-green)',
                            color: 'var(--brand-green)',
                            padding: '6px 16px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--brand-green)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'var(--brand-green)';
                          }}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
