import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="category-grid">
      {categories.map(cat => (
        <Link key={cat.id} href={`/category/${cat.id}`} className="category-card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div className="category-emoji" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            {cat.emoji && (cat.emoji.startsWith('http://') || cat.emoji.startsWith('https://')) ? (
              <img src={cat.emoji} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '48px' }}>{cat.emoji || '📦'}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
