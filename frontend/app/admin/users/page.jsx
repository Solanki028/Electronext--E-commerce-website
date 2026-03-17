'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserX, UserCheck, Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Pagination from '@/components/shared/Pagination';
import { formatDate } from '@/lib/formatters';
import api from '@/services/api';
import { toast } from 'sonner';
import { ADMIN_ITEMS_PER_PAGE } from '@/lib/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null); // { type, userId, userName }

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: ADMIN_ITEMS_PER_PAGE };
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch {}
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/admin/users/${confirmAction.userId}/toggle-status`);
      toast.success(`User ${confirmAction.label}`);
      setConfirmAction(null);
      fetchUsers();
    } catch { toast.error('Action failed'); setConfirmAction(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-400">{total} total users</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9 w-full sm:w-64" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['User', 'Email', 'Joined', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar?.url} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{user.name?.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-40 truncate">{user.email}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                        {user.isActive !== false ? 'Active' : 'Banned'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => setConfirmAction({
                            userId: user._id,
                            isActive: user.isActive !== false,
                            label: user.isActive !== false ? 'banned' : 'activated',
                            title: user.isActive !== false ? 'Ban User?' : 'Activate User?',
                            description: user.isActive !== false ? `${user.name} will no longer be able to access their account.` : `${user.name} will regain access to their account.`,
                          })}
                        >
                          {user.isActive !== false ? <UserX className="w-4 h-4 text-red-400" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        onConfirm={handleToggleStatus}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.isActive ? 'Ban User' : 'Activate User'}
        destructive={confirmAction?.isActive}
      />
    </div>
  );
}
