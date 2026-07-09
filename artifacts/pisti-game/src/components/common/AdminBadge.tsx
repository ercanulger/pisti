import { CheckCircle2 } from 'lucide-react';

interface AdminBadgeProps {
  className?: string;
}

export function AdminBadge({ className = '' }: AdminBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-300 ${className}`}>
      <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
      Admin
    </span>
  );
}
