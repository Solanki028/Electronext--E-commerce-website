'use client';

import { useParams } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function AdminCategoryEditPage() {
  const { id } = useParams();
  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/categories"><ChevronLeft className="w-4 h-4 mr-1" />Back</Link>
      </Button>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit Category</h1>
      <CategoryForm categoryId={id} />
    </div>
  );
}
