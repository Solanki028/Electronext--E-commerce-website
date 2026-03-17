'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { orderService } from '@/services/orderService';
import { formatPrice, formatDate } from '@/lib/formatters';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await orderService.getMyOrders({ page, limit: 10 });
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [page]);

  if (loading) {
    return (
      <div className="container-custom py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="You haven't placed any orders yet." actionLabel="Start Shopping" actionHref="/products" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
            return (
              <Link key={order._id} href={`/orders/${order._id}`} className="block bg-white rounded-xl border hover:border-primary-200 hover:shadow-md transition-all p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
                    <p className="font-bold text-primary-700">{formatPrice(order.total)}</p>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                  </div>
                </div>
              </Link>
            );
          })}
          <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={setPage} className="mt-6" />
        </div>
      )}
    </div>
  );
}
