'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Eye, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/shared/Pagination';
import { orderService } from '@/services/orderService';
import { formatPrice, formatDate } from '@/lib/formatters';
import { ORDER_STATUSES, ADMIN_ITEMS_PER_PAGE } from '@/lib/constants';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: ADMIN_ITEMS_PER_PAGE };
    if (statusFilter) params.status = statusFilter;
    orderService.getAllOrders(params)
      .then(res => { setOrders(res.data.orders); setPagination(res.data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-400">{pagination.total} total orders</p>
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(order => {
                  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">#{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-xs text-slate-400">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-center">{order.items?.length}</td>
                      <td className="px-4 py-3 font-bold text-primary-700">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${statusConfig.color}`}>{statusConfig.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/orders/${order._id}`}><Eye className="w-3.5 h-3.5" /></Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && pagination.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
