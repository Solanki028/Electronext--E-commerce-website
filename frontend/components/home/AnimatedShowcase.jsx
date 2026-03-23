'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatters';

 

const GOLD = '#b8976a';

const BENTO = [
  // [className, height]
  { className: 'col-span-1 md:col-span-2 md:row-span-1', height: 'clamp(380px, 52vh, 580px)' },
  { className: 'col-span-1 md:col-span-1 md:row-span-2', height: '100%' },
  { className: 'col-span-1 md:col-span-1 md:row-span-1', height: 'clamp(260px, 34vh, 360px)' },
  { className: 'col-span-1 md:col-span-1 md:row-span-1', height: 'clamp(260px, 34vh, 360px)' },
];

function ProductCard({ product, bentoCfg, index, visible }) {
  const [hovered, setHovered] = useState(false);
  const img1 = product?.images?.[0]?.url || product?.image?.url;
  const img2 = product?.images?.[1]?.url;

  const price = product?.salePrice ?? product?.price ?? 0;
  const originalPrice = product?.originalPrice ?? product?.mrp;
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link
      href={`/product/${product?.slug}`}
      className={bentoCfg.className}
      style={{
        display: 'block',
        height: bentoCfg.height,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.97)',
        transition: `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`,
      }}
    >
      <div
        className="relative w-full h-full overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: '#101010' }}
      >
        {/* Primary image */}
        {img1 && (
          <Image
            src={img1}
            alt={product.name}
            fill
            className="object-cover object-center"
            style={{
              transition: 'transform 1s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.5s ease',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              opacity: (hovered && img2) ? 0 : 1,
            }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
        )}

        {/* Secondary hover image */}
        {img2 && (
          <Image
            src={img2}
            alt={product.name}
            fill
            className="object-cover object-center"
            style={{
              transition: 'opacity 0.5s ease, transform 1s ease',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1.07)' : 'scale(1.02)',
            }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}

        {/* Always-on vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)',
          }}
        />

        {/* Hover: top overlay darkens slightly */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.18)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <div
            className="absolute top-4 left-4 z-20"
            style={{
              background: GOLD,
              padding: '4px 10px',
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

        {/* Bottom info — always visible, lifts on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{
            padding: '1.25rem 1.5rem',
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'transform 0.4s ease',
          }}
        >
          {/* Brand */}
          {product?.brand && (
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.55rem',
                letterSpacing: '0.28em',
                color: GOLD,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '5px',
              }}
            >
              {product.brand}
            </p>
          )}

          {/* Name */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: index === 0 ? 'clamp(1.4rem, 2.8vw, 2.4rem)' : 'clamp(1.1rem, 2vw, 1.6rem)',
              fontWeight: 400,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              marginBottom: '8px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product?.name}
          </p>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.04em',
              }}
            >
              {price ? formatPrice(price) : ''}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.38)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(originalPrice)}
              </span>
            )}

            {/* Arrow — slides in on hover */}
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.25em',
                  color: GOLD,
                  textTransform: 'uppercase',
                }}
              >
                View
              </span>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton ── */
function SkeletonCard({ bentoCfg }) {
  return (
    <div
      className={bentoCfg.className}
      style={{
        height: bentoCfg.height,
        background: 'linear-gradient(90deg, #111 0%, #1c1c1c 50%, #111 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s infinite',
      }}
    />
  );
}

export default function AnimatedShowcase({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loading]);

  if (!loading && !products.length) return null;

  return (
    <>
      

      <section
        ref={ref}
        style={{ background: '#080808', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1rem, 3vw, 2.5rem)' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <div>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', letterSpacing: '0.35em', color: GOLD, fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
              Freshly Dropped
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', fontWeight: 300, color: 'white', lineHeight: 0.92, letterSpacing: '-0.02em' }}>
              New Arrivals
            </h2>
          </div>

          <Link href="/products">
            <div className="group" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', paddingBottom: '4px' }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase' }}>
                Shop All
              </span>
              <div style={{ height: '1px', background: GOLD, width: '20px', transition: 'width 0.4s ease' }} className="group-hover:!w-10" />
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-[3px]">
          {loading
            ? BENTO.map((cfg, i) => <SkeletonCard key={i} bentoCfg={cfg} />)
            : products.map((p, i) => (
              <ProductCard
                key={p._id}
                product={p}
                bentoCfg={BENTO[i]}
                index={i}
                visible={visible}
              />
            ))}
        </div>
      </section>
    </>
  );
}