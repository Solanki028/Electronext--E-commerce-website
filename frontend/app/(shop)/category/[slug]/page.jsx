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

const GOLD = '#b8976a';

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
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-12 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {category ? (
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-8">
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1.5rem', display: 'block' }}>
                Curated Collection
              </span>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 300, color: 'white', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                {category.name}
              </h1>
              {category.description && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
                  {category.description}
                </p>
              )}
              {!loading && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2rem' }}>
                  {pagination.total} {pagination.total === 1 ? 'Piece' : 'Pieces'}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="h-4 w-32 bg-white/5 rounded-full animate-pulse" />
              <div className="h-12 w-64 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-96 bg-white/5 rounded animate-pulse" />
            </div>
          )}
        </div>

        {/* Sub-categories */}
        {category?.children?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {category.children.map(sub => (
              <a 
                key={sub._id} 
                href={`/category/${sub.slug}`} 
                className="px-6 py-2 transition-all duration-300 hover:text-white"
                style={{ 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  background: 'transparent',
                  fontFamily: "'Montserrat', sans-serif", 
                  fontSize: '0.7rem', 
                  color: 'rgba(255,255,255,0.6)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = GOLD;
                  e.currentTarget.style.color = GOLD;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                {sub.name}
              </a>
            ))}
          </div>
        )}

        {!loading && products.length === 0 ? (
          <div className="py-20 border border-[rgba(255,255,255,0.05)] bg-[#0a0a0a] flex items-center justify-center">
            <EmptyState 
              icon={Package} 
              title="Collection Unavailable" 
              description="There are currently no pieces available in this category. We invite you to explore our other collections." 
              actionLabel="Discover All Pieces" 
              actionHref="/products" 
            />
          </div>
        ) : (
          <>
            <ProductGrid products={products} loading={loading} skeletonCount={ITEMS_PER_PAGE} />
            {!loading && pagination.pages > 1 && (
              <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} className="mt-16" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
