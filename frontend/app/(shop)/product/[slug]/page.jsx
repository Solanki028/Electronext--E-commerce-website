'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShoppingCart, Heart, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarRating from '@/components/shared/StarRating';
import ProductGrid from '@/components/product/ProductGrid';
import { productService } from '@/services/productService';
import { formatPrice, formatRelativeTime } from '@/lib/formatters';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const GOLD = '#b8976a';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductBySlug(params.slug);
        const p = res.data;
        setProduct(p);

        const [relRes, revRes] = await Promise.all([
          productService.getRelatedProducts(p._id),
          productService.getProductReviews(p._id, { limit: 5 }),
        ]);
        setRelated(relRes.data || []);
        setReviews(revRes.data?.reviews || []);
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '4rem' }}>
        <div className="container-custom py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <div className="skeleton aspect-square rounded-xl" style={{ background: '#111' }} />
              <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="skeleton w-16 h-16 rounded-lg" style={{ background: '#111' }} />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="skeleton h-6 w-32 rounded" style={{ background: '#111' }} />
              <div className="skeleton h-8 w-full rounded" style={{ background: '#111' }} />
              <div className="skeleton h-8 w-3/4 rounded" style={{ background: '#111' }} />
              <div className="skeleton h-10 w-36 rounded" style={{ background: '#111' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  const discountedPrice = product.salePrice ?? product.price;
  const originalPrice = product.originalPrice ?? product.mrp;
  const hasDiscount = originalPrice && originalPrice > discountedPrice;
  const discount = product.discountPercent || (hasDiscount ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0);
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product, quantity, selectedVariant);
    setAddingToCart(false);
  };

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <div className="container-custom py-10 lg:py-16">
        
        {/* Breadcrumbs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }} className="hover:text-[#b8976a]">Home</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <Link href="/products" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }} className="hover:text-[#b8976a]">Products</Link>
          {product.category && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <Link href={`/category/${product.category.slug}`} style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }} className="hover:text-[#b8976a]">{product.category.name}</Link>
            </>
          )}
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ color: 'white', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full border" style={{ background: '#0c0c0c', borderColor: 'rgba(255,255,255,0.05)' }}>
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discount > 0 && (
                  <span style={{ background: GOLD, color: '#000', padding: '6px 12px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Save {discount}%
                  </span>
                )}
                {product.isFeatured && (
                  <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: `1px solid ${GOLD}44`, color: GOLD, padding: '6px 12px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Featured
                  </span>
                )}
              </div>
              
              <Image
                src={product.images?.[selectedImage]?.url || product.image?.url || '/placeholder-product.jpg'}
                alt={product.images?.[selectedImage]?.alt || product.name}
                fill
                className="object-contain p-8 mix-blend-screen"
                priority
              />
            </div>

            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="shrink-0 transition-all duration-300 relative"
                    style={{ 
                      width: '80px', height: '80px', 
                      background: '#0c0c0c', 
                      border: `1px solid ${selectedImage === i ? GOLD : 'rgba(255,255,255,0.05)'}`,
                      opacity: selectedImage === i ? 1 : 0.6
                    }}
                  >
                    <Image src={img.url} alt={img.alt || product.name} fill className="object-cover mix-blend-screen p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col pt-2 lg:pt-8">
            <div className="mb-6">
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '12px' }}>
                {product.brand || 'Luxury Label'}
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
                {product.name}
              </h1>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-3">
                  <StarRating rating={product.averageRating} size="md" />
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    {product.averageRating} ({product.reviewCount} Reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-4 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-8 space-y-6">
                {[...new Set(product.variants.map(v => v.name))].map(variantName => (
                  <div key={variantName}>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
                      {variantName}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.filter(v => v.name === variantName).map((v, i) => {
                        const isSelected = selectedVariant?.value === v.value;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedVariant({ name: v.name, value: v.value })}
                            style={{ 
                              padding: '10px 20px', 
                              border: `1px solid ${isSelected ? GOLD : 'rgba(255,255,255,0.1)'}`, 
                              background: isSelected ? 'rgba(184,151,106,0.08)' : 'transparent',
                              color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                              fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.02em',
                              transition: 'all 0.3s'
                            }}
                            className={!isSelected ? "hover:border-[rgba(255,255,255,0.3)] hover:text-white" : ""}
                          >
                            {v.value}
                            {v.priceModifier > 0 && ` (+${formatPrice(v.priceModifier)})`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} style={{ padding: '0 20px', color: 'rgba(255,255,255,0.6)', height: '100%', display: 'flex', alignItems: 'center', transition: 'background 0.3s' }} className="hover:bg-white/5 hover:text-white">-</button>
                <div style={{ padding: '14px 20px', color: 'white', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: '0.9rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  {quantity}
                </div>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q+1))} style={{ padding: '0 20px', color: 'rgba(255,255,255,0.6)', height: '100%', display: 'flex', alignItems: 'center', transition: 'background 0.3s' }} className="hover:bg-white/5 hover:text-white">+</button>
              </div>

              <Button 
                onClick={handleAddToCart} 
                disabled={product.stock === 0 || addingToCart} 
                className="flex-1 rounded-none hover:opacity-90"
                style={{ 
                  background: GOLD, color: '#000', 
                  fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', 
                  height: 'auto', padding: '0 2rem' 
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => toggleWishlist(product._id)} 
                className="rounded-none transition-all"
                style={{ 
                  height: 'auto', padding: '0 20px', 
                  background: wishlisted ? 'rgba(184,151,106,0.1)' : 'transparent',
                  borderColor: wishlisted ? GOLD : 'rgba(255,255,255,0.1)'
                }}
              >
                <Heart style={{ width: '18px', height: '18px', color: wishlisted ? GOLD : 'white', fill: wishlisted ? GOLD : 'none' }} />
              </Button>
            </div>

            {/* Micro-assurances */}
            <div className="flex flex-col gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[{ icon: Truck, text: 'Complimentary shipping globally' }, { icon: Shield, text: 'Secure, encrypted transaction' }, { icon: RotateCcw, text: 'Hassle-free 14-day returns' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <Icon style={{ width: '16px', height: '16px', color: GOLD }} />
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</span>
                </div>
              ))}
            </div>
            
          </div>
        </div>

        {/* Dynamic Tabs */}
        {/* We strip Shadcn Tabs component default styling completely and use custom luxury UI */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4rem', marginBottom: '5rem' }}>
          <Tabs defaultValue="overview">
            <TabsList className="bg-transparent border-b border-[rgba(255,255,255,0.05)] rounded-none h-auto p-0 flex flex-wrap gap-8 justify-center mb-10 w-full mb-12">
              {[ {id: 'overview', label: 'The Details'}, {id: 'specs', label: 'Specifications'}, {id: 'reviews', label: `Reviews (${product.reviewCount})`} ].map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-[#b8976a] data-[state=active]:bg-transparent data-[state=active]:text-white text-[rgba(255,255,255,0.4)] pb-4 px-0"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', letterSpacing: '0.02em', boxShadow: 'none' }}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="max-w-4xl mx-auto">
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', lineHeight: 2, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                {product.description}
              </p>
              {product.warranty && (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.2em', border: `1px solid ${GOLD}44`, padding: '8px 20px' }}>
                    Shielded by {product.warranty}
                  </span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="specs" className="max-w-4xl mx-auto">
              {product.specifications?.length > 0 ? (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-12 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', width: '200px', shrink: 0 }}>
                        {spec.key}
                      </span>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                        {spec.value} {spec.unit && <span style={{ color: 'rgba(255,255,255,0.4)' }}>{spec.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem' }}>No specifications available.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="max-w-3xl mx-auto">
              {reviews.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem' }}>Be the first to leave a review.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div key={r._id} style={{ border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a', padding: '2rem' }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(184,151,106,0.1)', border: `1px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.8rem' }}>
                            {r.user?.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{r.user?.name}</p>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{formatRelativeTime(r.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StarRating rating={r.rating} size="sm" />
                          {r.isVerifiedPurchase && (
                            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>✓ Verified Buyer</span>
                          )}
                        </div>
                      </div>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'white', marginBottom: '8px' }}>{r.title}</h4>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: '6rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '12px' }}>Pair It With</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
                <em style={{ fontStyle: 'italic', color: GOLD }}>Complementary</em> Pieces
              </h2>
            </div>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  );
}
