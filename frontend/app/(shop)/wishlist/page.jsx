'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import EmptyState from '@/components/shared/EmptyState';
import { productService } from '@/services/productService';
import { useSelector } from 'react-redux';
import { selectWishlist } from '@/store/slices/wishlistSlice';

export default function WishlistPage() {
  const wishlistIds = useSelector(selectWishlist);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (wishlistIds.length === 0) { setLoading(false); return; }
      try {
        const results = await Promise.allSettled(
          wishlistIds.map(id => productService.getProductById(id))
        );
        setProducts(results.filter(r => r.status === 'fulfilled').map(r => r.value.data));
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [wishlistIds]);

  return (
    <div className="container-custom py-10">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
        {products.length > 0 && <span className="text-sm text-slate-400">({products.length} items)</span>}
      </div>
      {wishlistIds.length === 0 ? (
        <EmptyState icon={Heart} title="Your wishlist is empty" description="Save products you love by clicking the heart icon." actionLabel="Browse Products" actionHref="/products" />
      ) : (
        <ProductGrid products={products} loading={loading} skeletonCount={wishlistIds.length} />
      )}
    </div>
  );
}
