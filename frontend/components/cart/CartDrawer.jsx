'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { selectIsCartOpen, setCartOpen } from '@/store/slices/cartSlice';
import useCart from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatters';
import EmptyState from '@/components/shared/EmptyState';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsCartOpen);
  const { items, itemCount, subtotal, total, couponDiscount, updateQuantity, removeFromCart, isLoading } = useCart();

  const close = () => dispatch(setCartOpen(false));

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent side="right" className="flex flex-col w-full max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-700" />
            Cart
            {itemCount > 0 && (
              <span className="ml-auto text-sm font-normal text-slate-500">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Add some products to get started."
              actionLabel="Browse Products"
              actionHref="/products"
            />
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item, idx) => (
                <div key={`${item.product?._id || item.product}-${idx}`} className="flex gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg overflow-hidden shrink-0 relative">
                    <Image
                      src={item.image || item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-primary-700">
                        {formatPrice(
                          (item.discountedPrice || item.price * (1 - (item.discountPercent || 0) / 100)) * item.quantity
                        )}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product?._id || item.product, item.quantity - 1)}
                          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-slate-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product?._id || item.product, item.quantity + 1)}
                          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product?._id || item.product)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 space-y-3">
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Coupon Discount</span>
                  <span className="text-green-600 font-medium">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-700">{formatPrice(total || subtotal)}</span>
              </div>
              <Button asChild className="w-full" size="lg" onClick={close}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={close}>
                <Link href="/cart">View Full Cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
