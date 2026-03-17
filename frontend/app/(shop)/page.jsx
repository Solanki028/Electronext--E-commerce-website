'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Zap, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/ProductGrid';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { formatPrice } from '@/lib/formatters';

const features = [
  { icon: Truck,       label: 'Free Delivery',   sub: 'On orders over ₹999' },
  { icon: ShieldCheck, label: 'Secure Payments',  sub: '100% protected' },
  { icon: RotateCcw,   label: 'Easy Returns',     sub: '7-day hassle-free' },
  { icon: Headphones,  label: '24/7 Support',     sub: 'Always here to help' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getFeaturedProducts(),
      categoryService.getCategories({ parent: 'null' }),
    ])
      .then(([featuredRes, categoriesRes]) => {
        setFeatured(featuredRes.data || []);
        setCategories(categoriesRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              New Arrivals — Up to 40% Off
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Premium Electronics<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                At Your Fingertips
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Discover the latest smartphones, laptops, tablets, and accessories. All with warranty and free returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Features bar */}
      <section className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {(loading || categories.length > 0) && (
        <section className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading">Shop by Category</h2>
            <Link href="/products" className="text-sm text-primary-700 font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-slate-50">
                    {cat.image?.url ? (
                      <Image src={cat.image.url} alt={cat.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-400">{cat.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 text-center group-hover:text-primary-700 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Products */}
      <section className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">Featured Products</h2>
          <Link href="/products?isFeatured=true" className="text-sm text-primary-700 font-medium hover:underline flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} skeletonCount={8} />
      </section>

      {/* Deals Banner */}
      <section className="container-custom">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-amber-100 font-medium mb-2">🔥 Limited Time</p>
            <h2 className="text-3xl font-black mb-2">Deal of the Day</h2>
            <p className="text-amber-100">Up to 50% off on select electronics. Don&apos;t miss out!</p>
          </div>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-amber-50 font-bold shrink-0" asChild>
            <Link href="/products?sort=-discountPercent">Shop Deals</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
