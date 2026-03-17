'use client';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';

export default function ProductVariants({ variants = [], selected, onSelect }) {
  if (!variants.length) return null;

  // Group variants by name (e.g., "Color", "Storage")
  const groups = variants.reduce((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([groupName, options]) => (
        <div key={groupName}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-slate-700">{groupName}</p>
            {selected?.name === groupName && selected?.value && (
              <span className="text-sm text-slate-400">— {selected.value}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {options.map((variant, i) => {
              const isSelected =
                selected?.name === variant.name && selected?.value === variant.value;
              const isColor = /color/i.test(groupName);

              return (
                <button
                  key={i}
                  onClick={() => onSelect?.(isSelected ? null : { name: variant.name, value: variant.value })}
                  className={cn(
                    'relative px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150',
                    isSelected
                      ? 'border-primary-700 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-slate-200 hover:border-primary-300 text-slate-600',
                    variant.stock === 0 && 'opacity-40 cursor-not-allowed line-through'
                  )}
                  disabled={variant.stock === 0}
                  title={variant.stock === 0 ? 'Out of stock' : variant.value}
                >
                  {variant.value}
                  {variant.priceModifier > 0 && (
                    <span className="ml-1 text-xs text-slate-400">+{formatPrice(variant.priceModifier)}</span>
                  )}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-700 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
