import { cn } from '@/lib/utils';
import { SectionMark } from '@/components/section';

/** Title block at the top of a page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn('container py-12 md:py-16', className)}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0 max-w-2xl">
          {eyebrow && (
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-h1 md:text-display">{title}</h1>
          <SectionMark />
          {description && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
