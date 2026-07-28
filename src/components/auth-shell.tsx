import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLockup } from '@/components/brand-mark';
import { SectionMark } from '@/components/section';
import { cn } from '@/lib/utils';

/** Soft shapes behind login / signup. */
function AuthShapes({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <span className="absolute -left-[20%] -top-[10%] h-[55%] w-[70%] rounded-[50%] bg-primary/15" />
      <span className="absolute -right-[18%] top-[5%] h-[48%] w-[55%] rotate-[18deg] rounded-[50%] border border-primary/30" />
      <span className="absolute bottom-[-15%] left-[10%] h-[50%] w-[60%] -rotate-[12deg] rounded-[50%] bg-primary/10" />
      <span className="absolute right-[8%] bottom-[18%] h-24 w-14 rotate-[28deg] rounded-[50%] bg-primary/25" />
      <span className="absolute left-[12%] top-[38%] h-10 w-16 -rotate-[20deg] rounded-[50%] bg-foreground/8" />
      <span className="absolute right-[22%] top-[42%] h-8 w-8 rounded-[50%] border border-foreground/15" />
    </div>
  );
}

/** Layout for auth pages (brand + form). */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      <AuthShapes className="opacity-90 md:hidden" />

      <div className="container relative grid min-h-[calc(100vh-4rem)] items-stretch gap-0 py-10 md:grid-cols-2 md:gap-12 md:py-0 lg:gap-20">
        {/* Left: brand panel (desktop) */}
        <aside className="relative hidden overflow-hidden md:flex md:flex-col md:justify-between md:py-16 lg:py-20">
          <AuthShapes />

          <div className="relative z-10 max-w-md">
            <Link
              to="/"
              className="inline-flex transition-opacity hover:opacity-70"
            >
              <BrandLockup className="h-8" />
            </Link>
            <p className="mt-10 font-display text-4xl leading-[1.1] tracking-tight text-foreground lg:text-5xl">
              {t('brand.tagline')}
            </p>
            <SectionMark className="mt-6" />
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
              {t('home.subtitle')}
            </p>
          </div>

          <p className="relative z-10 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('home.eyebrow')}
          </p>
        </aside>

        {/* Right: form panel */}
        <div className="relative z-10 flex items-center md:py-16 lg:py-20">
          <div className="w-full max-w-md md:ml-auto">
            <Link
              to="/"
              className="mb-8 inline-flex transition-opacity hover:opacity-70 md:hidden"
            >
              <BrandLockup />
            </Link>

            <div className="rounded-2xl border border-foreground/8 bg-background/80 p-6 shadow-[0_20px_50px_-28px_hsl(152_38%_28%/0.35)] backdrop-blur-sm sm:p-8">
              <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                {title}
              </h1>
              <SectionMark />
              {description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {description}
                </p>
              )}

              <div className="mt-7">{children}</div>

              {footer && (
                <div className="mt-7 border-t border-foreground/8 pt-5 text-sm text-muted-foreground">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
