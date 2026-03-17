import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { TrendingUp } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), sub: `${formatPrice(stats?.revenueThisMonth || 0)} this month`, color: 'blue' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, sub: `${stats?.ordersThisMonth || 0} this month`, color: 'purple' },
    { label: 'Total Users', value: stats?.totalUsers || 0, sub: `${stats?.newUsersThisMonth || 0} new this month`, color: 'green' },
    { label: 'Active Products', value: stats?.totalProducts || 0, sub: 'Available in store', color: 'amber' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', colorMap[card.color])}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mb-1">{card.value}</p>
          <p className="text-xs text-slate-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
