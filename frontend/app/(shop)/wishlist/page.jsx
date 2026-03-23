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
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
      <div className="container-custom py-12">
        <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Heart style={{ width: '28px', height: '28px', color: '#b8976a', fill: 'rgba(184,151,106,0.15)' }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 300, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
            My Curations
          </h1>
          {products.length > 0 && (
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.25em', paddingLeft: '8px', paddingTop: '10px' }}>
              {products.length} Pieces
            </span>
          )}
        </div>
        {wishlistIds.length === 0 ? (
          <div style={{ padding: '4rem 0' }}>
            <EmptyState 
              icon={Heart} 
              title="Your curation is empty" 
              description="Save exceptional pieces you love to build your personal collection." 
              actionLabel="Discover Pieces" 
              actionHref="/products" 
            />
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={wishlistIds.length || 4} />
        )}
      </div>
    </div>
  );
}
