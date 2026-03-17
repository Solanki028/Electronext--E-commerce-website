'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/formatters';

export default function PriceRangeFilter({ min = 0, max = 200000, value = [0, 200000], onChange }) {
  const [localMin, setLocalMin] = useState(String(value[0]));
  const [localMax, setLocalMax] = useState(String(value[1]));

  const handleSliderChange = (vals) => {
    setLocalMin(String(vals[0]));
    setLocalMax(String(vals[1]));
    onChange?.(vals);
  };

  const handleInputBlur = () => {
    const parsedMin = Math.max(min, Math.min(Number(localMin) || 0, Number(localMax) || max));
    const parsedMax = Math.min(max, Math.max(Number(localMax) || max, parsedMin));
    setLocalMin(String(parsedMin));
    setLocalMax(String(parsedMax));
    onChange?.([parsedMin, parsedMax]);
  };

  return (
    <div className="space-y-4">
      <Slider
        min={min}
        max={max}
        step={100}
        value={[Number(localMin), Number(localMax)]}
        onValueChange={handleSliderChange}
        className="w-full"
      />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs text-slate-400">Min (₹)</Label>
          <Input
            type="number"
            value={localMin}
            onChange={e => setLocalMin(e.target.value)}
            onBlur={handleInputBlur}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <span className="text-slate-300 mt-5">—</span>
        <div className="flex-1">
          <Label className="text-xs text-slate-400">Max (₹)</Label>
          <Input
            type="number"
            value={localMax}
            onChange={e => setLocalMax(e.target.value)}
            onBlur={handleInputBlur}
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="text-xs text-center text-slate-500">
        {formatPrice(Number(localMin))} — {formatPrice(Number(localMax))}
      </div>
    </div>
  );
}
