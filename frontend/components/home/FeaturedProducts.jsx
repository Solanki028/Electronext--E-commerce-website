'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
 

const GOLD = '#b8976a';
const GOLD_LIGHT = '#d4b896';
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

/* ── Ticker strip ── */
const TICKER_ITEMS = ['New Arrivals', 'Free Shipping Over ₹999', 'Curated by Experts', 'Premium Selection', 'Exclusive Deals', 'Top Rated'];

function Ticker() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ borderTop: '1px solid rgba(184,151,106,0.15)', borderBottom: '1px solid rgba(184,151,106,0.15)', background: '#070707', padding: '10px 0' }}
    >
      <div
        style={{
          display: 'flex',
          gap: '3rem',
          animation: 'ticker 28s linear infinite',
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2rem' }}>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {item}
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: GOLD, opacity: 0.6, display: 'inline-block', flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({ product, index, visible }) {
  const [hovered, setHovered] = useState(false);

  const price = product.price ?? product.salePrice ?? 0;
  const originalPrice = product.originalPrice ?? product.mrp;
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const imageUrl = product.images?.[0]?.url || product.image?.url;
  const hoverImage = product.images?.[1]?.url;

  // Alternating heights for visual rhythm
  const isTall = index % 5 === 1 || index % 5 === 4;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.8s ease ${index * 0.07}s, transform 0.8s ease ${index * 0.07}s`,
      }}
    >
      <Link href={`/product/${product.slug}`}>
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ background: '#0f0f0f' }}
        >
          {/* Image container */}
          <div
            className="relative overflow-hidden"
            style={{ height: isTall ? 'clamp(320px, 42vh, 480px)' : 'clamp(260px, 34vh, 380px)' }}
          >
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  style={{ transition: 'transform 900ms cubic-bezier(0.25,0.46,0.45,0.94)', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Hover second image */}
                {hoverImage && (
                  <Image
                    src={hoverImage}
                    alt={product.name}
                    fill
                    className="object-cover object-center absolute inset-0"
                    style={{ transition: 'opacity 600ms ease', opacity: hovered ? 1 : 0 }}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #151515 0%, #1a1a1a 100%)' }} />
            )}

            {/* Bottom gradient */}
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

            {/* Grain */}
            <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-40" style={{ backgroundImage: GRAIN, backgroundSize: '256px 256px' }} />

            {/* Discount badge */}
            {hasDiscount && (
              <div
                className="absolute top-4 left-4 z-30"
                style={{
                  background: GOLD,
                  padding: '3px 10px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#000',
                  textTransform: 'uppercase',
                }}
              >
                -{discount}%
              </div>
            )}

            {/* Featured badge */}
            {product.isFeatured && !hasDiscount && (
              <div
                className="absolute top-4 left-4 z-30"
                style={{
                  border: `1px solid ${GOLD}`,
                  padding: '3px 10px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.52rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  color: GOLD,
                  textTransform: 'uppercase',
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                Featured
              </div>
            )}

            {/* Hover CTA pill */}
            <div
              className="absolute bottom-4 left-1/2 z-30"
              style={{
                transform: `translateX(-50%) translateY(${hovered ? '0px' : '12px'})`,
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${GOLD}44`,
                padding: '8px 20px',
                whiteSpace: 'nowrap',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.25em',
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              View Product →
            </div>
          </div>

          {/* Info strip */}
          <div style={{ padding: '14px 4px 18px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {/* Brand */}
            {product.brand && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginBottom: '5px' }}>
                {product.brand}
              </p>
            )}

            {/* Name */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.15rem',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.25,
                marginBottom: '10px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.name}
            </p>

            {/* Price row */}
            <div className="flex items-baseline gap-2">
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 500, color: 'white' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Gold underline on hover */}
            <div
              style={{
                height: '1px',
                background: GOLD,
                marginTop: '12px',
                transition: 'width 0.5s ease',
                width: hovered ? '100%' : '0%',
              }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard({ index }) {
  const isTall = index % 5 === 1 || index % 5 === 4;
  return (
    <div style={{ background: '#0f0f0f' }}>
      <div
        style={{
          height: isTall ? 'clamp(320px, 42vh, 480px)' : 'clamp(260px, 34vh, 380px)',
          background: 'linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s infinite',
        }}
      />
      <div style={{ padding: '14px 4px 18px', background: '#0a0a0a' }}>
        <div style={{ height: '8px', width: '40%', background: '#1a1a1a', marginBottom: '8px', borderRadius: 0 }} />
        <div style={{ height: '14px', width: '80%', background: '#1a1a1a', marginBottom: '6px', borderRadius: 0 }} />
        <div style={{ height: '14px', width: '55%', background: '#1a1a1a', marginBottom: '10px', borderRadius: 0 }} />
        <div style={{ height: '10px', width: '30%', background: '#1a1a1a', borderRadius: 0 }} />
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function FeaturedProducts({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading]);

  if (!loading && !products.length) return null;

  return (
    <>
      

      {/* Ticker strip */}
      <Ticker />

      <section
        ref={sectionRef}
        style={{ background: '#080808', padding: 'clamp(3rem, 6vw, 6rem) 0' }}
      >
        {/* Section header */}
        <div
          style={{
            padding: '0 clamp(1.5rem, 4vw, 4rem)',
            marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
          }}
        >
          {/* Left: titles */}
          <div>
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.38em',
                color: GOLD,
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              Hand-Picked by Our Experts
            </p>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2.8rem, 5vw, 5.5rem)',
                fontWeight: 300,
                color: 'white',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
              }}
            >
              Featured
              <br />
              <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>Products</em>
            </h2>
          </div>

          {/* Right: count + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', flexShrink: 0 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', fontWeight: 300, color: 'rgba(255,255,255,0.08)', lineHeight: 1 }}>
              {String(products.length || 8).padStart(2, '0')}
            </p>
            <Link href="/products?isFeatured=true">
              <div className="group flex items-center gap-3" style={{ cursor: 'pointer' }}>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    letterSpacing: '0.3em',
                    color: GOLD,
                    textTransform: 'uppercase',
                  }}
                >
                  View All
                </span>
                <div style={{ height: '1px', background: GOLD, width: '24px', transition: 'width 0.4s ease' }} className="group-hover:!w-12" />
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Gold rule */}
        <div
          style={{
            margin: '0 clamp(1.5rem, 4vw, 4rem)',
            height: '1px',
            background: `linear-gradient(to right, ${GOLD}55, transparent)`,
            marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 1s ease 0.2s',
          }}
        />

        {/* Product grid */}
        <div
          style={{
            padding: '0 clamp(1.5rem, 4vw, 4rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3px',
          }}
          className="md:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            : products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} visible={visible} />
            ))
          }
        </div>

        {/* Bottom CTA strip */}
        {!loading && products.length > 0 && (
          <div
            style={{
              marginTop: 'clamp(2.5rem, 5vw, 4rem)',
              display: 'flex',
              justifyContent: 'center',
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease 0.8s',
            }}
          >
            <Link href="/products?isFeatured=true">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                  border: `1px solid ${GOLD}44`,
                  padding: '14px 40px',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="group hover:!bg-[#b8976a0d] hover:!border-[#b8976a88]"
              >
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.32em',
                    color: GOLD,
                    textTransform: 'uppercase',
                  }}
                >
                  Explore All Featured Products
                </span>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}