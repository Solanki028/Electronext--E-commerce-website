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
    return <div className="container-custom py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-700" /></div>;
  }

  if (!order) return null;

  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const canCancel = ['pending','confirmed'].includes(order.status);

  return (
    <div className="container-custom py-10 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/orders"><ChevronLeft className="w-4 h-4 mr-1" />Back to Orders</Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
          {canCancel && (
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setCancelOpen(true)}>
              <XCircle className="w-4 h-4 mr-1" />Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary-700" />Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg relative overflow-hidden shrink-0">
                    <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.variant && <p className="text-xs text-slate-400">{item.variant.name}: {item.variant.value}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-primary-700">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline */}
          {order.statusHistory?.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-primary-700" />Tracking</h2>
              {order.trackingNumber && <p className="text-sm text-slate-500 mb-3">Tracking #: <span className="font-semibold text-slate-800">{order.trackingNumber}</span></p>}
              <div className="relative pl-4 space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="relative pl-4">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary-700" />
                    <p className="text-sm font-semibold capitalize text-slate-900">{h.status}</p>
                    {h.comment && <p className="text-xs text-slate-500">{h.comment}</p>}
                    <p className="text-xs text-slate-400">{formatRelativeTime(h.changedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <h3 className="font-bold text-slate-900">Order Summary</h3>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(order.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span></div>
              {order.tax > 0 && <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatPrice(order.tax)}</span></div>}
            </div>
            <Separator />
            <div className="flex justify-between font-black text-base"><span>Total</span><span className="text-primary-700">{formatPrice(order.total)}</span></div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-700" />Delivery Address</h3>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        title="Cancel Order?"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel={cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
        destructive
      />
    </div>
  );
}
