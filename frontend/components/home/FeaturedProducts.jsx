'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import { productService } from '@/services/productService';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getFeaturedProducts({ limit: 8 })
      .then(res => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !products.length) return null;

  return (
    <section className="container-custom">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-heading">Featured Products</h2>
          <p className="text-sm text-slate-400 mt-0.5">Hand-picked by our experts</p>
        </div>
        <Link
          href="/products?isFeatured=true"
          className="text-sm text-primary-700 font-semibold hover:underline flex items-center gap-1"
        >
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <ProductGrid products={products} loading={loading} skeletonCount={8} />
    </section>
  );
}
