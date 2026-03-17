'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { orderService } from '@/services/orderService';
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/formatters';
import { ORDER_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

const ALL_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [tracking, setTracking] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    orderService.getAdminOrderById(id)
      .then(res => { setOrder(res.data); setNewStatus(res.data.status); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(id, newStatus, comment, tracking);
      toast.success('Order status updated');
      setComment('');
      const res = await orderService.getAdminOrderById(id);
      setOrder(res.data);
    } catch (err) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-700" /></div>;
  if (!order) return null;

  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;

  return (
    <div className="max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/orders"><ChevronLeft className="w-4 h-4 mr-1" />Back to Orders</Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-slate-400">{formatDate(order.createdAt)} · {order.user?.name} ({order.user?.email})</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-slate-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-14 h-14 bg-slate-50 rounded-lg relative overflow-hidden shrink-0">
                    <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-primary-700">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-slate-900 mb-4">Update Order Status</h2>
            <div className="space-y-3">
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        <span className="capitalize">{ORDER_STATUSES[s]?.label || s}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newStatus === 'shipped' && (
                <div>
                  <Label>Tracking Number</Label>
                  <Input className="mt-1" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number" />
                </div>
              )}
              <div>
                <Label>Comment (optional)</Label>
                <Textarea className="mt-1" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add notes for this status change..." />
              </div>
              <Button onClick={handleUpdateStatus} disabled={updating || newStatus === order.status} className="gap-2">
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>

          {/* Timeline */}
          {order.statusHistory?.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-slate-900 mb-4">Status History</h2>
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-700 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-900">{h.status}</p>
                      {h.comment && <p className="text-xs text-slate-500">{h.comment}</p>}
                      {h.trackingNumber && <p className="text-xs text-slate-500">Tracking: {h.trackingNumber}</p>}
                      <p className="text-xs text-slate-400">{formatRelativeTime(h.changedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <h3 className="font-bold text-slate-900">Payment</h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-medium capitalize">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{order.paymentStatus}</Badge></div>
              <Separator />
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(order.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span></div>
              <Separator />
              <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary-700">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-slate-900 mb-3">Shipping To</h3>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-semibold">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
