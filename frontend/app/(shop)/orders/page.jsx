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
      <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
        <div className="container-custom py-12 max-w-4xl">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>Past Orders</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-28 rounded-none border border-white/5" style={{ background: '#0a0a0a' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
      <div className="container-custom py-12 max-w-4xl">
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'white', marginBottom: '2rem', letterSpacing: '-0.02em' }}>Past Orders</h1>
        {orders.length === 0 ? (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '4rem 2rem', textAlign: 'center' }}>
            <Package style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.2)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>No Orders Found</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>You haven&apos;t placed any orders with us yet.</p>
            <Link href="/products" style={{ display: 'inline-block', background: '#b8976a', color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem' }}>
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              return (
                <Link key={order._id} href={`/orders/${order._id}`} className="block transition-all p-6 group" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>
                        Order Ref.
                      </p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'white', lineHeight: 1.2 }}>
                        #{order.orderNumber}
                      </p>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                        {formatDate(order.createdAt)} <span style={{ padding: '0 8px', color: 'rgba(255,255,255,0.2)' }}>|</span> {order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-[0.65rem] font-bold px-3 py-1 uppercase tracking-widest ${statusConfig.color}`} style={{ background: 'transparent', border: `1px solid currentColor` }}>
                        {statusConfig.label}
                      </span>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#b8976a', fontWeight: 600 }}>
                        {formatPrice(order.total)}
                      </p>
                      <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: '#b8976a' }} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={setPage} className="mt-8" />
          </div>
        )}
      </div>
    </div>
  );
}
