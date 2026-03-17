import { cn } from '@/lib/utils';

export default function ProductSpecifications({ specifications = [] }) {
  if (!specifications.length) {
    return <p className="text-slate-400 text-sm">No specifications available.</p>;
  }

  // Group by category if present
  const grouped = specifications.reduce((acc, spec) => {
    const group = spec.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(spec);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([groupName, specs]) => (
        <div key={groupName}>
          {Object.keys(grouped).length > 1 && (
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">{groupName}</h4>
          )}
          <div className="bg-white rounded-xl border overflow-hidden">
            {specs.map((spec, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-4 px-5 py-3',
                  i % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                )}
              >
                <span className="text-sm font-semibold text-slate-500 w-40 shrink-0">{spec.key}</span>
                <span className="text-sm text-slate-900">
                  {spec.value}
                  {spec.unit && <span className="text-slate-400 ml-1">{spec.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
