'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/shared/EmptyState';
import { formatPrice } from '@/lib/formatters';
import useCart from '@/hooks/useCart';
import { useState } from 'react';
import { cartService } from '@/services/cartService';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, subtotal, total, couponDiscount, updateQuantity, removeFromCart, isLoading, fetchCart } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      await cartService.applyCoupon(couponInput.trim());
      await fetchCart();
      toast.success('Coupon applied successfully!');
      setCouponInput('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await cartService.removeCoupon();
      await fetchCart();
      toast.success('Coupon removed');
    } catch {}
  };

  if (items.length === 0) {
    return (
      <div style={{ background: '#080808', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container-custom py-16 text-center">
          <ShoppingBag style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.1)', margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>Your Bag is Empty</h3>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>Discover our exceptional pieces.</p>
          <Button asChild style={{ background: '#b8976a', color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 2rem', height: '48px', borderRadius: 0 }}>
            <Link href="/products">Explore Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
      <div className="container-custom py-12 max-w-6xl">
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 4vw, 3rem)', color: 'white', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
          Your Bag <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', verticalAlign: 'middle', marginLeft: '1rem', textTransform: 'uppercase' }}>({items.length} {items.length === 1 ? 'Piece' : 'Pieces'})</span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items Container */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, idx) => {
              const p = (typeof item.product === 'object' && item.product !== null) ? item.product : item;
              const name = p.name || item.name || 'Unknown Item';
              const image = p.images?.[0]?.url || p.image?.url || item.image?.url || item.image || '/placeholder-product.jpg';
              const originalPrice = p.price || p.mrp || item.price || 0;
              const salePrice = p.salePrice || item.discountedPrice || (originalPrice * (1 - ((p.discountPercent || 0)/100)));

              return (
                <div key={idx} className="flex gap-6 p-6 group" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-28 h-28 bg-[#0d0d0d] relative flex items-center justify-center shrink-0 border border-white/5">
                    <Image src={image} alt={name} fill className="object-contain p-3 mix-blend-screen" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: 'white', lineHeight: 1.2 }}>{name}</h3>
                        {item.variant && (
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: '#b8976a', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                      </div>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'white', fontWeight: 600 }}>
                        {formatPrice(salePrice * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => updateQuantity(p._id || item.product, item.quantity - 1)} disabled={item.quantity <= 1} className="hover:bg-white/5 transition-colors" style={{ padding: '8px 12px', color: item.quantity <= 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }}>
                          <Minus style={{ width: '12px', height: '12px' }} />
                        </button>
                        <span style={{ padding: '8px 16px', color: 'white', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: '40px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(p._id || item.product, item.quantity + 1)} className="hover:bg-white/5 transition-colors" style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                          <Plus style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                      
                      <button onClick={() => removeFromCart(p._id || item.product)} className="hover:text-red-400 transition-colors flex items-center gap-2" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Setup / Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag style={{ width: '16px', height: '16px', color: '#b8976a' }} />
                Promotional Code
              </h3>
              <div className="flex gap-2">
                <Input 
                  value={couponInput} 
                  onChange={e => setCouponInput(e.target.value)} 
                  placeholder="Enter code" 
                  className="flex-1 rounded-none border-white/10 text-white placeholder:text-white/30" 
                  style={{ background: '#0d0d0d', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', height: '48px', borderColor: 'rgba(255,255,255,0.1)' }} 
                />
                <Button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponInput} className="rounded-none hover:opacity-90 transition-opacity" style={{ background: '#b8976a', color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: '48px', padding: '0 1.5rem' }}>
                  Apply
                </Button>
              </div>
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between mt-4" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: '#4ade80' }}>
                  <span>Discount Applied</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                    <button onClick={handleRemoveCoupon} className="hover:text-white transition-colors"><X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} /></button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'white', paddingBottom: '1.2rem', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Order Summary
              </h3>
              
              <div className="space-y-4" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem' }}>
                <div className="flex justify-between items-center text-white/60">
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                   <div className="flex justify-between items-center text-[#4ade80]">
                     <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Savings</span>
                     <span>-{formatPrice(couponDiscount)}</span>
                   </div>
                )}
                <div className="flex justify-between items-center text-white/60">
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Shipping</span>
                  <span style={{ color: subtotal >= 999 ? '#b8976a' : 'white', fontWeight: 500 }}>{subtotal >= 999 ? 'Complimentary' : formatPrice(49)}</span>
                </div>
              </div>

              <div style={{ margin: '1.5rem 0', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-end">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Estimated Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: '#b8976a', fontWeight: 600, lineHeight: 1 }}>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full rounded-none hover:opacity-90" style={{ background: '#b8976a', color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', height: '56px' }}>
                  <Link href="/checkout">Secure Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-none hover:bg-white/5 transition-all" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', height: '56px' }}>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
