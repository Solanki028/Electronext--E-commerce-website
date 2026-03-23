'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/* ─────────────────────────────────────────────
   APPLIANCE SHOWCASE — 2x2 Bento Grid
   Matches user reference image.
───────────────────────────────────────────── */

const CARD_THEMES = [
  {
    bg: 'linear-gradient(180deg, #182234 0%, #201a35 100%)',
    label: 'Best Deals on',
  },
  {
    bg: 'linear-gradient(180deg, #16364a 0%, #151a2a 100%)',
    label: 'Top Rated',
  },
  {
    bg: 'linear-gradient(180deg, #1e3a5f 0%, #301736 100%)',
    label: 'Bestselling',
  },
  {
    bg: 'linear-gradient(180deg, #2a1515 0%, #15152a 100%)',
    label: 'Trending',
  },
];

const FALLBACK = [
  { name: 'Microwave Ovens', slug: 'microwave-ovens', startingPrice: '₹8,000' },
  { name: 'Air Coolers', slug: 'air-coolers', startingPrice: '₹5,000' },
  { name: 'Fans', slug: 'fans', startingPrice: '₹2,500' },
  { name: 'Water Heaters', slug: 'water-heaters', startingPrice: '₹6,000' }
];

function BannerCard({ category, theme, index, visible }) {
  const [hovered, setHovered] = useState(false);

  const img = category?.image?.url || category?.banner?.url;
  // Fallback to ensuring .png is loaded correctly if it's the seed fallback. 
  // We'll replace the `.webp` fallback in the seed with `.png` below.
  const resolvedImg = img?.replace('.webp', '.png');

  const name = category?.name || FALLBACK[index]?.name || 'Category';
  const slug = category?.slug || FALLBACK[index]?.slug || '#';
  const startingPrice = category?.startingPrice || FALLBACK[index]?.startingPrice;

  return (
    <Link href={`/category/${slug}`} style={{ display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(280px, 40vw, 380px)', // Tall vertical cards
          background: theme.bg,
          overflow: 'hidden',
          cursor: 'pointer',
          borderRadius: '12px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: `opacity 0.8s ease ${index * 0.12}s, transform 0.8s ease ${index * 0.12}s`,
        }}
      >
        {/* Top Text */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.25rem', textAlign: 'center', zIndex: 10 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            {theme.label}
          </p>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.15rem, 2.8vw, 1.45rem)', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {name}
          </h3>
        </div>

        {/* Center Image (Now Full Bleed) */}
        {resolvedImg && (
          <>
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <Image
                src={resolvedImg}
                alt={name}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'transform 800ms cubic-bezier(0.25,0.46,0.45,0.94)',
                  transform: hovered ? 'scale(1.08)' : 'scale(1.0)',
                }}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>

            {/* Gradient Overlays for Text Readability */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.9) 100%)', pointerEvents: 'none' }} />
          </>
        )}

        {/* Bottom Price */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', textAlign: 'center', zIndex: 10 }}>
          <div style={{ width: '35px', height: '1.5px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 10px', transition: 'width 0.4s ease', ...(hovered ? { width: '55px' } : {}) }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
            Starting at <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{startingPrice}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard({ index }) {
  return (
    <div style={{
      height: 'clamp(280px, 40vw, 380px)',
      borderRadius: '12px',
      background: 'linear-gradient(180deg, #181818 0%, #101010 100%)',
      animation: `shimmer 1.8s ease ${index * 0.15}s infinite`,
    }} />
  );
}

export default function ApplianceShowcase({ initialCategories = [] }) {
  const [categories, setCategories] = useState(() => {
    const requiredSlugs = ['microwave-ovens', 'air-coolers', 'fans', 'water-heaters'];
    return requiredSlugs.map(slug => initialCategories.find(c => c.slug === slug)).filter(Boolean);
  });
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loading]);

  const items = loading
    ? [null, null, null, null]
    : [...categories, ...Array(Math.max(0, 4 - categories.length)).fill(null)].slice(0, 4);

  return (
    <section ref={ref} style={{ background: '#080808', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 2.5rem)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 'clamp(1.25rem, 2.5vw, 2rem)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.32em', color: '#c9934a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
            Handpicked For You
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 0.95, letterSpacing: '-0.025em' }}>
            Categories
          </h2>
        </div>
        <Link href="/categories">
          <div className="group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '4px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', transition: 'color 0.3s' }} className="group-hover:!text-white">
              All Categories
            </span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="#c9934a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
      </div>

      <div style={{
        height: '1px',
        marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
        background: 'linear-gradient(to right, #c9934a55, transparent)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.2s',
      }} />

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px] md:gap-[16px]">
        {items.map((cat, i) =>
          loading
            ? <SkeletonCard key={i} index={i} />
            : <BannerCard key={cat?._id || i} category={cat} theme={CARD_THEMES[i]} index={i} visible={visible} />
        )}
      </div>
    </section>
  );
}