'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Package, Clock } from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/formatters';
import { ORDER_STATUSES } from '@/lib/constants';
import api from '@/services/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <DashboardStats stats={data?.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4 text-primary-700" />Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/orders">View all</Link></Button>
          </div>
          <div className="space-y-3">
            {data?.recentOrders?.map(order => {
              const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              return (
                <Link key={order._id} href={`/admin/orders/${order._id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-400">{order.user?.name} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                    <span className="text-sm font-bold text-primary-700">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Low Stock Alert</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/products">Manage</Link></Button>
          </div>
          {!data?.lowStockProducts?.length ? (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
              <Package className="w-5 h-5 text-green-400" />
              <p className="text-sm">All products have sufficient stock!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map(product => (
                <div key={product._id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50">
                  <p className="text-sm font-medium truncate flex-1">{product.name}</p>
                  <Badge className={product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      {data?.orderStatusBreakdown?.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-slate-900 mb-4">Order Status Overview</h2>
          <div className="flex flex-wrap gap-3">
            {data.orderStatusBreakdown.map(item => {
              const cfg = ORDER_STATUSES[item._id] || { label: item._id, color: 'bg-slate-100 text-slate-700' };
              return (
                <div key={item._id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cfg.color}`}>
                  <span className="text-sm font-medium">{cfg.label}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
