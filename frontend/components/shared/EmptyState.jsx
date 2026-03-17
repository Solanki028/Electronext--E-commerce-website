import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmptyState({ icon: Icon = PackageX, title = 'Nothing here yet', description = '', actionLabel, actionHref, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-6 max-w-sm">{description}</p>}
      {actionLabel && (
        actionHref ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}
