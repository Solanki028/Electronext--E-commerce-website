'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/formatters';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import api from '@/services/api';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', buttonText: 'Shop Now', position: 'hero', isActive: true, startDate: '', endDate: '' });
  const [imageFile, setImageFile] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [linkType, setLinkType] = useState('custom');
  const [productSearch, setProductSearch] = useState('');

  const fetch = async () => {
    try { const res = await api.get('/banners/admin/all'); setBanners(res.data.data || []); }
    catch (err) { toast.error('Failed to load banners'); } finally { setLoading(false); }
  };

  useEffect(() => { 
    fetch(); 
    categoryService.getCategories().then(res => setCategories(res.data || []));
    productService.getProducts({ limit: 1000 }).then(res => setProducts(res.data.products || []));
  }, []);

  const openCreate = () => { setForm({ title: '', subtitle: '', link: '', buttonText: 'Shop Now', position: 'hero', isActive: true, startDate: '', endDate: '' }); setImageFile(null); setEditingId(null); setLinkType('custom'); setProductSearch(''); setOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (imageFile) fd.append('image', imageFile);
      if (editingId) { await api.put(`/banners/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Banner updated'); }
      else { await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Banner created'); }
      setOpen(false); fetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/banners/${deleteId}`); toast.success('Banner deleted'); setDeleteId(null); fetch(); }
    catch { toast.error('Delete failed'); setDeleteId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Banners</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Add Banner</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(2)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />) : (
          banners.map(b => (
            <div key={b._id} className="bg-white rounded-xl border overflow-hidden group">
              <div className="aspect-video bg-slate-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {b.image?.url ? <img src={b.image.url} alt={b.title} className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-10 h-10" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{b.title}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge className="text-xs bg-slate-100 text-slate-600 capitalize">{b.position}</Badge>
                      <Badge className={`text-xs ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { 
                      const link = b.link || '';
                      let type = 'custom';
                      if (link.startsWith('/category/')) type = 'category';
                      else if (link.startsWith('/product/')) type = 'product';
                      setForm({ title: b.title, subtitle: b.subtitle || '', link, buttonText: b.buttonText || 'Shop Now', position: b.position, isActive: b.isActive, startDate: b.startDate?.slice(0,10) || '', endDate: b.endDate?.slice(0,10) || '' }); 
                      setLinkType(type);
                      setProductSearch('');
                      setEditingId(b._id); 
                      setOpen(true); 
                    }}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(b._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Subtitle</Label><Input className="mt-1" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} /></div>
            
            <div className="space-y-3 p-4 border rounded-xl bg-slate-50/50">
              <div>
                <Label>Link Target Type</Label>
                <Select value={linkType} onValueChange={setLinkType}>
                  <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom URL</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {linkType === 'category' && (
                <div>
                  <Label>Select Category</Label>
                  <Select 
                    onValueChange={v => setForm(f => ({ ...f, link: `/category/${v}` }))}
                    value={form.link.startsWith('/category/') ? form.link.split('/category/')[1] : ''}
                  >
                    <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c._id} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {linkType === 'product' && (
                <div className="space-y-2">
                  <Label>Search & Select Product</Label>
                  <Input 
                    placeholder="Type to filter products..." 
                    value={productSearch} 
                    onChange={e => setProductSearch(e.target.value)} 
                    className="bg-white h-9" 
                  />
                  <Select 
                    onValueChange={v => setForm(f => ({ ...f, link: `/product/${v}` }))}
                    value={form.link.startsWith('/product/') ? form.link.split('/product/')[1] : ''}
                  >
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Choose a product" /></SelectTrigger>
                    <SelectContent>
                      {products
                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .slice(0, 50)
                        .map(p => <SelectItem key={p._id} value={p.slug}>{p.name}</SelectItem>)
                      }
                      {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                        <div className="p-2 text-sm text-slate-500 text-center">No products found.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {linkType === 'custom' && (
                <div>
                  <Label>Custom Link URL</Label>
                  <Input className="mt-1 bg-white" placeholder="/about, /sale, etc." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
                </div>
              )}
              
              <p className="text-xs text-slate-500 mt-1">Generated URL: <strong>{form.link || 'None selected'}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Button Text</Label><Input className="mt-1" value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))} /></div>
              <div><Label>Start Date</Label><Input type="date" className="mt-1" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            </div>
            <div><Label>Image</Label>
              <input type="file" accept="image/*" className="mt-1 text-sm" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Banner?" description="This banner will be permanently removed." confirmLabel="Delete" destructive />
    </div>
  );
}
