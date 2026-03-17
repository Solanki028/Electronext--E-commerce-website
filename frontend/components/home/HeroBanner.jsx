'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/banners?position=hero').then(res => setBanners(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fallback static hero if no banners
  if (!banners.length) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              New Season — Up to 40% Off
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
              Premium Electronics<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                At Your Fingertips
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Discover the latest smartphones, laptops, and accessories with warranty and free returns.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold" asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/category/smartphones">Browse Smartphones</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[current];

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white h-[480px] md:h-[580px]">
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b._id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {b.image?.url && (
            <Image src={b.image.url} alt={b.title} fill className="object-cover opacity-50" priority={i === 0} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="container-custom relative h-full flex items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">{b.title}</h1>
              {b.subtitle && <p className="text-lg text-slate-300 mb-6">{b.subtitle}</p>}
              {b.link && (
                <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold" asChild>
                  <Link href={b.link}>{b.buttonText || 'Shop Now'}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c === 0 ? banners.length - 1 : c - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn('h-1.5 rounded-full transition-all', i === current ? 'bg-white w-6' : 'bg-white/40 w-1.5')}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
