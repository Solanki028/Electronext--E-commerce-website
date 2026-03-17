'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { ShoppingBag } from 'lucide-react';

export default function CartSummary({
  subtotal = 0,
  couponDiscount = 0,
  shippingCost,         // undefined = unknown, 0 = free
  tax = 0,
  total = 0,
  itemCount = 0,
  onCheckout,           // optional callback, if omitted → Link is used
  checkoutHref = '/checkout',
  showTitle = true,
  className = '',
}) {
  const freeShipping = subtotal >= 999;
  const shipping = shippingCost !== undefined ? shippingCost : (freeShipping ? 0 : 49);
  const grandTotal = total || Math.max(0, subtotal - couponDiscount + shipping + tax);

  return (
    <div className={`bg-white rounded-xl border p-5 space-y-3 ${className}`}>
      {showTitle && (
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary-700" />
          Order Summary
        </h3>
      )}

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span className="font-medium">-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-500">Shipping</span>
          <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shippingCost === undefined && !freeShipping
              ? 'Calculated at next step'
              : shipping === 0
              ? 'Free'
              : formatPrice(shipping)}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Tax (18% GST)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
        )}

        {freeShipping && shipping === 0 && (
          <p className="text-xs text-green-600 bg-green-50 rounded px-2 py-1">
            🎉 You qualify for free shipping!
          </p>
        )}

        {!freeShipping && subtotal > 0 && (
          <p className="text-xs text-slate-400">
            Add {formatPrice(999 - subtotal)} more for free shipping
          </p>
        )}
      </div>

      <Separator />

      <div className="flex justify-between font-black text-lg">
        <span>Total</span>
        <span className="text-primary-700">{formatPrice(grandTotal)}</span>
      </div>

      {onCheckout ? (
        <Button size="lg" className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      ) : (
        <Button asChild size="lg" className="w-full">
          <Link href={checkoutHref}>Proceed to Checkout</Link>
        </Button>
      )}
    </div>
  );
}
