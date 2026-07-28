import { cn } from '@/lib/utils';

/** Empty list / no results message. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-start gap-4 py-4', className)}>
      <div className="motif-rule" />
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center border border-foreground/15 text-accent">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
