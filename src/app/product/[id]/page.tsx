'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { items, addItem, updateQty } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch current product
      const { data: pData } = await supabase
        .from('store_products')
        .select(`
          product_id,
          store_id,
          is_in_stock,
          products!inner(id, name, weight, standard_mrp, emoji, image_url, category_id)
        `)
        .eq('product_id', id)
        .limit(1)
        .maybeSingle();
      
      if (!pData) {
        setLoading(false);
        return;
      }
      
      const p = { ...pData.products, product_id: pData.product_id, store_id: pData.store_id, is_in_stock: pData.is_in_stock, price: pData.products.standard_mrp };
      setProduct(p);

      // 2. Fetch variants
      const searchTerms = p.name.split(' ').slice(0, 3).join(' ');
      const { data: varData } = await supabase
        .from('store_products')
        .select(`
          product_id,
          store_id,
          is_in_stock,
          products!inner(id, name, weight, standard_mrp, emoji, image_url, category_id)
        `)
        .eq('is_in_stock', true)
        .ilike('products.name', `%${searchTerms}%`)
        .limit(5);

      if (varData) {
        const vList = varData.map((v: any) => ({ ...v.products, product_id: v.product_id, store_id: v.store_id, is_in_stock: v.is_in_stock, price: v.products.standard_mrp }));
        const unique = Array.from(new Map(vList.map((item:any) => [item.weight?.trim(), item])).values()) as any[];
        if (!unique.find((u:any) => u.product_id === p.product_id)) unique.unshift(p);
        unique.sort((a, b) => a.price - b.price);
        if (unique.length > 0 && !unique.find((u:any) => u.weight?.includes('Pack'))) {
          const base = unique[0];
          unique.push({ ...base, id: base.id + '_pack3', weight: 'Pack of 3', price: base.price * 3, is_pack_of_3: true });
        }
        setVariants(unique);
      }

      // 3. Fetch similar products
      if (p.category_id) {
        const { data: simData } = await supabase
          .from('store_products')
          .select(`
            product_id,
            store_id,
            is_in_stock,
            products!inner(id, name, weight, standard_mrp, emoji, image_url, category_id)
          `)
          .eq('is_in_stock', true)
          .eq('products.category_id', p.category_id)
          .limit(10);
        if (simData) {
          const sList = simData.map((v: any) => ({ ...v.products, product_id: v.product_id, store_id: v.store_id, is_in_stock: v.is_in_stock, price: v.products.standard_mrp }));
          const sUnique = Array.from(new Map(sList.map(item => [item.id, item])).values());
          setSimilar(sUnique);
        }
      }
      
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!product) return <div style={{ padding: 20 }}>Product not found</div>;

  const cartItem = items.find(i => i.product_id === product.product_id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    const amount = product.is_pack_of_3 ? 3 : 1;
    for (let i = 0; i < amount; i++) addItem(product);
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="main-content" style={{ background: '#fff' }}>
        <div className="container">
          <div className="product-layout">
            {/* Left Column: Image */}
            <div className="product-image-col">
              <div style={{ border: '1px solid #f1f4f9', borderRadius: '16px', overflow: 'hidden', padding: '40px' }}>
                <img 
                  src={product.image_url || 'https://res.cloudinary.com/ytjg5qba/image/upload/v1783821791/knj75zdizge1sr1sehso.avif'} 
                  alt={product.name} 
                  style={{ width: '100%', height: '400px', objectFit: 'contain' }} 
                />
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="product-info-col">
              <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
                <span>/</span>
                <Link href={`/category/${product.category_id}`} style={{ textDecoration: 'none', color: '#64748b' }}>Category</Link>
                <span>/</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{product.name}</span>
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: '#1e293b', lineHeight: 1.2 }}>
                {product.name}
              </h1>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12, marginBottom: 24 }}>
                <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b' }}>Flavour</div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Masala</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b' }}>Shelf Life</div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>8 Months</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f4f9', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 16, margin: '0 0 16px 0', color: '#475569' }}>Select Unit</h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {variants.map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => setProduct(v)} 
                      style={{
                        padding: '16px',
                        border: v.id === product.id ? '2px solid var(--brand-green)' : '1px solid #e2e8f0',
                        background: v.id === product.id ? '#f0fdf4' : '#fff',
                        borderRadius: 12,
                        minWidth: 140,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {v.id === product.id && (
                        <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--brand-green)', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                          ✓
                        </div>
                      )}
                      <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{v.weight}</div>
                      <div style={{ fontWeight: 800, fontSize: 20, marginTop: 8, color: '#1e293b' }}>₹{v.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', borderTop: '1px solid #f1f4f9', borderBottom: '1px solid #f1f4f9', marginTop: '24px' }}>
                 <div>
                   <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{product.weight}</div>
                   <div style={{ fontWeight: 800, fontSize: 28, color: '#1e293b' }}>₹{product.price}</div>
                   <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>(Inclusive of all taxes)</div>
                 </div>
                 
                 <div style={{ minWidth: '160px' }}>
                   {qty === 0 ? (
                     <button onClick={handleAdd} style={{ width: '100%', background: 'var(--brand-green)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 12, fontWeight: 800, fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                       Add to cart
                     </button>
                   ) : (
                     <div style={{ background: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: '8px 16px', color: '#fff' }}>
                       <button onClick={() => updateQty(product.product_id, qty - (product.is_pack_of_3 ? 3 : 1))} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', padding: '0 8px' }}>−</button>
                       <span style={{ fontWeight: 800, fontSize: 20 }}>{qty}</span>
                       <button onClick={() => updateQty(product.product_id, qty + (product.is_pack_of_3 ? 3 : 1))} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', padding: '0 8px' }}>+</button>
                     </div>
                   )}
                 </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 20 }}>Why shop from Chotu?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚡</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Superfast Delivery</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Get your items delivered to your doorstep in minutes.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏷️</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Best Prices & Offers</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Cheaper prices than your local supermarket, always.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Wide Assortment</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Choose from thousands of products across all categories.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div style={{ marginTop: 60, paddingBottom: 60, borderTop: '1px solid #f1f4f9', paddingTop: 40 }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px 0', color: '#1e293b' }}>Similar products</h3>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
              {similar.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
