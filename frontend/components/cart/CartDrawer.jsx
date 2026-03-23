'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { selectIsCartOpen, setCartOpen } from '@/store/slices/cartSlice';
import useCart from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatters';

const GOLD = '#b8976a';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsCartOpen);
  const { items, itemCount, subtotal, total, couponDiscount, updateQuantity, removeFromCart } = useCart();

  const close = () => dispatch(setCartOpen(false));

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent side="right" className="flex flex-col w-full max-w-md p-0 border-l" style={{ background: '#0a0a0a', borderColor: 'rgba(255,255,255,0.05)' }}>
        <SheetHeader className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <SheetTitle className="flex items-center gap-3">
            <ShoppingBag style={{ width: '20px', height: '20px', color: GOLD }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'white', fontWeight: 400, letterSpacing: '0.02em' }}>
              Your Bag
            </span>
            {itemCount > 0 && (
              <span className="ml-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {itemCount} {itemCount !== 1 ? 'Pieces' : 'Piece'}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>Your bag is empty</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', lineHeight: 1.6 }}>Start adding exceptional pieces to your collection.</p>
            <Button asChild onClick={close} className="rounded-none hover:opacity-90" style={{ background: GOLD, color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 2rem' }}>
              <Link href="/products">Discover Pieces</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
              {items.map((item, idx) => {
                const p = (typeof item.product === 'object' && item.product !== null) ? item.product : item;
                const name = p.name || item.name || 'Unknown Item';
                const image = p.images?.[0]?.url || p.image?.url || item.image?.url || item.image || '/placeholder-product.jpg';
                const originalPrice = p.price || p.mrp || item.price || 0;
                const salePrice = p.salePrice || item.discountedPrice || (originalPrice * (1 - ((p.discountPercent || 0)/100)));
                const brand = p.brand || item.brand || 'Luxury';
                
                return (
                  <div key={`${item._id || item.product}-${idx}`} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-[#0d0d0d] rounded-sm overflow-hidden shrink-0 relative flex items-center justify-center p-2" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-contain p-2 mix-blend-screen"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>
                          {brand}
                        </p>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'white', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {name}
                        </p>
                        {item.variant && (
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', color: GOLD, marginTop: '4px' }}>
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                          <button
                            onClick={() => updateQuantity(p._id || item.product, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{ padding: '4px 8px', color: item.quantity <= 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}
                            className="hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Minus style={{ width: '10px', height: '10px' }} />
                          </button>
                          <span style={{ padding: '4px 8px', color: 'white', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', minWidth: '30px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(p._id || item.product, item.quantity + 1)}
                            style={{ padding: '4px 8px', color: 'rgba(255,255,255,0.6)' }}
                            className="hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Plus style={{ width: '10px', height: '10px' }} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'white', fontWeight: 600 }}>
                            {formatPrice(salePrice * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(p._id || item.product)}
                            style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', textDecoration: 'underline' }}
                            className="hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-6 space-y-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#080808' }}>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Discount</span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: '#4ade80', fontWeight: 500 }}>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-end pb-2">
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Estimated Total</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'white', fontWeight: 600, lineHeight: 1 }}>{formatPrice(total || subtotal)}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full rounded-none hover:opacity-90" onClick={close} style={{ background: GOLD, color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '1.5rem 0' }}>
                  <Link href="/checkout">Secure Checkout</Link>
                </Button>
                <Button asChild className="w-full rounded-none border transition-all" onClick={close} style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '1.5rem 0' }}>
                  <Link href="/cart">Review Collection</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
