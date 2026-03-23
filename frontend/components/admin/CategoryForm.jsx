'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoryService } from '@/services/categoryService';
import { toast } from 'sonner';
import api from '@/services/api';

export default function CategoryForm({ categoryId = null, onSuccess }) {
  const router = useRouter();
  const isEdit = !!categoryId;
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEdit) {
      categoryService.getCategoryById(categoryId).then(res => {
        const c = res.data;
        setValue('name', c.name);
        setValue('description', c.description);
        setExistingImage(c.image?.url || null);
      });
    }
  }, [isEdit, categoryId, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      if (data.description) fd.append('description', data.description);
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        await api.put(`/categories/${categoryId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created');
      }
      onSuccess?.();
      router.push('/admin/categories');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div>
        <Label>Category Name *</Label>
        <Input className="mt-1" {...register('name', { required: 'Name is required' })} placeholder="e.g. Smartphones" />
        {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea className="mt-1" rows={3} {...register('description')} placeholder="Brief description of this category" />
      </div>

      <div>
        <Label>Category Image</Label>
        {existingImage && !imageFile && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border mt-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-0.5">Current</span>
          </div>
        )}
        <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all mt-1">
          <Upload className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-500">
            {imageFile ? imageFile.name : 'Click to upload image'}
          </span>
          {imageFile && (
            <button type="button" onClick={(e) => { e.preventDefault(); setImageFile(null); }} className="ml-auto text-slate-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          )}
          <input type="file" className="sr-only" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>Cancel</Button>
      </div>
    </form>
  );
}
