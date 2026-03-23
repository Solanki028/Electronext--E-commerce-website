'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const GOLD = '#b8976a';

const FALLBACK_SLIDES = [
  {
    id: 1,
    image: '/images/mockups/hero_1.png',
    tagline: 'FLAGSHIP SERIES',
    title: 'The Obsidian Collection',
    description: 'Experience unparalleled performance with our new premium dark curation of high-end smartphones.',
    link: '/category/smartphones',
    linkText: 'Explore Collection'
  },
  {
    id: 2,
    image: '/images/mockups/hero_2.png',
    tagline: 'PRO PERFORMANCE',
    title: 'Ultra-Thin Mastery',
    description: 'Unleash your creative potential with the next generation of portable computing edge.',
    link: '/category/laptops',
    linkText: 'Discover Laptops'
  },
  {
    id: 3,
    image: '/images/mockups/hero_banner_1773930188095.png',
    tagline: 'SIGNATURE SOUND',
    title: 'Auditory Perfection',
    description: 'Immerse yourself in flawless high-fidelity audio engineering with our studio noise-cancelling range.',
    link: '/category/headphones',
    linkText: 'Shop Audio'
  }
];

export default function HeroBanner({ initialBanners = [] }) {
  const [slides, setSlides] = useState(() => {
    if (initialBanners && initialBanners.length > 0) {
      return initialBanners.map((b, i) => ({
        id: b._id || i,
        image: b.image?.url || '',
        tagline: b.subtitle || 'FEATURED',
        title: b.title || 'Special Offer',
        description: '', 
        link: b.link || '/products',
        linkText: b.buttonText || 'Shop Now'
      }));
    }
    return FALLBACK_SLIDES;
  });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 80px)', minHeight: '600px', background: '#080808' }}>
      
      {/* Images Layer */}
      {slides.map((slide, idx) => (
        <div 
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: current === idx ? 1 : 0, zIndex: 0 }}
        >
          <Image 
            src={slide.image} 
            alt={slide.title} 
            fill 
            sizes="100vw"
            priority={idx === 0}
            className="object-cover object-center"
            style={{ 
              transform: current === idx ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 12s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          />
        </div>
      ))}

      {/* 
        Instead of a heavy black fade covering the whole image, 
        we use a crisp transparent-to-black gradient only on the left 
        and bottom so the image remains 100% sharp everywhere else. 
      */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
          background: 'linear-gradient(to right, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.7) 35%, transparent 65%)'
        }} 
      />
      <div 
        className="absolute inset-x-0 bottom-0 z-10 h-32" 
        style={{ background: 'linear-gradient(to top, #090909 0%, transparent 100%)' }}
      />

      {/* Content Layer */}
      <div className="container-custom h-full relative z-20 flex items-center">
        <div className="max-w-2xl px-4 md:px-8">
          {slides.map((slide, idx) => {
            const isActive = current === idx;
            return (
              <div 
                key={slide.id} 
                className="absolute top-1/2 -translate-y-1/2 w-full max-w-xl transition-all duration-1000 ease-in-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(-50%)' : 'translateY(-40%)',
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                <div 
                  style={{ 
                    fontFamily: "'Montserrat', sans-serif", 
                    fontSize: '0.7rem', 
                    letterSpacing: '0.4em', 
                    color: GOLD, 
                    fontWeight: 600, 
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {slide.tagline}
                </div>
                
                <h1 
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
                    fontWeight: 300,
                    color: 'white',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    marginBottom: '1.5rem'
                  }}
                >
                  {slide.title}
                </h1>
                
                {slide.description && (
                  <p 
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif", 
                      fontSize: '0.8rem', 
                      color: 'rgba(255,255,255,0.6)', 
                      lineHeight: 1.8,
                      letterSpacing: '0.05em',
                      marginBottom: '2.5rem',
                      maxWidth: '85%'
                    }}
                  >
                    {slide.description}
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link 
                    href="/products" 
                    className="flex items-center justify-center gap-3 px-8 py-4 transition-transform hover:scale-105"
                    style={{ background: GOLD, color: 'black', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}
                  >
                    <ShoppingBag className="w-4 h-4" /> Shop All
                  </Link>
                  
                  <Link 
                    href={slide.link}
                    className="flex items-center gap-3 transition-opacity hover:opacity-70 group"
                    style={{ color: 'white', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}
                  >
                    {slide.linkText}
                    <div className="w-8 h-[1px] bg-white transition-all group-hover:w-12" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-0 w-full z-30">
          <div className="container-custom px-4 md:px-8 flex items-center gap-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: current === idx ? '36px' : '8px',
                height: '3px',
                background: current === idx ? GOLD : 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.4s ease',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      )}

      {/* Manual Controls */}
      {slides.length > 1 && (
        <div className="absolute right-8 md:right-16 bottom-10 z-30 flex gap-2 hidden md:flex">
          <button
            onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
            style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          >
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
            style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

    </section>
  );
}
