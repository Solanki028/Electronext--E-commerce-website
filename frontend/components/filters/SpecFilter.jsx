'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * SpecFilter — checkbox list for a single specification group.
 *
 * @param {string}   name         e.g. "Brand" or "RAM"
 * @param {string[]} options      Available values to pick from
 * @param {string[]} selected     Currently selected values
 * @param {Function} onChange     (selectedValues: string[]) => void
 */
export default function SpecFilter({ name, options = [], selected = [], onChange }) {
  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange?.(next);
  };

  if (!options.length) return null;

  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
          <Checkbox
            checked={selected.includes(opt)}
            onCheckedChange={() => toggle(opt)}
            id={`spec-${name}-${opt}`}
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}
