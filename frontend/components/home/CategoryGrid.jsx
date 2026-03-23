'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';


const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`;

const GOLD = '#b8976a';
const GOLD_LIGHT = '#d4b896';

const HERO_CONFIGS = [
  {
    label: 'NEW COLLECTION',
    tagline: 'THE FUTURE, HELD IN YOUR HAND',
    contentSide: 'left',
    contentBg: '#0a0a0a',
  },
  {
    label: 'SIGNATURE SERIES',
    tagline: 'SOUND WITHOUT COMPROMISE',
    contentSide: 'right',
    contentBg: '#0d0c0b',
  },
];

const GRID_CONFIGS = [
  { label: 'LIMITED EDITION', accent: GOLD },
  { label: 'EXCLUSIVE DROP', accent: GOLD_LIGHT },
  { label: 'CURATED', accent: GOLD },
  { label: 'PREMIUM', accent: GOLD_LIGHT },
];

/* ── Animated number counter ── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = () => {
        start += Math.ceil(to / 40);
        if (start >= to) { setVal(to); return; }
        setVal(start);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Split Hero Card ── */
function HeroCard({ cat, index, visible }) {
  const cfg = HERO_CONFIGS[index] || HERO_CONFIGS[0];
  const isRight = cfg.contentSide === 'right';

  const stats = [
    { n: 500, s: '+', label: 'Products' },
    { n: 50, s: '+', label: 'Brands' },
    { n: 98, s: '%', label: 'Rated' },
  ];

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: `opacity 1s ease ${index * 0.2}s, transform 1s ease ${index * 0.2}s`,
      }}
    >
      <Link href={`/category/${cat.slug}`}>
        <section
          className="relative w-full flex flex-row group overflow-hidden"
          style={{ height: 'clamp(320px, 45vw, 760px)', background: '#090909' }}
        >

          {/* ── Image Panel ── */}
          <div
            className="relative overflow-hidden"
            style={{ flex: '0 0 58%', order: isRight ? 1 : 2 }}
          >
            {cat.image?.url && (
              <Image
                src={cat.image.url}
                alt={cat.name}
                fill
                className="object-cover object-center"
                style={{ transition: 'transform 1200ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
                sizes="60vw"
                priority={index === 0}
              />
            )}
            {/* Directional bleed gradient toward content panel */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: isRight
                  ? 'linear-gradient(to left, rgba(9,9,9,0.75) 0%, transparent 55%)'
                  : 'linear-gradient(to right, rgba(9,9,9,0.75) 0%, transparent 55%)',
              }}
            />
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.45) 100%)' }} />
            <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-50" style={{ backgroundImage: GRAIN, backgroundSize: '256px 256px' }} />
          </div>

          {/* ── Content Panel ── */}
          <div
            className="relative flex flex-col justify-between z-30"
            style={{ flex: '0 0 42%', order: isRight ? 2 : 1, background: cfg.contentBg, padding: 'clamp(1.5rem, 3.5vw, 3.5rem) clamp(1rem, 3vw, 3rem)' }}
          >
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30" style={{ backgroundImage: GRAIN, backgroundSize: '256px 256px' }} />

            {/* Top content */}
            <div className="relative z-10">
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(0.45rem, 1vw, 0.62rem)', letterSpacing: '0.38em', color: GOLD, fontWeight: 600, marginBottom: 'clamp(0.5rem, 2vw, 2rem)' }} className="uppercase">
                {cfg.label}
              </p>

              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(0.45rem, 1.2vw, 0.68rem)', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginBottom: 'clamp(0.5rem, 1vw, 1rem)' }} className="uppercase">
                {cfg.tagline}
              </p>

              <h2
                className="text-white"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(1.8rem, 5vw, 7rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  lineHeight: 0.9,
                  marginBottom: 'clamp(0.5rem, 2vw, 1.5rem)',
                }}
              >
                {cat.name}
              </h2>

              <div style={{ width: 'clamp(20px, 5vw, 40px)', height: '1px', background: `linear-gradient(to right, ${GOLD}, transparent)`, marginBottom: 'clamp(0.8rem, 2vw, 1.5rem)' }} />

              {cat.description && (
                <p
                  className="hidden sm:block"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 'clamp(0.5rem, 1.2vw, 0.75rem)',
                    fontWeight: 400,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    maxWidth: '280px',
                    lineHeight: 1.8,
                  }}
                >
                  {cat.description}
                </p>
              )}
            </div>

            {/* Bottom content */}
            <div className="relative z-10 w-full hidden sm:block">
              {/* Stats */}
              <div className="flex gap-4 lg:gap-10 mb-6 lg:mb-10 w-full flex-wrap">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.4rem, 2vw, 2.2rem)', fontWeight: 400, color: 'white', lineHeight: 1 }}>
                      <Counter to={stat.n} suffix={stat.s} />
                    </p>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(0.45rem, 1vw, 0.55rem)', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginTop: '6px', textTransform: 'uppercase' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 lg:gap-4 cursor-pointer mt-auto" style={{ transition: 'opacity 0.3s' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(0.5rem, 1vw, 0.65rem)', fontWeight: 600, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase' }}>
                  Explore Collection
                </span>
                <div style={{ height: '1px', background: GOLD, transition: 'width 0.5s ease' }} className="w-4 group-hover:w-8 lg:w-6 lg:group-hover:w-14" />
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Ghost index number */}
            {/* <div
              className="absolute bottom-12 right-10 z-10 select-none pointer-events-none"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '6rem', fontWeight: 300, color: 'rgba(255,255,255,0.035)', lineHeight: 1 }}
            >
              0{index + 1}
            </div> */}
          </div>
        </section>
      </Link>
    </div>
  );
}

/* ── Carousel Card ── */
function CarouselCard({ cat, index }) {
  const cfg = GRID_CONFIGS[index % GRID_CONFIGS.length];
  return (
    <Link href={`/category/${cat.slug}`} className="block shrink-0 w-[85vw] md:w-[36vw] md:max-w-[440px] md:min-w-[280px]" style={{ scrollSnapAlign: 'start' }}>
      <div className="relative overflow-hidden group cursor-pointer" style={{ height: 'clamp(360px, 52vh, 560px)', background: '#0f0f0f' }}>
        {cat.image?.url && (
          <Image
            src={cat.image.url}
            alt={cat.name}
            fill
            className="object-cover object-center"
            style={{ transition: 'transform 1000ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
            sizes="40vw"
          />
        )}
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)' }} />
        <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-40" style={{ backgroundImage: GRAIN, backgroundSize: '256px 256px' }} />

        <div className="absolute top-6 left-6 z-30">
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', letterSpacing: '0.32em', color: cfg.accent, fontWeight: 600, textTransform: 'uppercase' }}>
            {cfg.label}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 p-8">
          <div style={{ width: '28px', height: '1px', background: cfg.accent, marginBottom: '16px', transition: 'width 0.6s ease' }} className="group-hover:!w-16" />
          <h3
            className="text-white"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}
          >
            {cat.name}
          </h3>
          {cat.description && (
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.63rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', marginBottom: '1.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {cat.description}
            </p>
          )}
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.25em', color: cfg.accent, textTransform: 'uppercase' }}>
              Discover
            </span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke={cfg.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Carousel ── */
function Carousel({ categories }) {
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    const cardW = el.scrollWidth / categories.length;
    setActiveIdx(Math.round(el.scrollLeft / cardW));
  }, [categories.length]);

  const scrollTo = (idx) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / categories.length;
    el.scrollTo({ left: idx * cardW, behavior: 'smooth' });
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  return (
    <div className="relative w-full" style={{ background: '#070707' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between px-8 md:px-16 pt-16 pb-8 gap-4">
        <div>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.62rem', letterSpacing: '0.35em', color: GOLD, fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase' }}>
            Curated For You
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 300, color: 'white', lineHeight: 0.92, letterSpacing: '-0.015em' }}>
            More Collections
          </h2>
        </div>

        {/* Dot nav */}
        <div className="hidden md:flex items-center gap-3 pb-2">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              style={{
                width: i === activeIdx ? '28px' : '6px',
                height: '2px',
                background: i === activeIdx ? GOLD : 'rgba(255,255,255,0.18)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                borderRadius: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingLeft: 'clamp(2rem, 4vw, 4rem)',
          paddingRight: 'clamp(2rem, 4vw, 4rem)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((cat, i) => (
          <CarouselCard key={cat._id} cat={cat} index={i} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ padding: '1.5rem clamp(2rem, 4vw, 4rem) 3rem' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress * 100}%`, background: GOLD, transition: 'width 0.1s linear' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function CategoryGrid({ initialCategories = [] }) {
  const [categories, setCategories] = useState(() => {
    const all = initialCategories || [];
    return all.filter(cat => cat.slug !== 'appliances');
  });
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-1 mt-8" style={{ background: '#090909' }}>
        {[0, 1].map(i => (
          <div key={i} className="w-full flex" style={{ height: 'clamp(480px, 70vh, 760px)' }}>
            <div style={{ flex: '0 0 58%', background: i % 2 === 0 ? '#131313' : '#111' }} className="animate-pulse" />
            <div style={{ flex: '0 0 42%', background: '#0a0a0a' }} className="animate-pulse" />
          </div>
        ))}
        <div style={{ height: '520px', background: '#070707' }} className="animate-pulse" />
      </div>
    );
  }

  if (!categories.length) return null;

  const heroCategories = categories.slice(0, 2);
  const carouselCategories = categories.slice(2);

  return (
    <>
      

      <div className="w-full flex flex-col gap-1 mt-8" style={{ background: '#090909' }}>
        {heroCategories.map((cat, i) => (
          <HeroCard key={cat._id} cat={cat} index={i} visible={visible} />
        ))}

        {/* Gold divider */}
        <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${GOLD}55, transparent)` }} />

        {carouselCategories.length > 0 && <Carousel categories={carouselCategories} />}
      </div>
    </>
  );
}