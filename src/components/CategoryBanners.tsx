import Link from 'next/link';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  bg_color: string;
  emoji: string;
  redirect_url?: string;
}

const DEFAULT_PROMOS: PromoBanner[] = [
  { id: '1', title: 'Pharmacy at your doorstep!', subtitle: 'Medicines, health essentials & more', cta_text: 'Order Now', bg_color: '#0EA5E9', emoji: '💊' },
  { id: '2', title: 'Fresh Fruits & Vegetables', subtitle: 'Farm fresh, delivered daily', cta_text: 'Order Now', bg_color: '#10B981', emoji: '🥦' },
  { id: '3', title: 'Dairy & Bakery Essentials', subtitle: 'Milk, bread, eggs & more', cta_text: 'Order Now', bg_color: '#F59E0B', emoji: '🥛' },
];

export default function CategoryBanners({ banners }: { banners?: PromoBanner[] }) {
  const data = (banners && banners.length > 0) ? banners.slice(0, 3) : DEFAULT_PROMOS;

  return (
    <div className="promo-banners">
      {data.map(b => {
        const isImageUrl = b.emoji && (b.emoji.startsWith('http://') || b.emoji.startsWith('https://'));
        const cardContent = (
          <div
            className="promo-card"
            style={{ 
              background: isImageUrl 
                ? `url(${b.emoji}) center/cover no-repeat` 
                : (b.bg_color || '#10B981'),
              cursor: b.redirect_url ? 'pointer' : 'default',
              height: '240px',
              padding: isImageUrl ? '0px' : '24px 24px 18px'
            }}
          >
            {!isImageUrl && (
              <>
                <h3>{b.title}</h3>
                <p>{b.subtitle}</p>
                <span className="promo-card-btn">{b.cta_text || 'Order Now'}</span>
                <span style={{ position: 'absolute', right: 16, bottom: 10, fontSize: 56, opacity: 0.22 }}>
                  {b.emoji || '🛒'}
                </span>
              </>
            )}
          </div>
        );

        return b.redirect_url ? (
          <Link key={b.id} href={b.redirect_url} style={{ display: 'block', height: '100%' }}>
            {cardContent}
          </Link>
        ) : (
          <div key={b.id}>{cardContent}</div>
        );
      })}
    </div>
  );
}
