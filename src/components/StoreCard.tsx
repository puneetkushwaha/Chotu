import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  is_online: boolean;
  delivery_radius_km: number;
  emoji?: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Grocery & Staples': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
  'Dairy & Bakery': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
  'Fruits & Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=300&q=80',
  'Meat & Fish': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=300&q=80',
  'Pharmacy': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=300&q=80',
  'Snacks & Beverages': 'https://images.unsplash.com/photo-1599490659213-e2b9527b0f76?auto=format&fit=crop&w=300&q=80',
  'Personal Care': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=300&q=80',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80',
};

export default function StoreCard({ store }: { store: Store }) {
  const imageUrl = CATEGORY_IMAGES[store.category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
  return (
    <Link href={`/store/${store.id}`} className="store-card">
      <div className="store-card-banner" style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: store.is_online ? 1 : 0.5,
        height: '120px'
      }}>
      </div>
      <div className="store-card-body">
        <div className="store-card-name">{store.name}</div>
        <div className="store-card-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {store.rating?.toFixed(1) || '5.0'}
          </span>
          <span>•</span>
          <span>{store.delivery_radius_km || 3} km delivery</span>
        </div>
        <span className={`store-badge-online${!store.is_online ? ' store-badge-offline' : ''}`}>
          <span style={{ fontSize: 8 }}>{store.is_online ? '●' : '●'}</span>
          {store.is_online ? 'Open Now' : 'Closed'}
        </span>
      </div>
    </Link>
  );
}
