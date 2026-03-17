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
      <div className="container-custom py-16">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Looks like you haven't added anything yet." actionLabel="Start Shopping" actionHref="/products" />
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border p-4 flex gap-4">
              <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden relative shrink-0">
                <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                {item.variant && <p className="text-xs text-slate-400 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <p className="font-bold text-primary-700">{formatPrice((item.discountedPrice || item.price) * item.quantity)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.product?._id || item.product, item.quantity - 1)} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product?._id || item.product, item.quantity + 1)} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product?._id || item.product)} className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3"><Tag className="w-4 h-4" /> Coupon Code</h3>
            <div className="flex gap-2">
              <Input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter code" className="flex-1" />
              <Button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponInput} size="sm">Apply</Button>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between mt-2 text-sm text-green-600">
                <span>Coupon applied: -{formatPrice(couponDiscount)}</span>
                <button onClick={handleRemoveCoupon}><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Order Summary</h3>
            <Separator />
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Coupon Discount</span><span>-{formatPrice(couponDiscount)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-slate-500">Shipping</span><span className="text-green-600">{subtotal >= 999 ? 'Free' : formatPrice(49)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary-700">{formatPrice(total)}</span></div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
