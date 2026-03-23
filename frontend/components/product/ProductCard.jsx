'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';

const GOLD = '#b8976a';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const discountedPrice = product.salePrice ?? product.price;
  const originalPrice = product.originalPrice ?? product.mrp;
  const hasDiscount = originalPrice && originalPrice > discountedPrice;
  const discount = product.discountPercent || (hasDiscount ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0);

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
    <Link href={`/product/${product.slug}`} className="block group h-full">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="h-full flex flex-col relative overflow-hidden transition-all duration-500"
        style={{
          background: hovered ? '#111111' : '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.04)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.8)' : '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 z-30 flex justify-between items-start pointer-events-none">
          {discount > 0 ? (
            <span style={{ background: GOLD, color: '#000', padding: '4px 8px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              -{discount}%
            </span>
          ) : product.isFeatured ? (
            <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: `1px solid ${GOLD}44`, color: GOLD, padding: '4px 8px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Featured
            </span>
          ) : <div/>}

          <button
            onClick={handleWishlist}
            className="pointer-events-auto"
            style={{ 
              width: '32px', height: '32px', 
              borderRadius: '50%', 
              background: wishlisted ? 'rgba(184,151,106,0.15)' : 'rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(4px)',
              border: `1px solid ${wishlisted ? GOLD : 'rgba(255,255,255,0.1)'}`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s'
            }}
          >
            <Heart style={{ width: '14px', height: '14px', color: wishlisted ? GOLD : 'white', fill: wishlisted ? GOLD : 'none' }} />
          </button>
        </div>

        {/* Image */}
        <div className="relative aspect-square flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm">
              <span style={{ fontFamily: "'Montserrat', sans-serif", color: 'white', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px' }}>
                Out of Stock
              </span>
            </div>
          )}

          <Image
            src={product.images?.[0]?.url || product.image?.url || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-contain p-6 mix-blend-screen transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            sizes="(max-width: 640px) 50vw, 25vw"
          />

          {/* Quick Add overlay */}
          {product.stock > 0 && (
            <div 
              className="absolute inset-x-4 bottom-4 z-20 transition-all duration-300 pointer-events-none"
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(10px)' }}
            >
              <Button
                className="w-full pointer-events-auto rounded-none"
                style={{ background: GOLD, color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', height: '40px' }}
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Quick Add'}
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          {/* Brand & Stars */}
          <div className="flex justify-between items-center mb-2">
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
              {product.brand || 'Luxury'}
            </p>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <Star style={{ width: '10px', height: '10px', fill: GOLD, color: GOLD }} />
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{product.averageRating}</span>
              </div>
            )}
          </div>

          <h3 
            className="flex-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: hovered ? 'white' : 'rgba(255,255,255,0.9)', lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '12px', transition: 'color 0.3s' }}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-auto">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
