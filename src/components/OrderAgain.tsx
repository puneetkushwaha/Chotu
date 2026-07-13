'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function OrderAgain() {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [previouslyBought, setPreviouslyBought] = useState<any[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<any[]>([]);

  useEffect(() => {
    // Load recently viewed
    const viewed = localStorage.getItem('recently_viewed');
    if (viewed) {
      try {
        setRecentlyViewed(JSON.parse(viewed));
      } catch (e) {}
    }

    const mapStoreProduct = (v: any) => ({ ...v.products, product_id: v.product_id, store_id: v.store_id, is_in_stock: v.is_in_stock, price: v.products.standard_mrp });

    // Load Frequently Bought
    const loadFreq = async () => {
      const { data } = await supabase.from('store_products')
        .select('product_id, store_id, is_in_stock, products!inner(*)')
        .eq('is_in_stock', true)
        .limit(15);
      if (data) {
        let mapped = data.map(mapStoreProduct);
        mapped = Array.from(new Map(mapped.map(item => [item.id, item])).values());
        mapped.sort(() => 0.5 - Math.random());
        setFrequentlyBought(mapped.slice(0, 6));
      }
    };
    loadFreq();

    // Load Previously Bought
    const loadPrev = async () => {
      const phone = localStorage.getItem('chotu_merchant_phone');
      if (phone) {
        const { data: orders } = await supabase.from('orders').select('id').eq('customer_phone', phone);
        if (orders && orders.length > 0) {
          const orderIds = orders.map((o: any) => o.id);
          const { data: items } = await supabase.from('order_items').select('product_id, products(*)').in('order_id', orderIds);
          if (items) {
            const unique: any = {};
            items.forEach((item: any) => {
              if (item.products) unique[item.product_id] = { ...item.products, product_id: item.product_id, price: item.products.standard_mrp, is_in_stock: true };
            });
            setPreviouslyBought(Object.values(unique));
          }
        }
      }
    };
    loadPrev();
  }, []);

  const renderProductGrid = (title: string, products: any[]) => {
    if (products.length === 0) return null;
    return (
      <div className="home-section" style={{ paddingBottom: '12px' }}>
        <div className="section-header">
          <h2>{title}</h2>
        </div>
        <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {products.map((product: any, idx: number) => (
            <ProductCard key={idx} product={product} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderProductGrid('Recently Viewed', recentlyViewed)}
      {renderProductGrid('Previously Bought', previouslyBought)}
      {renderProductGrid('Frequently Bought', frequentlyBought)}
    </>
  );
}
