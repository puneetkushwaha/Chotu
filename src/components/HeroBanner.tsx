'use client';
import { useState, useEffect } from 'react';

import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  bg_color: string;
  emoji: string;
  redirect_url?: string;
}

export default function HeroBanner({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #059669, #10B981)', display: 'flex', alignItems: 'center', padding: '32px 40px' }}>
        <div className="hero-banner-content">
          <h2>Apni Dukaan,<br />Ghar Tak</h2>
          <p>Order daily essentials from local shops near you</p>
          <a href="#stores" className="hero-btn">Shop Now</a>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-banner" style={{ height: 250 }}>
      {banners.map((b, i) => {
        const isImageUrl = b.emoji && (b.emoji.startsWith('http://') || b.emoji.startsWith('https://'));
        const slideContent = (
          <div
            className={`hero-banner-slide${i === active ? ' active' : ''}`}
            style={{ 
              background: isImageUrl 
                ? `url(${b.emoji}) center/cover no-repeat` 
                : (b.bg_color || 'linear-gradient(135deg, #059669, #10B981)'),
              cursor: b.redirect_url ? 'pointer' : 'default'
            }}
          >
            {!isImageUrl && (
              <>
                <div className="hero-banner-content">
                  <h2>{b.title}</h2>
                  <p>{b.subtitle}</p>
                  <span className="hero-btn">{b.cta_text || 'Shop Now'}</span>
                </div>
                <span style={{ position: 'absolute', right: 60, fontSize: 100, opacity: 0.25 }}>
                  {b.emoji || '🛒'}
                </span>
              </>
            )}
          </div>
        );

        return b.redirect_url ? (
          <Link key={b.id} href={b.redirect_url}>
            {slideContent}
          </Link>
        ) : (
          <div key={b.id}>{slideContent}</div>
        );
      })}
      <div className="hero-dots">
        {banners.map((_, i) => (
          <button key={i} className={`hero-dot${i === active ? ' active' : ''}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </div>
  );
}
