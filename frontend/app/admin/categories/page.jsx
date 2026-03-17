'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { categoryService } from '@/services/categoryService';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const res = await categoryService.getCategories(); setCategories(res.data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    try {
      await categoryService.deleteCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      fetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Categories <span className="text-slate-400 font-normal text-base">({categories.length})</span></h1>
        <Button asChild><Link href="/admin/categories/new" className="gap-2"><Plus className="w-4 h-4" />Add Category</Link></Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {categories.map(cat => (
              <div key={cat._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 relative overflow-hidden shrink-0">
                  {cat.image?.url ? <Image src={cat.image.url} alt={cat.name} fill className="object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{cat.name}</p>
                  <p className="text-xs text-slate-400">/{cat.slug}</p>
                </div>
                {cat.parent ? <Badge variant="outline" className="text-xs">{cat.parent?.name}</Badge> : <Badge className="bg-primary-50 text-primary-700 text-xs">Root</Badge>}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/admin/categories/${cat._id}/edit`}><Edit2 className="w-3.5 h-3.5" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(cat._id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Category?" description="All products in this category will be uncategorised. Are you sure?" confirmLabel="Delete" destructive />
    </div>
  );
}
