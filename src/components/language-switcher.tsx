import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n';
import { cn } from '@/lib/utils';

/** Switch EN / FR / RW. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language) as LanguageCode;

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn(
        'inline-flex items-center rounded-md border border-foreground/12 bg-muted/50 p-0.5',
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = current === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            aria-pressed={active}
            aria-label={lang.nativeLabel}
            title={lang.nativeLabel}
            onClick={() => {
              if (!active) void i18n.changeLanguage(lang.code);
            }}
            className={cn(
              'min-w-[2.25rem] rounded-[0.3rem] px-2.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors duration-150',
              active
                ? 'bg-background text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {lang.code}
          </button>
        );
      })}
    </div>
  );
}
