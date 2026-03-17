'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const discountedPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountPercent > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    await addToCart(product, 1);
    setAddingToCart(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="product-card h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-slate-50 aspect-square">
          {hasDiscount && (
            <span className="absolute top-2 left-2 z-10 badge-discount">
              -{product.discountPercent}%
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
              <span className="bg-white text-slate-800 font-semibold text-xs px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          <Image
            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
            alt={product.images?.[0]?.alt || product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Hover actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleWishlist}
                className={cn(
                  'w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform',
                  wishlisted && 'bg-red-50'
                )}
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={cn('w-4 h-4', wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-600')}
                />
              </button>
            </div>

            {product.stock > 0 && (
              <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  className="w-full gap-2 bg-primary-700 hover:bg-primary-600 text-xs shadow-lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {addingToCart ? 'Adding...' : 'Quick Add'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2 flex-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-slate-700">{product.averageRating}</span>
              <span className="text-xs text-slate-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="price-discounted">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="price-original">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
