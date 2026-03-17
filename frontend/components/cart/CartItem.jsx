'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function CartItem({ item, onUpdateQuantity, onRemove, compact = false }) {
  const productId = item.product?._id || item.product;
  const price = item.discountedPrice || item.price;
  const lineTotal = price * item.quantity;

  return (
    <div className={cn('flex gap-3', compact ? 'items-center' : 'items-start')}>
      {/* Image */}
      <div className={cn(
        'relative bg-slate-50 rounded-lg overflow-hidden shrink-0',
        compact ? 'w-12 h-12' : 'w-20 h-20'
      )}>
        <Image
          src={item.image || item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-slate-900', compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2')}>
          {item.name}
        </p>

        {item.variant && (
          <p className="text-xs text-slate-400 mt-0.5">
            {item.variant.name}: {item.variant.value}
          </p>
        )}

        {!compact && (
          <p className="text-xs text-slate-400 mt-0.5">
            {formatPrice(price)} each
          </p>
        )}

        {/* Qty controls + price */}
        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
          <p className={cn('font-bold text-primary-700', compact ? 'text-xs' : 'text-sm')}>
            {formatPrice(lineTotal)}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity?.(productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className={cn('text-center font-medium', compact ? 'w-5 text-xs' : 'w-7 text-sm')}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity?.(productId, item.quantity + 1)}
              className="w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onRemove?.(productId)}
              className="ml-1 w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
