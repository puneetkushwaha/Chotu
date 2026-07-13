'use client';
import Link from 'next/link';

export default function Footer({ categories }: { categories: { id: string; name: string }[] }) {
  const usefulLinks = ['About Us', 'Blog', 'Privacy Policy', 'Terms & Conditions', 'Contact', 'FAQs'];
  const partnerLinks = ['Partner with Us', 'Become a Merchant', 'Advertise', 'Careers'];

  return (
    <footer style={{ background: '#090d16', color: '#94a3b8', padding: '60px 0 30px', borderTop: '4px solid var(--brand-green)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.8fr', gap: '50px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Brand & App downloads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--brand-green)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/mascot.jpg" alt="Chotu Mascot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                chotu<span style={{ color: 'var(--brand-green)' }}>.</span>
                <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', fontWeight: 700, marginTop: '-6px' }}>instant</span>
              </div>
            </div>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.6', fontWeight: 500 }}>
              Chotu is India's local instant commerce platform, connecting you with trusted neighborhood shopkeepers for delivery in minutes.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: 'white', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                🤖 Google Play
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: 'white', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                🍎 App Store
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 800, marginBottom: '18px', fontFamily: 'Outfit' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                {usefulLinks.map(l => (
                  <a key={l} href="#" style={{ color: '#64748b', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-green)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 800, marginBottom: '18px', fontFamily: 'Outfit' }}>Partner</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                {partnerLinks.map(l => (
                  <a key={l} href="#" style={{ color: '#64748b', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-green)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>{l}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '18px' }}>
              <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 800, fontFamily: 'Outfit', margin: 0 }}>Categories</h4>
              <a href="#categories" style={{ fontSize: '12px', color: 'var(--brand-green)', fontWeight: 700, textDecoration: 'none', marginLeft: '12px' }}>See all →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 14px', fontSize: '13px' }}>
              {categories.length > 0 ? (
                categories.slice(0, 12).map(c => (
                  <a key={c.id} href={`#cat-${c.id}`} style={{ color: '#64748b', transition: 'color 0.2s', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-green)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>{c.name}</a>
                ))
              ) : (
                ['Dairy & Eggs', 'Fruits & Veggies', 'Snacks & Munchies', 'Breakfast & Cereals', 'Bakery & Biscuits', 'Tea & Coffee', 'Atta & Rice', 'Oil & Masala', 'Personal Care', 'Home Essentials', 'Baby Care', 'Pharma'].map(c => (
                  <a key={c} href="#" style={{ color: '#64748b', transition: 'color 0.2s', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-green)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>{c}</a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
            © {new Date().getFullYear()} Chotu Instant Commerce. Made with ❤️ in India.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Instagram', 'Twitter', 'Facebook', 'LinkedIn'].map((social, i) => (
              <a 
                key={i} 
                href="#" 
                style={{ 
                  color: '#475569', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  textDecoration: 'none', 
                  transition: 'color 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'} 
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
