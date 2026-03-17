'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { categoryService } from '@/services/categoryService';

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories({ parent: 'null', limit: 8 })
      .then(res => setCategories(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="container-custom">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-heading">Shop by Category</h2>
        <Link
          href="/products"
          className="text-sm text-primary-700 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map(cat => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-100
              hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-slate-50">
              {cat.image?.url ? (
                <Image
                  src={cat.image.url}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-400">{cat.name[0]}</span>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center leading-tight group-hover:text-primary-700 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
