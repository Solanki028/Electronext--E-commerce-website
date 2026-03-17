'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { productService } from '@/services/productService';

function Countdown({ endTime }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endTime) - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="font-mono font-black text-xl bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-white/60 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function DealOfTheDay() {
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deal ends at midnight
  const endTime = new Date();
  endTime.setHours(23, 59, 59, 999);

  useEffect(() => {
    productService.getProducts({ sort: '-discountPercent', limit: 4, minDiscount: 20 })
      .then(res => setDealProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !dealProducts.length) return null;

  return (
    <section className="container-custom">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-amber-200 fill-amber-200" />
            <span className="font-bold text-amber-100 uppercase text-xs tracking-wider">Hot Deals</span>
          </div>
          <h2 className="text-2xl font-black">Deal of the Day</h2>
          <p className="text-orange-100 text-sm mt-0.5">Grab them before the clock runs out!</p>
        </div>

        <div className="text-white">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-orange-100" />
            <span className="text-xs text-orange-100">Ends in</span>
          </div>
          <Countdown endTime={endTime} />
        </div>

        <Button asChild className="bg-white text-orange-600 hover:bg-orange-50 font-bold shrink-0 hidden sm:inline-flex">
          <Link href="/products?sort=-discountPercent">All Deals</Link>
        </Button>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dealProducts.map(product => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );
}
