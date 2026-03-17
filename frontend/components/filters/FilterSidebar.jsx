'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import PriceRangeFilter from './PriceRangeFilter';
import SpecFilter from './SpecFilter';
import { categoryService } from '@/services/categoryService';
import { cn } from '@/lib/utils';

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Sony', 'Dell', 'HP', 'Lenovo', 'Xiaomi', 'Asus', 'LG'];

function Accordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-slate-800 hover:text-primary-700 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function FilterContent({ onApply }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('minPrice') || 0),
    Number(searchParams.get('maxPrice') || 200000),
  ]);
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get('brand') ? searchParams.get('brand').split(',') : []
  );
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');

  useEffect(() => {
    categoryService.getCategories({ parent: 'null' }).then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]); else params.delete('minPrice');
    if (priceRange[1] < 200000) params.set('maxPrice', priceRange[1]); else params.delete('maxPrice');
    if (selectedBrands.length) params.set('brand', selectedBrands.join(',')); else params.delete('brand');
    if (selectedCategory) params.set('category', selectedCategory); else params.delete('category');
    if (inStockOnly) params.set('inStock', 'true'); else params.delete('inStock');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
    onApply?.();
  };

  const handleReset = () => {
    setPriceRange([0, 200000]);
    setSelectedBrands([]);
    setSelectedCategory('');
    setInStockOnly(false);
    router.push('/products');
    onApply?.();
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 200000 || selectedBrands.length > 0 || selectedCategory || inStockOnly;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {/* Price */}
        <Accordion title="Price Range">
          <PriceRangeFilter value={priceRange} onChange={setPriceRange} />
        </Accordion>
        <Separator />

        {/* Category */}
        {categories.length > 0 && (
          <>
            <Accordion title="Category">
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" checked={!selectedCategory} onChange={() => setSelectedCategory('')} className="accent-primary-700" />
                  <span className="text-sm text-slate-600">All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" checked={selectedCategory === cat._id} onChange={() => setSelectedCategory(cat._id)} className="accent-primary-700" />
                    <span className="text-sm text-slate-600">{cat.name}</span>
                  </label>
                ))}
              </div>
            </Accordion>
            <Separator />
          </>
        )}

        {/* Brand */}
        <Accordion title="Brand">
          <SpecFilter name="Brand" options={BRANDS} selected={selectedBrands} onChange={setSelectedBrands} />
        </Accordion>
        <Separator />

        {/* Availability */}
        <Accordion title="Availability">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="accent-primary-700" />
            <span className="text-sm text-slate-600">In Stock Only</span>
          </label>
        </Accordion>
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-2 border-t mt-3">
        <Button className="w-full" onClick={handleApply}>Apply Filters</Button>
        {hasActiveFilters && (
          <Button variant="outline" className="w-full gap-1 text-slate-500" onClick={handleReset}>
            <X className="w-3.5 h-3.5" /> Reset All
          </Button>
        )}
      </div>
    </div>
  );
}

export default function FilterSidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white rounded-xl border p-4 h-fit sticky top-20">
        <p className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-700" />
          Filters
        </p>
        <FilterContent />
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col p-5">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden mt-4">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
