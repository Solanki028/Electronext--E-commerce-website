'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { productSchema } from '@/lib/validators';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { toast } from 'sonner';

export default function ProductForm({ productId = null, onSuccess }) {
  const router = useRouter();
  const isEdit = !!productId;
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // new File[]
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [specs, setSpecs] = useState([{ key: '', value: '', unit: '' }]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { discountPercent: 0, stock: 0, isFeatured: false },
  });

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data || []));
    if (isEdit) {
      productService.getProductById(productId).then(res => {
        const p = res.data;
        ['name','description','shortDescription','brand','sku','warranty'].forEach(f => setValue(f, p[f]));
        setValue('price', p.price);
        setValue('discountPercent', p.discountPercent || 0);
        setValue('stock', p.stock);
        setValue('category', p.category?._id || p.category);
        setValue('isFeatured', p.isFeatured);
        setExistingImages(p.images || []);
        if (p.specifications?.length) setSpecs(p.specifications);
      });
    }
  }, [isEdit, productId, setValue]);

  const addSpec = () => setSpecs(s => [...s, { key: '', value: '', unit: '' }]);
  const removeSpec = (i) => setSpecs(s => s.filter((_, j) => j !== i));
  const updateSpec = (i, field, val) => setSpecs(s => s.map((sp, j) => j === i ? { ...sp, [field]: val } : sp));

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, typeof v === 'boolean' ? String(v) : v); });
      const validSpecs = specs.filter(s => s.key && s.value);
      if (validSpecs.length) fd.append('specifications', JSON.stringify(validSpecs));
      images.forEach(f => fd.append('images', f));

      if (isEdit) {
        await productService.updateProduct(productId, fd);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(fd);
        toast.success('Product created successfully');
      }
      onSuccess?.();
      router.push('/admin/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Product Name *</Label>
            <Input className="mt-1" {...register('name')} placeholder="e.g. Apple iPhone 15 Pro" />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
          </div>
          <div><Label>Brand *</Label><Input className="mt-1" {...register('brand')} />{errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}</div>
          <div><Label>SKU *</Label><Input className="mt-1" {...register('sku')} />{errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}</div>
          <div>
            <Label>Category *</Label>
            <Select onValueChange={v => setValue('category', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div><Label>Warranty</Label><Input className="mt-1" {...register('warranty')} placeholder="1 Year Manufacturer Warranty" /></div>
          <div className="sm:col-span-2"><Label>Short Description</Label><Input className="mt-1" {...register('shortDescription')} /></div>
          <div className="sm:col-span-2">
            <Label>Description *</Label>
            <Textarea className="mt-1" rows={5} {...register('description')} />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">Pricing & Inventory</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Price (₹) *</Label>
            <Input className="mt-1" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div>
            <Label>Discount (%)</Label>
            <Input className="mt-1" type="number" min="0" max="100" {...register('discountPercent', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Stock *</Label>
            <Input className="mt-1" type="number" min="0" {...register('stock', { valueAsNumber: true })} />
            {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="isFeatured" checked={watch('isFeatured')} onCheckedChange={v => setValue('isFeatured', v)} />
          <Label htmlFor="isFeatured">Mark as Featured Product</Label>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Specifications</h3>
          <Button type="button" size="sm" variant="outline" onClick={addSpec} className="gap-1"><Plus className="w-3.5 h-3.5" />Add Row</Button>
        </div>
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input placeholder="Key" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} className="flex-1" />
              <Input placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} className="flex-1" />
              <Input placeholder="Unit" value={spec.unit} onChange={e => updateSpec(i, 'unit', e.target.value)} className="w-20" />
              <button type="button" onClick={() => removeSpec(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Images</h3>
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingImages.map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
          <Upload className="w-8 h-8 text-slate-400" />
          <span className="text-sm text-slate-500">Click to upload images (max 8)</span>
          <input type="file" className="sr-only" multiple accept="image/*" onChange={e => setImages(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 8))} />
        </label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((f, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-xs">
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
  );
}
