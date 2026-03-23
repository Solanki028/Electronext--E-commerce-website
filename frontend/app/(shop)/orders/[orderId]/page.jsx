'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, MapPin, Truck, XCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { orderService } from '@/services/orderService';
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/formatters';
import { ORDER_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        setOrder(res.data);
      } catch { toast.error('Order not found'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled');
      setOrder(o => ({ ...o, status: 'cancelled' }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancellation failed');
    } finally { setCancelling(false); setCancelOpen(false); }
  };

  if (loading) {
    return <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}><Loader2 className="w-8 h-8 animate-spin text-[#b8976a]" /></div>;
  }

  if (!order) return null;

  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const canCancel = ['pending','confirmed'].includes(order.status);

  return (
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
      <div className="container-custom py-10 max-w-5xl">
        <Link href="/orders" className="inline-flex items-center hover:opacity-70 transition-opacity mb-8" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to History
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Invoice Receipt</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'white', lineHeight: 1.1 }}>Order #{order.orderNumber}</h1>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Confirmed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[0.65rem] font-bold px-4 py-2 uppercase tracking-widest ${statusConfig.color}`} style={{ background: 'transparent', border: `1px solid currentColor` }}>
              {statusConfig.label}
            </span>
            {canCancel && (
              <Button variant="outline" size="sm" style={{ background: 'transparent', color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.2)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 0, padding: '0 1rem', height: '34px' }} className="hover:bg-red-500/10" onClick={() => setCancelOpen(true)}>
                <XCircle className="w-3.5 h-3.5 mr-2" />Revoke
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package style={{ width: '20px', height: '20px', color: '#b8976a' }} /> Pieces
              </h2>
              <div className="space-y-6">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-6 pb-6" style={{ borderBottom: i !== order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: i !== order.items.length - 1 ? '1.5rem' : 0 }}>
                    <div className="w-24 h-24 bg-[#0d0d0d] border border-white/5 relative overflow-hidden shrink-0 flex items-center justify-center">
                      <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-contain p-2 mix-blend-screen" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'white', lineHeight: 1.2 }}>{item.name}</p>
                      {item.variant && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: '#b8976a', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.variant.name}: {item.variant.value}</p>}
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>QTY: {item.quantity} <span style={{ margin: '0 6px' }}>×</span> {formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'white', fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Timeline */}
            {order.statusHistory?.length > 0 && (
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck style={{ width: '20px', height: '20px', color: '#b8976a' }} /> Logistics Log
                </h2>
                {order.trackingNumber && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>AWB: <span style={{ color: 'white', fontWeight: 600 }}>{order.trackingNumber}</span></p>}
                
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[4px] before:w-[1px] before:bg-white/10">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[26px] top-1.5 w-[9px] h-[9px] rounded-full" style={{ background: i === 0 ? '#b8976a' : '#333', boxShadow: i === 0 ? '0 0 10px rgba(184, 151, 106, 0.5)' : 'none' }} />
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: i === 0 ? 'white' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{h.status}</p>
                      {h.comment && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{h.comment}</p>}
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{formatRelativeTime(h.changedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-8">
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'white', paddingBottom: '1.2rem', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Financial Summary
              </h3>
              
              <div className="space-y-4" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem' }}>
                <div className="flex justify-between items-center text-white/60">
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Subtotal</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </div>
                {order.couponDiscount > 0 && (
                   <div className="flex justify-between items-center text-[#4ade80]">
                     <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Savings</span>
                     <span>-{formatPrice(order.couponDiscount)}</span>
                   </div>
                )}
                <div className="flex justify-between items-center text-white/60">
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Shipping</span>
                  <span style={{ color: order.shippingCost === 0 ? '#b8976a' : 'white', fontWeight: 500 }}>{order.shippingCost === 0 ? 'Complimentary' : formatPrice(order.shippingCost)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between items-center text-white/60">
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>GST (18%)</span>
                    <span className="text-white">{formatPrice(order.tax)}</span>
                  </div>
                )}
              </div>

              <div style={{ margin: '1.5rem 0 0 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-end">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Grand Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: '#b8976a', fontWeight: 600, lineHeight: 1 }}>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'white', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin style={{ width: '18px', height: '18px', color: '#b8976a' }} /> Destination
              </h3>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                <p style={{ color: 'white', fontWeight: 500, fontSize: '0.85rem', marginBottom: '4px' }}>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                <p style={{ color: '#b8976a', marginTop: '8px' }}>{order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onConfirm={handleCancel}
          title="Revoke Protocol"
          description="Are you sure you want to cancel this order? This action formally voids the transaction."
          confirmLabel={cancelling ? 'Voiding...' : 'Confirm Revocation'}
          destructive
        />
      </div>
    </div>
  );
}
