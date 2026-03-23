'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Edit2, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { couponService } from '@/services/couponService';
import { couponSchema } from '@/lib/validators';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ resolver: zodResolver(couponSchema) });

  const fetch = async () => {
    try { const res = await couponService.getAllCoupons(); setCoupons(res.data?.coupons || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { reset({ discountType: 'percentage', perUserLimit: 1, minOrderAmount: 0 }); setEditingId(null); setOpen(true); };

  const openEdit = (c) => {
    reset({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount, perUserLimit: c.perUserLimit, startDate: c.startDate?.slice(0,10), endDate: c.endDate?.slice(0,10) });
    setEditingId(c._id);
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editingId) { await couponService.updateCoupon(editingId, data); toast.success('Coupon updated'); }
      else { await couponService.createCoupon(data); toast.success('Coupon created'); }
      setOpen(false);
      fetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await couponService.deleteCoupon(deleteId); toast.success('Coupon deleted'); setDeleteId(null); fetch(); }
    catch { toast.error('Delete failed'); setDeleteId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Coupons</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Add Coupon</Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="divide-y">
            {coupons.map(c => {
              const isExpired = new Date(c.endDate) < new Date();
              return (
                <div key={c._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 font-mono">{c.code}</p>
                      <Badge className={isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}>{isExpired ? 'Expired' : 'Active'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`} · Expires {formatDate(c.endDate)}</p>
                  </div>
                  <p className="text-sm text-slate-400 whitespace-nowrap hidden sm:block">{c.usageCount || 0} uses</p>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(c._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Code *</Label>
                <Input className="mt-1 uppercase font-mono" {...register('code')} />
                {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
              </div>
              <div>
                <Label>Type *</Label>
                <Select defaultValue="percentage" onValueChange={v => setValue('discountType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input className="mt-1" type="number" {...register('discountValue', { valueAsNumber: true })} />
              </div>
              <div>
                <Label>Min Order (₹)</Label>
                <Input className="mt-1" type="number" {...register('minOrderAmount', { valueAsNumber: true })} />
              </div>
              <div>
                <Label>Start Date *</Label>
                <Input className="mt-1" type="date" {...register('startDate')} />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input className="mt-1" type="date" {...register('endDate')} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Coupon?" description="This coupon will be permanently deleted." confirmLabel="Delete" destructive />
    </div>
  );
}
