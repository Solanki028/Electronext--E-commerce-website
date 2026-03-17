'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShoppingCart, Heart, Star, ChevronLeft, Share2, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarRating from '@/components/shared/StarRating';
import ProductGrid from '@/components/product/ProductGrid';
import { productService } from '@/services/productService';
import { formatPrice, formatRelativeTime } from '@/lib/formatters';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="skeleton aspect-square rounded-xl" />
            <div className="flex gap-2">
              {[1,2,3,4].map(i => <div key={i} className="skeleton w-16 h-16 rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-8 w-full rounded" />
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-10 w-36 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  const discountedPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountPercent > 0;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async () => {
    await addToCart(product, quantity, selectedVariant);
  };

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-700">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-700">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary-700">{product.category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-700 truncate max-w-40">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden">
            {hasDiscount && (
              <span className="absolute top-4 left-4 z-10 badge-discount text-sm px-3 py-1">
                -{product.discountPercent}% OFF
              </span>
            )}
            <Image
              src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'}
              alt={product.images?.[selectedImage]?.alt || product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn('w-16 h-16 relative rounded-lg overflow-hidden border-2 shrink-0 transition-all',
                    selectedImage === i ? 'border-primary-700' : 'border-transparent hover:border-slate-200')}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{product.name}</h1>
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <StarRating rating={product.averageRating} size="md" />
              <span className="text-sm text-slate-500">{product.averageRating} ({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary-700">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <Badge className="bg-green-100 text-green-700">{product.stock <= 10 ? `Only ${product.stock} left` : 'In Stock'}</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {[...new Set(product.variants.map(v => v.name))].map(variantName => (
                <div key={variantName}>
                  <p className="text-sm font-semibold text-slate-700 mb-2">{variantName}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.filter(v => v.name === variantName).map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant({ name: v.name, value: v.value })}
                        className={cn('px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                          selectedVariant?.value === v.value
                            ? 'border-primary-700 bg-primary-50 text-primary-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600')}
                      >
                        {v.value}
                        {v.priceModifier > 0 && ` (+${formatPrice(v.priceModifier)})`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Quantity:</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="px-3 py-2 hover:bg-slate-50 text-slate-600">-</button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q+1))} className="px-3 py-2 hover:bg-slate-50 text-slate-600">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 gap-2">
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => toggleWishlist(product._id)} className={cn('gap-2', wishlisted && 'text-red-500 border-red-200')}>
              <Heart className={cn('w-4 h-4', wishlisted && 'fill-red-500')} />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 pt-2 border-t">
            {[{ icon: Truck, text: 'Free shipping over ₹999' }, { icon: Shield, text: 'Secure checkout' }, { icon: RotateCcw, text: '7-day returns' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                <Icon className="w-3.5 h-3.5 text-primary-700" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          {product.warranty && <p className="text-sm text-slate-500 mt-4">🛡️ Warranty: {product.warranty}</p>}
        </TabsContent>

        <TabsContent value="specifications">
          {product.specifications?.length > 0 ? (
            <div className="bg-white rounded-xl border">
              {product.specifications.map((spec, i) => (
                <div key={i} className={cn('flex gap-4 px-4 py-3', i % 2 === 0 ? 'bg-slate-50' : 'bg-white')}>
                  <span className="text-sm font-semibold text-slate-500 w-40 shrink-0">{spec.key}</span>
                  <span className="text-sm text-slate-900">{spec.value}{spec.unit && ` ${spec.unit}`}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No specifications available.</p>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {reviews.length === 0 ? (
            <p className="text-slate-400">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                      {r.user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-slate-900">{r.user?.name}</p>
                        <div className="flex items-center gap-2">
                          {r.isVerifiedPurchase && <Badge variant="outline" className="text-xs text-green-600 border-green-200">✓ Verified</Badge>}
                          <span className="text-xs text-slate-400">{formatRelativeTime(r.createdAt)}</span>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                      {r.title && <p className="text-sm font-medium text-slate-800 mt-1">{r.title}</p>}
                      <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="section-heading mb-6">Related Products</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
