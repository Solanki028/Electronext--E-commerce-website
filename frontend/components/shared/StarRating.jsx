'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({ rating = 0, maxRating = 5, size = 'sm', showCount, count = 0, interactive = false, onRate }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const starSize = sizes[size] || sizes.sm;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const halfFilled = !filled && i < rating;
          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              onClick={() => interactive && onRate?.(i + 1)}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'cursor-default'
              )}
              aria-label={interactive ? `Rate ${i + 1} stars` : undefined}
            >
              <Star
                className={cn(
                  starSize,
                  filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300',
                  halfFilled && 'fill-amber-200 text-amber-400'
                )}
              />
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-slate-500">
          ({count > 999 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}
