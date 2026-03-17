import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/formatters';
import { ORDER_STATUSES } from '@/lib/constants';

/**
 * Reusable orders table component for the admin panel.
 * Used on the admin dashboard (recent orders) and admin/orders listing page.
 *
 * @param {Array}    orders          Array of order objects
 * @param {boolean}  loading         Show skeleton rows while loading
 * @param {boolean}  showPagination  Handled externally — just renders the rows
 */
export default function OrdersTable({ orders = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-12 rounded" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <p className="text-center text-slate-400 py-8 text-sm">No orders found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map(order => {
            const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
            return (
              <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                  #{order.orderNumber}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 max-w-36 truncate">{order.user?.name}</p>
                  <p className="text-xs text-slate-400 max-w-36 truncate">{order.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {order.items?.length}
                </td>
                <td className="px-4 py-3 font-bold text-primary-700 whitespace-nowrap">
                  {formatPrice(order.total)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/admin/orders/${order._id}`}>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
