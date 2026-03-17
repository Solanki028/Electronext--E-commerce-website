'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { Package } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/constants';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await categoryService.getCategoryBySlug(slug);
        setCategory(res.data);
      } catch { notFound(); }
    };
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ category: category._id, page, limit: ITEMS_PER_PAGE, sort: '-createdAt' });
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch {}
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [category, page]);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        {category ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900">{category.name}</h1>
            {category.description && <p className="text-slate-500 mt-2">{category.description}</p>}
            {!loading && <p className="text-sm text-slate-400 mt-1">{pagination.total} products found</p>}
          </>
        ) : (
          <div className="space-y-2">
            <div className="skeleton h-8 w-48 rounded" />
            <div className="skeleton h-4 w-72 rounded" />
          </div>
        )}
      </div>

      {/* Sub-categories */}
      {category?.children?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map(sub => (
            <a key={sub._id} href={`/category/${sub.slug}`} className="px-4 py-1.5 rounded-full border text-sm font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors">
              {sub.name}
            </a>
          ))}
        </div>
      )}

      {!loading && products.length === 0 ? (
        <EmptyState icon={Package} title="No products in this category" description="Check back later or browse all products." actionLabel="All Products" actionHref="/products" />
      ) : (
        <>
          <ProductGrid products={products} loading={loading} skeletonCount={ITEMS_PER_PAGE} />
          {!loading && pagination.pages > 1 && (
            <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} className="mt-10" />
          )}
        </>
      )}
    </div>
  );
}
