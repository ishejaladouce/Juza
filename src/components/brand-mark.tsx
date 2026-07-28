import { cn } from '@/lib/utils';

/** Juza wordmark logo. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 118 28"
      role="img"
      aria-label="Juza"
      className={cn('h-7 w-auto overflow-visible', className)}
    >
      <path
        d="M18 4 V16.5 C18 21.5 14.2 24.5 9 24.5 C5.2 24.5 2.5 22.8 1.5 20.2"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12 4 H24"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M32 4 V15.5 C32 20.8 35.8 24.5 41 24.5 C46.2 24.5 50 20.8 50 15.5 V4"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M58 5 H78 L58 23 H78"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M64 14 H72"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M88 24.5 L98 4 L108 24.5"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M92.5 16.5 H103.5"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <polygon
        points="98,10 100.2,12.2 98,14.4 95.8,12.2"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
}
