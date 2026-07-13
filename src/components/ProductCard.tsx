'use client';
import { useCart } from '@/context/CartContext';

import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  product_id: string;
  store_id: string;
  name: string;
  emoji: string;
  weight: string;
  price: number;
  is_in_stock: boolean;
  image_url?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find(i => i.product_id === product.product_id);
  const qty = cartItem?.quantity || 0;

  const router = useRouter();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      product_id: product.product_id,
      store_id: product.store_id,
      name: product.name,
      emoji: product.emoji || '📦',
      weight: product.weight,
      price: product.price,
    });
  };

  const handleUpdateQty = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    updateQty(product.product_id, qty + delta);
  };

  const handleClick = () => {
    try {
      const viewed = localStorage.getItem('recently_viewed');
      let list = viewed ? JSON.parse(viewed) : [];
      list = list.filter((p: any) => p.id !== product.id);
      list.unshift(product);
      if (list.length > 15) list = list.slice(0, 15);
      localStorage.setItem('recently_viewed', JSON.stringify(list));
    } catch(e) {}
    
    router.push(`/product/${product.product_id || product.id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ height: 80, objectFit: 'contain' }} />
          : <span>{product.emoji || '📦'}</span>
        }
      </div>
      <div className="product-weight">{product.weight}</div>
      <div className="product-name">{product.name}</div>
      <div className="product-footer">
        <span className="product-price">₹{product.price}</span>
        {!product.is_in_stock ? (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Out of stock</span>
        ) : qty === 0 ? (
          <button className="btn-add" onClick={handleAdd}>+ Add</button>
        ) : (
          <div className="qty-control" onClick={e => e.stopPropagation()}>
            <button className="qty-btn" onClick={(e) => handleUpdateQty(e, -1)}>−</button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={(e) => handleUpdateQty(e, 1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
