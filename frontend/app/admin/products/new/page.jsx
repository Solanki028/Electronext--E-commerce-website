'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productSchema } from '@/lib/validators';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { toast } from 'sonner';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data || []));
    if (isEdit) {
      productService.getProductById(params.id).then(res => {
        const p = res.data;
        ['name','description','shortDescription','brand','sku','warranty'].forEach(f => setValue(f, p[f]));
        setValue('price', p.price);
        setValue('discountPercent', p.discountPercent || 0);
        setValue('stock', p.stock);
        setValue('category', p.category?._id || p.category);
        setValue('isFeatured', p.isFeatured);
        setExistingImages(p.images || []);
      });
    }
  }, [isEdit, params?.id, setValue]);

  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 8));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') formData.append(k, v); });
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await productService.updateProduct(params.id, formData);
        toast.success('Product updated');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/admin/products"><ChevronLeft className="w-4 h-4 mr-1" />Back</Link>
      </Button>
      <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Product Name *</Label>
              <Input className="mt-1" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Brand *</Label>
              <Input className="mt-1" {...register('brand')} />
              {errors.brand && <p className="text-xs text-red-500 mt-0.5">{errors.brand.message}</p>}
            </div>

            <div>
              <Label>SKU *</Label>
              <Input className="mt-1" {...register('sku')} />
              {errors.sku && <p className="text-xs text-red-500 mt-0.5">{errors.sku.message}</p>}
            </div>

            <div>
              <Label>Category *</Label>
              <Select onValueChange={v => setValue('category', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500 mt-0.5">{errors.category.message}</p>}
            </div>

            <div>
              <Label>Warranty</Label>
              <Input className="mt-1" {...register('warranty')} placeholder="e.g. 1 Year Manufacturer" />
            </div>

            <div className="sm:col-span-2">
              <Label>Short Description</Label>
              <Input className="mt-1" {...register('shortDescription')} placeholder="A brief summary (max 300 chars)" />
            </div>

            <div className="sm:col-span-2">
              <Label>Description *</Label>
              <Textarea className="mt-1" rows={5} {...register('description')} />
              {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Price (₹) *</Label>
              <Input className="mt-1" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-red-500 mt-0.5">{errors.price.message}</p>}
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input className="mt-1" type="number" min="0" max="100" {...register('discountPercent', { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Stock *</Label>
              <Input className="mt-1" type="number" min="0" {...register('stock', { valueAsNumber: true })} />
              {errors.stock && <p className="text-xs text-red-500 mt-0.5">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="featured" onCheckedChange={v => setValue('isFeatured', v)} />
            <Label htmlFor="featured">Mark as Featured Product</Label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Images</h2>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-sm text-slate-500">Click to upload images (max 8)</span>
            <input type="file" className="sr-only" multiple accept="image/*" onChange={onImagesChange} />
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((f, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-xs">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
