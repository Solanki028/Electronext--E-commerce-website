'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatters';

 

const CRIMSON = '#c0152a';
const CRIMSON_DIM = '#7a0d1b';
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`;

/* ── Countdown ── */
function Countdown({ endTime }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const [tick, setTick] = useState(false);
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endTime) - Date.now());
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
      setTick(t => !t);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  const pad = n => String(n).padStart(2, '0');
  const units = [{ val: time.h, label: 'HRS' }, { val: time.m, label: 'MIN' }, { val: time.s, label: 'SEC' }];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
      {units.map(({ val, label }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: CRIMSON, padding: '6px 10px', minWidth: '52px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <span style={{
                fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 900,
                color: 'white', lineHeight: 1, display: 'block', fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                transition: label === 'SEC' ? 'transform 0.1s ease' : 'none',
                transform: label === 'SEC' && tick ? 'translateY(-1px)' : 'translateY(0)',
              }}>{pad(val)}</span>
            </div>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.46rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginTop: '4px' }}>{label}</span>
          </div>
          {i < 2 && <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 900, color: CRIMSON, lineHeight: 1, marginBottom: '18px', opacity: tick ? 1 : 0.25, transition: 'opacity 0.5s' }}>:</span>}
        </div>
      ))}
    </div>
  );
}

/* ── Spotlight card ── */
function SpotlightCard({ product, visible }) {
  const [hovered, setHovered] = useState(false);
  const img = product?.images?.[0]?.url || product?.image?.url;
  const img2 = product?.images?.[1]?.url;
  const price = product?.salePrice ?? product?.price ?? 0;
  const original = product?.originalPrice ?? product?.mrp;
  const discount = product?.discountPercent || (original && original > price ? Math.round(((original - price) / original) * 100) : 0);
  return (
    <Link href={`/product/${product?.slug}`} style={{ display: 'block', height: '100%' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', height: '100%', minHeight: '520px',
          background: '#0d0d0d', overflow: 'hidden', cursor: 'pointer',
          opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
        }}
      >
        {img && <>
          <Image src={img} alt={product.name} fill
            style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform 1s ease, opacity 0.5s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)', opacity: hovered && img2 ? 0 : 1 }}
            sizes="45vw" priority />
          {img2 && <Image src={img2} alt={product.name} fill
            style={{ objectFit: 'cover', transition: 'opacity 0.5s ease, transform 1s ease', opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1.06)' : 'scale(1.02)' }}
            sizes="45vw" />}
        </>}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, backgroundImage: GRAIN, backgroundSize: '256px 256px', opacity: 0.5, mixBlendMode: 'overlay', pointerEvents: 'none' }} />

        {/* Deal badge */}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, background: CRIMSON, padding: '10px 18px' }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', display: 'block' }}>Deal</span>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.8rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.03em', display: 'block' }}>-{discount}%</span>
        </div>

        {/* Live dot */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: CRIMSON, boxShadow: `0 0 10px ${CRIMSON}, 0 0 20px ${CRIMSON}88`, animation: 'blink 1.4s infinite' }} />
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>Today Only</span>
        </div>

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '1.75rem 2rem' }}>
          {product?.brand && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', letterSpacing: '0.28em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{product.brand}</p>}
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(1.4rem, 2.8vw, 2.5rem)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product?.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{formatPrice(price)}</span>
              {original && <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>{formatPrice(original)}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(10px)', transition: 'opacity 0.3s, transform 0.3s' }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.25em', color: '#f0ece4', textTransform: 'uppercase' }}>Grab Deal</span>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke={CRIMSON} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Deal row ── */
function DealRow({ product, index, visible }) {
  const [hovered, setHovered] = useState(false);
  const img = product?.images?.[0]?.url || product?.image?.url;
  const price = product?.salePrice ?? product?.price ?? 0;
  const original = product?.originalPrice ?? product?.mrp;
  const discount = product?.discountPercent || (original && original > price ? Math.round(((original - price) / original) * 100) : 0);
  return (
    <Link href={`/product/${product?.slug}`} style={{ display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'stretch',
          background: hovered ? '#141414' : '#0f0f0f',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          cursor: 'pointer',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(30px)',
          transition: `background 0.3s ease, opacity 0.8s ease ${0.15 + index * 0.1}s, transform 0.8s ease ${0.15 + index * 0.1}s`,
        }}
      >
        {/* Vertical discount strip */}
        <div style={{ width: '48px', flexShrink: 0, background: hovered ? CRIMSON : CRIMSON_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.8rem', fontWeight: 900, color: 'white', letterSpacing: '0.05em', transform: 'rotate(180deg)' }}>-{discount}%</span>
        </div>
        {/* Image */}
        <div style={{ width: '108px', height: '100px', flexShrink: 0, position: 'relative', background: '#181818', overflow: 'hidden' }}>
          {img && <Image src={img} alt={product.name} fill style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }} sizes="108px" />}
        </div>
        {/* Info */}
        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
          {product?.brand && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>{product.brand}</p>}
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1rem', fontWeight: 600, color: hovered ? 'white' : 'rgba(255,255,255,0.8)', lineHeight: 1.2, transition: 'color 0.3s', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product?.name}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '2px' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{formatPrice(price)}</span>
            {original && <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.22)', textDecoration: 'line-through' }}>{formatPrice(original)}</span>}
          </div>
        </div>
        {/* Arrow */}
        <div style={{ width: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0.18, transition: 'opacity 0.3s' }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke={CRIMSON} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </Link>
  );
}

/* ── Skeletons ── */
function SpotlightSkeleton() {
  return <div style={{ minHeight: '520px', height: '100%', background: 'linear-gradient(90deg,#111 0%,#1c1c1c 50%,#111 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s infinite' }} />;
}
function RowSkeleton() {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', height: '100px' }}>
      <div style={{ width: '48px', background: CRIMSON_DIM, opacity: 0.3 }} />
      <div style={{ width: '108px', background: '#181818' }} />
      <div style={{ flex: 1, padding: '12px 14px', background: '#0f0f0f', display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'center' }}>
        <div style={{ height: '7px', width: '32%', background: '#1e1e1e' }} />
        <div style={{ height: '13px', width: '82%', background: '#1e1e1e' }} />
        <div style={{ height: '11px', width: '38%', background: '#1e1e1e' }} />
      </div>
    </div>
  );
}

/* ── Main ── */
export default function DealOfTheDay({ initialDeals = [] }) {
  const [dealProducts, setDealProducts] = useState(initialDeals);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const endTime = (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })();

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.05 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loading]);

  if (!loading && !dealProducts.length) return null;

  const [spotlight, ...rest] = dealProducts;

  return (
    <>
      

      <section ref={ref} style={{ background: '#080808', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 2.5rem)' }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6 transition-opacity duration-800" style={{ opacity: visible ? 1 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
            <div style={{ width: '4px', alignSelf: 'stretch', background: CRIMSON, minHeight: '56px', flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.58rem', letterSpacing: '0.35em', color: CRIMSON, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>● Live Now</p>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3.8rem)', fontWeight: 900, color: 'white', lineHeight: 0.9, letterSpacing: '-0.03em' }}>
                Deal of<br /><em style={{ fontStyle: 'italic', color: CRIMSON }}>the Day</em>
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.52rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Ends Tonight</p>
            <Countdown endTime={endTime} />
            <Link href="/products?sort=-discountPercent">
              <div className="group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.56rem', fontWeight: 600, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', transition: 'color 0.3s' }} className="group-hover:!text-white">All Deals</span>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke={CRIMSON} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Crimson rule */}
        <div style={{ height: '1px', marginBottom: 'clamp(1rem, 2vw, 1.5rem)', background: `linear-gradient(to right, ${CRIMSON}, ${CRIMSON}44, transparent)`, opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.2s' }} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[3px] items-stretch">
          {/* Left spotlight */}
          <div>{loading ? <SpotlightSkeleton /> : spotlight ? <SpotlightCard product={spotlight} visible={visible} /> : null}</div>

          {/* Right stack */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading ? [0, 1, 2].map(i => <RowSkeleton key={i} />) : rest.map((p, i) => <DealRow key={p._id} product={p} index={i} visible={visible} />)}

            {/* Savings callout */}
            {!loading && (
              <div style={{ flex: 1, background: '#0c0c0c', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.7s', minHeight: '130px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 900, color: CRIMSON, lineHeight: 1, letterSpacing: '-0.02em' }}>UP TO</p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: '4.5rem', fontWeight: 900, color: 'white', lineHeight: 0.85, letterSpacing: '-0.04em' }}>70%</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginTop: '6px' }}>off today</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}