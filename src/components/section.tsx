import { cn } from '@/lib/utils';

const toneBg = {
  default: 'bg-background',
  soft: 'bg-muted/40',
  ink: 'bg-foreground text-background',
} as const;

const toneFill = {
  default: 'text-background',
  soft: 'text-[hsl(var(--muted)/0.4)]',
  ink: 'text-foreground',
} as const;

/** Page section with a background tone. */
export function Section({
  tone = 'default',
  className,
  children,
  ...props
}: React.ComponentProps<'section'> & {
  tone?: keyof typeof toneBg;
}) {
  return (
    <section className={cn('relative', toneBg[tone], className)} {...props}>
      {children}
    </section>
  );
}

/** Small mark under a section title. */
export function SectionMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('mt-4 flex items-center gap-2', className)}
    >
      <span className="block h-2 w-2 rotate-45 bg-primary" />
      <span className="h-px w-8 bg-primary/40" />
    </span>
  );
}

/** Curve between two sections. */
export function SectionBreak({
  to = 'soft',
  className,
}: {
  to?: keyof typeof toneFill;
  className?: string;
}) {
  return (
    <div
      className={cn('relative z-[1] -mb-px h-16 md:h-24', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className={cn('absolute inset-0 h-full w-full', toneFill[to])}
      >
        <path
          fill="currentColor"
          d="M0 28
             C 180 72, 360 8, 540 40
             C 720 72, 900 12, 1080 44
             C 1200 64, 1320 36, 1440 52
             L 1440 96 L 0 96 Z"
        />
      </svg>

      <div className="absolute left-1/2 top-[38%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 md:top-[42%] md:gap-4">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/35 md:w-16" />
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inset-0 rotate-45 rounded-[1px] border border-primary/25" />
          <span className="block h-2 w-2 rotate-45 bg-primary shadow-[0_0_0_3px_hsl(var(--background)/0.65)]" />
        </span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/35 md:w-16" />
      </div>
    </div>
  );
}
