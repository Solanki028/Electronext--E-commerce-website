'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, FolderOpen, ShoppingBag,
  Tag, Image, Users, ChevronRight, Zap, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary-700 text-white shadow-md shadow-primary-700/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 min-h-screen sticky top-0">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
          <Zap className="w-6 h-6 text-primary-700 fill-primary-700" />
          <span className="font-black text-lg text-slate-900">Aspar</span>
          <span className="text-xs font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded ml-auto">Admin</span>
        </div>
        <NavLinks />
        <div className="px-3 pb-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative flex flex-col w-64 bg-white min-h-screen">
            <div className="flex items-center gap-2 px-6 h-16 border-b">
              <Zap className="w-6 h-6 text-primary-700 fill-primary-700" />
              <span className="font-black text-lg">Aspar Admin</span>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <NavLinks />
          </aside>
        </div>
      )}
    </>
  );
}
