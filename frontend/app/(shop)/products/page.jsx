'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import { productService } from '@/services/productService';
import { SORT_OPTIONS, ITEMS_PER_PAGE } from '@/lib/constants';
import { Package } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Number(searchParams.get('page') || 1);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand = searchParams.get('brand') || '';
  const isFeatured = searchParams.get('isFeatured') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: ITEMS_PER_PAGE, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (brand) params.brand = brand;
        if (isFeatured) params.isFeatured = isFeatured;

        const result = await productService.getProducts(params);
        setProducts(result.data.products);
        setPagination(result.data.pagination);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, sort, page, minPrice, maxPrice, brand, isFeatured]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    // Crucial Bug Fix: Only reset to page 1 if the user changed a FILTER (like sort, category, brand).
    // If they clicked the pagination 'Next' button, the key is 'page', so we do NOT delete it.
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`/products?${params.toString()}`);
  };

  const activeFilters = [
    search && { key: 'search', label: `Search: "${search}"` },
    brand && { key: 'brand', label: `Brand: ${brand}` },
    minPrice && { key: 'minPrice', label: `Min: ₹${minPrice}` },
    maxPrice && { key: 'maxPrice', label: `Max: ₹${maxPrice}` },
  ].filter(Boolean);

  return (
    <div className="container-custom py-12">
      {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {search ? `Results for "${search}"` : 'The Collection'}
            </h1>
            {!loading && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: '12px' }}>
                {pagination.total} extraordinary pieces
              </p>
            )}
          </div>

        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="secondary" className="gap-1 pl-3 pr-1 py-1">
              {f.label}
              <button onClick={() => updateParam(f.key, '')} className="ml-1 hover:text-slate-900">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => router.push('/products')}
            className="text-xs text-primary-700 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products */}
      {!loading && products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting your search or filter criteria."
          actionLabel="Browse all products"
          actionHref="/products"
        />
      ) : (
        <>
          <ProductGrid products={products} loading={loading} skeletonCount={ITEMS_PER_PAGE} />
          {!loading && pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => updateParam('page', p)}
              className="mt-10"
            />
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Suspense fallback={<div className="container-custom py-12"><ProductGrid loading={true} /></div>}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
